import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import {
    ScanFace,
    Camera,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ShieldCheck,
    ChevronDown,
    UserPlus,
    X,
} from 'lucide-react';

// ---- Detection tuning ----
// Ramanujan's approximation for ellipse circumference — accurate enough for
// an animated progress ring and avoids needing a real DOM measurement.
function ellipseCircumference(rx, ry) {
    const h = Math.pow(rx - ry, 2) / Math.pow(rx + ry, 2);
    return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

const HOLD_FRAMES_REQUIRED = 6;      // consecutive well-positioned frames needed before capturing/advancing (max strictness)
const TURN_HOLD_FRAMES_REQUIRED = 8; // must hold a genuine, deliberate turn for ~8 consecutive confirmed frames (max strictness)
const STABLE_FRAMES_REQUIRED = 4;    // for passive auto-capture (timein/timeout) — loosened from 6 so a good position confirms faster

// Head-yaw estimate anchored to the eyes, not the face detection box.
// The detector's bounding box is frequently NOT symmetric around the actual
// face (extra margin from hair, jaw angle, lighting, etc.), which silently
// biased the old box-relative ratio even when facing straight at the camera.
// Using eye positions as the reference frame is far more stable: ~0.5 means
// the nose sits squarely between the eyes (facing center); it shifts toward
// 0 or 1 only when the head actually turns.
function getYawRatio(landmarks) {
    const nose = landmarks.getNose();
    const noseTip = nose[3]; // true, centered nose tip (see note below)

    const avgX = (pts) => pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
    const leftEyeX = avgX(landmarks.getLeftEye());
    const rightEyeX = avgX(landmarks.getRightEye());
    const eyeMinX = Math.min(leftEyeX, rightEyeX);
    const eyeMaxX = Math.max(leftEyeX, rightEyeX);
    const eyeSpan = eyeMaxX - eyeMinX;
    if (eyeSpan < 1) return 0.5; // degenerate case guard

    return (noseTip.x - eyeMinX) / eyeSpan;
}
// getNose() returns the 9 standard 68-point nose landmarks in order: indices
// 0-3 are the bridge (top to tip), indices 4-8 are the nostril outline (left
// corner → right corner). Index 3 is the true, centered nose tip — not the
// last point, which is a nostril corner and is naturally off-center.
// Swapped vs. the raw math: the preview is mirrored (scaleX(-1)) but detection
// runs on the raw, unmirrored stream, so "turn left" on-screen actually shows
// up as a higher nose ratio in the raw frame, and vice versa. Thresholds are
// also a bit more forgiving now so a natural, moderate turn registers.
// Strict enough to require a real, sustained turn, but not so extreme that the
// face turns fully into profile — past a certain angle the landmark detector
// can lose the face entirely, which is worse than being lenient.
const YAW_LEFT_MAX = 0.72;   // must clearly exceed this ratio to count as turned left (on-screen) — recalibrated for the eye-span-based metric
const YAW_RIGHT_MIN = 0.28;  // must clearly fall below this ratio to count as turned right (on-screen) — recalibrated for the eye-span-based metric

// Anti-spoofing — blink-based liveness (Eye Aspect Ratio).
// Uses the standard Soukupová & Čech EAR formula on the 6-point eye
// landmarks face-api.js already gives us (no extra model needed). A printed
// photo, an ID card, or a photo shown on a phone/screen physically cannot
// blink, so requiring one real open→closed→open cycle before capture is what
// actually blocks photo/ID spoofing — face size/position checks alone do
// not, since a still image satisfies those just as easily as a live face.
const EAR_CLOSED_THRESHOLD = 0.23; // below this, eyes are considered closed
const EAR_OPEN_THRESHOLD = 0.25;   // above this, eyes are considered open again (hysteresis avoids jitter false-triggers)
// If the face has been "stable" (well-positioned) for this long without
// a single genuine blink, treat it as a spoof attempt (photo/printed ID/screen)
// and reject automatically instead of waiting indefinitely.
const SPOOF_TIMEOUT_MS = 12000;

function getEyeAspectRatio(landmarks) {
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const earFor = (eye) => {
        // eye = 6 points: [outerCorner, topLid1, topLid2, innerCorner, bottomLid1, bottomLid2]
        const vertical1 = dist(eye[1], eye[5]);
        const vertical2 = dist(eye[2], eye[4]);
        const horizontal = dist(eye[0], eye[3]);
        if (horizontal < 1) return 0.3; // degenerate case guard, treat as open
        return (vertical1 + vertical2) / (2 * horizontal);
    };
    const left = earFor(landmarks.getLeftEye());
    const right = earFor(landmarks.getRightEye());
    return (left + right) / 2;
}

function getDetectorOptions() {
    return new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.2 });
}

// More lenient than the default — a turned face is harder for the model to
// pick up than a frontal one, so we lower the confidence bar specifically
// for the turn_left/turn_right steps to avoid false "no face detected" drops.
function getTurnDetectorOptions() {
    return new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.12 });
}

// Detection is throttled to run at most this often. Running the full
// TinyFaceDetector + 68-point landmark model on every single
// requestAnimationFrame call (up to ~60 times/sec) is far more work than the
// UI actually needs and is what was causing the visible lag/stutter before
// the face was even recognized as "held" in place. ~7 checks/sec is still
// fast enough to feel instant while cutting CPU load dramatically.
const DETECTION_INTERVAL_MS = 140;

let enhanceCanvas = null;
let enhanceCtx = null;

function getEnhancedFrame(video) {
    if (!enhanceCanvas) {
        enhanceCanvas = document.createElement('canvas');
        // willReadFrequently tells the browser this canvas will have its pixel
        // data read back over and over (which is exactly what face-api.js does
        // internally every detection call). Without it, Chrome optimizes for
        // write-only/GPU-composited use and repeated readback gets noticeably
        // slower — this was the "Canvas2D: Multiple readback operations..."
        // warning showing up in devtools.
        enhanceCtx = enhanceCanvas.getContext('2d', { willReadFrequently: true });
    }
    enhanceCanvas.width = video.videoWidth;
    enhanceCanvas.height = video.videoHeight;
    enhanceCtx.filter = 'brightness(1.5) contrast(1.2)';
    enhanceCtx.drawImage(video, 0, 0, enhanceCanvas.width, enhanceCanvas.height);
    return enhanceCanvas;
}

// Registration now walks through a short liveness challenge — center, then a
// turn to each side, then back to center — before submitting. The reference
// descriptor used for matching is captured during "detecting_face"
// (best-quality, forward-facing frame); the turn/recenter steps are pure
// liveness checks (no re-capture).
const REGISTER_STEPS = ['detecting_face', 'turn_left', 'turn_right', 'recenter', 'capturing', 'done'];

const STEP_LABELS = {
    detecting_face: 'Look directly at the camera',
    turn_left: 'Slowly turn your head to the left',
    turn_right: 'Slowly turn your head to the right',
    recenter: 'Now face the camera again',
    capturing: 'Capturing your photo...',
    done: 'Captured!',
};

// Which arrow (if any) to show during a given step.
const STEP_ARROWS = {
    detecting_face: null,
    turn_left: 'left',
    turn_right: 'right',
    recenter: null,
    capturing: null,
    done: null,
};

export default function FaceAttendance({ todayRecords, activities, hasFaceDescriptor }) {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState('');
    const [statusType, setStatusType] = useState(null); // 'success' | 'error' | null
    const [loading, setLoading] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [mode, setMode] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState('');
    const [liveStep, setLiveStep] = useState('detecting_face');
    const [scanProgress, setScanProgress] = useState(0); // 0-1, fills the ring during timein/timeout scan
    const [verified, setVerified] = useState(false);
    const [registerStepProgress, setRegisterStepProgress] = useState(0); // 0-1, fills the ring per register step
    const [livePositive, setLivePositive] = useState(false); // true when the current frame is correctly positioned/turned — live green feedback
    // Mirrors the hasFaceDescriptor prop, but can flip to true immediately after a
    // successful registration — the prop itself only updates on the next full
    // page load/reload, which would otherwise leave "Register Face" showing.
    const [faceIsRegistered, setFaceIsRegistered] = useState(!!hasFaceDescriptor);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);

    const holdCounterRef = useRef(0);
    const stepIndexRef = useRef(0);
    const stableCounterRef = useRef(0);
    const processingRef = useRef(false);
    const referenceDescriptorRef = useRef(null);
    const lastDetectionTimeRef = useRef(0); // throttles heavy detection calls, see DETECTION_INTERVAL_MS

    // Blink-liveness tracking for the passive timein/timeout scan.
    const blinkDetectedRef = useRef(false);
    const eyeStateRef = useRef('open');
    const blinkWaitStartRef = useRef(null); // timestamp when the face first became "stable" without a blink yet
    // Per-session "eyes open" EAR baseline. Eye shape, eyelid coverage, and
    // camera angle shift the absolute EAR range a lot from person to person
    // (e.g. looking slightly down at a laptop webcam, or naturally hooded
    // eyelids), so a fixed global threshold can be simply unreachable for
    // some users even while blinking completely normally. Calibrating a
    // baseline at the start of each scan and comparing relative drops fixes
    // that instead of guessing a one-size-fits-all number.
    const earBaselineRef = useRef(null);
    const earCalibrationSamplesRef = useRef([]); // collects the first few EAR readings to establish a reliable "open" baseline before trusting it

    const locationPromiseRef = useRef(null);
    const pingIntervalRef = useRef(null);
    const pingingActivityIdRef = useRef(null);

    const todayRecordForSelectedActivity = selectedActivity
        ? todayRecords?.find(r => String(r.activity_id) === String(selectedActivity))
        : null;

    const alreadyTimedIn = !!todayRecordForSelectedActivity?.time_in;
    const alreadyTimedOut = !!todayRecordForSelectedActivity?.time_out;

    const selectableActivities = activities?.filter((a) => {
        const rec = todayRecords?.find(r => String(r.activity_id) === String(a.id));
        return !(rec && rec.time_out);
    });

    const setSuccessStatus = (msg) => { setStatus(msg); setStatusType('success'); };
    const setErrorStatus = (msg) => { setStatus(msg); setStatusType('error'); };
    const setInfoStatus = (msg) => { setStatus(msg); setStatusType(null); };

    useEffect(() => {
        loadModels();
        return () => {
            stopEverything();
            stopLocationPing();
        };
    }, []);

    useEffect(() => {
        const activeRecord = todayRecords?.find(r => r.time_in && !r.time_out);
        if (activeRecord) {
            startLocationPing(activeRecord.activity_id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [todayRecords]);

    useEffect(() => {
        if (cameraOn) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [cameraOn]);

    const loadModels = async () => {
        try {
            // Force the GPU-accelerated WebGL backend explicitly. Without this,
            // tfjs sometimes silently falls back to its plain CPU backend on
            // certain devices/drivers — which can be 10-50x slower for a model
            // like this and is very likely why detection feels sluggish on
            // older/weaker volunteer laptops specifically. If WebGL truly isn't
            // available we swallow the error and let tfjs pick whatever backend
            // it can, rather than blocking model loading entirely.
            try {
                await faceapi.tf.setBackend('webgl');
                await faceapi.tf.ready();
            } catch (backendErr) {
                console.warn('WebGL backend unavailable, falling back to default:', backendErr);
            }

            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            ]);
            setModelsLoaded(true);
        } catch (err) {
            setErrorStatus('Failed to load face models.');
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Camera error:', err);
            setErrorStatus('Camera access denied. Please allow camera permissions.');
            setCameraOn(false);
            setMode(null);
        }
    };

    const stopCamera = () => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const stopEverything = () => stopCamera();

    const getCsrfToken = () => {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    };

    // enableHighAccuracy tells the browser to prefer the device's real GPS
    // chip over WiFi/cell-tower/IP-based estimation. Only matters on devices
    // that actually have a GPS chip (i.e. phones) - laptops/desktops usually
    // don't, so they'll still fall back to network-based location no matter
    // what options are passed here.
    const getLocation = () => new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            pos => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy, // meters of uncertainty in this reading
            }),
            () => reject(new Error('Location access denied.')),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    });

    const primeLocation = () => {
        locationPromiseRef.current = getLocation();
    };

    const sendLocationPing = async (activityId) => {
        try {
            const pos = await getLocation();
            await fetch(route('volunteer.location.ping'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ activity_id: activityId, ...pos }),
            });
        } catch (err) {
            console.error('Location ping failed:', err);
        }
    };

    const startLocationPing = (activityId) => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingingActivityIdRef.current = activityId;
        sendLocationPing(activityId);
        pingIntervalRef.current = setInterval(() => sendLocationPing(activityId), 20000);
    };

    const stopLocationPing = async (clearOnServer = false) => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
        const activityId = pingingActivityIdRef.current;
        pingingActivityIdRef.current = null;

        if (clearOnServer && activityId) {
            try {
                await fetch(route('volunteer.location.clear'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                    body: JSON.stringify({ activity_id: activityId }),
                });
            } catch (err) {
                console.error('Location clear failed:', err);
            }
        }
    };

    // Total steps that count toward the ring: center, turn_left, turn_right, recenter.
    // "capturing"/"done" are the final beat right after recenter completes.
    const REGISTER_RING_STEP_COUNT = 4;

    const startRegisterLoop = useCallback(() => {
        stepIndexRef.current = 0;
        holdCounterRef.current = 0;
        referenceDescriptorRef.current = null;
        lastDetectionTimeRef.current = 0;
        setLiveStep('detecting_face');
        setRegisterStepProgress(0);

        const tick = async () => {
            let continueLoop = true;
            try {
                const video = videoRef.current;
                if (!video || video.readyState !== 4) {
                    return;
                }

                // Skip the heavy detection work (but keep the rAF loop alive) if
                // we ran it too recently — this is what actually cuts the lag,
                // since the video itself keeps rendering smoothly regardless.
                const now = performance.now();
                if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
                    return;
                }
                lastDetectionTimeRef.current = now;

                const currentStep = REGISTER_STEPS[stepIndexRef.current];

                if (currentStep === 'detecting_face') {
                    const frame = getEnhancedFrame(video);
                    const result = await faceapi
                        .detectSingleFace(frame, getDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (!result) {
                        holdCounterRef.current = 0;
                        setRegisterStepProgress(0);
                        setInfoStatus('No face detected. Make sure the area is well lit and your whole face is inside the circle.');
                        return;
                    }

                    setInfoStatus('');
                    const videoArea = video.videoWidth * video.videoHeight;
                    const faceRatio = (result.detection.box.width * result.detection.box.height) / videoArea;
                    // Stricter than the daily passive scan — registration should require a
                    // properly centered, well-sized face before locking in the reference.
                    const wellPositioned = faceRatio > 0.12 && faceRatio < 0.5;

                    if (wellPositioned) {
                        holdCounterRef.current += 1;
                        setLivePositive(true);
                        const withinStepFraction = Math.min(holdCounterRef.current / HOLD_FRAMES_REQUIRED, 1);
                        setRegisterStepProgress((0 + withinStepFraction) / REGISTER_RING_STEP_COUNT);
                        if (holdCounterRef.current >= HOLD_FRAMES_REQUIRED) {
                            // lock in this forward-facing frame as the reference for matching
                            referenceDescriptorRef.current = result.descriptor;
                            stepIndexRef.current = 1; // turn_left
                            holdCounterRef.current = 0;
                            setLiveStep('turn_left');
                        }
                    } else {
                        holdCounterRef.current = 0;
                        setLivePositive(false);
                        setRegisterStepProgress(0);
                        setInfoStatus('Move a little closer or further from the camera');
                    }
                } else if (currentStep === 'turn_left' || currentStep === 'turn_right') {
                    const frame = getEnhancedFrame(video);
                    const result = await faceapi
                        .detectSingleFace(frame, getTurnDetectorOptions())
                        .withFaceLandmarks();

                    if (!result) {
                        holdCounterRef.current = 0;
                        setLivePositive(false);
                        setInfoStatus('No face detected. Come back inside the circle.');
                        return;
                    }

                    setInfoStatus('');
                    const yawRatio = getYawRatio(result.landmarks);
                    const matchesDirection = currentStep === 'turn_left'
                        ? yawRatio > YAW_LEFT_MAX
                        : yawRatio < YAW_RIGHT_MIN;
                    const stepsCompletedBefore = currentStep === 'turn_left' ? 1 : 2;

                    if (matchesDirection) {
                        holdCounterRef.current += 1;
                        setLivePositive(true);
                        const withinStepFraction = Math.min(holdCounterRef.current / TURN_HOLD_FRAMES_REQUIRED, 1);
                        setRegisterStepProgress((stepsCompletedBefore + withinStepFraction) / REGISTER_RING_STEP_COUNT);
                        if (holdCounterRef.current >= TURN_HOLD_FRAMES_REQUIRED) {
                            holdCounterRef.current = 0;
                            if (currentStep === 'turn_left') {
                                stepIndexRef.current = 2; // turn_right
                                setLiveStep('turn_right');
                            } else {
                                stepIndexRef.current = 3; // recenter — must return to facing forward before capture
                                setLiveStep('recenter');
                            }
                        }
                    } else {
                        holdCounterRef.current = 0;
                        setLivePositive(false);
                        setRegisterStepProgress(stepsCompletedBefore / REGISTER_RING_STEP_COUNT);
                    }
                } else if (currentStep === 'recenter') {
                    const frame = getEnhancedFrame(video);
                    const result = await faceapi
                        .detectSingleFace(frame, getDetectorOptions())
                        .withFaceLandmarks();

                    if (!result) {
                        holdCounterRef.current = 0;
                        setLivePositive(false);
                        setInfoStatus('No face detected. Come back inside the circle.');
                        return;
                    }

                    setInfoStatus('');
                    const yawRatio = getYawRatio(result.landmarks);
                    const backToCenter = yawRatio > YAW_RIGHT_MIN && yawRatio < YAW_LEFT_MAX;

                    if (backToCenter) {
                        holdCounterRef.current += 1;
                        setLivePositive(true);
                        const withinStepFraction = Math.min(holdCounterRef.current / HOLD_FRAMES_REQUIRED, 1);
                        setRegisterStepProgress((3 + withinStepFraction) / REGISTER_RING_STEP_COUNT);
                        if (holdCounterRef.current >= HOLD_FRAMES_REQUIRED) {
                            holdCounterRef.current = 0;
                            stepIndexRef.current = 4; // capturing
                            setLiveStep('capturing');
                        }
                    } else {
                        holdCounterRef.current = 0;
                        setLivePositive(false);
                        setRegisterStepProgress(3 / REGISTER_RING_STEP_COUNT);
                    }
                } else if (currentStep === 'capturing') {
                    setLiveStep('done');
                    continueLoop = false;
                    submitRegister(Array.from(referenceDescriptorRef.current));
                }
            } catch (err) {
                console.error('Register liveness detection error:', err);
            } finally {
                if (continueLoop) {
                    rafRef.current = requestAnimationFrame(tick);
                }
            }
        };

        rafRef.current = requestAnimationFrame(tick);
    }, []);

    const submitRegister = async (descriptor) => {
        setLoading(true);
        setInfoStatus('Recording your face...');
        try {
            const res = await fetch(route('volunteer.face.register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ face_descriptor: descriptor }),
            });
            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setSuccessStatus('Your face has been verified!');
                setFaceIsRegistered(true);
                setTimeout(() => proceedToAttendanceAfterRegister(), 250);
            } else {
                setErrorStatus(data.message);
            }
        } catch {
            setErrorStatus('Something went wrong.');
            setLoading(false);
        }
    };

    const proceedToAttendanceAfterRegister = () => {
        const target = !alreadyTimedIn ? 'timein' : (!alreadyTimedOut ? 'timeout' : null);

        if (!target || !selectedActivity) {
            stopCamera();
            setCameraOn(false);
            setMode(null);
            setInfoStatus('');
            setVerified(false);
            setScanProgress(0);
            return;
        }

        setMode(target);
        setInfoStatus('Automatically continuing to ' + (target === 'timein' ? 'Time In' : 'Time Out') + '...');
        startPassiveLoop(target);
    };

    const startPassiveLoop = useCallback((targetMode) => {
        stableCounterRef.current = 0;
        processingRef.current = false;
        lastDetectionTimeRef.current = 0;
        setScanProgress(0);
        setVerified(false);
        setLivePositive(false);
        setInfoStatus('');
        primeLocation();

        const tick = async () => {
            if (processingRef.current) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            let continueLoop = true;
            try {
                const video = videoRef.current;
                if (!video || video.readyState !== 4) {
                    return;
                }

                // Skip the heavy detection work (but keep the rAF loop alive) if
                // we ran it too recently — same throttle as the register loop,
                // this is what removes the lag while "holding still".
                const now = performance.now();
                if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
                    return;
                }
                lastDetectionTimeRef.current = now;

                const frame = getEnhancedFrame(video);
                // Requests landmarks every frame (not just the bounding box) so we
                // can track eye-openness for blink detection.
                const result = await faceapi.detectSingleFace(frame, getDetectorOptions()).withFaceLandmarks();

                if (!result) {
                    stableCounterRef.current = 0;
                    blinkWaitStartRef.current = null;
                    blinkDetectedRef.current = false;
                    eyeStateRef.current = 'open';
                    setScanProgress(0);
                    setLivePositive(false);
                    setInfoStatus('No face detected. Make sure the area is well lit.');
                    return;
                }

                const box = result.detection.box;
                const videoArea = video.videoWidth * video.videoHeight;
                const faceRatio = (box.width * box.height) / videoArea;
                // Slightly widened from the original 0.08–0.6 — the box
                // reported by the detector naturally jitters a little frame to
                // frame even when the person hasn't moved, and the old tighter
                // range meant that jitter alone could flip "well positioned"
                // on and off and keep resetting progress.
                const wellPositioned = faceRatio > 0.06 && faceRatio < 0.65;

                if (wellPositioned) {
                    stableCounterRef.current += 1;
                    setScanProgress(Math.min(stableCounterRef.current / STABLE_FRAMES_REQUIRED, 1));
                    setLivePositive(true);
                    setInfoStatus('Hold still...');
                } else {
                    // Decay by 1 instead of resetting to 0 — a single jittery
                    // frame (detector box briefly shrinking/growing, a tiny
                    // head wobble) shouldn't throw away several frames' worth
                    // of already-good progress. A person who's genuinely moved
                    // away will still fall back to 0 within a couple of frames;
                    // this just stops single-frame noise from being punishing.
                    stableCounterRef.current = Math.max(0, stableCounterRef.current - 1);
                    setScanProgress(Math.min(stableCounterRef.current / STABLE_FRAMES_REQUIRED, 1));
                    setLivePositive(false);
                    setInfoStatus('Move a little closer or further from the camera');
                }

                // Capture fires once the face has been stable and well-positioned
                // for STABLE_FRAMES_REQUIRED consecutive frames — no blink required.
                if (stableCounterRef.current >= STABLE_FRAMES_REQUIRED) {
                    const captureFrame = getEnhancedFrame(video);
                    const finalResult = await faceapi
                        .detectSingleFace(captureFrame, getDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (!finalResult) {
                        stableCounterRef.current = 0;
                        return;
                    }

                    processingRef.current = true;
                    continueLoop = false;
                    submitAttendance(targetMode, Array.from(finalResult.descriptor));
                }
            } catch (err) {
                console.error('Passive attendance detection error:', err);
            } finally {
                if (continueLoop) {
                    rafRef.current = requestAnimationFrame(tick);
                }
            }
        };

        rafRef.current = requestAnimationFrame(tick);
    }, [selectedActivity]);

    const submitAttendance = async (targetMode, descriptor) => {
        setLoading(true);
        setInfoStatus('Checking location...');
        let location;
        try {
            location = await locationPromiseRef.current;
        } catch (e) {
            setErrorStatus(e.message);
            setLoading(false);
            processingRef.current = false;
            rafRef.current = requestAnimationFrame(() => startPassiveLoop(targetMode));
            return;
        }

        setInfoStatus('Confirming your identity...');
        try {
            const routeName = targetMode === 'timein' ? 'volunteer.face.timein' : 'volunteer.face.timeout';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const res = await fetch(route(routeName), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ activity_id: selectedActivity, face_descriptor: descriptor, ...location }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error('invalid_response');
            }

            if (res.ok) {
                setSuccessStatus(data.message);
                setVerified(true);
                setScanProgress(1);
                if (targetMode === 'timein') {
                    startLocationPing(selectedActivity);
                } else {
                    stopLocationPing(true);
                }
                stopCamera();
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setErrorStatus(data.message);
                setTimeout(() => {
                    processingRef.current = false;
                    stableCounterRef.current = 0;
                    setLoading(false);
                    rafRef.current = requestAnimationFrame(() => startPassiveLoop(targetMode));
                }, 2000);
                return;
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                setErrorStatus('The server took too long to respond (timeout). Please try again.');
            } else if (err.message === 'invalid_response') {
                setErrorStatus('Server error (invalid response). Please check the Laravel logs.');
            } else {
                setErrorStatus('Something went wrong. Please check your internet connection or the server.');
            }
            console.error('Attendance submit error:', err);
        }
        setLoading(false);
    };

    const startMode = (m) => {
        if ((m === 'timein' || m === 'timeout') && !selectedActivity) {
            setErrorStatus('Please select an activity first.');
            return;
        }
        setMode(m);
        setInfoStatus('');
        setVerified(false);
        setScanProgress(0);
        setRegisterStepProgress(0);
        setCameraOn(true);

        setTimeout(() => {
            if (m === 'register') startRegisterLoop();
            else startPassiveLoop(m);
        }, 300);
    };

    const cancelMode = () => {
        setMode(null);
        setCameraOn(false);
        setInfoStatus('');
        setVerified(false);
        setScanProgress(0);
        setRegisterStepProgress(0);
        stopCamera();
    };

    const showCheckmark = verified || (mode === 'register' && liveStep === 'done');
    const activeProgress = mode === 'register' ? registerStepProgress : scanProgress;
    const currentArrow = mode === 'register' ? STEP_ARROWS[liveStep] : null;
    const showArrow = currentArrow && liveStep !== 'done';
    const ringStroke = livePositive ? '#16a34a' : '#9ca3af';

    // Note: buttons are locked (grayed out + unclickable) until an activity
    // is selected. This is on top of the existing startMode() guard/toast —
    // that guard still fires as a fallback (e.g. keyboard activation), but
    // now the button itself visibly communicates "not ready yet" instead of
    // looking clickable and only failing after the tap.
    const noActivitySelected = !selectedActivity;

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <ScanFace className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 leading-snug">
                                Today's check-in
                            </h2>
                            <p className="text-xs text-gray-500">
                                Verify duty attendance for your assignment
                            </p>
                        </div>
                    </div>
                </div>

                {/* Activity Selector */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Assigned deployment activity
                    </label>
                    <div className="relative">
                        <select
                            value={selectedActivity}
                            onChange={e => setSelectedActivity(e.target.value)}
                            disabled={!!mode}
                            autoComplete="off"
                            className={`w-full px-3.5 py-2.5 rounded-xl text-xs border bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none ${
                                noActivitySelected ? 'border-red-300 text-gray-700' : 'border-gray-200 text-gray-900'
                            }`}
                        >
                            <option value="">-- Choose your assigned deployment activity --</option>
                            {selectableActivities?.map(a => (
                                <option key={a.id} value={a.id}>{a.name} — {a.location_name} ({a.date})</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {noActivitySelected && (
                        <p className="text-[11px] text-red-600 mt-1.5">
                            Please select an assigned activity above before timing in or timing out.
                        </p>
                    )}
                </div>

                {/* Quick Shift Metrics */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
                        <div className="text-[11px] font-medium text-gray-500 mb-0.5">Time in</div>
                        <div className="text-sm sm:text-base font-bold text-emerald-600 truncate">
                            {todayRecordForSelectedActivity?.time_in
                                ? new Date(todayRecordForSelectedActivity.time_in).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true })
                                : '—'}
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
                        <div className="text-[11px] font-medium text-gray-500 mb-0.5">Time out</div>
                        <div className="text-sm sm:text-base font-bold text-red-600 truncate">
                            {todayRecordForSelectedActivity?.time_out
                                ? new Date(todayRecordForSelectedActivity.time_out).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true })
                                : '—'}
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
                        <div className="text-[11px] font-medium text-gray-500 mb-0.5">Hours today</div>
                        <div className="text-sm sm:text-base font-bold text-gray-900 truncate">
                            {todayRecordForSelectedActivity?.hours_rendered ? `${todayRecordForSelectedActivity.hours_rendered} hrs` : '0.0 hrs'}
                        </div>
                    </div>
                </div>

                {/* Models Loading Notice */}
                {!modelsLoaded && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <Clock className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                        <span>Loading biometric face recognition models...</span>
                    </div>
                )}

                {/* Status Alert (when not in modal) */}
                {!cameraOn && status && (
                    <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                        statusType === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : statusType === 'error'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                        {statusType === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : statusType === 'error' ? (
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        ) : null}
                        <span>{status}</span>
                    </div>
                )}

                {/* Action Buttons: Time In & Time Out */}
                {selectedActivity && alreadyTimedOut ? (
                    <div className="p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>You have already completed attendance for this activity today.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={() => startMode('timein')}
                            disabled={alreadyTimedIn || !modelsLoaded || noActivitySelected}
                            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs ${
                                alreadyTimedIn || noActivitySelected || !modelsLoaded
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            <span>{alreadyTimedIn ? 'Already timed in' : 'Face time in'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => startMode('timeout')}
                            disabled={!modelsLoaded || noActivitySelected}
                            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs ${
                                noActivitySelected || !modelsLoaded
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/10'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            <span>Face time out</span>
                        </button>
                    </div>
                )}

                {/* Face Biometric Status & Registration CTA */}
                <div className="pt-2 border-t border-gray-100">
                    {faceIsRegistered ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                            <div className="flex items-center gap-2 text-emerald-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-semibold">Face profile registered</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => startMode('register')}
                                disabled={!modelsLoaded}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                                <ScanFace className="w-3.5 h-3.5" />
                                <span>Recalibrate</span>
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 space-y-3">
                            <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-900">
                                        Face profile registration
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                                        Register your face profile to enable biometric field attendance.
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => startMode('register')}
                                disabled={!modelsLoaded}
                                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition flex items-center justify-center gap-2 shadow-xs shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ScanFace className="w-4 h-4 text-white" />
                                <span>Register face profile</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Themed Face Modal (Register Face / Time In / Time Out) - strictly NO BLUR */}
            {mode && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Dark overlay backdrop — NO BLUR */}
                    <div
                        className="fixed inset-0 bg-black/60 transition-opacity"
                        onClick={cancelMode}
                    />

                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <div
                            className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100 p-6 sm:p-7 relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                        <ScanFace className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                                            {mode === 'register'
                                                ? 'Register face profile'
                                                : mode === 'timein'
                                                ? 'Face verification — Time in'
                                                : 'Face verification — Time out'}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {mode === 'register'
                                                ? 'Follow camera instructions to calibrate your volunteer face ID'
                                                : 'Hold still and blink naturally to verify your deployment attendance'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={cancelMode}
                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Camera Content */}
                            <div className="py-4">
                                {verified && mode !== 'register' ? (
                                    <div className="text-center bg-emerald-50 rounded-2xl p-8 border border-emerald-200">
                                        <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <div className="text-base font-bold text-emerald-800">
                                            {status || 'Verified!'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        {/* Register Step Dots */}
                                        {mode === 'register' && (
                                            <div className="flex justify-center gap-1.5 mb-3">
                                                {REGISTER_STEPS.slice(0, 4).map((step, idx) => {
                                                    const currentIdx = REGISTER_STEPS.indexOf(liveStep);
                                                    return (
                                                        <div
                                                            key={step}
                                                            className={`w-10 h-1.5 rounded-full transition-all duration-200 ${
                                                                idx < currentIdx
                                                                    ? 'bg-emerald-600'
                                                                    : idx === currentIdx
                                                                    ? 'bg-red-600'
                                                                    : 'bg-gray-200'
                                                            }`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Centered Camera Oval Viewport */}
                                        <div style={{ position: 'relative', width: '260px', height: '268px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {showArrow && currentArrow === 'left' && (
                                                <div key={`arrow-${liveStep}`} style={{ position: 'absolute', left: '-6px', zIndex: 2 }}>
                                                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" style={{ animation: 'arrowAppear 0.4s ease-out' }}>
                                                        <path d="M15 18L9 12L15 6" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}

                                            <div style={{ position: 'relative', width: '208px', height: '268px' }}>
                                                {!showCheckmark && (
                                                    <svg width="208" height="268" style={{ position: 'absolute', top: 0, left: 0 }}>
                                                        <defs>
                                                            <clipPath id="faceOvalClip">
                                                                <ellipse cx="104" cy="134" rx="100" ry="130" />
                                                            </clipPath>
                                                        </defs>
                                                        <foreignObject x="4" y="4" width="200" height="260" clipPath="url(#faceOvalClip)">
                                                            <video
                                                                xmlns="http://www.w3.org/1999/xhtml"
                                                                ref={(el) => {
                                                                    videoRef.current = el;
                                                                    if (el && streamRef.current && el.srcObject !== streamRef.current) {
                                                                        el.srcObject = streamRef.current;
                                                                    }
                                                                }}
                                                                autoPlay
                                                                muted
                                                                playsInline
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
                                                            />
                                                        </foreignObject>
                                                        {activeProgress > 0 && (
                                                            <ellipse
                                                                cx="104" cy="134" rx="100" ry="130" fill="none"
                                                                stroke={ringStroke}
                                                                strokeWidth="4"
                                                                style={{ transition: 'stroke 0.15s linear' }}
                                                            />
                                                        )}
                                                        {activeProgress === 0 && (
                                                            <ellipse cx="104" cy="134" rx="100" ry="130" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                                        )}
                                                    </svg>
                                                )}

                                                {showCheckmark && (
                                                    <>
                                                        <svg width="208" height="268" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                                                            <ellipse cx="104" cy="134" rx="100" ry="130" fill="none" stroke="#16a34a" strokeWidth="4" />
                                                        </svg>
                                                        <div style={{
                                                            position: 'absolute', top: '4px', left: '4px', width: '200px', height: '260px', borderRadius: '50%',
                                                            background: 'rgba(22,163,74,0.12)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            animation: 'checkFadeIn 0.25s ease-out',
                                                        }}>
                                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                                                <circle cx="12" cy="12" r="11" fill="#16a34a" />
                                                                <path d="M7 12.5L10.5 16L17 8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {showArrow && currentArrow === 'right' && (
                                                <div key={`arrow-${liveStep}`} style={{ position: 'absolute', right: '-6px', zIndex: 2 }}>
                                                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" style={{ animation: 'arrowAppear 0.4s ease-out' }}>
                                                        <path d="M9 6L15 12L9 18" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <style>{`
                                            @keyframes scanPulse {
                                                0% { transform: scale(1); opacity: 0.5; }
                                                100% { transform: scale(1.18); opacity: 0; }
                                            }
                                            @keyframes arrowAppear {
                                                0% { opacity: 0; transform: scale(0.7); }
                                                60% { opacity: 1; transform: scale(1.1); }
                                                100% { opacity: 1; transform: scale(1); }
                                            }
                                            @keyframes checkFadeIn {
                                                0% { opacity: 0; transform: scale(0.85); }
                                                100% { opacity: 1; transform: scale(1); }
                                            }
                                        `}</style>

                                        {/* Status / Instructions */}
                                        <div className="mt-3.5 text-sm font-semibold text-gray-900 min-h-[20px]">
                                            {mode === 'register' ? (status || STEP_LABELS[liveStep]) : (status || 'Position your face within the frame')}
                                        </div>

                                        {/* Tips */}
                                        <div className="mt-4 pt-3.5 border-t border-gray-100 text-left max-w-xs mx-auto">
                                            {[
                                                'Keep your whole face inside the oval frame.',
                                                'Remove glasses, mask, or face coverings.',
                                                'Hold steady until the ring turns green.',
                                                'Make sure your surroundings are well lit.',
                                            ].map((tip, i) => (
                                                <div key={i} className="flex items-start gap-2 text-xs text-gray-500 mb-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                                                    <span>{tip}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={cancelMode}
                                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
