import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

/**
 * ✅ PERSISTENT LAYOUT
 * Gamitin ito sa lahat ng admin pages gaya nito sa dulo ng file:
 *
 *   AdminDashboard.layout = (page) => <AdminLayout title="Dashboard">{page}</AdminLayout>;
 *
 * Dahil dito, hindi na nire-render ulit ang sidebar sa tuwing magpapalit ng page —
 * mananatili siya sa React tree (kasama ang sidebarOpen state), content lang
 * ang papalitan ni Inertia.
 */

const navLinksMain = [
    { label: 'Dashboard',  route: 'admin.dashboard' },
    { label: 'Volunteers', route: 'admin.volunteers' },
    { label: 'Schedule',   route: 'admin.schedule' },
    { label: 'Attendance', route: 'admin.attendance.index' },
    { label: 'Reports',    route: 'admin.reports.index' },
];

const navLinksManage = [
    { label: 'Activities',    route: 'admin.activities.index' },
    { label: '201 Files',     route: 'admin.documents.index' },
    { label: 'Communication', route: 'admin.communication' },
];

// ⚠️ Idinefine OUTSIDE ng parent component (gaya ng Avatar convention niyo)
// para hindi mag-reset ang state nito sa bawat re-render.
const NavAvatar = ({ photoUrl, initials, size = 32, fontSize = 12 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#0000ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize, fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
        {photoUrl ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
);

export default function AdminLayout({ children, title = 'Dashboard' }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ✅ Dynamic active-link detection base sa current Inertia route
    // (gumagana kahit anong page ang binisita — hindi na naka-hardcode ang "active")
    const isActive = (routeName) => {
        try {
            return route().current(routeName) || route().current(`${routeName}.*`);
        } catch {
            return false;
        }
    };

    const admin = auth?.user;
    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;

    const handleLogout = () => router.post(route('logout'));

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :root { --red: #ff0000; --red-dark: #ff0000; --ink: #1A1A1A; --muted: #6B6B6B; --border: #EDEDED; --surface: #F7F7F5; --white: #FFFFFF; }
                body { font-family: Montserrat; background: var(--surface); }
                .wrap { display: flex; min-height: 100vh; }
                .sidebar { width: 220px; background: #ff0000; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: transform 0.2s; }
                .sidebar.closed { transform: translateX(-220px); }
                .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
                .main.full { margin-left: 0; }
                .sb-brand { padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.15); }
                .sb-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .sb-cross { width: 32px; height: 32px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; flex-shrink: 0; }
                .sb-name { font-family: Montserrat; color: #fff; font-size: 13px; font-weight: 600; letter-spacing: .5px; line-height: 1.3; }
                .sb-name span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; }
                /* ✅ Static na lang ito ngayon — hindi na Link, kaya walang cursor pointer / hover state */
                .sb-user { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 10px; cursor: default; }
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
                .page-title { font-family: Montserrat; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: .3px; text-transform: uppercase; line-height: 1; }
                .content { flex: 1; padding: 28px; }
                /* ✅ Right-side topbar profile — dito na ngayon ma-eedit ang profile */
                .topbar-profile { display: flex; align-items: center; gap: 10px; text-decoration: none; padding: 4px 8px; border-radius: 8px; transition: background 0.15s; cursor: pointer; }
                .topbar-profile:hover { background: #f5f5f5; }
                .topbar-profile-name { font-size: 12px; font-weight: 500; color: var(--ink); }
            `}</style>

            <div className="wrap">
                {/* SIDEBAR — persistent, hindi na nawawala sa bawat navigation */}
                <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>

                    {/* ✅ Static na lang, hindi na clickable/edit dito */}
                    <div className="sb-user">
                        <NavAvatar photoUrl={photoUrl} initials={initials} size={34} fontSize={12} />
                        <div className="sb-uname">{admin?.name ?? 'Admin'}<span>Administrator</span></div>
                    </div>
                    <nav className="sb-nav">
                        <div className="nav-section-label">Main</div>
                        {navLinksMain.map(({ label, route: r, badge }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${isActive(r) ? 'active' : ''}`}>
                                <div className="nav-dot" />{label}
                                {badge && <span className="nav-badge">{badge}</span>}
                            </Link>
                        ))}
                        <div className="nav-section-label">Manage</div>
                        {navLinksManage.map(({ label, route: r, badge }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${isActive(r) ? 'active' : ''}`}>
                                <div className="nav-dot" />{label}
                                {badge && <span className="nav-badge">{badge}</span>}
                            </Link>
                        ))}
                    </nav>
                    <div className="sb-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN — dito papasok yung content ng bawat page */}
                <main className={`main ${sidebarOpen ? '' : 'full'}`}>
                    <div className="topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            </button>
                            <span className="page-title">{title}</span>
                        </div>

                        {/* ✅ Dito na ngayon papunta sa admin.profile para ma-edit */}
                        <Link href={route('admin.profile')} className="topbar-profile">
                            <NavAvatar photoUrl={photoUrl} initials={initials} size={28} fontSize={10} />
                            <span className="topbar-profile-name">{admin?.name ?? 'Admin'}</span>
                        </Link>
                    </div>

                    <div className="content">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}