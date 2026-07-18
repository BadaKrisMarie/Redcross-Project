import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';

export default function Register() {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [emailExists, setEmailExists] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const debounceRef = useRef(null);

    // ✅ Real-time email existence check (debounced while typing)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const email = data.email.trim();

        // Basic format check before bothering the server
        const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!looksLikeEmail) {
            setEmailExists(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setCheckingEmail(true);
            try {
                const res = await axios.post(route('check.email'), { email });
                setEmailExists(res.data.exists);
            } catch (err) {
                // Fail silently — server-side validation on submit is still the fallback
                setEmailExists(false);
            } finally {
                setCheckingEmail(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(debounceRef.current);
    }, [data.email]);

    const submit = (e) => {
        e.preventDefault();
        if (emailExists) return; // extra guard, just in case
        post(route('register'));
    };

    const isBlocked = emailExists || processing;

    return (
        <>
            <Head title="Volunteer Registration" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

            <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Source Sans 3', sans-serif" }}>

                {/* TOP NAV */}
                <nav style={{
                    background: '#111', padding: '14px 32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px', height: '32px', background: '#ff0000',
                            borderRadius: '4px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '900'
                        }}>+</div>
                        <span style={{
                            fontFamily: 'Oswald, sans-serif',
                            color: 'white', fontSize: '16px', fontWeight: '600', letterSpacing: '1px'
                        }}>RED CROSS — Muntinlupa</span>
                    </div>
                    <Link href={route('login')} style={{
                        color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none'
                    }}>Already have an account? Log in →</Link>
                </nav>

                {/* FORM CARD */}
                <div style={{
                    maxWidth: '480px', margin: '60px auto', padding: '0 16px'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '8px',
                        border: '1px solid #e8e8e8', overflow: 'hidden'
                    }}>

                        {/* Card Header */}
                        <div style={{
                            background: '#ff0000', padding: '28px 32px'
                        }}>
                            <div style={{
                                fontSize: '11px', fontWeight: '600', letterSpacing: '2px',
                                textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
                                marginBottom: '6px'
                            }}>Volunteer Portal</div>
                            <h1 style={{
                                fontFamily: 'Oswald, sans-serif',
                                fontSize: '28px', color: 'white', fontWeight: '600',
                                letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0
                            }}>Create Account</h1>
                            <p style={{
                                color: 'rgba(255,255,255,0.7)', fontSize: '13px',
                                margin: '8px 0 0'
                            }}>Register to join the Red Cross volunteer team</p>
                        </div>

                        {/* Form Body */}
                        <div style={{ padding: '32px' }}>

                            {/* Pending notice */}
                            <div style={{
                                background: '#fffbeb', border: '1px solid #fde68a',
                                borderRadius: '6px', padding: '12px 16px',
                                marginBottom: '24px', fontSize: '13px', color: '#92400e'
                            }}>
                                ⏳ After registering, your account will be reviewed by an admin before you can log in.
                            </div>

                            <form onSubmit={submit}>

                                {/* Full Name */}
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={{
                                        display: 'block', fontSize: '12px', fontWeight: '600',
                                        color: '#555', textTransform: 'uppercase',
                                        letterSpacing: '0.5px', marginBottom: '6px'
                                    }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                        style={{
                                            width: '100%', padding: '10px 14px',
                                            border: errors.name ? '1px solid #ff0000' : '1px solid #e8e8e8',
                                            borderRadius: '6px', fontSize: '14px',
                                            outline: 'none', boxSizing: 'border-box',
                                            fontFamily: "'Source Sans 3', sans-serif"
                                        }}
                                    />
                                    {errors.name && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={{
                                        display: 'block', fontSize: '12px', fontWeight: '600',
                                        color: '#555', textTransform: 'uppercase',
                                        letterSpacing: '0.5px', marginBottom: '6px'
                                    }}>Email Address</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        style={{
                                            width: '100%', padding: '10px 14px',
                                            border: (errors.email || emailExists) ? '1px solid #ff0000' : '1px solid #e8e8e8',
                                            borderRadius: '6px', fontSize: '14px',
                                            outline: 'none', boxSizing: 'border-box',
                                            fontFamily: "'Source Sans 3', sans-serif"
                                        }}
                                    />
                                    {checkingEmail && (
                                        <p style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                                            Checking email…
                                        </p>
                                    )}
                                    {!checkingEmail && emailExists && (
                                        <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px', fontWeight: '600' }}>
                                            ⚠ This email is already registered. Please use a different email or log in instead.
                                        </p>
                                    )}
                                    {errors.email && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={{
                                        display: 'block', fontSize: '12px', fontWeight: '600',
                                        color: '#555', textTransform: 'uppercase',
                                        letterSpacing: '0.5px', marginBottom: '6px'
                                    }}>Password</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Create a password"
                                        required
                                        style={{
                                            width: '100%', padding: '10px 14px',
                                            border: errors.password ? '1px solid #ff0000' : '1px solid #e8e8e8',
                                            borderRadius: '6px', fontSize: '14px',
                                            outline: 'none', boxSizing: 'border-box',
                                            fontFamily: "'Source Sans 3', sans-serif"
                                        }}
                                    />
                                    {errors.password && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block', fontSize: '12px', fontWeight: '600',
                                        color: '#555', textTransform: 'uppercase',
                                        letterSpacing: '0.5px', marginBottom: '6px'
                                    }}>Confirm Password</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="Repeat your password"
                                        required
                                        style={{
                                            width: '100%', padding: '10px 14px',
                                            border: errors.password_confirmation ? '1px solid #ff0000' : '1px solid #e8e8e8',
                                            borderRadius: '6px', fontSize: '14px',
                                            outline: 'none', boxSizing: 'border-box',
                                            fontFamily: "'Source Sans 3', sans-serif"
                                        }}
                                    />
                                    {errors.password_confirmation && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.password_confirmation}</p>}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isBlocked}
                                    style={{
                                        width: '100%', background: isBlocked ? '#999' : '#ff0000',
                                        color: 'white', border: 'none', padding: '12px',
                                        borderRadius: '6px', fontSize: '14px', fontWeight: '600',
                                        cursor: isBlocked ? 'not-allowed' : 'pointer',
                                        fontFamily: "'Source Sans 3', sans-serif",
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {processing
                                        ? 'Registering...'
                                        : emailExists
                                            ? 'Email already registered'
                                            : 'Register as Volunteer'}
                                </button>

                            </form>
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#999', marginTop: '16px' }}>
                        Already have an account?{' '}
                        <Link href={route('login')} style={{ color: '#ff0000', textDecoration: 'none', fontWeight: '600' }}>
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}