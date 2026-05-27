import React, { useState } from 'react';
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
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const admin = auth?.user;
    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;

    const handleLogout = () => router.post(route('logout'));

    const navLinks = [
        { label: 'Dashboard',     route: 'admin.dashboard', active: true },
        { label: 'Volunteers',    route: 'admin.volunteers' },
        { label: 'Schedule',      route: 'admin.schedule' },
        { label: 'Attendance',    route: 'admin.attendance.index' },
        { label: 'Activities',    route: 'admin.activities.index' },
        { label: '201 Files',     route: 'admin.documents.index' },
        { label: 'Communication', route: 'admin.communication' },
    ];

    const NavAvatar = ({ size = 32, fontSize = 12 }) => (
        <div style={{ width: size, height: size, borderRadius: '50%', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize, fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
            {photoUrl ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>
    );

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
        if (status === 'Active') return { background: '#dcfce7', color: '#166534' };
        if (status === 'Incomplete docs') return { background: '#fef3c7', color: '#92400e' };
        return { background: '#f5f5f5', color: '#555' };
    };

    const isImage = (url) => url && /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
    const isPdf   = (url) => url && (/\.pdf(\?.*)?$/i.test(url) || /\/documents\/\d+\/file/.test(url));

    const handleDownload = async (doc) => {
        if (!doc.file_url) return;
        const fileName = `${doc.name}_${doc.type}`.replace(/\s+/g, '_') + (isPdf(doc.file_url) ? '.pdf' : '');
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

    return (
        <>
            <Head title="Admin Dashboard" />
            <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :root { --red: #C8102E; --red-dark: #9B0B22; --ink: #1A1A1A; --muted: #6B6B6B; --border: #EDEDED; --surface: #F7F7F5; --white: #FFFFFF; }
                body { font-family: 'DM Sans', sans-serif; background: var(--surface); }
                .wrap { display: flex; min-height: 100vh; }
                .sidebar { width: 220px; background: #CC0000; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: transform 0.2s; }
                .sidebar.closed { transform: translateX(-220px); }
                .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
                .main.full { margin-left: 0; }
                .sb-brand { padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.15); }
                .sb-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .sb-cross { width: 32px; height: 32px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; flex-shrink: 0; }
                .sb-name { font-family: 'Barlow Condensed', sans-serif; color: #fff; font-size: 13px; font-weight: 600; letter-spacing: .5px; line-height: 1.3; }
                .sb-name span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; }
                .sb-user { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 10px; text-decoration: none; transition: background 0.15s; }
                .sb-user:hover { background: rgba(0,0,0,0.1); }
                .sb-uname { color: #fff; font-size: 12px; font-weight: 500; line-height: 1.3; }
                .sb-uname span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; }
                .sb-nav { padding: 10px 0; flex: 1; overflow-y: auto; }
                .nav-section-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.6); padding: 10px 20px 4px; font-weight: 600; }
                .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; border-left: 2px solid transparent; text-decoration: none; }
                .nav-item:hover { background: rgba(0,0,0,0.12); color: #fff; }
                .nav-item.active { background: rgba(255,255,255,0.2); border-left-color: #fff; color: #fff; }
                .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
                .nav-badge { margin-left: auto; background: #fff; color: var(--red); font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 10px; }
                .sb-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.15); }
                .logout-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 12px; cursor: pointer; transition: color .15s; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; }
                .logout-btn:hover { color: #fff; }
                .topbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; position: sticky; top: 0; z-index: 50; }
                .menu-btn { background: none; border: none; cursor: pointer; color: var(--ink); display: flex; align-items: center; padding: 4px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: .3px; text-transform: uppercase; line-height: 1; }
                .content { flex: 1; padding: 28px; }
                .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                .metric-card { background: var(--white); padding: 20px; border-radius: 10px; border: 1px solid var(--border); text-decoration: none; display: block; transition: border-color 0.15s; }
                .metric-card:hover { border-color: #ccc; }
                .metric-val { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; color: var(--red); line-height: 1; }
                .metric-val.highlight { color: #f59e0b; }
                .metric-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
                .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
                .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .3px; margin-bottom: 14px; }
                .vol-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-decoration: none; }
                .vol-row:last-child { border-bottom: none; }
                .vol-name { font-size: 13px; color: var(--ink); font-weight: 500; }
                .vol-sub { font-size: 11px; color: var(--muted); }
                .badge { font-size: 11px; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
                .view-all { font-size: 12px; color: var(--red); text-decoration: none; font-weight: 600; }
                .quick-actions { display: flex; gap: 10px; flex-wrap: wrap; }
                .btn-red   { background: var(--red); color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: background 0.15s; font-family: 'DM Sans', sans-serif; }
                .btn-red:hover { background: var(--red-dark); }
                .btn-blue  { background: #1d4ed8; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'DM Sans', sans-serif; }
                .btn-green { background: #16a34a; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'DM Sans', sans-serif; }
                .btn-gray  { background: #f5f5f5; border: 1px solid var(--border); padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--ink); text-decoration: none; display: inline-block; font-family: 'DM Sans', sans-serif; }
                .alert { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
            `}</style>

            {/* MODAL */}
            {previewDoc && (
                <div onClick={() => setPreviewDoc(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '860px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <ProfileAvatar doc={previewDoc} size={36} />
                                <div>
                                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase' }}>{previewDoc.name}</div>
                                    <div style={{ fontSize: '12px', color: '#C8102E', fontWeight: '600', marginTop: '2px' }}>{previewDoc.type}</div>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '240px 1fr' }}>
                            <div style={{ borderRight: '1px solid #f0f0f0', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <ProfileAvatar doc={previewDoc} size={80} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{previewDoc.name}</div>
                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Muntinlupa City Branch</div>
                                </div>
                                <div style={{ width: '100%', marginTop: '8px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Document</div>
                                    <div style={{ fontSize: '13px', color: '#C8102E', fontWeight: '600' }}>{previewDoc.type}</div>
                                </div>
                            </div>
                            <div style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', overflow: 'hidden' }}>
                                {previewDoc.file_url ? (
                                    isImage(previewDoc.file_url) ? (
                                        <img src={previewDoc.file_url} alt={previewDoc.type} style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', margin: '20px' }} />
                                    ) : isPdf(previewDoc.file_url) ? (
                                        <iframe src={`${previewDoc.file_url}#toolbar=1`} style={{ width: '100%', height: '55vh', border: 'none' }} title={previewDoc.type} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#888' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                                            <button onClick={() => handleDownload(previewDoc)} style={{ background: 'none', border: 'none', color: '#C8102E', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>I-download →</button>
                                        </div>
                                    )
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Walang file na naka-attach.</div>
                                )}
                            </div>
                        </div>
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {previewDoc.file_url && <button onClick={() => handleDownload(previewDoc)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>I-download</button>}
                            <button onClick={() => setPreviewDoc(null)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="wrap">
                {/* SIDEBAR */}
                <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
                    <div className="sb-brand">
                        <Link href={route('admin.dashboard')} className="sb-logo">
                            <div className="sb-cross">+</div>
                            <div className="sb-name">Philippine Red Cross<span>Rizal · Muntinlupa</span></div>
                        </Link>
                    </div>
                    <Link href={route('admin.profile')} className="sb-user">
                        <NavAvatar size={34} fontSize={12} />
                        <div className="sb-uname">{admin?.name ?? 'Admin'}<span>Administrator</span></div>
                    </Link>
                    <nav className="sb-nav">
                        <div className="nav-section-label">Main</div>
                        {navLinks.slice(0, 4).map(({ label, route: r, active, badge }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${active ? 'active' : ''}`}>
                                <div className="nav-dot" />{label}
                                {badge && <span className="nav-badge">{badge}</span>}
                            </Link>
                        ))}
                        <div className="nav-section-label">Manage</div>
                        {navLinks.slice(4).map(({ label, route: r, active, badge }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${active ? 'active' : ''}`}>
                                <div className="nav-dot" />{label}
                                {badge && <span className="nav-badge">{badge}</span>}
                            </Link>
                        ))}
                        {/* Reports nav item removed */}
                    </nav>
                    <div className="sb-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className={`main ${sidebarOpen ? '' : 'full'}`}>
                    <div className="topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            </button>
                            <span className="page-title">Dashboard</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <NavAvatar size={28} fontSize={10} />
                            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--ink)' }}>{admin?.name ?? 'Admin'}</span>
                        </div>
                    </div>

                    <div className="content">
                        {/* METRICS */}
                        <div className="metrics-grid">
                            {[
                                { label: 'Total Volunteers', value: totalVolunteers ?? 0, href: route('admin.volunteers') },
                                { label: 'Active Today',     value: activeToday ?? 0,     href: route('admin.attendance.index') },
                                { label: 'Pending Approval', value: pendingCount ?? 0, highlight: true, href: route('admin.volunteers') },
                                { label: 'Total Activities', value: qs.totalActivities,  href: route('admin.activities.index') },
                            ].map(({ label, value, highlight, href }) => (
                                <Link key={label} href={href} className="metric-card">
                                    <div className={`metric-val ${highlight && value > 0 ? 'highlight' : ''}`}>{value}</div>
                                    <div className="metric-label">{label}</div>
                                </Link>
                            ))}
                        </div>

                        {/* ALERT */}
                        {pendingCount > 0 && (
                            <div className="alert">
                                <span style={{ fontSize: '14px', color: '#92400e', fontWeight: '500' }}>
                                    You have <strong>{pendingCount}</strong> volunteer{pendingCount > 1 ? 's' : ''} waiting for approval.
                                </span>
                                <Link href={route('admin.volunteers')} style={{ background: '#f59e0b', color: 'white', padding: '7px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>Review Now →</Link>
                            </div>
                        )}

                        {/* RECENT VOLUNTEERS + PENDING DOCS */}
                        <div className="grid2">
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <div className="card-title">Recent Volunteers</div>
                                    <Link href={route('admin.volunteers')} className="view-all">View all →</Link>
                                </div>
                                {recentVolunteers.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '20px 0' }}>No volunteers yet</div>
                                ) : recentVolunteers.map((vol, i) => {
                                    const [bg, color] = avatarColors[i % avatarColors.length];
                                    return (
                                        <Link key={i} href={route('admin.volunteers')} className="vol-row">
                                            {vol.photo
                                                ? <img src={vol.photo} alt={vol.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                : <div style={{ width: 34, height: 34, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color, flexShrink: 0 }}>{vol.initials}</div>
                                            }
                                            <div style={{ flex: 1 }}>
                                                <div className="vol-name">{vol.name}</div>
                                                <div className="vol-sub">{vol.branch}</div>
                                            </div>
                                            <span className="badge" style={statusBadge(vol.status)}>{vol.status}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <div className="card-title">Pending Documents</div>
                                    <Link href={route('admin.documents.index')} className="view-all">View all →</Link>
                                </div>
                                {pendingDocuments.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '20px 0' }}>No pending documents</div>
                                ) : pendingDocuments.map((doc, i) => {
                                    const [bg, color] = avatarColors[doc.color_id ?? i % avatarColors.length];
                                    return (
                                        <div key={i} onClick={() => setPreviewDoc(doc)} className="vol-row" style={{ cursor: 'pointer' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {doc.photo
                                                ? <img src={doc.photo} alt={doc.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                : <div style={{ width: 34, height: 34, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color, flexShrink: 0 }}>{doc.initials}</div>
                                            }
                                            <div style={{ flex: 1 }}>
                                                <div className="vol-name">{doc.name}</div>
                                                <div className="vol-sub">{doc.type}</div>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#C8102E', fontWeight: '600' }}>View →</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* QUICK ACTIONS */}
                        <div className="card">
                            <div className="card-title">Quick Actions</div>
                            <div className="quick-actions">
                                <Link href={route('admin.volunteers')}        className="btn-red">Manage Volunteers</Link>
                                <Link href={route('admin.activities.index')}  className="btn-blue">Manage Activities</Link>
                                <Link href={route('admin.activities.create')} className="btn-green">+ New Activity</Link>
                                <Link href={route('admin.attendance.index')}  className="btn-gray">View Attendance</Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}