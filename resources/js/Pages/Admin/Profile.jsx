import React, { useRef, useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminProfile({ auth, activityLogs = [] }) {
    const admin = auth.user;
    const fileRef = useRef();
    const [activeTab, setActiveTab] = useState('info');

    // ✅ Fixed asset helper
    const photoUrl = (path) => window.location.origin + '/storage/' + path;

    const [preview, setPreview] = useState(
        admin.photo ? photoUrl(admin.photo) : null
    );

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const profileForm = useForm({
        _method: 'PATCH',
        name:    admin.name  ?? '',
        email:   admin.email ?? '',
        phone:   admin.phone ?? '',
        photo:   null,
    });

    const passwordForm = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    // ✅ Update preview when admin.photo changes (after save)
    useEffect(() => {
        if (admin.photo) {
            setPreview(photoUrl(admin.photo));
        }
    }, [admin.photo]);

    function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        profileForm.setData('photo', file);
        setPreview(URL.createObjectURL(file));
    }

    function handleProfileSubmit(e) {
        e.preventDefault();
        profileForm.post(route('admin.profile.update'), { forceFormData: true });
    }

    function handlePasswordSubmit(e) {
        e.preventDefault();
        passwordForm.post(route('admin.profile.password'), {
            onSuccess: () => {
                passwordForm.reset();
                setShowCurrent(false);
                setShowNew(false);
                setShowConfirm(false);
            },
        });
    }

    const initials = admin.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    const tabs = [
        { key: 'info',     label: 'Personal Info' },
        { key: 'password', label: 'Change Password' },
        { key: 'logs',     label: 'Activity Logs' },
    ];

    const EyeButton = ({ show, onToggle }) => (
        <button
            type="button"
            onClick={onToggle}
            aria-label={show ? 'Hide password' : 'Show password'}
            style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0', display: 'flex', alignItems: 'center',
                color: '#9CA3AF',
            }}
        >
            {show ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
            )}
        </button>
    );

    return (
        <>
            <Head title="Admin Profile" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

            <div style={{ fontFamily: "'Source Sans 3', sans-serif", maxWidth: '900px', margin: '0 auto' }}>

                <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#ff0000', marginBottom: '8px' }}>Admin Panel</div>
                    <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '36px', color: '#111', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>My Profile</h1>
                </div>

                {/* PROFILE HERO CARD */}
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', marginBottom: '20px', overflow: 'hidden' }}>
                    <div style={{ background: '#ff0000', height: '80px', position: 'relative' }} />
                    <div style={{ padding: '0 28px 24px', position: 'relative' }}>
                        <div style={{ position: 'relative', display: 'inline-block', marginTop: '-44px', marginBottom: '12px' }}>
                            <div onClick={() => fileRef.current.click()} title="Click to change photo"
                                style={{ width: 88, height: 88, borderRadius: '50%', border: '4px solid white', overflow: 'hidden', cursor: 'pointer', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#991b1b', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                                {preview
                                    ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    : initials
                                }
                            </div>
                            <div onClick={() => fileRef.current.click()}
                                style={{ position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: '50%', background: '#111', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}>📷</div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '24px', fontWeight: '600', color: '#111' }}>{admin.name}</div>
                                <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{admin.email}</div>
                                <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#fee2e2', color: '#991b1b', fontWeight: '600' }}>Administrator</span>
                            </div>
                            {profileForm.recentlySuccessful && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                                    ✓ Profile updated!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '14px 24px', fontSize: '13px', fontWeight: '600',
                                    border: 'none', background: 'none', cursor: 'pointer',
                                    color: activeTab === tab.key ? '#ff0000' : '#888',
                                    borderBottom: activeTab === tab.key ? '2px solid #ff0000' : '2px solid transparent',
                                    marginBottom: '-1px', letterSpacing: '0.3px',
                                }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* TAB: Personal Info */}
                    {activeTab === 'info' && (
                        <form onSubmit={handleProfileSubmit} style={{ padding: '28px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#aaa', marginBottom: '20px' }}>Basic Information</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input type="text" value={profileForm.data.name} onChange={e => profileForm.setData('name', e.target.value)} style={inputStyle} placeholder="Full name" />
                                    {profileForm.errors.name && <span style={errStyle}>{profileForm.errors.name}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <input type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)} style={inputStyle} placeholder="email@example.com" />
                                    {profileForm.errors.email && <span style={errStyle}>{profileForm.errors.email}</span>}
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Phone Number</label>
                                <input type="tel" value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)} style={{ ...inputStyle, maxWidth: '320px' }} placeholder="e.g. 09171234567" />
                                {profileForm.errors.phone && <span style={errStyle}>{profileForm.errors.phone}</span>}
                            </div>
                            <button type="submit" disabled={profileForm.processing} style={btnRedStyle}>
                                {profileForm.processing ? 'Saving…' : 'Save Changes'}
                            </button>
                        </form>
                    )}

                    {/* TAB: Change Password */}
                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} style={{ padding: '28px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#aaa', marginBottom: '20px' }}>Update Password</div>
                            {passwordForm.recentlySuccessful && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#16a34a', fontWeight: '600', marginBottom: '20px' }}>
                                    ✓ Password updated successfully!
                                </div>
                            )}
                            <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Current Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            value={passwordForm.data.current_password}
                                            onChange={e => passwordForm.setData('current_password', e.target.value)}
                                            style={inputWithIconStyle}
                                            placeholder="Enter current password"
                                        />
                                        <EyeButton show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
                                    </div>
                                    {passwordForm.errors.current_password && <span style={errStyle}>{passwordForm.errors.current_password}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={passwordForm.data.password}
                                            onChange={e => passwordForm.setData('password', e.target.value)}
                                            style={inputWithIconStyle}
                                            placeholder="Enter new password"
                                        />
                                        <EyeButton show={showNew} onToggle={() => setShowNew(v => !v)} />
                                    </div>
                                    {passwordForm.errors.password && <span style={errStyle}>{passwordForm.errors.password}</span>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Confirm New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={passwordForm.data.password_confirmation}
                                            onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                            style={inputWithIconStyle}
                                            placeholder="Repeat new password"
                                        />
                                        <EyeButton show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                                    </div>
                                    {passwordForm.errors.password_confirmation && <span style={errStyle}>{passwordForm.errors.password_confirmation}</span>}
                                </div>
                            </div>
                            <div style={{ marginTop: '24px' }}>
                                <button type="submit" disabled={passwordForm.processing} style={btnRedStyle}>
                                    {passwordForm.processing ? 'Updating…' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB: Activity Logs */}
                    {activeTab === 'logs' && (
                        <div style={{ padding: '28px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#aaa', marginBottom: '20px' }}>Recent Admin Actions</div>
                            {activityLogs.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '32px 0' }}>Walang activity logs.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {activityLogs.map((log, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 0', borderBottom: i < activityLogs.length - 1 ? '1px solid #f0f0f0' : 'none', alignItems: 'flex-start' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: logColor(log.action).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                                                {logColor(log.action).icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', color: '#111', fontWeight: '500' }}>{log.description}</div>
                                                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>
                                                    {log.created_at ? new Date(log.created_at).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: logColor(log.action).bg, color: logColor(log.action).color, fontWeight: '600', whiteSpace: 'nowrap' }}>
                                                {log.action}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function logColor(action) {
    if (!action) return { bg: '#f5f5f5', color: '#555', icon: '📋' };
    const a = action.toLowerCase();
    if (a.includes('approv'))                          return { bg: '#dcfce7', color: '#166534', icon: '✅' };
    if (a.includes('reject') || a.includes('revoke')) return { bg: '#fee2e2', color: '#991b1b', icon: '❌' };
    if (a.includes('creat') || a.includes('add'))     return { bg: '#dbeafe', color: '#1e40af', icon: '➕' };
    if (a.includes('update') || a.includes('edit'))   return { bg: '#fef3c7', color: '#92400e', icon: '✏️' };
    if (a.includes('delet') || a.includes('remov'))   return { bg: '#fee2e2', color: '#991b1b', icon: '🗑️' };
    return { bg: '#f5f5f5', color: '#555', icon: '📋' };
}

const labelStyle = { display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '5px', fontWeight: '500' };
const inputStyle = {
    width: '100%', boxSizing: 'border-box', border: '1px solid #E5E7EB',
    borderRadius: '6px', padding: '9px 12px', fontSize: '13px', outline: 'none',
    fontFamily: 'inherit', color: '#111', background: 'white',
};
const inputWithIconStyle = {
    width: '100%', boxSizing: 'border-box', border: '1px solid #E5E7EB',
    borderRadius: '6px', padding: '9px 38px 9px 12px', fontSize: '13px', outline: 'none',
    fontFamily: 'inherit', color: '#111', background: 'white',
};
const btnRedStyle = {
    background: '#ff0000', color: 'white', border: 'none', borderRadius: '6px',
    padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
};
const errStyle = { fontSize: '11px', color: '#ff0000', marginTop: '4px', display: 'block' };

// ✅ ITO ANG SUSI: gamitin ang AdminLayout bilang persistent wrapper,
// kagaya ng AdminDashboard — hindi na nawawala ang sidebar sa profile page.
AdminProfile.layout = (page) => <AdminLayout title="My Profile">{page}</AdminLayout>;