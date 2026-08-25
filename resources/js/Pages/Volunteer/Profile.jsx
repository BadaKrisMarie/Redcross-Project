import React, { useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import VolunteerLayout from '@/Layouts/VolunteerLayout';

// ✅ Accent color matched to the sidebar (sampled: #5765F2, active-state #3249F4)
const ACCENT = '#5765F2';
const ACCENT_DARK = '#3249F4';

export default function Profile({ user }) {
    const fileRef = useRef();
    const [preview, setPreview] = useState(
        user.photo ? `/storage/${user.photo}` : null
    );
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'password'

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method:                  'PATCH',
        phone:                    user.phone                    ?? '',
        address:                  user.address                  ?? '',
        birthdate:                user.birthdate                ?? '',
        gender:                   user.gender                   ?? '',
        emergency_contact_name:   user.emergency_contact_name   ?? '',
        emergency_contact_phone:  user.emergency_contact_phone  ?? '',
        photo:                    null,
    });

    function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('photo', file);
        setPreview(URL.createObjectURL(file));
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(route('volunteer.profile.update'), {
            forceFormData: true,
        });
    }

    const initials = user.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <>
            <Head title="My Profile" />

            <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: "'monserrat, monserrat" }}>

                {recentlySuccessful && activeTab === 'personal' && (
                    <div style={{
                        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
                        background: '#16a34a', color: '#fff', padding: '8px 20px',
                        borderRadius: 8, fontSize: 13, zIndex: 9999, pointerEvents: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}>
                        ✓ Profile updated successfully!
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>

                    {/* Header — compact, no big colored banner. Just avatar + name/email on a plain surface with a hairline divider. */}
                    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #E5E7EB' }}>
                        <div
                            onClick={() => fileRef.current.click()}
                            title="Click to change photo"
                            style={{
                                width: 64, height: 64, borderRadius: '50%',
                                flexShrink: 0, position: 'relative',
                                cursor: 'pointer', border: '1px solid #E5E7EB',
                                overflow: 'hidden',
                            }}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%', height: '100%',
                                    background: '#EEF0FE',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: ACCENT, fontSize: 20, fontWeight: 700,
                                }}>
                                    {initials}
                                </div>
                            )}
                            <div style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: 20, height: 20, borderRadius: '50%',
                                background: 'white', border: '1px solid #E5E7EB',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 10,
                            }}>📷</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>{user.name}</div>
                            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{user.email}</div>
                            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Volunteer</div>
                        </div>
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhotoChange}
                    />

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 28, padding: '0 24px', borderBottom: '1px solid #E5E7EB' }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('personal')}
                            style={tabStyle(activeTab === 'personal')}
                        >
                            Personal Info
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('password')}
                            style={tabStyle(activeTab === 'password')}
                        >
                            Change Password
                        </button>
                    </div>

                    {/* Personal Info tab */}
                    {activeTab === 'personal' && (
                        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 16 }}>
                                Profile Information
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input value={user.name} disabled style={{ ...inputStyle, background: '#F9FAFB', color: '#9CA3AF' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input value={user.email} disabled style={{ ...inputStyle, background: '#F9FAFB', color: '#9CA3AF' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        style={inputStyle}
                                        placeholder="e.g. 09171234567"
                                    />
                                    {errors.phone && <span style={errStyle}>{errors.phone}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Birthdate</label>
                                    <input
                                        type="date"
                                        value={data.birthdate}
                                        onChange={e => setData('birthdate', e.target.value)}
                                        style={inputStyle}
                                    />
                                    {errors.birthdate && <span style={errStyle}>{errors.birthdate}</span>}
                                </div>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>Gender</label>
                                <select
                                    value={data.gender}
                                    onChange={e => setData('gender', e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <span style={errStyle}>{errors.gender}</span>}
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>Address</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    style={inputStyle}
                                    placeholder="e.g. Brgy. Alabang, Muntinlupa City"
                                />
                                {errors.address && <span style={errStyle}>{errors.address}</span>}
                            </div>

                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '20px 0 14px' }}>
                                Emergency Contact
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                                <div>
                                    <label style={labelStyle}>Contact Name</label>
                                    <input
                                        type="text"
                                        value={data.emergency_contact_name}
                                        onChange={e => setData('emergency_contact_name', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Full name"
                                    />
                                    {errors.emergency_contact_name && <span style={errStyle}>{errors.emergency_contact_name}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Contact Phone</label>
                                    <input
                                        type="tel"
                                        value={data.emergency_contact_phone}
                                        onChange={e => setData('emergency_contact_phone', e.target.value)}
                                        style={inputStyle}
                                        placeholder="e.g. 09181234567"
                                    />
                                    {errors.emergency_contact_phone && <span style={errStyle}>{errors.emergency_contact_phone}</span>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                style={primaryBtnStyle}
                            >
                                {processing ? 'Saving…' : 'Save Changes'}
                            </button>
                        </form>
                    )}

                    {/* Change Password tab */}
                    {activeTab === 'password' && <ChangePasswordTab />}
                </div>
            </div>
        </>
    );
}

function ChangePasswordTab() {
    const [form, setForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: null }));
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccess(false);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            await axios.put(route('volunteer.password.update'), form, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            setSuccess(true);
            setForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: 'Something went wrong. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            {/* ✅ Hide native browser password-reveal icon (Edge/Chromium)
                para hindi mag-duplicate sa custom eye icon natin */}
            <style>{`
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear {
                    display: none;
                }
            `}</style>

            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>
                Update Your Password
            </div>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 16px' }}>
                Make sure it's at least 8 characters and hard to guess.
            </p>

            {success && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803D', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleIcon /> Password updated successfully!
                </div>
            )}

            {errors.general && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <PasswordField
                    label="Current Password"
                    name="current_password"
                    value={form.current_password}
                    show={showCurrent}
                    onToggle={() => setShowCurrent(v => !v)}
                    onChange={handleChange}
                    errors={errors}
                />
                <PasswordField
                    label="New Password"
                    name="password"
                    value={form.password}
                    show={showNew}
                    onToggle={() => setShowNew(v => !v)}
                    onChange={handleChange}
                    errors={errors}
                />
                <PasswordField
                    label="Confirm New Password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    show={showConfirm}
                    onToggle={() => setShowConfirm(v => !v)}
                    onChange={handleChange}
                    errors={errors}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{ ...primaryBtnStyle, background: loading ? '#E5E7EB' : ACCENT, color: loading ? '#9CA3AF' : 'white', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Updating…' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}

function PasswordField({ label, name, value, show, onToggle, onChange, errors }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={show ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    style={{ ...inputStyle, paddingRight: 40, borderColor: errors?.[name] ? '#EF4444' : '#E5E7EB' }}
                    autoComplete="off"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF', display: 'flex', alignItems: 'center' }}
                >
                    {show ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
            {errors?.[name] && (
                <span style={errStyle}>
                    {Array.isArray(errors[name]) ? errors[name][0] : errors[name]}
                </span>
            )}
        </div>
    );
}

function tabStyle(active) {
    return {
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '14px 0', fontSize: 13, fontWeight: 600,
        color: active ? ACCENT : '#6B7280',
        borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent',
        marginBottom: -1,
    };
}

function EyeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EyeOffIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }
function CheckCircleIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }

const labelStyle = { display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 };
const inputStyle = {
    width: '100%', boxSizing: 'border-box', border: '1px solid #E5E7EB',
    borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none',
    fontFamily: 'monserrat', color: '#111', background: 'white',
};
const primaryBtnStyle = {
    background: ACCENT, color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    width: '100%',
};
const errStyle = { fontSize: 11, color: '#DC2626', marginTop: 4, display: 'block' };

Profile.layout = (page) => <VolunteerLayout title="My Profile">{page}</VolunteerLayout>;