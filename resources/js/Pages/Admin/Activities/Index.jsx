import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, activities = [], pendingCount = 0 }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [view, setView] = useState('table');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const admin = auth?.user;
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;
    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            router.delete(route('admin.activities.destroy', id));
        }
    };

    const handleLogout = () => router.post(route('logout'));

    const statusStyle = (status) => {
        switch (status) {
            case 'upcoming':  return { background: '#dbeafe', color: '#1e40af' };
            case 'ongoing':   return { background: '#dcfce7', color: '#166534' };
            case 'completed': return { background: '#f3f4f6', color: '#374151' };
            case 'cancelled': return { background: '#fee2e2', color: '#991b1b' };
            default:          return { background: '#f3f4f6', color: '#374151' };
        }
    };

    const navLinks = [
        { label: 'Dashboard',     route: 'admin.dashboard' },
        { label: 'Volunteers',    route: 'admin.volunteers', badge: pendingCount > 0 ? pendingCount : null },
        { label: 'Schedule',      route: 'admin.schedule' },
        { label: 'Attendance',    route: 'admin.attendance.index' },
        { label: 'Activities',    route: 'admin.activities.index', active: true },
        { label: '201 Files',     route: 'admin.documents.index' },
        { label: 'Communication', route: 'admin.communication' },
    ];

    const NavAvatar = ({ size = 32, fontSize = 12 }) => (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: '#C8102E', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize,
            fontWeight: '700', overflow: 'hidden', flexShrink: 0,
        }}>
            {photoUrl
                ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
        </div>
    );

    const filtered = activities.filter(a => {
        const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) ||
                            a.description?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <Head title="Activities" />
            <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :root {
                    --red: #C8102E; --red-dark: #9B0B22; --ink: #1A1A1A;
                    --muted: #6B6B6B; --border: #EDEDED; --surface: #F7F7F5; --white: #FFFFFF;
                }
                body { font-family: 'DM Sans', sans-serif; background: var(--surface); }
                .wrap { display: flex; min-height: 100vh; }
                .sidebar {
                    width: 220px; background: #CC0000; display: flex; flex-direction: column;
                    position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
                    transition: transform 0.2s;
                }
                .sidebar.closed { transform: translateX(-220px); }
                .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
                .main.full { margin-left: 0; }
                .sb-brand { padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.15); background: #AA0000; }
                .sb-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .sb-cross { width: 32px; height: 32px; background: #CC0000; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; flex-shrink: 0; }
                .sb-name { font-family: 'Barlow Condensed', sans-serif; color: #fff; font-size: 13px; font-weight: 600; letter-spacing: .5px; line-height: 1.3; }
                .sb-name span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; }
                .sb-user { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 10px; text-decoration: none; transition: background 0.15s; }
                .sb-user:hover { background: rgba(0,0,0,0.1); }
                .sb-uname { color: #fff; font-size: 12px; font-weight: 500; line-height: 1.3; }
                .sb-uname span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; }
                .sb-nav { padding: 10px 0; flex: 1; overflow-y: auto; }
                .nav-section-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.6); padding: 10px 20px 4px; font-weight: 500; }
                .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; color: rgba(255,255,255,0.85); font-size: 13px; cursor: pointer; transition: all .15s; border-left: 2px solid transparent; text-decoration: none; }
                .nav-item:hover { color: #fff; background: rgba(0,0,0,0.12); }
                .nav-item.active { color: #fff; background: rgba(255,255,255,0.2); border-left-color: #fff; font-weight: 500; }
                .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
                .nav-badge { margin-left: auto; background: #fff; color: var(--red); font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 10px; }
                .sb-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.15); }
                .logout-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 12px; cursor: pointer; transition: color .15s; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; }
                .logout-btn:hover { color: #fff; }
                .topbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; position: sticky; top: 0; z-index: 50; }
                .topbar-left { display: flex; align-items: center; gap: 12px; }
                .menu-btn { background: none; border: none; cursor: pointer; color: var(--ink); display: flex; align-items: center; padding: 4px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: .3px; text-transform: uppercase; line-height: 1; }
                .content { flex: 1; padding: 24px 28px; }
                .status-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; text-transform: capitalize; white-space: nowrap; }
                .card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; }
                .act-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .act-table th { text-align: left; padding: 11px 16px; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid var(--border); background: var(--surface); }
                .act-table td { padding: 13px 16px; border-bottom: 1px solid var(--border); color: var(--ink); vertical-align: top; }
                .act-table tr:last-child td { border-bottom: none; }
                .act-table tr:hover td { background: #fafafa; }
                .act-card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.15s, transform 0.15s; }
                .act-card:hover { border-color: #ddd; transform: translateY(-2px); }
                .btn-edit { background: var(--surface); border: 1px solid var(--border); color: var(--ink); padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 500; text-decoration: none; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
                .btn-edit:hover { background: #ebebeb; }
                .btn-del { background: #fee2e2; border: none; color: #991b1b; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
                .btn-del:hover { background: #fecaca; }
                .view-toggle { display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
                .view-toggle button { background: none; border: none; padding: 7px 12px; cursor: pointer; color: var(--muted); font-size: 12px; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
                .view-toggle button.active { background: var(--white); color: var(--ink); font-weight: 500; }
                .filter-select { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; font-size: 12px; color: var(--ink); font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }
                .new-btn { background: var(--red); color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s; font-family: 'DM Sans', sans-serif; }
                .new-btn:hover { background: var(--red-dark); }
                .search-input { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 7px 12px; font-size: 12px; color: var(--ink); font-family: 'DM Sans', sans-serif; outline: none; width: 200px; transition: border-color 0.15s; }
                .search-input:focus { border-color: #ccc; }
                .search-input::placeholder { color: #aaa; }
                .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-220px); }
                    .main { margin-left: 0; }
                    .content { padding: 16px; }
                }
            `}</style>

            <div className="wrap">
                {/* SIDEBAR */}
                <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
                    <div className="sb-brand">
                        <Link href={route('admin.dashboard')} className="sb-logo">
                            <div className="sb-cross">+</div>
                            <div className="sb-name">
                                Philippine Red Cross
                                <span>Rizal · Muntinlupa</span>
                            </div>
                        </Link>
                    </div>

                    <Link href={route('admin.profile')} className="sb-user">
                        <NavAvatar size={34} fontSize={12} />
                        <div className="sb-uname">
                            {admin?.name ?? 'Admin'}
                            <span>Administrator</span>
                        </div>
                    </Link>

                    <nav className="sb-nav">
                        <div className="nav-section-label">Main</div>
                        {navLinks.slice(0, 4).map(({ label, route: r, active, badge }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${active ? 'active' : ''}`}>
                                <div className="nav-dot" />
                                {label}
                                {badge && <span className="nav-badge">{badge}</span>}
                            </Link>
                        ))}
                        <div className="nav-section-label">Manage</div>
                        {navLinks.slice(4).map(({ label, route: r, active, badge }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${active ? 'active' : ''}`}>
                                <div className="nav-dot" />
                                {label}
                                {badge && <span className="nav-badge">{badge}</span>}
                            </Link>
                        ))}
                    </nav>

                    <div className="sb-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className={`main ${sidebarOpen ? '' : 'full'}`}>
                    {/* TOPBAR */}
                    <div className="topbar">
                        <div className="topbar-left">
                            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                    <line x1="3" y1="12" x2="21" y2="12"/>
                                    <line x1="3" y1="18" x2="21" y2="18"/>
                                </svg>
                            </button>

                            {/* BREADCRUMB */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                                    <Link
                                        href={route('admin.dashboard')}
                                        style={{ color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                                    >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                            <polyline points="9 22 9 12 15 12 15 22"/>
                                        </svg>
                                        Dashboard
                                    </Link>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                    <span style={{ color: 'var(--ink)', fontWeight: '500' }}>Activities</span>
                                </div>
                                <span className="page-title">Activities</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <NavAvatar size={28} fontSize={10} />
                            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--ink)' }}>{admin?.name ?? 'Admin'}</span>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="content">

                        {/* PAGE HEADER */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                                    {filtered.length} activit{filtered.length !== 1 ? 'ies' : 'y'} found
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <input
                                    className="search-input"
                                    placeholder="Search activities…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <div className="view-toggle">
                                    <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>
                                        ☰ Table
                                    </button>
                                    <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>
                                        ⊞ Cards
                                    </button>
                                </div>
                                <Link href={route('admin.activities.create')} className="new-btn">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    New Activity
                                </Link>
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="card empty-state">
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                                <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '6px', color: 'var(--ink)' }}>No activities found</div>
                                <div style={{ fontSize: '13px', marginBottom: '16px' }}>
                                    {search || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Create your first activity to get started.'}
                                </div>
                                <Link href={route('admin.activities.create')} className="new-btn" style={{ display: 'inline-flex' }}>
                                    + New Activity
                                </Link>
                            </div>
                        ) : view === 'table' ? (
                            /* ── TABLE VIEW ── */
                            <div className="card" style={{ overflow: 'hidden' }}>
                                <table className="act-table">
                                    <thead>
                                        <tr>
                                            <th>Activity</th>
                                            <th>Date & Time</th>
                                            <th>Status</th>
                                            <th>Description</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(activity => (
                                            <tr key={activity.id}>
                                                <td>
                                                    <div style={{ fontWeight: '500', color: 'var(--ink)', fontSize: '13px' }}>{activity.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>📍 {activity.location_name ?? '—'}</div>
                                                </td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <div style={{ fontSize: '12px', color: 'var(--ink)' }}>{activity.date}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{activity.start_time} – {activity.end_time}</div>
                                                </td>
                                                <td>
                                                    <span className="status-badge" style={statusStyle(activity.status)}>
                                                        {activity.status}
                                                    </span>
                                                </td>
                                                <td style={{ maxWidth: '260px' }}>
                                                    <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {activity.description ?? '—'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                        <Link href={route('admin.activities.edit', activity.id)} className="btn-edit">Edit</Link>
                                                        <button onClick={() => handleDelete(activity.id)} className="btn-del">Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* ── CARDS VIEW ── */
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {filtered.map(activity => (
                                    <div key={activity.id} className="act-card">
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ink)', lineHeight: '1.3' }}>{activity.name}</div>
                                            <span className="status-badge" style={{ ...statusStyle(activity.status), flexShrink: 0 }}>
                                                {activity.status}
                                            </span>
                                        </div>

                                        {activity.description && (
                                            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {activity.description}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                                {activity.date} &nbsp;·&nbsp; {activity.start_time} – {activity.end_time}
                                            </div>
                                            {activity.location_name && (
                                                <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                    {activity.location_name}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                            <Link href={route('admin.activities.edit', activity.id)} className="btn-edit" style={{ flex: 1, textAlign: 'center' }}>Edit</Link>
                                            <button onClick={() => handleDelete(activity.id)} className="btn-del" style={{ flex: 1 }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}