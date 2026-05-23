import React, { useRef, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

export default function Profile({ user }) {
    const fileRef = useRef();
    const [preview, setPreview] = useState(
        user.photo ? `/storage/${user.photo}` : null
    );

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

    // Initials from name
    const initials = user.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <>
            <Head title="My Profile" />

            <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: "'Inter', sans-serif", padding: '32px 24px' }}>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>

                    {/* Back */}
                    <button
                        onClick={() => router.visit(route('volunteer.dashboard'))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 13, marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        ← Back to Dashboard
                    </button>

                    {/* Success toast */}
                    {recentlySuccessful && (
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

                        {/* Header */}
                        <div style={{ background: '#CC0000', padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
                            {/* Avatar — clickable para mag-upload */}
                            <div
                                onClick={() => fileRef.current.click()}
                                title="Click to change photo"
                                style={{
                                    width: 72, height: 72, borderRadius: '50%',
                                    flexShrink: 0, position: 'relative',
                                    cursor: 'pointer', border: '3px solid rgba(255,255,255,0.4)',
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
                                        background: 'rgba(255,255,255,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 24, fontWeight: 700,
                                    }}>
                                        {initials}
                                    </div>
                                )}
                                {/* Camera badge */}
                                <div style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: 22, height: 22, borderRadius: '50%',
                                    background: 'white', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: 11,
                                }}>📷</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{user.name}</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{user.email}</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Volunteer</div>
                            </div>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handlePhotoChange}
                        />

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 16 }}>
                                Profile Information
                            </div>

                            {/* Read-only fields */}
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

                            {/* Editable fields */}
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
                    </div>
                </div>
            </div>
        </>
    );
}

const labelStyle = { display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 };
const inputStyle = {
    width: '100%', boxSizing: 'border-box', border: '1px solid #E5E7EB',
    borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none',
    fontFamily: 'inherit', color: '#111', background: 'white',
};
const primaryBtnStyle = {
    background: '#CC0000', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    width: '100%',
};
const errStyle = { fontSize: 11, color: '#CC0000', marginTop: 4, display: 'block' };