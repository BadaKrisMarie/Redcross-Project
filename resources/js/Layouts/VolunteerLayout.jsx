import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import LiveChatPanel from '@/Components/LiveChatPanel';
// ⚠️ Palitan ang import path sa itaas kung iba ang lokasyon ng LiveChatPanel.jsx mo
// (hal. '@/Pages/Volunteer/Communication/LiveChatPanel' o kung saan mo talaga sinave).

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
 *
 * ❌ Notification bell removed — tinanggal na ang bell button, dropdown,
 * detail modal, at lahat ng kaugnay na state/logic (fetch, mark-as-read, atbp).
 *
 * 🆕 FLOATING LIVE CHAT — dinagdag na floating chat bubble (parang Messenger/Intercom)
 * dito sa layout mismo, kaya lumalabas siya sa LAHAT ng volunteer pages kasama ang
 * Dashboard, hindi lang sa Communication page. Ginagamit nito yung LiveChatPanel.jsx
 * mo (mode="volunteer") sa loob ng floating overlay window.
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

// 🆕 Floating chat bubble button — nasa ibaba-right, laging nakalutang sa lahat ng pages
const ChatBubbleIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
);
const CloseIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

export default function VolunteerLayout({ children, title = 'Dashboard' }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false); // 🆕 floating chat window toggle

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
            {/* ✅ FIXED: dating may duplicate/typo na "monserrat" family, isa na lang ngayon
                at kumpleto ang weights (300–800) */}
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :root { --red: #5765F2; --ink: #1A1A1A; --muted: #6B6B6B; --border: #EDEDED; --surface: #F4F5F7; --white: #FFFFFF; }
                /* ✅ FIXED: fallback font + explicit regular weight, para hindi ma-default sa bold
                   ang buong app habang naglo-load pa ang Montserrat */
                body { font-family: 'Montserrat', sans-serif; font-weight: 400; background: var(--surface); }
                .vwrap { display: flex; min-height: 100vh; }
                .vsidebar { width: 220px; background: #e40000; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: transform 0.2s; }
                .vsidebar.closed { transform: translateX(-220px); }
                .vmain { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
                .vmain.full { margin-left: 0; }
                /* ✅ Static lang — hindi clickable, kagaya ng ginawa sa AdminLayout */
                .vsb-user { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 10px; cursor: default; }
                .vsb-uname { color: #fff; font-size: 14px; font-weight: 700; line-height: 1.3; }
                .vsb-uname span { display: block; color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 500; }
                .vsb-nav { padding: 10px 0; flex: 1; overflow-y: auto; }
                .vnav-section-label { font-size: 10.5px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.85); padding: 10px 20px 4px; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.15); }
                .vnav-item { position: relative; display: flex; align-items: center; gap: 10px; padding: 11px 20px; color: #ffffff; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all .15s; border-left: 2px solid transparent; text-decoration: none; text-shadow: 0 1px 2px rgba(0,0,0,0.12); }
                .vnav-item:hover { background: rgba(0,0,0,0.15); color: #fff; }
                .vnav-item.active { background: #fff; border-left-color: transparent; color: #e40000; text-shadow: none; font-weight: 700; border-radius: 20px 0 0 20px; z-index: 1; }
                .vnav-item.active::before,
                .vnav-item.active::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    pointer-events: none;
                }
                .vnav-item.active::before { top: -18px; box-shadow: 9px 9px 0 0 #fff; }
                .vnav-item.active::after { bottom: -18px; box-shadow: 9px -9px 0 0 #fff; }
                .vsb-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.15); }
                /* ✅ FIXED: dating 'DM Sans' (ibang font, hindi consistent) — Montserrat na rin */
                .vlogout-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.85); font-size: 12px; font-weight: 600; cursor: pointer; transition: color .15s; background: none; border: none; width: 100%; font-family: 'Montserrat', sans-serif; }
                .vlogout-btn:hover { color: #fff; }
                .vtopbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; position: sticky; top: 0; z-index: 50; }
                .vmenu-btn { background: none; border: none; cursor: pointer; color: var(--ink); display: flex; align-items: center; padding: 4px; }
                .vpage-title { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: .3px; text-transform: uppercase; line-height: 1; }
                .vcontent { flex: 1; padding: 28px; }
                /* ✅ Right-side topbar profile — dito ma-eedit ang profile */
                .vtopbar-profile { display: flex; align-items: center; gap: 10px; text-decoration: none; padding: 4px 8px; border-radius: 8px; transition: background 0.15s; cursor: pointer; }
                .vtopbar-profile:hover { background: #f5f5f5; }
                .vtopbar-profile-name { font-size: 12px; font-weight: 500; color: var(--ink); }

                /* 🆕 FLOATING CHAT WIDGET */
                .vchat-fab {
                    position: fixed; bottom: 26px; right: 26px; width: 58px; height: 58px;
                    border-radius: 50%; background: #5765F2; border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 6px 18px rgba(87,101,242,0.35);
                    z-index: 200; transition: transform 0.15s, box-shadow 0.15s;
                }
                .vchat-fab:hover { transform: scale(1.06); box-shadow: 0 8px 22px rgba(87,101,242,0.45); }
                .vchat-window {
                    position: fixed; bottom: 98px; right: 26px;
                    width: 360px; max-width: calc(100vw - 40px);
                    height: 520px; max-height: calc(100vh - 140px);
                    background: #fff; border-radius: 14px; overflow: hidden;
                    box-shadow: 0 14px 40px rgba(0,0,0,0.22);
                    z-index: 200; display: flex; flex-direction: column;
                    border: 1px solid var(--border);
                    animation: vchat-pop 0.16s ease-out;
                }
                @keyframes vchat-pop {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .vchat-header {
                    background: #5765F2; color: #fff; padding: 14px 16px;
                    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
                }
                .vchat-header-title { font-size: 13.5px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
                .vchat-close-btn { background: rgba(255,255,255,0.18); border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .vchat-close-btn:hover { background: rgba(255,255,255,0.3); }

                @media (max-width: 480px) {
                    .vchat-window { right: 12px; left: 12px; width: auto; bottom: 92px; }
                    .vchat-fab { right: 18px; bottom: 18px; }
                }
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

                        {/* 👤 Profile na lang sa kanan — tinanggal na ang bell */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {/* ✅ Papunta sa volunteer.profile para ma-edit */}
                            <Link href={route('volunteer.profile')} className="vtopbar-profile">
                                <NavAvatar photoUrl={photoUrl} initials={initials} size={28} fontSize={10} />
                                <span className="vtopbar-profile-name">{volunteer?.name ?? 'Volunteer'}</span>
                            </Link>
                        </div>
                    </div>

                    <div className="vcontent">
                        {children}
                    </div>
                </main>
            </div>

            {/* 🆕 FLOATING LIVE CHAT — lumalabas sa LAHAT ng volunteer pages */}
            {chatOpen && (
                <div className="vchat-window">
                    <div className="vchat-header">
                        <div className="vchat-header-title">
                            <ChatBubbleIcon size={16} />
                            Live Chat
                        </div>
                        <button className="vchat-close-btn" onClick={() => setChatOpen(false)}>
                            <CloseIcon size={14} />
                        </button>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <LiveChatPanel mode="volunteer" currentUserId={volunteer?.id} />
                    </div>
                </div>
            )}

            <button
                className="vchat-fab"
                onClick={() => setChatOpen(o => !o)}
                title={chatOpen ? 'Close chat' : 'Open live chat'}
            >
                {chatOpen ? <CloseIcon /> : <ChatBubbleIcon />}
            </button>
        </>
    );
}