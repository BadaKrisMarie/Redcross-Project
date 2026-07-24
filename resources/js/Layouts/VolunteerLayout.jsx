import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

/**
 * ✅ PERSISTENT LAYOUT (Volunteer side)
 * Gamitin ito sa lahat ng volunteer pages gaya nito sa dulo ng file:
 *
 *   VolunteerDashboard.layout = (page) => <VolunteerLayout title="Dashboard">{page}</VolunteerLayout>;
 *
 * Dahil dito, hindi na nire-render ulit ang sidebar sa tuwing magpapalit ng page —
 * mananatili siya sa React tree, content lang ang papalitan ni Inertia.
 *
 * ⚠️ Palitan ang mga route names sa navLinks kung iba ang pangalan nila sa routes/web.php mo.
 */

const navLinks = [
    { label: 'Dashboard',      route: 'volunteer.dashboard',     icon: 'grid' },
    { label: 'Schedule',       route: 'volunteer.schedule',      icon: 'calendar' },
    { label: 'Communication',  route: 'volunteer.communication', icon: 'message' },
    { label: 'Attendance',     route: 'volunteer.attendance',    icon: 'check' },
    { label: '201',            route: 'volunteer.documents',     icon: 'folder' },
];

const NavIcon = ({ name }) => {
    const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
    switch (name) {
        case 'grid':     return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
        case 'calendar': return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
        case 'message':  return <svg {...common}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
        case 'check':    return <svg {...common}><polyline points="20 6 9 17 4 12"/></svg>;
        case 'folder':   return <svg {...common}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
        default:         return null;
    }
};

// ⚠️ Idinefine OUTSIDE ng parent component para hindi mag-reset ang state nito sa bawat re-render.
const NavAvatar = ({ photoUrl, initials, size = 32, fontSize = 12 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize, fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
        {photoUrl ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
);

export default function VolunteerLayout({ children, title = 'Dashboard' }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const isActive = (routeName) => {
        try {
            return route().current(routeName) || route().current(`${routeName}.*`);
        } catch {
            return false;
        }
    };

    const volunteer = auth?.user;
    const initials = volunteer?.name
        ? volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'VL';
    const photoUrl = volunteer?.photo ? `/storage/${volunteer.photo}` : null;

    const handleLogout = () => router.post(route('logout'));

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=monserrat:wght@300;400;500&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :root { --red: #ff0000; --ink: #1A1A1A; --muted: #6B6B6B; --border: #EDEDED; --surface: #F7F7F5; --white: #FFFFFF; }
                body { font-family: Montserrat; background: var(--surface); }
                .vwrap { display: flex; min-height: 100vh; }
                .vsidebar { width: 220px; background: #ff0000; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: transform 0.2s; }
                .vsidebar.closed { transform: translateX(-220px); }
                .vmain { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
                .vmain.full { margin-left: 0; }
                /* ✅ Static lang — hindi clickable, kagaya ng ginawa sa AdminLayout */
                .vsb-user { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 10px; cursor: default; }
                .vsb-uname { color: #fff; font-size: 14px; font-weight: 700; line-height: 1.3; }
                .vsb-uname span { display: block; color: rgba(255,255,255,0.75); font-size: 11px; font-weight: 400; }
                .vsb-nav { padding: 10px 0; flex: 1; overflow-y: auto; }
                .vnav-section-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.6); padding: 10px 20px 4px; font-weight: 600; }
                .vnav-item { display: flex; align-items: center; gap: 10px; padding: 11px 20px; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; border-left: 2px solid transparent; text-decoration: none; }
                .vnav-item:hover { background: rgba(0,0,0,0.12); color: #fff; }
                .vnav-item.active { background: rgba(255,255,255,0.2); border-left-color: #fff; color: #fff; font-weight: 700; }
                .vsb-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.15); }
                .vlogout-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 12px; cursor: pointer; transition: color .15s; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; }
                .vlogout-btn:hover { color: #fff; }
                .vtopbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; position: sticky; top: 0; z-index: 50; }
                .vmenu-btn { background: none; border: none; cursor: pointer; color: var(--ink); display: flex; align-items: center; padding: 4px; }
                .vpage-title { font-family: Montserrat; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: .3px; text-transform: uppercase; line-height: 1; }
                .vcontent { flex: 1; padding: 28px; }
                /* ✅ Right-side topbar profile — dito ma-eedit ang profile */
                .vtopbar-profile { display: flex; align-items: center; gap: 10px; text-decoration: none; padding: 4px 8px; border-radius: 8px; transition: background 0.15s; cursor: pointer; }
                .vtopbar-profile:hover { background: #f5f5f5; }
                .vtopbar-profile-name { font-size: 12px; font-weight: 500; color: var(--ink); }
            `}</style>

            <div className="vwrap">
                {/* SIDEBAR — persistent, hindi na nawawala sa bawat navigation */}
                <aside className={`vsidebar ${sidebarOpen ? '' : 'closed'}`}>

                    {/* ✅ Static, hindi clickable/edit dito */}
                    <div className="vsb-user">
                        <NavAvatar photoUrl={photoUrl} initials={initials} size={40} fontSize={14} />
                        <div className="vsb-uname">{volunteer?.name ?? 'Volunteer'}<span>Volunteer</span></div>
                    </div>
                    <nav className="vsb-nav">
                        <div className="vnav-section-label">Main</div>
                        {navLinks.map(({ label, route: r, icon }) => (
                            <Link key={label} href={route(r)} className={`vnav-item ${isActive(r) ? 'active' : ''}`}>
                                <NavIcon name={icon} />{label}
                            </Link>
                        ))}
                    </nav>
                    <div className="vsb-footer">
                        <button className="vlogout-btn" onClick={handleLogout}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN — dito papasok yung content ng bawat page */}
                <main className={`vmain ${sidebarOpen ? '' : 'full'}`}>
                    <div className="vtopbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="vmenu-btn" onClick={() => setSidebarOpen(o => !o)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            </button>
                            <span className="vpage-title">{title}</span>
                        </div>

                        {/* ✅ Papunta sa volunteer.profile para ma-edit */}
                        <Link href={route('volunteer.profile')} className="vtopbar-profile">
                            <NavAvatar photoUrl={photoUrl} initials={initials} size={28} fontSize={10} />
                            <span className="vtopbar-profile-name">{volunteer?.name ?? 'Volunteer'}</span>
                        </Link>
                    </div>

                    <div className="vcontent">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}