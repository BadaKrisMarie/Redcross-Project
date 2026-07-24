import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Register() {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
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

    // Day options depend on selected month/year (basic leap-year aware)
    const daysInMonth = useMemo(() => {
        const month = parseInt(data.birth_month, 10);
        const year = parseInt(data.birth_year, 10) || 2000;
        if (!month) return 31;
        return new Date(year, month, 0).getDate();
    }, [data.birth_month, data.birth_year]);

    const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const inputStyle = (hasError) => ({
        width: '100%', padding: '10px 14px',
        border: hasError ? '1px solid #ff0000' : '1px solid #e8e8e8',
        borderRadius: '6px', fontSize: '14px',
        outline: 'none', boxSizing: 'border-box',
        fontFamily: "'monserrat', monserrat",
        background: 'white',
    });

    const labelStyle = {
        display: 'block', fontSize: '12px', fontWeight: '600',
        color: '#555', textTransform: 'uppercase',
        letterSpacing: '0.5px', marginBottom: '6px'
    };

    return (
        <>
            <Head title="Volunteer Registration" />
            <link href="https://fonts.googleapis.com/css2?family=monserrat:wght@400;500;600;700&family=monserrat:wght@300;400;600&display=swap" rel="stylesheet" />

            <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'monserrat', sans-serif" }}>

                {/* TOP NAV */}
                <nav style={{
                    background: '#ff0000', padding: '14px 32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                            src="/images/redcross-logo.png"
                            alt="Philippine Red Cross - Muntinlupa City Branch"
                            style={{
                                width: '36px', height: '36px',
                                objectFit: 'cover', clipPath: 'circle(50%)'
                            }}
                        />
                        <span style={{
                            fontFamily: 'monserrat, monserrat',
                            color: 'white', fontSize: '16px', fontWeight: '600', letterSpacing: '1px'
                        }}>RED CROSS — Muntinlupa</span>
                    </div>
                    <Link href={route('login')} style={{
                        color: 'white', fontSize: '13px', fontWeight: '600',
                        textDecoration: 'underline', textUnderlineOffset: '3px'
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

                        {/* Form Body */}
                        <div style={{ padding: '32px' }}>

                            {/* Pending notice */}
                            <div style={{
                                
                                borderRadius: '6px', padding: '12px 16px',
                                marginBottom: '24px', fontSize: '13px', color: '#92400e'
                            }}>
                    
                            </div>

                            <form onSubmit={submit}>

                                {/* First Name / Last Name */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    gap: '12px', marginBottom: '18px'
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
                                        {errors.first_name && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.first_name}</p>}
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
                                        {errors.last_name && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.last_name}</p>}
                                    </div>
                                </div>

                                {/* Email */}
                                <div style={{ marginBottom: '18px' }}>
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

                                {/* Phone */}
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={labelStyle}>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="09XXXXXXXXX"
                                        required
                                        style={inputStyle(errors.phone)}
                                    />
                                    {errors.phone && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</p>}
                                </div>

                                {/* Address */}
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={labelStyle}>Address</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        placeholder="House/Street, Barangay, City"
                                        required
                                        style={inputStyle(errors.address)}
                                    />
                                    {errors.address && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.address}</p>}
                                </div>

                                {/* Birthday */}
                                <div style={{ marginBottom: '18px' }}>
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
                                        <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>
                                            {errors.birth_day || errors.birth_month || errors.birth_year}
                                        </p>
                                    )}
                                </div>

                                {/* Gender */}
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={labelStyle}>Gender</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr  1fr', gap: '10px' }}>
                                        {['Male', 'Female'].map(option => {
                                            const value = option.toLowerCase();
                                            const selected = data.gender === value;
                                            return (
                                                <label
                                                    key={value}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        gap: '8px', padding: '10px 8px',
                                                        border: selected ? '1.5px solid #ff0000' : '1px solid #e8e8e8',
                                                        background: selected ? '#fff5f5' : 'white',
                                                        borderRadius: '6px', fontSize: '13px',
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
                                    {errors.gender && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.gender}</p>}
                                </div>

                                {/* Password */}
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={labelStyle}>Password</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Create a password"
                                        required
                                        style={inputStyle(errors.password)}
                                    />
                                    {errors.password && <p style={{ color: '#ff0000', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={labelStyle}>Confirm Password</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="Repeat your password"
                                        required
                                        style={inputStyle(errors.password_confirmation)}
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
                                        fontFamily: "'monserrat', sans-serif",
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