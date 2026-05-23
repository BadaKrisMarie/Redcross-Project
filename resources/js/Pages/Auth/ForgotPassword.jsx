import React from 'react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
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

            {/* Page wrapper */}
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
                    maxWidth: '460px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}>

                    {/* Brand Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            backgroundColor: '#CC2222',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: '700',
                            flexShrink: 0,
                        }}>+</div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Rizal Chapter</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Muntinlupa City Branch</div>
                        </div>
                    </div>

                    {/* Icon */}
                    <div style={{
                        width: '52px',
                        height: '52px',
                        backgroundColor: '#FEF2F2',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem',
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC2222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#111',
                        marginBottom: '6px',
                    }}>
                        Forgot Password
                    </h1>
                    <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        marginBottom: '1.75rem',
                    }}>
                        Enter your registered email address and we'll send you a password reset link.
                    </p>

                    {/* Success status */}
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

                    {/* Form */}
                    <form onSubmit={submit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px',
                            }}>
                                Email Address
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
                                    color: '#111',
                                    backgroundColor: '#f9fafb',
                                    outline: 'none',
                                }}
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                            />
                            <InputError message={errors.email} className="mt-2" />
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
                                marginTop: '0.25rem',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={e => { if (!processing) e.target.style.backgroundColor = '#aa1a1a'; }}
                            onMouseLeave={e => { if (!processing) e.target.style.backgroundColor = '#CC2222'; }}
                        >
                            {processing ? 'Sending...' : 'Send Password Reset Link'}
                        </button>
                    </form>

                    {/* Back link */}
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <a
                            href="/login"
                            style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                textDecoration: 'none',
                            }}
                        >
                            ← Back to Sign In
                        </a>
                    </div>

                </div>
            </div>
        </GuestLayout>
    );
}