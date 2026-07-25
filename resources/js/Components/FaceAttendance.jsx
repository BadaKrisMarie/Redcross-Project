import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';

// ---- Detection tuning ----
// Ramanujan's approximation for ellipse circumference — accurate enough for
// an animated progress ring and avoids needing a real DOM measurement.
function ellipseCircumference(rx, ry) {
    const h = Math.pow(rx - ry, 2) / Math.pow(rx + ry, 2);
    return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

const HOLD_FRAMES_REQUIRED = 6;      // consecutive well-positioned frames needed before capturing/advancing (max strictness)
const TURN_HOLD_FRAMES_REQUIRED = 8; // must hold a genuine, deliberate turn for ~8 consecutive confirmed frames (max strictness)
const STABLE_FRAMES_REQUIRED = 6;    // for passive auto-capture (timein/timeout)

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

function getDetectorOptions() {
    return new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 });
}

// More lenient than the default — a turned face is harder for the model to
// pick up than a frontal one, so we lower the confidence bar specifically
// for the turn_left/turn_right steps to avoid false "no face detected" drops.
function getTurnDetectorOptions() {
    return new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.12 });
}

let enhanceCanvas = null;

function getEnhancedFrame(video) {
    if (!enhanceCanvas) enhanceCanvas = document.createElement('canvas');
    enhanceCanvas.width = video.videoWidth;
    enhanceCanvas.height = video.videoHeight;
    const ctx = enhanceCanvas.getContext('2d');
    ctx.filter = 'brightness(1.5) contrast(1.2)';
    ctx.drawImage(video, 0, 0, enhanceCanvas.width, enhanceCanvas.height);
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
    const preWarmedStreamRef = useRef(null);
    const rafRef = useRef(null);

    const holdCounterRef = useRef(0);
    const stepIndexRef = useRef(0);
    const stableCounterRef = useRef(0);
    const processingRef = useRef(false);
    const referenceDescriptorRef = useRef(null);

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
        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                preWarmedStreamRef.current = stream;
            } catch {}
        })();
        return () => {
            stopEverything();
            stopLocationPing();
            if (preWarmedStreamRef.current) {
                preWarmedStreamRef.current.getTracks().forEach(t => t.stop());
                preWarmedStreamRef.current = null;
            }
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
        if (cameraOn) startCamera();
        else stopCamera();
        return () => stopCamera();
    }, [cameraOn]);

    const loadModels = async () => {
        try {
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
            if (preWarmedStreamRef.current && preWarmedStreamRef.current.active) {
                streamRef.current = preWarmedStreamRef.current;
                preWarmedStreamRef.current = null;
                if (videoRef.current) videoRef.current.srcObject = streamRef.current;
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
            setErrorStatus('Camera access denied.');
            setCameraOn(false);
        }
    };

    const stopCamera = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
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
        setLiveStep('detecting_face');
        setRegisterStepProgress(0);

        const tick = async () => {
            let continueLoop = true;
            try {
                const video = videoRef.current;
                if (!video || video.readyState !== 4) {
                    return;
                }

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

                const frame = getEnhancedFrame(video);
                const result = await faceapi.detectSingleFace(frame, getDetectorOptions());

                if (!result) {
                    stableCounterRef.current = 0;
                    setScanProgress(0);
                    setLivePositive(false);
                    setInfoStatus('No face detected. Make sure the area is well lit.');
                    return;
                }

                const box = result.box;
                const videoArea = video.videoWidth * video.videoHeight;
                const faceRatio = (box.width * box.height) / videoArea;
                const wellPositioned = faceRatio > 0.08 && faceRatio < 0.6;

                if (wellPositioned) {
                    stableCounterRef.current += 1;
                    setScanProgress(Math.min(stableCounterRef.current / STABLE_FRAMES_REQUIRED, 1));
                    // ✅ FIXED: dati, hindi na-uupdate ang livePositive dito, kaya laging
                    // kulay-abo ang progress ring kahit tama na ang posisyon ng mukha.
                    // Ngayon, sumusunod na ito sa parehong pattern ng register flow —
                    // magiging berde ang ring habang tama ang detection.
                    setLivePositive(true);
                    setInfoStatus('Hold still...');
                } else {
                    stableCounterRef.current = 0;
                    setScanProgress(0);
                    setLivePositive(false);
                    setInfoStatus('Move a little closer or further from the camera');
                }

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
            setErrorStatus('Please select an activity.');
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

    return (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '28px', marginBottom: '24px' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: '#111', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
                Today's Attendance
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Time In', value: todayRecordForSelectedActivity?.time_in ? new Date(todayRecordForSelectedActivity.time_in).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—', color: '#16a34a' },
                    { label: 'Time Out', value: todayRecordForSelectedActivity?.time_out ? new Date(todayRecordForSelectedActivity.time_out).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—', color: '#ff0000' },
                    { label: 'Hours Today', value: todayRecordForSelectedActivity?.hours_rendered ?? '0.00', color: '#111' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{label}</div>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '22px', color }}>{value}</div>
                    </div>
                ))}
            </div>

            {!alreadyTimedOut && (
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                        Select Activity
                    </label>
                    <select
                        value={selectedActivity}
                        onChange={e => setSelectedActivity(e.target.value)}
                        disabled={!!mode}
                        autoComplete="off"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                    >
                        <option value="">-- Select your assigned activity --</option>
                        {selectableActivities?.map(a => (
                            <option key={a.id} value={a.id}>{a.name} — {a.location_name} ({a.date})</option>
                        ))}
                    </select>
                </div>
            )}

            {!modelsLoaded && (
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    Loading face recognition models...
                </div>
            )}

            {cameraOn && verified && mode !== 'register' ? (
                <div style={{
                    marginBottom: '16px', textAlign: 'center', background: '#f0fdf4',
                    borderRadius: '14px', padding: '40px 24px', border: '1px solid #bbf7d0',
                }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: '#16a34a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        animation: 'checkFadeIn 0.25s ease-out',
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M7 12.5L10.5 16L17 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', fontWeight: '600', color: '#166534' }}>
                        {status || 'Verified!'}
                    </div>
                </div>
            ) : cameraOn && (
                <div style={{
                    marginBottom: '16px', textAlign: 'center', background: '#fafafa',
                    borderRadius: '14px', padding: '32px 24px', border: '1px solid #ececec',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '4px', letterSpacing: '0.3px' }}>
                        {mode === 'register' ? 'Scan Your Face' : mode === 'timein' ? 'Face Verification — Time In' : 'Face Verification — Time Out'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '22px' }}>
                        {mode === 'register'
                            ? 'Follow the instructions below to verify it\u2019s really you.'
                            : 'Your face will be scanned automatically — no need to press anything.'}
                    </div>

                    <div style={{ position: 'relative', width: '260px', height: '268px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {showArrow && currentArrow === 'left' && (
                            <div key={`arrow-${liveStep}`} style={{ position: 'absolute', left: '-6px', zIndex: 2 }}>
                                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" style={{ animation: 'arrowAppear 0.4s ease-out' }}>
                                    <path d="M15 18L9 12L15 6" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
                                        />
                                    </foreignObject>
                                    {activeProgress > 0 && (
                                        <ellipse
                                            cx="104" cy="134" rx="100" ry="130" fill="none"
                                            stroke={livePositive ? '#16a34a' : '#9ca3af'}
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
                                    <path d="M9 6L15 12L9 18" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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

                    {mode === 'register' && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '18px' }}>
                            {REGISTER_STEPS.slice(0, 4).map((step, idx) => {
                                const currentIdx = REGISTER_STEPS.indexOf(liveStep);
                                return (
                                    <div key={step} style={{
                                        width: '36px', height: '6px', borderRadius: '999px',
                                        background: idx < currentIdx ? '#16a34a' : idx === currentIdx ? '#ff0000' : '#e5e7eb',
                                        transition: 'background 0.2s',
                                    }} />
                                );
                            })}
                        </div>
                    )}

                    <div style={{ marginTop: '14px', fontSize: '14px', fontWeight: '600', color: '#111', minHeight: '20px' }}>
                        {mode === 'register' ? (status || STEP_LABELS[liveStep]) : (status || 'Position your face within the frame')}
                    </div>

                    <div style={{
                        marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #eee',
                        textAlign: 'left', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto',
                    }}>
                        {[
                            'Remove glasses, mask, or anything covering your face.',
                            'Keep your whole face inside the circle.',
                            'Scanning is automatic — no need to press anything.',
                            'Make sure the area is well lit.',
                        ].map((tip, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                                <span style={{ color: '#ff0000' }}>•</span>
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!cameraOn && status && (
                <div style={{
                    padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px',
                    background: statusType === 'success' ? '#f0fdf4' : statusType === 'error' ? '#fef2f2' : '#f9fafb',
                    color: statusType === 'success' ? '#166534' : statusType === 'error' ? '#991b1b' : '#374151',
                }}>
                    {status}
                </div>
            )}

            {!mode && selectedActivity && alreadyTimedOut ? (
                <div style={{ padding: '12px 14px', borderRadius: '6px', fontSize: '13px', background: '#f0fdf4', color: '#166534' }}>
                    You have already completed attendance for this activity today.
                </div>
            ) : !mode ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                        onClick={() => startMode('timein')}
                        disabled={alreadyTimedIn || !modelsLoaded}
                        style={{
                            padding: '12px', borderRadius: '6px', border: 'none',
                            cursor: alreadyTimedIn || !modelsLoaded ? 'not-allowed' : 'pointer',
                            background: alreadyTimedIn ? '#e5e7eb' : '#16a34a',
                            color: alreadyTimedIn ? '#9ca3af' : 'white',
                            fontWeight: '600', fontSize: '14px',
                        }}
                    >
                        {alreadyTimedIn ? 'Timed In' : 'Face Time In'}
                    </button>
                    <button
                        onClick={() => startMode('timeout')}
                        disabled={!modelsLoaded}
                        style={{
                            padding: '12px', borderRadius: '6px', border: 'none',
                            cursor: !modelsLoaded ? 'not-allowed' : 'pointer',
                            background: '#ff0000',
                            color: 'white',
                            fontWeight: '600', fontSize: '14px',
                        }}
                    >
                        Face Time Out
                    </button>
                </div>
            ) : mode !== 'register' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    <button
                        onClick={cancelMode}
                        style={{ padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#f3f4f6', color: '#374151', fontWeight: '600' }}
                    >
                        Cancel
                    </button>
                </div>
            ) : null}

            {!faceIsRegistered && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e8e8e8' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '8px' }}>
                        First time? Register your face:
                    </div>
                    {mode === 'register' ? (
                        <button onClick={cancelMode} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#f3f4f6', color: '#374151', fontWeight: '600' }}>
                            Cancel
                        </button>
                    ) : (
                        <button
                            onClick={() => startMode('register')}
                            disabled={!modelsLoaded || !!mode}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', cursor: modelsLoaded ? 'pointer' : 'not-allowed', background: '#111', color: 'white', fontWeight: '600' }}
                        >
                            Register Face
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}