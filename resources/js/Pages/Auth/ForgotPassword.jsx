import React from 'react';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                padding: '2rem',
            }}>
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    padding: '2.5rem',
                    width: '100%',
                    maxWidth: '440px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}>

                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '6px',
                        textAlign: 'center',
                    }}>
                        Forgot password
                    </h1>
                    <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        marginBottom: '1.75rem',
                        textAlign: 'center',
                    }}>
                        Enter your registered email and we'll send you a link to reset your password.
                    </p>

                    {status && (
                        <div style={{
                            backgroundColor: '#F0FDF4',
                            border: '1px solid #86EFAC',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            marginBottom: '1.25rem',
                            fontSize: '13px',
                            color: '#166534',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label htmlFor="email" style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px',
                            }}>
                                Email address
                            </label>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px',
                                    color: '#111827',
                                    backgroundColor: '#ffffff',
                                    outline: 'none',
                                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                }}
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="name@example.com"
                            />
                            <InputError message={errors.email} className="mt-2" />
                            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
                                We'll only use this to verify your account and send the reset link.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            style={{
                                width: '100%',
                                padding: '11px',
                                backgroundColor: processing ? '#e5a0a0' : '#CC2222',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={e => { if (!processing) e.target.style.backgroundColor = '#aa1a1a'; }}
                            onMouseLeave={e => { if (!processing) e.target.style.backgroundColor = '#CC2222'; }}
                        >
                            {processing ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <a
                            href="/login"
                            style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                textDecoration: 'none',
                            }}
                        >
                            &larr; Back to sign in
                        </a>
                    </div>

                </div>
            </div>
        </GuestLayout>
    );
}