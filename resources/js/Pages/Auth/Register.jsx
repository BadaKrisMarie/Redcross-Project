import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        password_confirmation: '',
        birth_day: '',
        birth_month: '',
        birth_year: '',
        gender: '',
    });

    const [emailExists, setEmailExists] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const email = data.email.trim();
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
                setEmailExists(false);
            } finally {
                setCheckingEmail(false);
            }
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [data.email]);

    const submit = (e) => {
        e.preventDefault();
        if (emailExists) return;
        post(route('register'));
    };

    const isBlocked = emailExists || processing;

    const daysInMonth = useMemo(() => {
        const month = parseInt(data.birth_month, 10);
        const year = parseInt(data.birth_year, 10) || 2000;
        if (!month) return 31;
        return new Date(year, month, 0).getDate();
    }, [data.birth_month, data.birth_year]);

    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

    // ===== Styles matched to the Login card =====
    const inputStyle = (hasError) => ({
        width: '100%',
        padding: '11px 14px',
        border: hasError ? '1px solid #ff0000' : '1px solid #e5e5e5',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: '400',
        background: '#fafafa',
        color: '#111',
    });

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        color: '#444',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '7px'
    };

    const errorTextStyle = {
        fontSize: '11px',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: '500',
        color: '#ff0000',
        marginTop: '5px'
    };

    return (
        <>
            <Head title="Volunteer Registration" />
            <link
                href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap"
                rel="stylesheet"
            />
            <style>{`
                .register-card-scroll {
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE/Edge */
                }
                .register-card-scroll::-webkit-scrollbar {
                    display: none; /* Chrome/Safari/Edge Chromium */
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                background: '#f7f7f7',
                fontFamily: "'Montserrat', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                boxSizing: 'border-box',
            }}>
                <div className="register-card-scroll" style={{
                    width: '100%',
                    maxWidth: '480px',
                    maxHeight: '92vh',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    padding: '40px',
                    overflowY: 'auto',
                    boxSizing: 'border-box',
                }}>

                    {/* Title */}
                    <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#111',
                            letterSpacing: '-0.5px',
                            margin: '0 0 6px 0'
                        }}>
                            Register
                        </h1>
                        <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                            Create your volunteer account
                        </p>
                    </div>

                    <form onSubmit={submit}>

                        {/* First Name / Last Name */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: '14px', marginBottom: '16px'
                        }}>
                            <div>
                                <label style={labelStyle}>First Name</label>
                                <input
                                    type="text"
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                    placeholder="First name"
                                    required
                                    style={inputStyle(errors.first_name)}
                                />
                                {errors.first_name && <p style={errorTextStyle}>{errors.first_name}</p>}
                            </div>
                            <div>
                                <label style={labelStyle}>Last Name</label>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    placeholder="Last name"
                                    required
                                    style={inputStyle(errors.last_name)}
                                />
                                {errors.last_name && <p style={errorTextStyle}>{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Email Address</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="Enter your email"
                                required
                                style={inputStyle(errors.email || emailExists)}
                            />
                            {checkingEmail && (
                                <p style={{ fontSize: '11px', fontFamily: "'Montserrat', sans-serif", color: '#999', marginTop: '5px' }}>
                                    Checking email…
                                </p>
                            )}
                            {!checkingEmail && emailExists && (
                                <p style={{ ...errorTextStyle, fontWeight: '600' }}>
                                    This email is already registered. Please use a different email or log in instead.
                                </p>
                            )}
                            {errors.email && <p style={errorTextStyle}>{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Phone Number</label>
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                placeholder="09XXXXXXXXX"
                                required
                                style={inputStyle(errors.phone)}
                            />
                            {errors.phone && <p style={errorTextStyle}>{errors.phone}</p>}
                        </div>

                        {/* Address */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Address</label>
                            <input
                                type="text"
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                placeholder="House/Street, Barangay, City"
                                required
                                style={inputStyle(errors.address)}
                            />
                            {errors.address && <p style={errorTextStyle}>{errors.address}</p>}
                        </div>

                        {/* Birthday */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Birthday</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '10px' }}>
                                <select
                                    value={data.birth_day}
                                    onChange={e => setData('birth_day', e.target.value)}
                                    required
                                    style={inputStyle(errors.birth_day)}
                                >
                                    <option value="">Day</option>
                                    {dayOptions.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <select
                                    value={data.birth_month}
                                    onChange={e => setData('birth_month', e.target.value)}
                                    required
                                    style={inputStyle(errors.birth_month)}
                                >
                                    <option value="">Month</option>
                                    {MONTHS.map((m, i) => (
                                        <option key={m} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    value={data.birth_year}
                                    onChange={e => setData('birth_year', e.target.value)}
                                    required
                                    style={inputStyle(errors.birth_year)}
                                >
                                    <option value="">Year</option>
                                    {yearOptions.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            {(errors.birth_day || errors.birth_month || errors.birth_year) && (
                                <p style={errorTextStyle}>
                                    {errors.birth_day || errors.birth_month || errors.birth_year}
                                </p>
                            )}
                        </div>

                        {/* Gender */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Gender</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {['Male', 'Female'].map(option => {
                                    const value = option.toLowerCase();
                                    const selected = data.gender === value;
                                    return (
                                        <label
                                            key={value}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: '8px', padding: '11px 8px',
                                                border: selected ? '1.5px solid #ff0000' : '1px solid #e5e5e5',
                                                background: selected ? '#fff5f5' : '#fafafa',
                                                borderRadius: '8px', fontSize: '13px',
                                                color: selected ? '#ff0000' : '#333',
                                                fontWeight: selected ? '600' : '400',
                                                cursor: 'pointer', userSelect: 'none'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={value}
                                                checked={selected}
                                                onChange={e => setData('gender', e.target.value)}
                                                required
                                                style={{ accentColor: '#ff0000', margin: 0 }}
                                            />
                                            {option}
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.gender && <p style={errorTextStyle}>{errors.gender}</p>}
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Create a password"
                                required
                                style={inputStyle(errors.password)}
                            />
                            {errors.password && <p style={errorTextStyle}>{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Confirm Password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                placeholder="Repeat your password"
                                required
                                style={inputStyle(errors.password_confirmation)}
                            />
                            {errors.password_confirmation && <p style={errorTextStyle}>{errors.password_confirmation}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isBlocked}
                            style={{
                                width: '100%',
                                background: isBlocked ? '#c9c9c9' : '#ff0000',
                                color: 'white', border: 'none', padding: '13px',
                                borderRadius: '8px', fontSize: '14px', fontWeight: '700',
                                cursor: isBlocked ? 'not-allowed' : 'pointer',
                                fontFamily: "'Montserrat', sans-serif",
                                letterSpacing: '0.3px',
                                marginBottom: '20px'
                            }}
                        >
                            {processing
                                ? 'Registering...'
                                : emailExists
                                    ? 'Email already registered'
                                    : 'Register as Volunteer'}
                        </button>

                        {/* Footer link */}
                        <p style={{
                            textAlign: 'center', fontSize: '13px',
                            fontFamily: "'Montserrat', sans-serif", fontWeight: '400', color: '#888'
                        }}>
                            Already have an account?{' '}
                            <Link href={route('login')} style={{
                                color: '#ff0000', fontFamily: "'Montserrat', sans-serif",
                                fontWeight: '700', textDecoration: 'none'
                            }}>
                                Log in here
                            </Link>
                        </p>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Link href="/" style={{
                                fontSize: '12px', fontFamily: "'Montserrat', sans-serif",
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