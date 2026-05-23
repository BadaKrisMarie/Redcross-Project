import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

export default function VolunteerDashboard({ auth, totalHours, totalDays, monthDays, assignedActivities, recentAttendance }) {
    const volunteer = auth.user;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [availability, setAvailability] = useState(false);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [doneIds, setDoneIds] = useState([]);
    const dropdownRef = useRef();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchNotifications = useCallback(async () => {
        const activityNotifs = (assignedActivities || [])
            .filter(a => new Date(a.date) >= new Date())
            .slice(0, 10)
            .map(a => ({
                id: `activity-${a.id}`,
                message: `Upcoming: ${a.name}`,
                created_at: new Date(a.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
                is_read: false,
                type: 'activity',
                activity: a,
            }));

        try {
            const res = await axios.get('/api/notifications');
            const apiNotifs = (res.data.notifications || []).map(n => ({ ...n, type: n.type || 'general' }));
            setNotifications([...activityNotifs, ...apiNotifs]);
            setUnreadCount((res.data.unread_count || 0) + activityNotifs.length);
        } catch {
            setNotifications(activityNotifs);
            setUnreadCount(activityNotifs.length);
        }
    }, [assignedActivities]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        try { await axios.patch('/api/notifications/read-all'); } catch {}
    };

    const markOneRead = async (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
        if (!String(id).startsWith('activity-')) {
            try { await axios.patch(`/api/notifications/${id}/read`); } catch {}
        }
    };

    const markTaskDone = (id) => {
        setDoneIds(prev => [...prev, id]);
        // Also mark as read
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
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

    const photoUrl = volunteer?.photo ? `/storage/${volunteer.photo}` : null;

    const sidebarLinks = [
        { key: 'dashboard',     label: 'Dashboard',     href: route('volunteer.dashboard'),     icon: <GridIcon /> },
        { key: 'schedule',      label: 'Schedule',      href: route('volunteer.schedule'),      icon: <CalIcon /> },
        { key: 'communication', label: 'Communication', href: route('volunteer.communication'), icon: <ChatIcon /> },
        { key: 'attendance',    label: 'Attendance',    href: route('volunteer.attendance'),    icon: <CheckIcon /> },
        { key: 'documents',     label: '201',           href: route('volunteer.documents'),     icon: <FolderIcon /> },
    ];

    const upcomingNotifs = notifications.filter(n => n.type === 'activity');
    const generalNotifs  = notifications.filter(n => n.type !== 'activity');

    return (
        <>
            <Head title="Volunteer Dashboard" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F3F4F6' }}>

                {/* SIDEBAR */}
                <aside style={{
                    width: '160px', minHeight: '100vh', background: '#CC0000',
                    display: 'flex', flexDirection: 'column', flexShrink: 0,
                    position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
                }}>
                    <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'white', lineHeight: '1.4' }}>
                            Rizal Chapter<br />
                            <span style={{ fontWeight: '400', opacity: 0.85 }}>Muntinlupa City Branch</span>
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
                        <button onClick={handleLogout} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,0.75)', fontSize: '12px', padding: 0, width: '100%'
                        }}>
                            <span style={{ fontSize: '16px' }}>⏻</span> Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div style={{ marginLeft: '160px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Topbar */}
                    <header style={{
                        background: 'white', padding: '0 28px', height: '56px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50
                    }}>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                            {currentTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <input placeholder="Search" style={{
                                border: '1px solid #E5E7EB', borderRadius: '20px',
                                padding: '6px 16px', fontSize: '13px', width: '180px',
                                outline: 'none', background: '#F9FAFB', color: '#374151'
                            }} />

                            {/* Profile Avatar + Dropdown */}
                            <div style={{ position: 'relative' }} ref={dropdownRef}>
                                <button
                                    onClick={() => { setDropdownOpen(o => !o); setShowNotifs(false); }}
                                    style={{
                                        width: '34px', height: '34px', borderRadius: '50%',
                                        background: '#CC0000', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '13px', fontWeight: '700',
                                        flexShrink: 0, position: 'relative', overflow: 'hidden', padding: 0,
                                    }}
                                >
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    ) : initials}
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -2, right: -2,
                                            background: '#ef4444', color: 'white',
                                            fontSize: '9px', fontWeight: '700',
                                            width: '16px', height: '16px', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '2px solid white',
                                        }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Profile Dropdown */}
                                {dropdownOpen && !showNotifs && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: 42, width: 240,
                                        background: 'white', border: '1px solid #E5E7EB',
                                        borderRadius: '12px', zIndex: 200,
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden',
                                    }}>
                                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                    background: '#CC0000', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', color: 'white', fontSize: '13px',
                                                    fontWeight: '700', flexShrink: 0, overflow: 'hidden',
                                                }}>
                                                    {photoUrl ? (
                                                        <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : initials}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{volunteer?.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{volunteer?.email}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowNotifs(true)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                width: '100%', padding: '11px 16px', background: 'none',
                                                border: 'none', borderBottom: '1px solid #F3F4F6',
                                                fontSize: '13px', color: '#374151', cursor: 'pointer', textAlign: 'left',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span>🔔</span> Notifications
                                            </span>
                                            {unreadCount > 0 && (
                                                <span style={{
                                                    background: '#ef4444', color: 'white',
                                                    fontSize: '10px', fontWeight: '700',
                                                    padding: '1px 6px', borderRadius: '10px',
                                                }}>{unreadCount}</span>
                                            )}
                                        </button>

                                        <Link
                                            href={route('volunteer.profile')}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '11px 16px', fontSize: '13px', color: '#374151',
                                                textDecoration: 'none', borderBottom: '1px solid #F3F4F6',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <span>👤</span> Edit Profile
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                width: '100%', padding: '11px 16px', background: 'none',
                                                border: 'none', fontSize: '13px', color: '#CC0000', cursor: 'pointer', textAlign: 'left',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <span>🚪</span> Log out
                                        </button>
                                    </div>
                                )}

                                {/* ── Notifications Panel ── */}
                                {dropdownOpen && showNotifs && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: 42, width: 340,
                                        background: 'white', border: '1px solid #E5E7EB',
                                        borderRadius: '12px', zIndex: 200,
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden',
                                    }}>
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => setShowNotifs(false)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#9CA3AF', padding: 0 }}
                                                >←</button>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Notifications</span>
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllRead}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#CC0000', fontWeight: '600' }}
                                                >Mark all read</button>
                                            )}
                                        </div>

                                        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>

                                            {/* ── Upcoming Tasks ── */}
                                            <div style={{ padding: '10px 16px 4px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                Upcoming Tasks
                                            </div>
                                            {upcomingNotifs.length === 0 ? (
                                                <div style={{ padding: '10px 16px 14px', fontSize: '12px', color: '#D1D5DB', textAlign: 'center' }}>No upcoming tasks</div>
                                            ) : upcomingNotifs.map(n => {
                                                const isDone = doneIds.includes(n.id);
                                                return (
                                                    <div
                                                        key={n.id}
                                                        style={{
                                                            display: 'flex', gap: '10px', padding: '10px 16px',
                                                            borderBottom: '1px solid #F9FAFB',
                                                            background: isDone ? '#F0FDF4' : n.is_read ? 'white' : '#FFF5F5',
                                                            transition: 'background 0.15s',
                                                        }}
                                                    >
                                                        {/* Dot */}
                                                        <span style={{
                                                            width: '7px', height: '7px', borderRadius: '50%',
                                                            background: isDone ? '#22C55E' : n.is_read ? '#D1D5DB' : '#22C55E',
                                                            flexShrink: 0, marginTop: '5px',
                                                        }} />

                                                        {/* Content */}
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '12px', fontWeight: isDone ? '400' : n.is_read ? '400' : '600', color: isDone ? '#6B7280' : '#111', textDecoration: isDone ? 'line-through' : 'none' }}>
                                                                {n.message}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{n.created_at}</div>

                                                            {/* Buttons */}
                                                            {!isDone && (
                                                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            markTaskDone(n.id);
                                                                        }}
                                                                        style={{
                                                                            fontSize: '10px', fontWeight: '600',
                                                                            padding: '3px 10px', borderRadius: '4px',
                                                                            border: 'none', cursor: 'pointer',
                                                                            background: '#22C55E', color: 'white',
                                                                        }}
                                                                    >✓ Done</button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (!n.is_read) markOneRead(n.id);
                                                                            setSelectedTask(n.activity || n);
                                                                            setDropdownOpen(false);
                                                                            setShowNotifs(false);
                                                                        }}
                                                                        style={{
                                                                            fontSize: '10px', fontWeight: '600',
                                                                            padding: '3px 10px', borderRadius: '4px',
                                                                            border: '1px solid #E5E7EB', cursor: 'pointer',
                                                                            background: 'white', color: '#374151',
                                                                        }}
                                                                    >View</button>
                                                                </div>
                                                            )}
                                                            {isDone && (
                                                                <div style={{ fontSize: '10px', color: '#22C55E', marginTop: '4px', fontWeight: '600' }}>✓ Marked as done</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }} />

                                            {/* ── Recent Notifications (Admin Announcements) ── */}
                                            <div style={{ padding: '10px 16px 4px', fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                Announcements
                                            </div>
                                            {generalNotifs.length === 0 ? (
                                                <div style={{ padding: '10px 16px 18px', fontSize: '12px', color: '#D1D5DB', textAlign: 'center' }}>No announcements yet</div>
                                            ) : generalNotifs.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => !n.is_read && markOneRead(n.id)}
                                                    style={{
                                                        display: 'flex', gap: '10px', padding: '10px 16px',
                                                        borderBottom: '1px solid #F9FAFB',
                                                        background: n.is_read ? 'white' : '#FFF5F5',
                                                        cursor: n.is_read ? 'default' : 'pointer',
                                                    }}
                                                >
                                                    <span style={{
                                                        width: '7px', height: '7px', borderRadius: '50%',
                                                        background: n.is_read ? '#D1D5DB' : '#CC0000',
                                                        flexShrink: 0, marginTop: '5px',
                                                    }} />
                                                    <div>
                                                        <div style={{ fontSize: '12px', fontWeight: n.is_read ? '400' : '600', color: '#111' }}>{n.title || n.message}</div>
                                                        {n.title && <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{n.message}</div>}
                                                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{n.created_at}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Body */}
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

                            {/* Welcome Banner */}
                            <div style={{
                                background: '#CC0000', borderRadius: '12px',
                                padding: '24px 28px', marginBottom: '20px',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                                <div style={{ position: 'absolute', right: 60, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                                    Welcome, {volunteer?.name}!
                                </div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>Here's what's happening today</div>
                            </div>

                            {/* Status Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
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
                                    <div onClick={() => setAvailability(!availability)} style={{
                                        width: '40px', height: '22px', borderRadius: '11px',
                                        background: availability ? '#22C55E' : '#D1D5DB',
                                        position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: '3px',
                                            left: availability ? '21px' : '3px',
                                            width: '16px', height: '16px', borderRadius: '50%',
                                            background: 'white', transition: 'left 0.2s',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                </div>

                                <div style={{ background: 'white', borderRadius: '10px', padding: '16px 20px', border: '1px solid #E5E7EB' }}>
                                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hours this day</div>
                                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#111' }}>
                                        {hoursToday.toFixed(2)} <span style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280' }}>hrs</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Quick Summary Card ── */}
                            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px 24px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Your Activity Summary</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    <div style={{ textAlign: 'center', padding: '12px', background: '#FFF5F5', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#CC0000' }}>{totalHours ?? 0}</div>
                                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Total Hours</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '12px', background: '#F0FDF4', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#16A34A' }}>{totalDays ?? 0}</div>
                                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Total Days</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '12px', background: '#EFF6FF', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#2563EB' }}>{monthDays ?? 0}</div>
                                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>This Month</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '14px', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
                                    🔔 Check the notification bell for your upcoming tasks and announcements from admin.
                                </div>
                            </div>

                        </main>
                    </div>
                </div>
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <div
                    onClick={() => setSelectedTask(null)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        zIndex: 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '16px',
                            width: '100%', maxWidth: '480px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{
                            background: '#CC0000', padding: '20px 24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Task Details</div>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>
                                    {selectedTask.name || selectedTask.message}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTask(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)', border: 'none',
                                    borderRadius: '50%', width: '32px', height: '32px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: 'white', fontSize: '16px', flexShrink: 0,
                                }}
                            >✕</button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            {[
                                { label: 'Date', value: selectedTask.date
                                    ? new Date(selectedTask.date).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                    : selectedTask.created_at },
                                selectedTask.start_time && { label: 'Time', value: selectedTask.start_time.substring(0, 5) },
                                selectedTask.location_name && { label: 'Location', value: selectedTask.location_name },
                                { label: 'Status', value: 'Upcoming', isStatus: true },
                            ].filter(Boolean).map((row, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '14px', alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', width: '72px', flexShrink: 0, paddingTop: '1px' }}>{row.label}</div>
                                    {row.isStatus ? (
                                        <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' }}>
                                            {row.value}
                                        </span>
                                    ) : (
                                        <div style={{ fontSize: '13px', color: '#111', fontWeight: '500' }}>{row.value}</div>
                                    )}
                                </div>
                            ))}

                            {selectedTask.description && (
                                <>
                                    <div style={{ height: '1px', background: '#F3F4F6', margin: '16px 0' }} />
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Description</div>
                                    <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', background: '#F9FAFB', borderRadius: '8px', padding: '14px' }}>
                                        {selectedTask.description}
                                    </div>
                                </>
                            )}

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <Link
                                    href={route('volunteer.attendance')}
                                    style={{
                                        flex: 1, textAlign: 'center',
                                        background: '#CC0000', color: 'white',
                                        fontSize: '13px', fontWeight: '600',
                                        padding: '10px', borderRadius: '8px',
                                        textDecoration: 'none',
                                    }}
                                >View in Attendance</Link>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    style={{
                                        padding: '10px 20px', borderRadius: '8px',
                                        border: '1px solid #E5E7EB', background: 'white',
                                        fontSize: '13px', color: '#6B7280', cursor: 'pointer',
                                    }}
                                >Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeUp {
                    from { transform: translateY(16px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `}</style>
        </>
    );
}

function GridIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function CalIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ChatIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function CheckIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
}
function FolderIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}

