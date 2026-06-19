import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';

export default function ChangePassword({ auth }) {
    const volunteer = auth.user;
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

        try {
            await axios.put('/volunteer/password', form);
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

    const initials = volunteer?.name
        ? volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';
    const avatarUrl = volunteer?.photo_url || null;

    const sidebarLinks = [
        { key: 'dashboard',     label: 'Dashboard',     href: route('volunteer.dashboard'),     icon: <GridIcon /> },
        { key: 'schedule',      label: 'Schedule',      href: route('volunteer.schedule'),      icon: <CalIcon /> },
        { key: 'communication', label: 'Communication', href: route('volunteer.communication'), icon: <ChatIcon /> },
        { key: 'attendance',    label: 'Attendance',    href: route('volunteer.attendance'),    icon: <CheckIcon /> },
        { key: 'documents',     label: '201',           href: route('volunteer.documents'),     icon: <FolderIcon /> },
    ];

    const inputStyle = (hasError) => ({
        width: '100%', padding: '10px 40px 10px 12px', fontSize: '13px',
        border: `1px solid ${hasError ? '#EF4444' : '#E5E7EB'}`,
        borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
        color: '#111', background: 'white',
    });

    const PasswordField = ({ label, name, value, show, onToggle }) => (
        <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type={show ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    style={inputStyle(!!errors[name])}
                    autoComplete="off"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF', display: 'flex', alignItems: 'center' }}
                >
                    {show ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
            {errors[name] && (
                <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>
                    {Array.isArray(errors[name]) ? errors[name][0] : errors[name]}
                </div>
            )}
        </div>
    );

    return (
        <>
            <Head title="Change Password" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F3F4F6' }}>

                {/* SIDEBAR */}
                <aside style={{ width: '160px', minHeight: '100vh', background: '#CC0000', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
                    <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'white', lineHeight: '1.4' }}>
                            Rizal Chapter<br /><span style={{ fontWeight: '400', opacity: 0.85 }}>Muntinlupa City Branch</span>
                        </div>
                    </div>
                    <nav style={{ flex: 1, paddingTop: '8px' }}>
                        {sidebarLinks.map(item => (
                            <Link key={item.key} href={item.href} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '11px 16px', textDecoration: 'none',
                                background: 'transparent', color: 'white', fontSize: '13px',
                                fontWeight: '400', borderLeft: '3px solid transparent',
                            }}>
                                <span style={{ opacity: 0.7, flexShrink: 0 }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                        <button onClick={() => router.post(route('logout'))} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', fontSize: '12px', padding: 0, width: '100%' }}>
                            <span style={{ fontSize: '16px' }}>&#x23FB;</span> Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div style={{ marginLeft: '160px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Topbar */}
                    <header style={{ background: 'white', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280' }}>
                            <Link href={route('volunteer.dashboard')} style={{ color: '#6B7280', textDecoration: 'none' }}>Dashboard</Link>
                            <span>›</span>
                            <span style={{ color: '#111' }}>Change Password</span>
                        </div>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: avatarUrl ? 'transparent' : '#CC0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
                            {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                        </div>
                    </header>

                    {/* Body */}
                    <main style={{ flex: 1, padding: '32px 28px' }}>
                        <div style={{ maxWidth: '460px' }}>

                            <div style={{ marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 4px' }}>Change Password</h1>
                                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Update your account password below.</p>
                            </div>

                            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB' }}>

                                {success && (
                                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#15803D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircleIcon /> Password updated successfully!
                                    </div>
                                )}

                                {errors.general && (
                                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#DC2626' }}>
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
                                    />
                                    <PasswordField
                                        label="New Password"
                                        name="password"
                                        value={form.password}
                                        show={showNew}
                                        onToggle={() => setShowNew(v => !v)}
                                    />
                                    <PasswordField
                                        label="Confirm New Password"
                                        name="password_confirmation"
                                        value={form.password_confirmation}
                                        show={showConfirm}
                                        onToggle={() => setShowConfirm(v => !v)}
                                    />

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{ flex: 1, padding: '10px', background: loading ? '#E5E7EB' : '#CC0000', color: loading ? '#9CA3AF' : 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
                                        >
                                            {loading ? 'Updating…' : 'Update Password'}
                                        </button>
                                        <Link
                                            href={route('volunteer.dashboard')}
                                            style={{ padding: '10px 18px', background: 'white', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                        >
                                            Cancel
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

function EyeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EyeOffIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }
function CheckCircleIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function GridIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function CalIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function ChatIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function CheckIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>; }
function FolderIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>; }