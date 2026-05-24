import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

// ── localStorage helpers for persisting read activity IDs ──────────────────
const LS_KEY = 'volunteer_read_notif_ids';
function getReadIds() {
    try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); }
    catch { return new Set(); }
}
function saveReadIds(set) {
    try { localStorage.setItem(LS_KEY, JSON.stringify([...set])); } catch {}
}
function markIdsRead(ids) {
    const s = getReadIds();
    ids.forEach(id => s.add(String(id)));
    saveReadIds(s);
}
// ───────────────────────────────────────────────────────────────────────────

export default function VolunteerDashboard({ auth, totalHours, totalDays, monthDays, assignedActivities, recentAttendance }) {
    const volunteer = auth.user;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [availability, setAvailability] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showBellNotifs, setShowBellNotifs] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const dropdownRef = useRef();
    const bellRef = useRef();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchNotifications = useCallback(async () => {
        const readIds = getReadIds(); // persisted across page navigations

        const activityNotifs = (assignedActivities || [])
            .filter(a => new Date(a.date) >= new Date())
            .slice(0, 10)
            .map(a => ({
                id: `activity-${a.id}`,
                message: `Upcoming: ${a.name}`,
                created_at: new Date(a.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
                // already read if ID was saved in localStorage
                is_read: readIds.has(`activity-${a.id}`),
                type: 'activity',
                activity: a,
            }));

        try {
            const res = await axios.get('/volunteer/notifications');
            const apiNotifs = (res.data.notifications || []).map(n => ({
                ...n,
                type: n.type || 'general',
                // server already tracks read; also check local cache as fallback
                is_read: n.is_read || readIds.has(String(n.id)),
            }));
            const allNotifs = [...activityNotifs, ...apiNotifs];
            setNotifications(allNotifs);
            // unread = those not yet marked read in localStorage AND not read on server
            const unread = allNotifs.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch {
            setNotifications(activityNotifs);
            setUnreadCount(activityNotifs.filter(n => !n.is_read).length);
        }
    }, [assignedActivities]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
                setShowNotifs(false);
            }
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setShowBellNotifs(false);
                setExpandedId(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Auto-mark all as read when bell panel opens
    const handleBellToggle = () => {
        const willOpen = !showBellNotifs;
        setShowBellNotifs(willOpen);
        setDropdownOpen(false);
        setShowNotifs(false);
        setExpandedId(null);

        if (willOpen && unreadCount > 0) {
            setNotifications(prev => {
                // Persist every notification ID to localStorage
                markIdsRead(prev.map(n => n.id));
                return prev.map(n => ({ ...n, is_read: true }));
            });
            setUnreadCount(0);
            axios.patch('/volunteer/notifications/read-all').catch(() => {});
        }
    };

    const markAllRead = async () => {
        setNotifications(prev => {
            markIdsRead(prev.map(n => n.id));
            return prev.map(n => ({ ...n, is_read: true }));
        });
        setUnreadCount(0);
        try { await axios.patch('/volunteer/notifications/read-all'); } catch {}
    };

    // Click a notification: expand/collapse it (already read since bell was opened)
    const handleNotifClick = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const attendance = recentAttendance || [];
    const hoursToday = attendance
        .filter(r => new Date(r.date).toDateString() === new Date().toDateString())
        .reduce((sum, r) => sum + parseFloat(r.hours_rendered || 0), 0);
    const isCheckedIn = attendance.some(r =>
        new Date(r.date).toDateString() === new Date().toDateString() && r.time_in && !r.time_out
    );

    const handleLogout = () => router.post(route('logout'));
    const initials = volunteer?.name
        ? volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';
    const avatarUrl = volunteer?.photo_url || null;

    const AvatarImg = ({ size = 34, fontSize = 13 }) => (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: avatarUrl ? 'transparent' : '#CC0000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize, fontWeight: '700',
            flexShrink: 0, overflow: 'hidden',
        }}>
            {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : initials}
        </div>
    );

    const bellTaskNotifs    = notifications.filter(n => n.type === 'activity');
    const bellGeneralNotifs = notifications.filter(n => n.type !== 'activity');
    // Badge only shows unread count; after opening bell it becomes 0
    const bellUnreadCount = unreadCount;

    const sidebarLinks = [
        { key: 'dashboard',     label: 'Dashboard',     href: route('volunteer.dashboard'),     icon: <GridIcon /> },
        { key: 'schedule',      label: 'Schedule',      href: route('volunteer.schedule'),      icon: <CalIcon /> },
        { key: 'communication', label: 'Communication', href: route('volunteer.communication'), icon: <ChatIcon /> },
        { key: 'attendance',    label: 'Attendance',    href: route('volunteer.attendance'),    icon: <CheckIcon /> },
        { key: 'documents',     label: '201',           href: route('volunteer.documents'),     icon: <FolderIcon /> },
    ];

    return (
        <>
            <Head title="Volunteer Dashboard" />
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
                        {sidebarLinks.map(item => {
                            const isActive = item.key === 'dashboard';
                            return (
                                <Link key={item.key} href={item.href} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '11px 16px', textDecoration: 'none',
                                    background: isActive ? 'rgba(0,0,0,0.18)' : 'transparent',
                                    color: 'white', fontSize: '13px',
                                    fontWeight: isActive ? '600' : '400',
                                    borderLeft: isActive ? '3px solid white' : '3px solid transparent',
                                }}>
                                    <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', fontSize: '12px', padding: 0, width: '100%' }}>
                            <span style={{ fontSize: '16px' }}>&#x23FB;</span> Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div style={{ marginLeft: '160px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Topbar */}
                    <header style={{ background: 'white', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50 }}>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                            {currentTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                            {/* ── BELL ICON ── */}
                            <div style={{ position: 'relative' }} ref={bellRef}>
                                <button
                                    onClick={handleBellToggle}
                                    aria-label="Notifications"
                                    style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#F3F4F6', border: '1px solid #E5E7EB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                                >
                                    <BellIcon />
                                    {bellUnreadCount > 0 && (
                                        <span style={{ position: 'absolute', top: -2, right: -2, background: '#CC0000', color: 'white', fontSize: '9px', fontWeight: '700', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', pointerEvents: 'none' }}>
                                            {bellUnreadCount > 9 ? '9+' : bellUnreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Bell Notifications Panel */}
                                {showBellNotifs && (
                                    <div style={{ position: 'absolute', right: 0, top: 42, width: 340, background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Notifications</span>
                                            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Click to expand</span>
                                        </div>

                                        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>

                                            {/* ── TASKS ── */}
                                            <div style={{ padding: '10px 16px 4px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tasks</div>
                                            {bellTaskNotifs.length === 0 ? (
                                                <div style={{ padding: '10px 16px 14px', fontSize: '12px', color: '#D1D5DB', textAlign: 'center' }}>No tasks assigned</div>
                                            ) : bellTaskNotifs.map(n => {
                                                const isExpanded = expandedId === n.id;
                                                const act = n.activity || {};
                                                return (
                                                    <div key={n.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                                                        {/* Row — always visible, clickable */}
                                                        <div
                                                            onClick={() => handleNotifClick(n.id)}
                                                            style={{
                                                                display: 'flex', gap: '10px', padding: '10px 16px',
                                                                background: isExpanded ? '#FFF5F5' : 'white',
                                                                cursor: 'pointer',
                                                                transition: 'background 0.15s',
                                                            }}
                                                        >
                                                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#CC0000', flexShrink: 0, marginTop: '5px' }} />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#111' }}>{n.message}</div>
                                                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{n.created_at}</div>
                                                            </div>
                                                            {/* Chevron */}
                                                            <span style={{ color: '#9CA3AF', fontSize: '12px', alignSelf: 'center', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
                                                        </div>

                                                        {/* Expanded details */}
                                                        {isExpanded && (
                                                            <div style={{ padding: '0 16px 14px 33px', background: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
                                                                {act.name && (
                                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '8px', paddingTop: '10px' }}>{act.name}</div>
                                                                )}
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                    {act.date && (
                                                                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                                                            <span style={{ color: '#9CA3AF', width: '60px', flexShrink: 0 }}>Date</span>
                                                                            <span style={{ color: '#374151', fontWeight: '500' }}>
                                                                                {new Date(act.date).toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {act.start_time && (
                                                                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                                                            <span style={{ color: '#9CA3AF', width: '60px', flexShrink: 0 }}>Time</span>
                                                                            <span style={{ color: '#374151', fontWeight: '500' }}>
                                                                                {act.start_time.substring(0, 5)}{act.end_time ? ` – ${act.end_time.substring(0, 5)}` : ''}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {act.location_name && (
                                                                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                                                            <span style={{ color: '#9CA3AF', width: '60px', flexShrink: 0 }}>Location</span>
                                                                            <span style={{ color: '#374151', fontWeight: '500' }}>{act.location_name}</span>
                                                                        </div>
                                                                    )}
                                                                    {act.description && (
                                                                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', marginTop: '2px' }}>
                                                                            <span style={{ color: '#9CA3AF', width: '60px', flexShrink: 0 }}>Details</span>
                                                                            <span style={{ color: '#6B7280', lineHeight: '1.5' }}>{act.description}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Link
                                                                    href={route('volunteer.schedule')}
                                                                    onClick={() => setShowBellNotifs(false)}
                                                                    style={{ display: 'inline-block', marginTop: '10px', fontSize: '11px', fontWeight: '600', color: '#CC0000', textDecoration: 'none' }}
                                                                >
                                                                    View in Schedule →
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }} />

                                            {/* ── ANNOUNCEMENTS ── */}
                                            <div style={{ padding: '10px 16px 4px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Announcements</div>
                                            {bellGeneralNotifs.length === 0 ? (
                                                <div style={{ padding: '10px 16px 18px', fontSize: '12px', color: '#D1D5DB', textAlign: 'center' }}>No announcements yet</div>
                                            ) : bellGeneralNotifs.map(n => {
                                                const isExpanded = expandedId === n.id;
                                                return (
                                                    <div key={n.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                                                        {/* Row */}
                                                        <div
                                                            onClick={() => handleNotifClick(n.id)}
                                                            style={{
                                                                display: 'flex', gap: '10px', padding: '10px 16px',
                                                                background: isExpanded ? '#F9FAFB' : 'white',
                                                                cursor: 'pointer',
                                                                transition: 'background 0.15s',
                                                            }}
                                                        >
                                                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#D1D5DB', flexShrink: 0, marginTop: '5px' }} />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title || n.message}</div>
                                                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{n.created_at}</div>
                                                            </div>
                                                            <span style={{ color: '#9CA3AF', fontSize: '12px', alignSelf: 'center', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
                                                        </div>

                                                        {/* Expanded */}
                                                        {isExpanded && (
                                                            <div style={{ padding: '0 16px 14px 33px', background: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
                                                                {n.title && (
                                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '6px', paddingTop: '10px' }}>{n.title}</div>
                                                                )}
                                                                <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.6', paddingTop: n.title ? 0 : '10px' }}>{n.message}</div>
                                                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>{n.created_at}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── AVATAR / PROFILE DROPDOWN ── */}
                            <div style={{ position: 'relative' }} ref={dropdownRef}>
                                <button
                                    onClick={() => { setDropdownOpen(o => !o); setShowNotifs(false); setShowBellNotifs(false); }}
                                    style={{ width: '34px', height: '34px', borderRadius: '50%', background: avatarUrl ? 'transparent' : '#CC0000', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0, overflow: 'hidden' }}
                                >
                                    {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : initials}
                                </button>

                                {dropdownOpen && (
                                    <div style={{ position: 'absolute', right: 0, top: 42, width: 240, background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <AvatarImg size={36} />
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{volunteer?.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{volunteer?.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={route('volunteer.profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', fontSize: '13px', color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F3F4F6' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                            Edit Profile
                                        </Link>
                                        
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Body */}
                    <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

                        {/* Welcome Banner */}
                        <div style={{ background: '#CC0000', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                            <div style={{ position: 'absolute', right: 60, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>Welcome, {volunteer?.name}!</div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>Here's what's happening today</div>
                        </div>

                        {/* Status Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                            <div style={{ background: 'white', borderRadius: '10px', padding: '16px 20px', border: '1px solid #E5E7EB' }}>
                                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Status</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCheckedIn ? '#22C55E' : '#9CA3AF', display: 'inline-block' }} />
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{isCheckedIn ? 'Checked in' : 'Not checked in'}</span>
                                </div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '10px', padding: '16px 20px', border: '1px solid #E5E7EB' }}>
                                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Availability</div>
                                <div style={{ fontSize: '12px', color: availability ? '#22C55E' : '#6B7280', marginBottom: '6px' }}>{availability ? 'Available' : 'Not Available'}</div>
                                <div onClick={() => setAvailability(!availability)} style={{ width: '40px', height: '22px', borderRadius: '11px', background: availability ? '#22C55E' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                                    <div style={{ position: 'absolute', top: '3px', left: availability ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                </div>
                            </div>
                            <div style={{ background: 'white', borderRadius: '10px', padding: '16px 20px', border: '1px solid #E5E7EB' }}>
                                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hours this day</div>
                                <div style={{ fontSize: '22px', fontWeight: '700', color: '#111' }}>
                                    {hoursToday.toFixed(2)} <span style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280' }}>hrs</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function GridIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function CalIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function ChatIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function CheckIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>; }
function FolderIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>; }