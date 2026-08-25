import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        user_type: 'volunteer',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log In" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

            <div style={{
                minHeight: '100vh', display: 'flex',
                justifyContent: 'center', alignItems: 'center',
                fontFamily: 'Montserrat, sans-serif',
                background: '#f7f7f7', padding: '40px 20px'
            }}>

                <div style={{
                    width: '100%', maxWidth: '420px',
                    background: '#fff', borderRadius: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    padding: '48px 40px'
                }}>

                    {/* Title */}
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <h2 style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '30px', fontWeight: '800', color: '#111',
                            letterSpacing: '-0.5px', lineHeight: '1.1',
                            margin: 0
                        }}>
                            Sign In
                        </h2>
                    </div>

                    {/* Status */}
                    {status && (
                        <div style={{
                            marginBottom: '20px', padding: '12px 16px',
                            background: '#f0fdf4', borderRadius: '8px',
                            border: '1px solid #bbf7d0',
                            fontSize: '13px', fontFamily: 'Montserrat, sans-serif',
                            fontWeight: '500', color: '#16a34a'
                        }}>{status}</div>
                    )}

                    {/* Form */}
                    <form onSubmit={submit}>

                        {/* Email */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{
                                display: 'block', fontSize: '11px',
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: '700', color: '#444', marginBottom: '7px',
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>Email Address</label>
                            <input
                                type="email"
                                value={data.email}
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Enter your email address"
                                style={{
                                    width: '100%', padding: '11px 14px',
                                    border: errors.email ? '1px solid #ff0000' : '1px solid #e5e5e5',
                                    borderRadius: '8px', fontSize: '14px',
                                    fontFamily: 'Montserrat, sans-serif', fontWeight: '400',
                                    outline: 'none', color: '#111',
                                    background: '#fafafa', boxSizing: 'border-box'
                                }}
                            />
                            {errors.email && (
                                <p style={{
                                    fontSize: '11px', fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: '500', color: '#ff0000', marginTop: '5px'
                                }}>{errors.email}</p>
                            )}
                        </div>

                        {/* Password with show/hide toggle */}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{
                                display: 'block', fontSize: '11px',
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: '700', color: '#444', marginBottom: '7px',
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    style={{
                                        width: '100%', padding: '11px 42px 11px 14px',
                                        border: errors.password ? '1px solid #ff0000' : '1px solid #e5e5e5',
                                        borderRadius: '8px', fontSize: '14px',
                                        fontFamily: 'Montserrat, sans-serif', fontWeight: '400',
                                        outline: 'none', color: '#111',
                                        background: '#fafafa', boxSizing: 'border-box'
                                    }}
                                />
                                {/* Show/Hide password button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', padding: '0',
                                        display: 'flex', alignItems: 'center',
                                        color: '#999',
                                    }}
                                >
                                    {showPassword ? (
                                        /* Eye OPEN — password is visible, click to HIDE */
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    ) : (
                                        /* Eye CLOSED — password is hidden, click to SHOW */
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p style={{
                                    fontSize: '11px', fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: '500', color: '#ff0000', marginTop: '5px'
                                }}>{errors.password}</p>
                            )}
                        </div>

                        {/* Remember + Forgot */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', marginBottom: '24px'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    style={{ accentColor: '#ff0000' }}
                                />
                                <span style={{
                                    fontSize: '12px', fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: '500', color: '#666'
                                }}>Remember me</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    style={{
                                        fontSize: '12px', fontFamily: 'Montserrat, sans-serif',
                                        fontWeight: '600', color: '#ff0000', textDecoration: 'none'
                                    }}
                                >Forgot password?</Link>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            style={{
                                width: '100%', padding: '13px',
                                background: '#ff0000',
                                color: 'white', border: 'none',
                                borderRadius: '8px', fontSize: '14px',
                                fontFamily: 'Montserrat, sans-serif', fontWeight: '700',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.3px', marginBottom: '20px'
                            }}
                        >{processing ? 'Signing In...' : 'Log In'}</button>

                        {/* Register Link */}
                        <p style={{
                            textAlign: 'center', fontSize: '13px',
                            fontFamily: 'Montserrat, sans-serif', fontWeight: '400', color: '#888'
                        }}>
                            Don't have an account?{' '}
                            <Link
                                href={route('register')}
                                style={{
                                    color: '#ff0000', fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: '700', textDecoration: 'none'
                                }}
                            >Register as Volunteer</Link>
                        </p>

                        {/* Back to home */}
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Link href="/" style={{
                                fontSize: '12px', fontFamily: 'Montserrat, sans-serif',
                                fontWeight: '600', color: '#666', textDecoration: 'none'
                            }}>
                                ← Back to Home
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}