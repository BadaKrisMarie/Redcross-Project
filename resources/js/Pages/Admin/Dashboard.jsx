import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function AdminDashboard({
    auth,
    pendingCount,
    totalVolunteers,
    activeToday,
    recentVolunteers = [],
    pendingDocuments = [],
    volunteerStats = { active: 0, incompleteDocs: 0, inactive: 0 },
    upcomingEvents = [],
    quickStats = {},
}) {
    const [previewDoc, setPreviewDoc] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef();

    const admin = auth?.user;

    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    // Always read photo fresh from auth.user — consistent across pages
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;

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

    const s = {
        page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Source Sans 3', sans-serif" },
        nav: { background: '#111', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
        navIcon: { width: '32px', height: '32px', background: '#DC2626', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '900' },
        navTitle: { fontFamily: 'Oswald, sans-serif', color: 'white', fontSize: '16px', fontWeight: '600', letterSpacing: '1px' },
        content: { padding: '40px 32px' },
        eyebrow: { fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#DC2626', marginBottom: '8px' },
        h1: { fontFamily: 'Oswald, sans-serif', fontSize: '36px', color: '#111', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 32px' },
        metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
        metricCard: (highlight) => ({ background: 'white', padding: '24px', borderRadius: '8px', border: highlight ? '2px solid #f59e0b' : '1px solid #e8e8e8', cursor: highlight ? 'pointer' : 'default', textDecoration: 'none', display: 'block' }),
        metricVal: (highlight) => ({ fontFamily: 'Oswald, sans-serif', fontSize: '36px', color: highlight ? '#f59e0b' : '#DC2626', fontWeight: '600' }),
        metricLabel: { fontSize: '13px', color: '#888', marginTop: '4px' },
        alert: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        alertDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' },
        alertText: { fontSize: '14px', color: '#92400e', fontWeight: '500' },
        alertBtn: { background: '#f59e0b', color: 'white', padding: '8px 18px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' },
        card: { background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '24px' },
        cardTitle: { fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: '#111', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' },
        sectionGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
        row: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
        rowLast: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' },
        avatar: (bg, color) => ({ width: '34px', height: '34px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color, flexShrink: 0 }),
        volName: { fontSize: '13px', color: '#111', margin: 0, fontWeight: '500' },
        volBranch: { fontSize: '11px', color: '#888', margin: 0 },
        badge: (bg, color) => ({ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: bg, color, whiteSpace: 'nowrap' }),
        quickActions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
        btnRed: { background: '#DC2626', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
        btnBlue: { background: '#1d4ed8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
        btnGreen: { background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
        btnGray: { background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '10px 20px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#111', textDecoration: 'none', display: 'inline-block' },
        viewAll: { fontSize: '12px', color: '#DC2626', textDecoration: 'none', fontWeight: '600' },
    };

    const avatarColors = [
        ['#fee2e2', '#991b1b'], ['#dbeafe', '#1e40af'],
        ['#dcfce7', '#166534'], ['#ede9fe', '#5b21b6'], ['#fef3c7', '#92400e'],
    ];

    const qs = {
        avgHours: quickStats.avgHours ?? 0,
        totalHours: quickStats.totalHours ?? 0,
        activeBranches: quickStats.activeBranches ?? 0,
        trainingsThisMonth: quickStats.trainingsThisMonth ?? 0,
        totalActivities: quickStats.totalActivities ?? 0,
    };

    const statusBadge = (status) => {
        if (status === 'Active') return s.badge('#dcfce7', '#166534');
        if (status === 'Incomplete docs') return s.badge('#fef3c7', '#92400e');
        return s.badge('#f5f5f5', '#555');
    };

    const isImage = (url) => url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isPdf   = (url) => url && /\.pdf$/i.test(url);

    const handleDownload = async (doc) => {
        if (!doc.file_url) return;
        const fileName = `${doc.name}_${doc.type}`.replace(/\s+/g, '_') + (isPdf(doc.file_url) ? '.pdf' : isImage(doc.file_url) ? doc.file_url.split('.').pop() : '');
        try {
            const response = await fetch(doc.file_url);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = fileName;
            document.body.appendChild(link); link.click();
            document.body.removeChild(link); URL.revokeObjectURL(url);
        } catch {
            const link = document.createElement('a');
            link.href = doc.file_url; link.download = fileName;
            document.body.appendChild(link); link.click();
            document.body.removeChild(link);
        }
    };

    const ProfileAvatar = ({ doc, size = 64 }) => {
        const [bg, color] = avatarColors[doc.color_id ?? 0];
        return doc.photo ? (
            <img src={doc.photo} alt={doc.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
        ) : (
            <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.3, fontWeight: '600', color }}>
                {doc.initials}
            </div>
        );
    };

    // Reusable avatar circle for nav — uses live photoUrl
    const NavAvatar = ({ size = 32, fontSize = 12 }) => (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: '#DC2626', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize,
            fontWeight: '700', overflow: 'hidden', flexShrink: 0,
        }}>
            {photoUrl
                ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
            }
        </div>
    );

    return (
        <>
            <Head title="Admin Dashboard" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

            {/* ── MODAL ─────────────────────────────────────────────── */}
            {previewDoc && (
                <div onClick={() => setPreviewDoc(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '860px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <ProfileAvatar doc={previewDoc} size={36} />
                                <div>
                                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', color: '#111' }}>{previewDoc.name}</div>
                                    <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '600', marginTop: '2px' }}>{previewDoc.type}</div>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888', lineHeight: 1 }}>✕</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '240px 1fr' }}>
                            <div style={{ borderRight: '1px solid #f0f0f0', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <div style={{ margin: '0 auto 4px' }}><ProfileAvatar doc={previewDoc} size={80} /></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>{previewDoc.name}</div>
                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Muntinlupa City Branch</div>
                                </div>
                                <div style={{ width: '100%', marginTop: '8px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Document</div>
                                    <div style={{ fontSize: '13px', color: '#DC2626', fontWeight: '600' }}>{previewDoc.type}</div>
                                </div>
                            </div>
                            <div style={{ padding: '0', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', overflow: 'hidden' }}>
                                {previewDoc.file_url ? (
                                    isImage(previewDoc.file_url) ? (
                                        <img src={previewDoc.file_url} alt={previewDoc.type} style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '4px', margin: '20px' }} />
                                    ) : isPdf(previewDoc.file_url) ? (
                                        <iframe src={`${previewDoc.file_url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`} style={{ width: '100%', height: '55vh', border: 'none', display: 'block' }} title={previewDoc.type} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#888' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                                            <div style={{ fontSize: '13px', marginBottom: '8px' }}>Hindi ma-preview ang file.</div>
                                            <button onClick={() => handleDownload(previewDoc)} style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>I-download →</button>
                                        </div>
                                    )
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Walang file na naka-attach.</div>
                                )}
                            </div>
                        </div>
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {previewDoc.file_url && (
                                <button onClick={() => handleDownload(previewDoc)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#111' }}>I-download</button>
                            )}
                            <button onClick={() => setPreviewDoc(null)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#111' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={s.page}>
                {/* ── TOP NAV ──────────────────────────────────────────── */}
                <nav style={s.nav}>
                    <div style={s.navBrand}>
                        <div style={s.navIcon}>+</div>
                        <span style={s.navTitle}>RED CROSS — Admin Panel</span>
                    </div>

                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(o => !o)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '6px' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <NavAvatar size={32} fontSize={12} />
                            <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
                                {admin?.name ?? 'Admin'}
                            </span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5"
                                style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {dropdownOpen && (
                            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                                {/* Header */}
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <NavAvatar size={36} fontSize={13} />
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{admin?.name ?? 'Admin'}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Super Admin</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Profile */}
                                <Link href={route('admin.profile')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    Edit Profile
                                </Link>

                                {/* Settings */}
                                <Link href={route('admin.profile')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                    Settings
                                </Link>

                                {/* Log Out */}
                                <button onClick={handleLogout}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '11px 16px', background: 'none', border: 'none', fontSize: '13px', color: '#f87171', cursor: 'pointer', textAlign: 'left' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
                {/* ─────────────────────────────────────────────────────── */}

                <div style={s.content}>
                    <div>
                        <div style={s.eyebrow}>Admin Panel</div>
                        <h1 style={s.h1}>Welcome, {admin?.name ?? 'Admin'}</h1>
                    </div>

                    {/* STATS */}
                    <div style={s.metricsGrid}>
                        {[
                            { label: 'Total Volunteers', value: totalVolunteers ?? 0, route: route('admin.volunteers') },
                            { label: 'Active Today',     value: activeToday ?? 0,     route: route('admin.attendance.index') },
                            { label: 'Pending Approval', value: pendingCount ?? 0, highlight: true, route: route('admin.volunteers') },
                            { label: 'Total Activities', value: qs.totalActivities,   route: route('admin.activities.index') },
                        ].map(({ label, value, highlight, route: href }) => (
                            <Link key={label} href={href} style={s.metricCard(highlight && value > 0)}>
                                <div style={s.metricVal(highlight && value > 0)}>{value}</div>
                                <div style={s.metricLabel}>{label}</div>
                            </Link>
                        ))}
                    </div>

                    {/* PENDING ALERT */}
                    {pendingCount > 0 && (
                        <div style={s.alert}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={s.alertDot} />
                                <span style={s.alertText}>
                                    You have <strong>{pendingCount}</strong> volunteer{pendingCount > 1 ? 's' : ''} waiting for approval.
                                </span>
                            </div>
                            <Link href={route('admin.volunteers')} style={s.alertBtn}>Review Now →</Link>
                        </div>
                    )}

                    {/* RECENT VOLUNTEERS + PENDING DOCUMENTS */}
                    <div style={s.sectionGrid2}>
                        <div style={s.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={s.cardTitle}>Recent Volunteers</div>
                                <Link href={route('admin.volunteers')} style={s.viewAll}>View all →</Link>
                            </div>
                            {recentVolunteers.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '24px 0' }}>No volunteers yet</div>
                            ) : recentVolunteers.map((vol, i) => {
                                const [bg, color] = avatarColors[i % avatarColors.length];
                                const isLast = i === recentVolunteers.length - 1;
                                return (
                                    <Link key={i} href={route('admin.volunteers')} style={{ ...(isLast ? s.rowLast : s.row), textDecoration: 'none' }}>
                                        {vol.photo
                                            ? <img src={vol.photo} alt={vol.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                            : <div style={s.avatar(bg, color)}>{vol.initials}</div>
                                        }
                                        <div style={{ flex: 1 }}>
                                            <p style={s.volName}>{vol.name}</p>
                                            <p style={s.volBranch}>{vol.branch}</p>
                                        </div>
                                        <span style={statusBadge(vol.status)}>{vol.status}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div style={s.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={s.cardTitle}>Pending Documents</div>
                                <Link href={route('admin.volunteers')} style={s.viewAll}>View all →</Link>
                            </div>
                            {pendingDocuments.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '24px 0' }}>No pending documents</div>
                            ) : pendingDocuments.map((doc, i) => {
                                const [bg, color] = avatarColors[doc.color_id ?? i % avatarColors.length];
                                const isLast = i === pendingDocuments.length - 1;
                                return (
                                    <div key={i} onClick={() => setPreviewDoc(doc)}
                                        style={{ ...(isLast ? s.rowLast : s.row), cursor: 'pointer', borderRadius: '6px', padding: '10px 8px' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {doc.photo
                                            ? <img src={doc.photo} alt={doc.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                            : <div style={s.avatar(bg, color)}>{doc.initials}</div>
                                        }
                                        <div style={{ flex: 1 }}>
                                            <p style={s.volName}>{doc.name}</p>
                                            <p style={s.volBranch}>{doc.type}</p>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600' }}>View →</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div style={s.card}>
                        <div style={s.cardTitle}>Quick Actions</div>
                        <div style={s.quickActions}>
                            <Link href={route('admin.volunteers')}          style={s.btnRed}>Manage Volunteers</Link>
                            <Link href={route('admin.activities.index')}    style={s.btnBlue}>Manage Activities</Link>
                            <Link href={route('admin.activities.create')}   style={s.btnGreen}>+ New Activity</Link>
                            <Link href={route('admin.attendance.index')}    style={s.btnGray}>View Attendance</Link>
                            <Link href={route('admin.attendance.export.pdf')} style={s.btnGray}>Export PDF</Link>
                            <Link href={route('admin.communication')}       style={s.btnGray}>Communication</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
