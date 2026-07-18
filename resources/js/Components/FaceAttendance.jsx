import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';

// ---- Detection tuning ----
const HOLD_FRAMES_REQUIRED = 2;     // consecutive well-positioned frames needed before capturing
const STABLE_FRAMES_REQUIRED = 6;   // for passive auto-capture (timein/timeout)

// More lenient detector options - helps with dim/backlit lighting conditions.
// Lower scoreThreshold = detector accepts less-confident detections instead of missing them.
function getDetectorOptions() {
    return new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 });
}

// A reusable offscreen canvas, shared across calls so we're not allocating a new one every frame.
let enhanceCanvas = null;

// Draws the current video frame onto an offscreen canvas with brightness/contrast boosted -
// this compensates for backlit or dim rooms (bright light behind the person, dark face) by
// artificially lightening the frame before it's fed into the face detector. Detection runs
// on this enhanced canvas instead of the raw video, without changing what the user sees on screen.
function getEnhancedFrame(video) {
    if (!enhanceCanvas) enhanceCanvas = document.createElement('canvas');
    enhanceCanvas.width = video.videoWidth;
    enhanceCanvas.height = video.videoHeight;
    const ctx = enhanceCanvas.getContext('2d');
    ctx.filter = 'brightness(1.5) contrast(1.2)';
    ctx.drawImage(video, 0, 0, enhanceCanvas.width, enhanceCanvas.height);
    return enhanceCanvas;
}

const REGISTER_STEPS = ['detecting_face', 'capturing', 'done'];

const STEP_LABELS = {
    detecting_face: 'Tumingin nang direkta sa camera',
    capturing: 'Kinukuha ang larawan...',
    done: '✅ Nakuha na!',
};

export default function FaceAttendance({ todayRecords, activities, hasFaceDescriptor }) {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [mode, setMode] = useState(null); // 'register' | 'timein' | 'timeout' | null
    const [selectedActivity, setSelectedActivity] = useState('');
    const [liveStep, setLiveStep] = useState('detecting_face'); // for register mode progress UI
    const [awaitingActivityForAutoStart, setAwaitingActivityForAutoStart] = useState(null); // 'timein' | 'timeout' | null
    const [debugInfo, setDebugInfo] = useState(null); // live readout to help diagnose detection issues

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const preWarmedStreamRef = useRef(null); // camera requested early in the background so it's instant when needed
    const rafRef = useRef(null);

    // detection refs
    const holdCounterRef = useRef(0);
    const stepIndexRef = useRef(0);
    const stableCounterRef = useRef(0);
    const processingRef = useRef(false);

    // Geolocation is kicked off the moment passive scanning starts (in parallel with face
    // detection frames), instead of waiting for a face match before requesting it. This ref
    // holds the in-flight (or settled) promise so submitAttendance can just await it - by the
    // time the face is matched, the location fix has often already resolved in the background.
    const locationPromiseRef = useRef(null);

    // Periodic "I'm still here at X,Y" pings sent to the server while checked in to
    // an activity (separate from the one-off getLocation() used for the time-in/out
    // request itself) - this is what powers the admin's live map.
    const pingIntervalRef = useRef(null);
    const pingingActivityIdRef = useRef(null);

    // The record (if any) matching whichever activity is currently selected - not just
    // "today's first record" - so status correctly resets when the volunteer switches
    // to a different activity assigned to them on the same day.
    const todayRecordForSelectedActivity = selectedActivity
        ? todayRecords?.find(r => String(r.activity_id) === String(selectedActivity))
        : null;

    const alreadyTimedIn = !!todayRecordForSelectedActivity?.time_in;
    const alreadyTimedOut = !!todayRecordForSelectedActivity?.time_out;

    useEffect(() => {
        loadModels();
        // Pre-request camera access in the background right away, so by the time the
        // user actually opens a mode, the stream is already live - no visible delay.
        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                preWarmedStreamRef.current = stream;
            } catch {
                // permission not granted yet / denied - will just fall back to requesting
                // normally when the user actually clicks a button.
            }
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

    // Resume periodic location pings on mount if the volunteer is already checked
    // in to some activity today (time_in done, time_out not yet done) - this covers
    // the page reload that happens right after a successful time-in.
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

    // Auto-chain: once an activity is selected while waiting (right after registration),
    // automatically proceed to the passive time-in/time-out scan without extra clicks.
    useEffect(() => {
        if (awaitingActivityForAutoStart && selectedActivity) {
            const target = awaitingActivityForAutoStart;
            setAwaitingActivityForAutoStart(null);
            setStatus('');
            startPassiveLoop(target);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedActivity, awaitingActivityForAutoStart]);

    const loadModels = async () => {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            ]);
            setModelsLoaded(true);
        } catch (err) {
            setStatus('❌ Failed to load face models.');
        }
    };

    const startCamera = async () => {
        try {
            // Reuse the pre-warmed stream if we already have one - instant, no waiting.
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
            setStatus('❌ Camera access denied.');
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
        // NOTE: not re-warming a new stream here on purpose - if the component unmounts
        // right after this runs, a background getUserMedia() call could resolve after
        // unmount and leave the camera indicator on with nothing to clean it up.
        // The very first open is pre-warmed on mount; subsequent opens are still fast
        // since the browser no longer needs to show a permission prompt.
    };

    const stopEverything = () => stopCamera();

    const getCsrfToken = () => {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    };

    const getLocation = () => new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => reject(new Error('Location access denied.'))
        );
    });

    // Kicks off the geolocation request right now and stashes the promise so later code can
    // just await it instead of starting a fresh request. Call this at the moment passive
    // scanning begins (and again on each retry) so it runs alongside face detection instead
    // of only starting after a face match is found.
    const primeLocation = () => {
        locationPromiseRef.current = getLocation();
    };

    // Sends one location ping to the server for the given activity. Fire-and-forget:
    // a missed ping just means the admin map's marker for this volunteer goes a bit
    // stale until the next successful one - not worth surfacing to the volunteer.
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

    // Starts periodic pings for this activity - called right after a successful
    // time-in (and again on mount if the volunteer reloads the page while still
    // checked in). Safe to call repeatedly: clears any previous interval first.
    const startLocationPing = (activityId) => {
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingingActivityIdRef.current = activityId;
        sendLocationPing(activityId); // send one immediately, don't wait for the first interval tick
        pingIntervalRef.current = setInterval(() => sendLocationPing(activityId), 20000);
    };

    // Stops periodic pings and, if requested, tells the server to drop this
    // volunteer's marker immediately (used on a successful time-out) rather than
    // waiting for the admin map's stale-ping cutoff.
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

    // ---------------- REGISTER FLOW (one-shot: just needs a clear, stable selfie) ----------------

    const startRegisterLoop = useCallback(() => {
        stepIndexRef.current = 0;
        holdCounterRef.current = 0;
        setLiveStep('detecting_face');

        const tick = async () => {
            let continueLoop = true;
            try {
                const video = videoRef.current;
                if (!video || video.readyState !== 4) {
                    return; // continueLoop stays true, will reschedule in finally
                }

                const currentStep = REGISTER_STEPS[stepIndexRef.current];

                if (currentStep === 'detecting_face') {
                    // Lightweight detection (no landmarks/descriptor) just to confirm a
                    // well-positioned face is steadily in frame before we capture.
                    const frame = getEnhancedFrame(video);
                    const result = await faceapi.detectSingleFace(frame, getDetectorOptions());

                    if (!result) {
                        holdCounterRef.current = 0;
                        setStatus('Walang nakikitang mukha. Siguraduhing maliwanag ang paligid at nasa loob ng bilog ang buong mukha.');
                        setDebugInfo(null);
                        return;
                    }

                    setStatus('');
                    const videoArea = video.videoWidth * video.videoHeight;
                    const faceRatio = (result.box.width * result.box.height) / videoArea;
                    const wellPositioned = faceRatio > 0.08 && faceRatio < 0.6;

                    setDebugInfo({ step: currentStep, hold: holdCounterRef.current });

                    if (wellPositioned) {
                        holdCounterRef.current += 1;
                        if (holdCounterRef.current >= HOLD_FRAMES_REQUIRED) {
                            stepIndexRef.current = 1;
                            holdCounterRef.current = 0;
                            setLiveStep('capturing');
                        }
                    } else {
                        holdCounterRef.current = 0;
                        setStatus('Ilapit o layuan nang kaunti ang mukha');
                    }
                } else if (currentStep === 'capturing') {
                    // The one heavier detection call (with descriptor) - only done once, at capture time.
                    const frame = getEnhancedFrame(video);
                    const finalResult = await faceapi
                        .detectSingleFace(frame, getDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (!finalResult) {
                        // face moved right at the last moment - go back and wait for a stable frame again
                        stepIndexRef.current = 0;
                        setLiveStep('detecting_face');
                        return;
                    }

                    setLiveStep('done');
                    continueLoop = false; // stop the loop, submitRegister takes over
                    submitRegister(Array.from(finalResult.descriptor));
                }
            } catch (err) {
                // Never let a transient detection error silently kill the loop.
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
        setStatus('📸 Nire-record ang face...');
        try {
            const res = await fetch(route('volunteer.face.register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ face_descriptor: descriptor }),
            });
            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setStatus('✅ Na-verify ang mukha mo!');
                // camera stays running - automatically continue into attendance, almost instantly
                setTimeout(() => proceedToAttendanceAfterRegister(), 250);
            } else {
                setStatus('❌ ' + data.message);
            }
        } catch {
            setStatus('❌ Something went wrong.');
            setLoading(false);
        }
    };

    // Decide what should happen right after a successful face registration:
    // auto-continue to time-in, or time-out if already timed in, or stop if nothing left to do today.
    const proceedToAttendanceAfterRegister = () => {
        const target = !alreadyTimedIn ? 'timein' : (!alreadyTimedOut ? 'timeout' : null);

        if (!target) {
            setStatus('✅ Naka-enroll ka na! Wala nang aksyon na kailangan ngayong araw.');
            stopCamera(); setCameraOn(false); setMode(null);
            return;
        }

        setMode(target);

        if (!selectedActivity) {
            setStatus('Pumili ng activity para awtomatikong magpatuloy sa ' + (target === 'timein' ? 'Time In' : 'Time Out') + '.');
            setAwaitingActivityForAutoStart(target);
            return;
        }

        setStatus('Awtomatikong magpapatuloy sa ' + (target === 'timein' ? 'Time In' : 'Time Out') + '...');
        startPassiveLoop(target);
    };

    // ---------------- TIME IN / TIME OUT FLOW (passive auto-capture) ----------------

    const startPassiveLoop = useCallback((targetMode) => {
        stableCounterRef.current = 0;
        processingRef.current = false;

        // Fire off the geolocation request right now, in parallel with face scanning below,
        // instead of waiting until a face match is confirmed. By the time the face is
        // matched, this has often already resolved - submitAttendance just awaits it.
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

                // Lightweight detection (no landmarks/descriptor needed) just to check
                // positioning - keeps the loop fast so we don't miss the stable moment.
                const frame = getEnhancedFrame(video);
                const result = await faceapi.detectSingleFace(frame, getDetectorOptions());

                if (!result) {
                    stableCounterRef.current = 0;
                    setStatus('Walang nakikitang mukha. Siguraduhing maliwanag ang paligid.');
                    return;
                }

                const box = result.box;
                const videoArea = video.videoWidth * video.videoHeight;
                const faceRatio = (box.width * box.height) / videoArea;
                const wellPositioned = faceRatio > 0.08 && faceRatio < 0.6;

                if (wellPositioned) {
                    stableCounterRef.current += 1;
                    setStatus('Huwag gumalaw...');
                } else {
                    stableCounterRef.current = 0;
                    setStatus('Ilapit o layuan nang kaunti ang mukha');
                }

                if (stableCounterRef.current >= STABLE_FRAMES_REQUIRED) {
                    // Now do the one heavier detection call (with descriptor) for the actual capture.
                    const captureFrame = getEnhancedFrame(video);
                    const finalResult = await faceapi
                        .detectSingleFace(captureFrame, getDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (!finalResult) {
                        // face moved right at the last moment - just retry
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
        setStatus('📍 Checking location...');
        let location;
        try {
            // Await the location fetch that was already kicked off back when scanning started
            // (see primeLocation in startPassiveLoop) - usually already resolved by now.
            location = await locationPromiseRef.current;
        } catch (e) {
            setStatus('❌ ' + e.message);
            setLoading(false);
            processingRef.current = false;
            // retry loop after location failure - this also re-primes location via startPassiveLoop
            rafRef.current = requestAnimationFrame(() => startPassiveLoop(targetMode));
            return;
        }

        setStatus('🔍 Kina-kumpirma ang pagkakakilanlan...');
        try {
            const routeName = targetMode === 'timein' ? 'volunteer.face.timein' : 'volunteer.face.timeout';

            // Abort the request if it hangs too long, instead of leaving the UI stuck forever.
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
                // response wasn't valid JSON (e.g. server returned an HTML error page)
                throw new Error('invalid_response');
            }

            setStatus(res.ok ? '✅ ' + data.message : '❌ ' + data.message);
            if (res.ok) {
                if (targetMode === 'timein') {
                    startLocationPing(selectedActivity);
                } else {
                    stopLocationPing(true); // targetMode === 'timeout' - clear marker on server immediately
                }
                stopCamera(); setCameraOn(false); setMode(null);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                // allow retry - face didn't match or out of range
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
                setStatus('❌ Sobrang tagal ng response galing sa server (timeout). Subukan ulit.');
            } else if (err.message === 'invalid_response') {
                setStatus('❌ May error sa server (hindi valid ang response). I-check ang Laravel logs.');
            } else {
                setStatus('❌ Something went wrong. I-check ang internet connection o server.');
            }
            console.error('Attendance submit error:', err);
        }
        setLoading(false);
    };

    // ---------------- Mode control ----------------

    const startMode = (m) => {
        if ((m === 'timein' || m === 'timeout') && !selectedActivity) {
            setStatus('❌ Please select an activity.');
            return;
        }
        setMode(m);
        setStatus('');
        setCameraOn(true);

        // wait a tick for video element to mount + stream to attach before starting detection
        setTimeout(() => {
            if (m === 'register') startRegisterLoop();
            else startPassiveLoop(m);
        }, 300);
    };

    const cancelMode = () => {
        setMode(null);
        setCameraOn(false);
        setStatus('');
        setAwaitingActivityForAutoStart(null);
        stopCamera();
    };

    return (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '28px', marginBottom: '24px' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: '#111', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
                Today's Attendance
            </div>

            {/* Today stats - reflect whichever activity is currently selected */}
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
            {!selectedActivity && (
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '-16px', marginBottom: '20px' }}>
                    Pumili ng activity sa ibaba para makita ang status ng attendance mo dito.
                </div>
            )}

            {/* Activity selector */}
            {!alreadyTimedOut && (
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                        Select Activity
                    </label>
                    <select
                        value={selectedActivity}
                        onChange={e => setSelectedActivity(e.target.value)}
                        disabled={!!mode && !awaitingActivityForAutoStart}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                    >
                        <option value="">-- Select your assigned activity --</option>
                        {activities?.map(a => (
                            <option key={a.id} value={a.id}>{a.name} — {a.location_name} ({a.date})</option>
                        ))}
                    </select>
                </div>
            )}

            {!modelsLoaded && (
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    ⏳ Loading face recognition models...
                </div>
            )}

            {/* Camera - circular scan-face UI */}
            {cameraOn && (
                <div style={{
                    marginBottom: '16px', textAlign: 'center', background: '#fafafa',
                    borderRadius: '12px', padding: '28px 20px', border: '1px solid #eee',
                }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>
                        {mode === 'register' ? 'I-scan ang Mukha' : mode === 'timein' ? 'Face Verification — Time In' : 'Face Verification — Time Out'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
                        {mode === 'register'
                            ? 'Susundin lang ang instructions para ma-verify na ikaw talaga.'
                            : 'Automatic na ma-sscan ang iyong mukha, walang pipindutin.'}
                    </div>

                    {/* Circular video frame */}
                    <div style={{
                        position: 'relative', width: '220px', height: '220px', margin: '0 auto',
                    }}>
                        <div style={{
                            width: '220px', height: '220px', borderRadius: '50%', overflow: 'hidden',
                            border: `4px solid ${mode === 'register' && liveStep === 'done' ? '#16a34a' : '#ff0000'}`,
                            boxShadow: '0 0 0 4px rgba(255,0,0,0.08)',
                        }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{
                                    width: '100%', height: '100%', objectFit: 'cover',
                                    transform: 'scaleX(-1)',
                                }}
                            />
                        </div>
                        {/* subtle pulsing scan ring while actively working */}
                        {loading || (mode === 'register' && liveStep !== 'done') ? (
                            <div style={{
                                position: 'absolute', inset: '-4px', borderRadius: '50%',
                                border: '2px solid #ff0000', opacity: 0.4,
                                animation: 'scanPulse 1.6s ease-out infinite',
                            }} />
                        ) : null}
                    </div>

                    <style>{`
                        @keyframes scanPulse {
                            0% { transform: scale(1); opacity: 0.5; }
                            100% { transform: scale(1.18); opacity: 0; }
                        }
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>

                    {/* Liveness progress dots - register mode only */}
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
                        {mode === 'register' ? (status || STEP_LABELS[liveStep]) : (status || 'Iposisyon ang mukha sa loob ng frame')}
                    </div>

                    {/* Live debug readout - temporary, helps diagnose if detection isn't triggering */}
                    {mode === 'register' && debugInfo && (
                        <div style={{
                            marginTop: '10px', fontSize: '11px', fontFamily: 'monospace', color: '#999',
                            background: '#f5f5f5', borderRadius: '6px', padding: '8px 12px', display: 'inline-block',
                        }}>
                            step: {debugInfo.step} | hold: {debugInfo.hold}/{HOLD_FRAMES_REQUIRED}
                        </div>
                    )}

                    {/* Instruction list - shown before/during scanning, like the reference UI */}
                    <div style={{
                        marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #eee',
                        textAlign: 'left', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto',
                    }}>
                        {[
                            'Alisin ang salamin, mask, o anumang nakatatakip sa mukha.',
                            'Panatilihing nasa loob ng bilog ang buong mukha.',
                            'Automatic na mag-sscan — walang kailangang pindutin.',
                            'Siguraduhing maliwanag ang paligid.',
                        ].map((tip, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                                <span style={{ color: '#ff0000' }}>•</span>
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Status - only shown when camera is closed (active-scan status already shows inside the circle) */}
            {!cameraOn && status && (
                <div style={{
                    padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px',
                    background: status.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
                    color: status.startsWith('✅') ? '#166534' : '#991b1b',
                }}>
                    {status}
                </div>
            )}

            {/* Buttons - hidden entirely (not just disabled) once fully timed out for the selected activity */}
            {!mode && selectedActivity && alreadyTimedOut ? (
                <div style={{
                    padding: '12px 14px', borderRadius: '6px', fontSize: '13px',
                    background: '#f0fdf4', color: '#166534',
                }}>
                    ✅ Kumpleto na ang attendance mo sa activity na ito ngayong araw.
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
                        {alreadyTimedIn ? '✓ Timed In' : '📷 Face Time In'}
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
                        📷 Face Time Out
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

            {/* Register face - only shown if not yet enrolled */}
            {!hasFaceDescriptor && (
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
                            🤳 Register Face
                        </button>
                    )}
                </div>
            )}

            {/* Already enrolled notice */}
            {hasFaceDescriptor && (
                <div style={{
                    marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e8e8e8',
                    fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                    ✅ Naka-enroll na ang mukha mo. Kontakin ang admin kung kailangan mo mag-re-register.
                </div>
            )}
        </div>
    );
}
