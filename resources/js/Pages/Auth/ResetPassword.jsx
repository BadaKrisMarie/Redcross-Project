import React from 'react';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '14px',
        color: '#111',
        backgroundColor: '#f9fafb',
        outline: 'none',
        marginTop: '6px',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

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
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
                        Reset Password
                    </h1>
                    <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        marginBottom: '1.75rem',
                    }}>
                        Enter your new password below to reset your account.
                    </p>

                    <form onSubmit={submit}>
                        {/* Email */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label htmlFor="email" style={labelStyle}>Email Address</label>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                style={inputStyle}
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label htmlFor="password" style={labelStyle}>New Password</label>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                style={inputStyle}
                                autoComplete="new-password"
                                isFocused={true}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="password_confirmation" style={labelStyle}>Confirm New Password</label>
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                style={inputStyle}
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        {/* Submit */}
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
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={e => { if (!processing) e.target.style.backgroundColor = '#aa1a1a'; }}
                            onMouseLeave={e => { if (!processing) e.target.style.backgroundColor = '#CC2222'; }}
                        >
                            {processing ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    {/* Back link */}
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <a href="/login" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
                            ← Back to Sign In
                        </a>
                    </div>

                </div>
            </div>
        </GuestLayout>
    );
}