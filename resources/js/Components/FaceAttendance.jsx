import React from 'react';
import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export default function FaceAttendance({ todayRecord, activities }) {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [mode, setMode] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const alreadyTimedIn = !!todayRecord?.time_in;
    const alreadyTimedOut = !!todayRecord?.time_out;

    useEffect(() => {
        loadModels();
        return () => stopCamera();
    }, []);

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
            setStatus('❌ Failed to load face models.');
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
            setStatus('❌ Camera access denied.');
            setCameraOn(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
    };

    const getCsrfToken = () => {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    };

    const captureFaceDescriptor = async () => {
        if (!videoRef.current) return null;
        const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
        if (!detection) return null;
        return Array.from(detection.descriptor);
    };

    const getLocation = () => new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => reject(new Error('Location access denied.'))
        );
    });

    const handleRegister = async () => {
        setLoading(true);
        setStatus('📸 Scanning face...');
        const descriptor = await captureFaceDescriptor();
        if (!descriptor) {
            setStatus('❌ No face detected. Please look at the camera.');
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(route('volunteer.face.register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ face_descriptor: descriptor }),
            });
            const data = await res.json();
            setStatus(res.ok ? '✅ ' + data.message : '❌ ' + data.message);
            if (res.ok) { setCameraOn(false); setMode(null); }
        } catch {
            setStatus('❌ Something went wrong.');
        }
        setLoading(false);
    };

    const handleTimeIn = async () => {
        if (!selectedActivity) { setStatus('❌ Please select an activity.'); return; }
        setLoading(true);
        setStatus('📸 Scanning face...');
        const descriptor = await captureFaceDescriptor();
        if (!descriptor) {
            setStatus('❌ No face detected. Please look at the camera.');
            setLoading(false);
            return;
        }
        setStatus('📍 Checking location...');
        let location;
        try {
            location = await getLocation();
        } catch (e) {
            setStatus('❌ ' + e.message);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(route('volunteer.face.timein'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ activity_id: selectedActivity, face_descriptor: descriptor, ...location }),
            });
            const data = await res.json();
            setStatus(res.ok ? '✅ ' + data.message : '❌ ' + data.message);
            if (res.ok) { stopCamera(); setCameraOn(false); setMode(null); setTimeout(() => window.location.reload(), 1500); }
        } catch {
            setStatus('❌ Something went wrong.');
        }
        setLoading(false);
    };

    const handleTimeOut = async () => {
        if (!selectedActivity) { setStatus('❌ Please select an activity.'); return; }
        setLoading(true);
        setStatus('📸 Scanning face...');
        const descriptor = await captureFaceDescriptor();
        if (!descriptor) {
            setStatus('❌ No face detected. Please look at the camera.');
            setLoading(false);
            return;
        }
        setStatus('📍 Checking location...');
        let location;
        try {
            location = await getLocation();
        } catch (e) {
            setStatus('❌ ' + e.message);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(route('volunteer.face.timeout'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ activity_id: selectedActivity, face_descriptor: descriptor, ...location }),
            });
            const data = await res.json();
            setStatus(res.ok ? '✅ ' + data.message : '❌ ' + data.message);
            if (res.ok) { stopCamera(); setCameraOn(false); setMode(null); setTimeout(() => window.location.reload(), 1500); }
        } catch {
            setStatus('❌ Something went wrong.');
        }
        setLoading(false);
    };

    const startMode = (m) => {
        setMode(m);
        setStatus('');
        setCameraOn(true);
    };

    const cancelMode = () => {
        setMode(null);
        setCameraOn(false);
        setStatus('');
        stopCamera();
    };

    return (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '28px', marginBottom: '24px' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: '#111', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
                Today's Attendance
            </div>

            {/* Today stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Time In', value: todayRecord?.time_in ? new Date(todayRecord.time_in).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—', color: '#16a34a' },
                    { label: 'Time Out', value: todayRecord?.time_out ? new Date(todayRecord.time_out).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—', color: '#DC2626' },
                    { label: 'Hours Today', value: todayRecord?.hours_rendered ?? '0.00', color: '#111' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{label}</div>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '22px', color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Activity selector */}
            {!alreadyTimedOut && (
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                        Select Activity
                    </label>
                    <select
                        value={selectedActivity}
                        onChange={e => setSelectedActivity(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                    >
                        <option value="">-- Select your assigned activity --</option>
                        {activities?.map(a => (
                            <option key={a.id} value={a.id}>{a.name} — {a.location_name} ({a.date})</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Models loading indicator */}
            {!modelsLoaded && (
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    ⏳ Loading face recognition models...
                </div>
            )}

            {/* Camera */}
            {cameraOn && (
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', border: '2px solid #DC2626' }}
                    />
                </div>
            )}

            {/* Status */}
            {status && (
                <div style={{
                    padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px',
                    background: status.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
                    color: status.startsWith('✅') ? '#166534' : '#991b1b',
                }}>
                    {status}
                </div>
            )}

            {/* Buttons */}
            {!mode ? (
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
                        disabled={!alreadyTimedIn || alreadyTimedOut || !modelsLoaded}
                        style={{
                            padding: '12px', borderRadius: '6px', border: 'none',
                            cursor: (!alreadyTimedIn || alreadyTimedOut) ? 'not-allowed' : 'pointer',
                            background: alreadyTimedOut ? '#e5e7eb' : (!alreadyTimedIn ? '#e5e7eb' : '#DC2626'),
                            color: (alreadyTimedOut || !alreadyTimedIn) ? '#9ca3af' : 'white',
                            fontWeight: '600', fontSize: '14px',
                        }}
                    >
                        {alreadyTimedOut ? '✓ Timed Out' : '📷 Face Time Out'}
                    </button>
                </div>
            ) : mode !== 'register' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                        onClick={cancelMode}
                        style={{ padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#f3f4f6', color: '#374151', fontWeight: '600' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={mode === 'timein' ? handleTimeIn : handleTimeOut}
                        disabled={loading || !modelsLoaded}
                        style={{
                            padding: '12px', borderRadius: '6px', border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            background: '#DC2626', color: 'white', fontWeight: '600', fontSize: '14px',
                        }}
                    >
                        {loading ? 'Processing...' : '📸 Capture & Submit'}
                    </button>
                </div>
            ) : null}

            {/* Register face */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '8px' }}>
                    First time? Register your face:
                </div>
                {mode === 'register' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button onClick={cancelMode} style={{ padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#f3f4f6', color: '#374151', fontWeight: '600' }}>
                            Cancel
                        </button>
                        <button onClick={handleRegister} disabled={loading || !modelsLoaded} style={{ padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#111', color: 'white', fontWeight: '600' }}>
                            {loading ? 'Registering...' : '📸 Capture Face'}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => startMode('register')}
                        disabled={!modelsLoaded}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', cursor: modelsLoaded ? 'pointer' : 'not-allowed', background: '#111', color: 'white', fontWeight: '600' }}
                    >
                        🤳 Register Face
                    </button>
                )}
            </div>
        </div>
    );
}
