import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [userType, setUserType] = useState('volunteer');

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

    const handleToggle = (type) => {
        setUserType(type);
        setData('user_type', type);
    };

    return (
        <>
            <Head title="Log In" />
            <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

            <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

                {/* LEFT SIDE - Form */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    padding: '60px 48px', background: '#fff'
                }}>
                    <div style={{ width: '100%', maxWidth: '380px' }}>

                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                            <div style={{
                                width: '34px', height: '34px', background: '#DC2626',
                                borderRadius: '4px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '900'
                            }}>+</div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#111' }}>Rizal Chapter</strong>
                                <span style={{ display: 'block', fontSize: '10px', color: '#888' }}>Muntinlupa City Branch</span>
                            </div>
                        </div>

                        {/* Title */}
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{
                                fontFamily: 'Bebas Neue, sans-serif',
                                fontSize: '38px', color: '#111',
                                letterSpacing: '1px', lineHeight: '1',
                                marginBottom: '8px'
                            }}>
                                {userType === 'volunteer' ? 'Volunteer' : 'Admin'} Sign In
                            </h2>
                            <p style={{ fontSize: '13px', color: '#888', fontWeight: '300' }}>
                                Sign in to access your {userType === 'volunteer' ? 'volunteer' : 'admin'} account
                            </p>
                        </div>

                        {/* Toggle */}
                        <div style={{
                            display: 'flex', background: '#f5f5f5',
                            borderRadius: '8px', padding: '4px',
                            marginBottom: '28px'
                        }}>
                            <button
                                type="button"
                                onClick={() => handleToggle('volunteer')}
                                style={{
                                    flex: 1, padding: '9px',
                                    borderRadius: '6px', border: 'none',
                                    cursor: 'pointer', fontSize: '13px',
                                    fontWeight: '600', transition: 'all 0.2s',
                                    background: userType === 'volunteer' ? '#DC2626' : 'transparent',
                                    color: userType === 'volunteer' ? 'white' : '#888',
                                }}
                            >Volunteer</button>
                            <button
                                type="button"
                                onClick={() => handleToggle('admin')}
                                style={{
                                    flex: 1, padding: '9px',
                                    borderRadius: '6px', border: 'none',
                                    cursor: 'pointer', fontSize: '13px',
                                    fontWeight: '600', transition: 'all 0.2s',
                                    background: userType === 'admin' ? '#DC2626' : 'transparent',
                                    color: userType === 'admin' ? 'white' : '#888',
                                }}
                            >Admin</button>
                        </div>

                        {/* Status */}
                        {status && (
                            <div style={{
                                marginBottom: '20px', padding: '12px 16px',
                                background: '#f0fdf4', borderRadius: '8px',
                                border: '1px solid #bbf7d0',
                                fontSize: '13px', color: '#16a34a'
                            }}>{status}</div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit}>

                            {/* Email */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{
                                    display: 'block', fontSize: '12px',
                                    fontWeight: '500', color: '#444', marginBottom: '7px'
                                }}>Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email address"
                                    style={{
                                        width: '100%', padding: '11px 14px',
                                        border: errors.email ? '1px solid #DC2626' : '1px solid #e5e5e5',
                                        borderRadius: '8px', fontSize: '13px',
                                        outline: 'none', color: '#111',
                                        background: '#fafafa', boxSizing: 'border-box'
                                    }}
                                />
                                {errors.email && (
                                    <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '5px' }}>{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{
                                    display: 'block', fontSize: '12px',
                                    fontWeight: '500', color: '#444', marginBottom: '7px'
                                }}>Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    style={{
                                        width: '100%', padding: '11px 14px',
                                        border: errors.password ? '1px solid #DC2626' : '1px solid #e5e5e5',
                                        borderRadius: '8px', fontSize: '13px',
                                        outline: 'none', color: '#111',
                                        background: '#fafafa', boxSizing: 'border-box'
                                    }}
                                />
                                {errors.password && (
                                    <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '5px' }}>{errors.password}</p>
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
                                        style={{ accentColor: '#DC2626' }}
                                    />
                                    <span style={{ fontSize: '12px', color: '#666' }}>Remember me</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        style={{ fontSize: '12px', color: '#DC2626', textDecoration: 'none', fontWeight: '500' }}
                                    >Forgot password?</Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    width: '100%', padding: '13px',
                                    background: processing ? '#f87171' : '#DC2626',
                                    color: 'white', border: 'none',
                                    borderRadius: '8px', fontSize: '14px',
                                    fontWeight: '600', cursor: processing ? 'not-allowed' : 'pointer',
                                    letterSpacing: '0.3px', marginBottom: '20px'
                                }}
                            >{processing ? 'Signing In...' : 'Log In'}</button>

                            {/* Register Link - only for volunteers */}
                            {userType === 'volunteer' && (
                                <p style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
                                    Don't have an account?{' '}
                                    <Link
                                        href={route('register')}
                                        style={{ color: '#DC2626', fontWeight: '600', textDecoration: 'none' }}
                                    >Register as Volunteer</Link>
                                </p>
                            )}

                            {/* Back to home */}
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Link href="/" style={{ fontSize: '12px', color: '#bbb', textDecoration: 'none' }}>
                                    ← Back to Home
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT SIDE - Photo */}
                <div style={{
                    flex: 1, position: 'relative',
                    background: '#1a1a1a', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {/* Background image */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: "url('https://scontent.fmnl8-1.fna.fbcdn.net/v/t39.30808-6/486253255_122117910200759224_1850104524729330657_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=s3qPx72vL0QQ7kNvwEIiHPI&_nc_oc=AdqRmmyhVTdlpQ1ucKr3gwtRZUjigQziyUGexQspH0zfnd9XfILoSqGTRbOsO1TXLSzdeB3CaaEb3y_yR-Ejs5Rk&_nc_zt=23&_nc_ht=scontent.fmnl8-1.fna&_nc_gid=OEftzlaHV_BR3OPDU5Gs0g&_nc_ss=7b289&oh=00_Af5Y55emzOdxd-X1_8lK2G_kTNILcyfRuukztDwxOLT0bw&oe=6A1CBC37')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }} />
                    {/* Dark overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, rgba(127,29,29,0.82) 0%, rgba(26,26,26,0.82) 100%)',
                    }} />

                    {/* Bottom text */}
                    <div style={{
                        position: 'absolute', bottom: '60px', left: '48px', right: '48px',
                        zIndex: 2
                    }}>
                        <div style={{
                            width: '40px', height: '3px',
                            background: '#DC2626', marginBottom: '16px'
                        }}></div>
                        <h2 style={{
                            fontFamily: 'Bebas Neue, sans-serif',
                            fontSize: '48px', color: 'white',
                            lineHeight: '1', letterSpacing: '2px',
                            marginBottom: '12px'
                        }}>
                            Rebuild one life<br />
                            <span style={{ color: '#DC2626' }}>at a time.</span>
                        </h2>
                        <p style={{
                            fontSize: '13px', color: 'rgba(255,255,255,0.5)',
                            fontWeight: '300', lineHeight: '1.6',
                            maxWidth: '320px'
                        }}>
                            Note: This portal is exclusively for Philippine Red Cross – Rizal Chapter, Muntinlupa City Branch.
                        </p>
                    </div>

                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '4px', background: '#DC2626'
                    }}></div>
                </div>
            </div>
        </>
    );
}