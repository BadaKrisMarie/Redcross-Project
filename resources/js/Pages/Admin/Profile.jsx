import React, { useRef, useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function AdminProfile({ auth, activityLogs = [] }) {
    const admin = auth.user;
    const fileRef = useRef();
    const dropdownRef = useRef();
    const [activeTab, setActiveTab] = useState('info');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [preview, setPreview] = useState(
        admin.photo ? asset('storage/' + admin.photo) : null
    );

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

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => router.post(route('logout'));

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
            onSuccess: () => passwordForm.reset(),
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

    return (
        <>
            <Head title="Admin Profile" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

            <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Source Sans 3', sans-serif" }}>

                {/* ─── NAV ─────────────────────────────────────────────────── */}
                <nav style={{ background: '#111', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#DC2626', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '900' }}>+</div>
                        <span style={{ fontFamily: 'Oswald, sans-serif', color: 'white', fontSize: '16px', fontWeight: '600', letterSpacing: '1px' }}>RED CROSS — Admin Panel</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Back to Dashboard link */}
                        <Link
                            href={route('admin.dashboard')}
                            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                        >
                            ← Back to Dashboard
                        </Link>

                        {/* Avatar Dropdown */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(o => !o)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    padding: '6px 10px', borderRadius: '6px',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: '#DC2626', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'white', fontSize: '12px',
                                    fontWeight: '700', overflow: 'hidden', flexShrink: 0,
                                }}>
                                    {preview
                                        ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : initials
                                    }
                                </div>
                                <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
                                    {admin.name}
                                </span>
                                <svg
                                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                                    stroke="rgba(255,255,255,0.6)" strokeWidth="2.5"
                                    style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                    width: '220px', background: '#1e1e1e',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px', zIndex: 200,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                    overflow: 'hidden',
                                }}>
                                    {/* Header */}
                                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: '#DC2626', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', color: 'white', fontSize: '13px',
                                                fontWeight: '700', overflow: 'hidden', flexShrink: 0,
                                            }}>
                                                {preview
                                                    ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : initials
                                                }
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{admin.name}</div>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Super Admin</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Edit Profile */}
                                    <Link
                                        href={route('admin.profile')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '11px 16px', fontSize: '13px',
                                            color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
                                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                                            background: 'rgba(255,255,255,0.06)',
                                        }}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        Edit Profile
                                    </Link>

                                    {/* Settings */}
                                    <Link
                                        href={route('admin.profile')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '11px 16px', fontSize: '13px',
                                            color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
                                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                        Settings
                                    </Link>

                                    {/* Log Out */}
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            width: '100%', padding: '11px 16px',
                                            background: 'none', border: 'none',
                                            fontSize: '13px', color: '#f87171', cursor: 'pointer', textAlign: 'left',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.12)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
                {/* ─────────────────────────────────────────────────────────── */}

                <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '0 auto' }}>

                    {/* Page Title */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#DC2626', marginBottom: '8px' }}>Admin Panel</div>
                        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '36px', color: '#111', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>My Profile</h1>
                    </div>

                    {/* PROFILE HERO CARD */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', marginBottom: '20px', overflow: 'hidden' }}>
                        <div style={{ background: '#DC2626', height: '80px', position: 'relative' }} />
                        <div style={{ padding: '0 28px 24px', position: 'relative' }}>
                            <div style={{ position: 'relative', display: 'inline-block', marginTop: '-44px', marginBottom: '12px' }}>
                                <div
                                    onClick={() => fileRef.current.click()}
                                    title="Click to change photo"
                                    style={{ width: 88, height: 88, borderRadius: '50%', border: '4px solid white', overflow: 'hidden', cursor: 'pointer', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#991b1b', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                                >
                                    {preview
                                        ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        : initials
                                    }
                                </div>
                                <div
                                    onClick={() => fileRef.current.click()}
                                    style={{ position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: '50%', background: '#111', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}
                                >📷</div>
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
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        padding: '14px 24px', fontSize: '13px', fontWeight: '600',
                                        border: 'none', background: 'none', cursor: 'pointer',
                                        color: activeTab === tab.key ? '#DC2626' : '#888',
                                        borderBottom: activeTab === tab.key ? '2px solid #DC2626' : '2px solid transparent',
                                        marginBottom: '-1px', letterSpacing: '0.3px',
                                    }}
                                >
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
                                        <input type="password" value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} style={inputStyle} placeholder="Enter current password" />
                                        {passwordForm.errors.current_password && <span style={errStyle}>{passwordForm.errors.current_password}</span>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>New Password</label>
                                        <input type="password" value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} style={inputStyle} placeholder="Enter new password" />
                                        {passwordForm.errors.password && <span style={errStyle}>{passwordForm.errors.password}</span>}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Confirm New Password</label>
                                        <input type="password" value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} style={inputStyle} placeholder="Repeat new password" />
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

function asset(path) {
    return '/' + path;
}

const labelStyle = { display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '5px', fontWeight: '500' };
const inputStyle = {
    width: '100%', boxSizing: 'border-box', border: '1px solid #E5E7EB',
    borderRadius: '6px', padding: '9px 12px', fontSize: '13px', outline: 'none',
    fontFamily: 'inherit', color: '#111', background: 'white',
};
const btnRedStyle = {
    background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px',
    padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
};
const errStyle = { fontSize: '11px', color: '#DC2626', marginTop: '4px', display: 'block' };