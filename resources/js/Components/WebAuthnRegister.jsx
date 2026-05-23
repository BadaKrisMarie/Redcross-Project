import React from 'react';
import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

export default function WebAuthnRegister() {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const getCsrfToken = () => {
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    };

    const registerFingerprint = async () => {
        setLoading(true);
        setStatus('');

        try {
            const optionsRes = await fetch(route('volunteer.webauthn.register.options'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
            });

            const options = await optionsRes.json();

            const registration = await startRegistration(options);

            const verifyRes = await fetch(route('volunteer.webauthn.register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(registration),
            });

            const result = await verifyRes.json();
            setStatus('✅ ' + result.message);
        } catch (err) {
            setStatus('❌ ' + (err.message || 'Fingerprint registration failed.'));
        }

        setLoading(false);
    };

    return (
        <div style={{ marginTop: '12px' }}>
            <button
                onClick={registerFingerprint}
                disabled={loading}
                style={{
                    background: loading ? '#999' : '#111',
                    color: 'white', border: 'none',
                    padding: '10px 20px', borderRadius: '6px',
                    fontSize: '13px', fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                }}
            >
                {loading ? 'Registering...' : '🖐 Register Fingerprint'}
            </button>
            {status && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: status.startsWith('✅') ? '#16a34a' : '#DC2626' }}>
                    {status}
                </p>
            )}
        </div>
    );
}
