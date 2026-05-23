import React from 'react';
import { useState } from 'react';

export default function WebAuthnAttendance({ todayRecord }) {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const alreadyTimedIn = !!todayRecord?.time_in;
    const alreadyTimedOut = !!todayRecord?.time_out;

    const getCsrfToken = () => {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    };

    const handleAttendance = async (type) => {
        setLoading(true);
        setStatus('');

        const actionRoute = type === 'timein'
            ? route('volunteer.webauthn.timein')
            : route('volunteer.webauthn.timeout');

        try {
            const res = await fetch(actionRoute, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
            });

            const result = await res.json();

            if (res.ok) {
                setStatus('✅ ' + result.message);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setStatus('❌ ' + result.message);
            }

        } catch (err) {
            setStatus('❌ ' + (err.message || 'Something went wrong.'));
        }

        setLoading(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <button
                    onClick={() => handleAttendance('timein')}
                    disabled={alreadyTimedIn || loading}
                    style={{
                        flex: 1, padding: '12px',
                        background: alreadyTimedIn ? '#e5e7eb' : '#16a34a',
                        color: alreadyTimedIn ? '#9ca3af' : 'white',
                        border: 'none', borderRadius: '6px',
                        fontSize: '14px', fontWeight: '600',
                        cursor: alreadyTimedIn ? 'not-allowed' : 'pointer',
                    }}
                >
                    {alreadyTimedIn ? '✓ Timed In' : '🖐 Fingerprint Time In'}
                </button>

                <button
                    onClick={() => handleAttendance('timeout')}
                    disabled={!alreadyTimedIn || alreadyTimedOut || loading}
                    style={{
                        flex: 1, padding: '12px',
                        background: alreadyTimedOut ? '#e5e7eb' : (!alreadyTimedIn ? '#e5e7eb' : '#DC2626'),
                        color: (alreadyTimedOut || !alreadyTimedIn) ? '#9ca3af' : 'white',
                        border: 'none', borderRadius: '6px',
                        fontSize: '14px', fontWeight: '600',
                        cursor: (!alreadyTimedIn || alreadyTimedOut) ? 'not-allowed' : 'pointer',
                    }}
                >
                    {alreadyTimedOut ? '✓ Timed Out' : '🖐 Fingerprint Time Out'}
                </button>
            </div>

            {status && (
                <p style={{
                    fontSize: '13px',
                    color: status.startsWith('✅') ? '#16a34a' : '#DC2626',
                    marginTop: '8px'
                }}>
                    {status}
                </p>
            )}
        </div>
    );
}
