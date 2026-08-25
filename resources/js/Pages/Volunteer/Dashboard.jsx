import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import VolunteerLayout from '@/Layouts/VolunteerLayout';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

// ✅ UPDATED: accent color now matches the sidebar's indigo/blue-purple
// (sampled from the sidebar background: #5765F2, active-state: #3249F4)
const ACCENT = '#5765F2';
const ACCENT_DARK = '#3249F4';

// -- localStorage helpers for persisting read activity IDs ------------------
// (parehong LS_KEY gamit ng bell sa VolunteerLayout, para magka-sync ang "read" state)
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

// -- localStorage helpers for persisting read announcement IDs --------------
const ANN_LS_KEY = 'volunteer_read_announcement_ids';
function getReadAnnIds() {
    try { return new Set(JSON.parse(localStorage.getItem(ANN_LS_KEY) || '[]')); }
    catch { return new Set(); }
}
function saveReadAnnIds(set) {
    try { localStorage.setItem(ANN_LS_KEY, JSON.stringify([...set])); } catch {}
}

// -- localStorage helpers for persisting viewed assigned-task IDs -----------
const SCHED_LS_KEY = 'volunteer_viewed_schedule_ids';
function getViewedScheduleIds() {
    try { return new Set(JSON.parse(localStorage.getItem(SCHED_LS_KEY) || '[]')); }
    catch { return new Set(); }
}
function saveViewedScheduleIds(set) {
    try { localStorage.setItem(SCHED_LS_KEY, JSON.stringify([...set])); } catch {}
}

// -- localStorage helper for tracking when a notif was first seen (for 24h expiry) --
const NOTIF_SEEN_KEY = 'volunteer_notif_first_seen';
function getFirstSeenMap() {
    try { return JSON.parse(localStorage.getItem(NOTIF_SEEN_KEY) || '{}'); }
    catch { return {}; }
}
function saveFirstSeenMap(map) {
    try { localStorage.setItem(NOTIF_SEEN_KEY, JSON.stringify(map)); } catch {}
}
// ---------------------------------------------------------------------------

function VolunteerDashboard({ auth, totalHours, totalDays, monthDays, assignedActivities, recentAttendance, announcements }) {
    const volunteer = auth.user;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [availability, setAvailability] = useState(!!volunteer.is_available);
    const [savingAvailability, setSavingAvailability] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dashExpandedId, setDashExpandedId] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [readAnnIds, setReadAnnIds] = useState(() => getReadAnnIds());
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [viewedScheduleIds, setViewedScheduleIds] = useState(() => getViewedScheduleIds());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleAvailability = async () => {
        const next = !availability;
        setAvailability(next);
        setSavingAvailability(true);
        try {
            await axios.patch(route('volunteer.availability.update'), { is_available: next });
        } catch {
            setAvailability(!next);
        } finally {
            setSavingAvailability(false);
        }
    };

    const fetchNotifications = useCallback(async () => {
        const readIds = getReadIds();
        const DAY_MS = 24 * 60 * 60 * 1000;
        const now = Date.now();

        const activityNotifs = (assignedActivities || [])
            .filter(a => new Date(a.date) >= new Date())
            .slice(0, 10)
            .map(a => ({
                id: `activity-${a.id}`,
                message: `Upcoming: ${a.name}`,
                created_at: new Date(a.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
                created_at_raw: null,
                is_read: readIds.has(`activity-${a.id}`),
                type: 'activity',
                activity: a,
            }));

        let apiNotifs = [];
        try {
            const res = await axios.get('/volunteer/notifications');
            apiNotifs = (res.data.notifications || []).map(n => ({
                ...n,
                type: n.type || 'general',
                created_at_raw: n.created_at || null,
                is_read: n.is_read || readIds.has(String(n.id)),
            }));
        } catch {
            apiNotifs = [];
        }

        const allRaw = [...activityNotifs, ...apiNotifs];

        const seenMap = getFirstSeenMap();
        let seenChanged = false;

        const allNotifs = allRaw.filter(n => {
            const key = String(n.id);
            const serverTs = n.created_at_raw ? new Date(n.created_at_raw).getTime() : NaN;

            let firstSeen = seenMap[key];
            if (!firstSeen) {
                firstSeen = !isNaN(serverTs) ? serverTs : now;
                seenMap[key] = firstSeen;
                seenChanged = true;
            }

            return (now - firstSeen) < DAY_MS;
        });

        if (seenChanged) saveFirstSeenMap(seenMap);

        setNotifications(allNotifs);
        setUnreadCount(allNotifs.filter(n => !n.is_read).length);
    }, [assignedActivities]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    useEffect(() => {
        const expiryTimer = setInterval(() => {
            const DAY_MS = 24 * 60 * 60 * 1000;
            const now = Date.now();
            const seenMap = getFirstSeenMap();
            setNotifications(prev => {
                const filtered = prev.filter(n => {
                    const firstSeen = seenMap[String(n.id)];
                    if (!firstSeen) return true;
                    return (now - firstSeen) < DAY_MS;
                });
                if (filtered.length !== prev.length) {
                    setUnreadCount(filtered.filter(n => !n.is_read).length);
                }
                return filtered;
            });
        }, 60 * 1000);
        return () => clearInterval(expiryTimer);
    }, []);

    const markAllRead = async () => {
        setNotifications(prev => {
            markIdsRead(prev.map(n => n.id));
            return prev.map(n => ({ ...n, is_read: true }));
        });
        setUnreadCount(0);
        try { await axios.patch('/volunteer/notifications/read-all'); } catch {}
    };

    const handleDashNotifClick = (id) => {
        setDashExpandedId(id);
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, is_read: true } : n);
            const newUnread = updated.filter(n => !n.is_read).length;
            setUnreadCount(newUnread);
            markIdsRead([id]);
            return updated;
        });
    };

    const handleAnnouncementClick = (a) => {
        setSelectedAnnouncement(a);
        setReadAnnIds(prev => {
            const next = new Set(prev);
            next.add(String(a.id));
            saveReadAnnIds(next);
            return next;
        });
    };

    const closeAnnouncementModal = () => setSelectedAnnouncement(null);

    const markScheduleViewed = () => {
        setViewedScheduleIds(prev => {
            const next = new Set(prev);
            upcomingActivities.forEach(a => next.add(String(a.id)));
            saveViewedScheduleIds(next);
            return next;
        });
    };

    const handleScheduleCardClick = (act) => {
        setSelectedActivity(act);
        setViewedScheduleIds(prev => {
            const next = new Set(prev);
            next.add(String(act.id));
            saveViewedScheduleIds(next);
            return next;
        });
    };

    const attendance = recentAttendance || [];
    const hoursToday = attendance
        .filter(r => new Date(r.date).toDateString() === new Date().toDateString())
        .reduce((sum, r) => sum + parseFloat(r.hours_rendered || 0), 0);
    const isCheckedIn = attendance.some(r =>
        new Date(r.date).toDateString() === new Date().toDateString() && r.time_in && !r.time_out
    );

    const announces = announcements || [];
    const unreadAnnCount = announces.filter(a => !readAnnIds.has(String(a.id))).length;
    const upcomingActivities = (assignedActivities || [])
        .filter(a => new Date(a.date) >= new Date(new Date().toDateString()))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const unviewedScheduleCount = upcomingActivities.filter(a => !viewedScheduleIds.has(String(a.id))).length;

    return (
        <>
            <Head title="Volunteer Dashboard">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
            </Head>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>
                    {currentTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Status Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <div style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: isCheckedIn ? '#22C55E' : '#9CA3AF', display: 'inline-block', boxShadow: isCheckedIn ? '0 0 0 3px rgba(34,197,94,0.15)' : 'none' }} />
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#111' }}>{isCheckedIn ? 'Checked in' : 'Not checked in'}</span>
                    </div>
                </div>
                <div style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Availability</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: availability ? '#22C55E' : '#6B7280', marginBottom: '8px' }}>{availability ? 'Available' : 'Not Available'}</div>
                    <div
                        onClick={savingAvailability ? undefined : toggleAvailability}
                        style={{ width: '42px', height: '23px', borderRadius: '12px', background: availability ? '#22C55E' : '#D1D5DB', position: 'relative', cursor: savingAvailability ? 'wait' : 'pointer', transition: 'background 0.2s', opacity: savingAvailability ? 0.6 : 1 }}
                    >
                        <div style={{ position: 'absolute', top: '3px', left: availability ? '22px' : '3px', width: '17px', height: '17px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
                    </div>
                </div>
                <div style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginBottom: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hours this day</div>
                    <div style={{ fontSize: '23px', fontWeight: '800', color: '#111' }}>
                        {hoursToday.toFixed(2)} <span style={{ fontSize: '13px', fontWeight: '500', color: '#6B7280' }}>hrs</span>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', marginTop: '16px', padding: '26px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#111', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Notifications</span>
                        {unreadCount > 0 && (
                            <span style={{ background: ACCENT, color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            style={{ fontSize: '12px', fontWeight: '700', color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center', fontSize: '12px', color: '#D1D5DB' }}>
                        No notifications yet
                    </div>
                ) : (
                    <div className="dash-notif-scroll">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '14px',
                        }}>
                            {notifications.map(n => {
                                const isTask = n.type === 'activity';
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleDashNotifClick(n.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDashNotifClick(n.id); } }}
                                        style={{
                                            display: 'flex', flexDirection: 'column',
                                            aspectRatio: '1 / 1',
                                            padding: '16px', cursor: 'pointer',
                                            border: '1px solid #E5E7EB', borderRadius: '14px',
                                            background: n.is_read ? '#FAFAFA' : '#F5F6FF',
                                            transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
                                            boxSizing: 'border-box', minWidth: 0,
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 22px rgba(87,101,242,0.15)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{
                                                width: '7px', height: '7px', borderRadius: '50%',
                                                background: n.is_read ? '#D1D5DB' : ACCENT, flexShrink: 0,
                                            }} />
                                            <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                {isTask ? 'Task' : 'News'}
                                            </span>
                                        </div>
                                        <div style={{
                                            fontSize: '13px', fontWeight: n.is_read ? '500' : '700', color: '#111',
                                            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
                                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                                            lineHeight: '1.4',
                                        }}>
                                            {n.title || n.message}
                                        </div>
                                        <div style={{ fontSize: '10.5px', color: '#9CA3AF', marginTop: '8px' }}>
                                            {n.created_at}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {dashExpandedId !== null && (() => {
                    const n = notifications.find(x => x.id === dashExpandedId);
                    if (!n) return null;
                    const isTask = n.type === 'activity';
                    const act = n.activity || {};
                    return (
                        <div
                            onClick={() => setDashExpandedId(null)}
                            style={{
                                position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(2px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 1000, padding: '20px', animation: 'fadeIn 0.15s ease-out',
                            }}
                        >
                            <div
                                onClick={e => e.stopPropagation()}
                                style={{
                                    background: 'white', borderRadius: '18px', width: '100%', maxWidth: '420px',
                                    boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
                                    animation: 'popIn 0.18s ease-out',
                                }}
                            >
                                <div style={{ padding: '22px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: '700', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                            {isTask ? 'Task' : 'Announcement'}
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#111' }}>{n.title || (isTask ? act.name : n.message)}</div>
                                    </div>
                                    <button onClick={() => setDashExpandedId(null)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#6B7280', fontSize: '15px', cursor: 'pointer', flexShrink: 0 }}>×</button>
                                </div>
                                <div style={{ padding: '20px 24px' }}>
                                    {isTask ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {act.date && <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px' }}><span style={{ color: '#9CA3AF', width: '64px', flexShrink: 0 }}>Date</span><span style={{ color: '#374151', fontWeight: '500' }}>{new Date(act.date).toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>}
                                            {act.start_time && <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px' }}><span style={{ color: '#9CA3AF', width: '64px', flexShrink: 0 }}>Time</span><span style={{ color: '#374151', fontWeight: '500' }}>{act.start_time.substring(0, 5)}{act.end_time ? ` – ${act.end_time.substring(0, 5)}` : ''}</span></div>}
                                            {act.location_name && <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px' }}><span style={{ color: '#9CA3AF', width: '64px', flexShrink: 0 }}>Location</span><span style={{ color: '#374151', fontWeight: '500' }}>{act.location_name}</span></div>}
                                            {act.description && <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px', marginTop: '2px' }}><span style={{ color: '#9CA3AF', width: '64px', flexShrink: 0 }}>Details</span><span style={{ color: '#6B7280', lineHeight: '1.6' }}>{act.description}</span></div>}
                                            <Link href={route('volunteer.schedule')} style={{ marginTop: '8px', fontSize: '12px', fontWeight: '700', color: ACCENT, textDecoration: 'none' }}>View in Schedule →</Link>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '13.5px', color: '#374151', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>{n.message}</div>
                                    )}
                                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '14px' }}>{n.created_at}</div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Assigned Task Section */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', marginTop: '16px', padding: '26px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#111', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Assigned Task</span>
                        {unviewedScheduleCount > 0 && (
                            <span style={{ background: ACCENT, color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                                {unviewedScheduleCount}
                            </span>
                        )}
                    </div>
                    <Link
                        href={route('volunteer.schedule')}
                        onClick={markScheduleViewed}
                        style={{ fontSize: '12px', fontWeight: '700', color: ACCENT, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        View all →
                    </Link>
                </div>

                {upcomingActivities.length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center', fontSize: '12px', color: '#D1D5DB' }}>
                        No assigned tasks yet
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '15px',
                    }}>
                        {upcomingActivities.slice(0, 4).map((act) => {
                            const d = new Date(act.date);
                            const day = d.toLocaleDateString('en-PH', { day: 'numeric' });
                            const mon = d.toLocaleDateString('en-PH', { month: 'short' }).toUpperCase();
                            const isUnviewed = !viewedScheduleIds.has(String(act.id));
                            return (
                                <div
                                    key={act.id}
                                    onClick={() => handleScheduleCardClick(act)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleScheduleCardClick(act); } }}
                                    style={{
                                        display: 'flex', flexDirection: 'column',
                                        padding: '19px', cursor: 'pointer',
                                        border: '1px solid #E5E7EB', borderRadius: '14px',
                                        background: isUnviewed ? '#F5F6FF' : '#FAFAFA',
                                        position: 'relative',
                                        transition: 'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
                                        minWidth: 0, boxSizing: 'border-box',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.background = '#F5F6FF'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 22px rgba(87,101,242,0.15)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = isUnviewed ? '#F5F6FF' : '#FAFAFA'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    {isUnviewed && (
                                        <span style={{ position: 'absolute', top: 14, right: 14, width: '8px', height: '8px', borderRadius: '50%', background: ACCENT }} />
                                    )}

                                    <div style={{
                                        width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
                                        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 10px rgba(87,101,242,0.25)',
                                        marginBottom: '13px',
                                    }}>
                                        <div style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.5px' }}>{mon}</div>
                                        <div style={{ fontSize: '17px', fontWeight: '800', color: 'white', lineHeight: '1.1' }}>{day}</div>
                                    </div>

                                    <div style={{
                                        fontSize: '14px', fontWeight: '700', color: '#111',
                                        marginBottom: '8px',
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    }}>
                                        {act.name}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                                        {act.start_time && (
                                            <span style={{ fontSize: '11.5px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <ClockIcon /> {act.start_time.substring(0, 5)}{act.end_time ? ` – ${act.end_time.substring(0, 5)}` : ''}
                                            </span>
                                        )}
                                        {act.location_name && (
                                            <span style={{ fontSize: '11.5px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <PinIcon /> {act.location_name}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '13px', fontSize: '11px', fontWeight: '700', color: ACCENT, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        Details <span style={{ fontSize: '13px' }}>›</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Announcements Section */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', marginTop: '16px', padding: '26px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#111', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Announcements</span>
                        {unreadAnnCount > 0 && (
                            <span style={{ background: ACCENT, color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                                {unreadAnnCount}
                            </span>
                        )}
                    </div>
                    <Link
                        href={route('volunteer.communication')}
                        style={{ fontSize: '12px', fontWeight: '700', color: ACCENT, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        View all →
                    </Link>
                </div>

                {announces.length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center', fontSize: '12px', color: '#D1D5DB' }}>
                        No announcements yet
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '15px',
                    }}>
                        {announces.slice(0, 6).map((a) => {
                            const isUnread = !readAnnIds.has(String(a.id));
                            return (
                            <div
                                key={a.id}
                                onClick={() => handleAnnouncementClick(a)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAnnouncementClick(a); } }}
                                style={{
                                    display: 'flex', flexDirection: 'column',
                                    padding: '19px', cursor: 'pointer',
                                    border: '1px solid #E5E7EB', borderRadius: '14px',
                                    background: isUnread ? '#F5F6FF' : '#FAFAFA',
                                    position: 'relative',
                                    transition: 'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
                                    minWidth: 0, boxSizing: 'border-box',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.background = '#F5F6FF'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 22px rgba(87,101,242,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = isUnread ? '#F5F6FF' : '#FAFAFA'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                {isUnread && (
                                    <span style={{ position: 'absolute', top: 14, right: 14, width: '8px', height: '8px', borderRadius: '50%', background: ACCENT }} />
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '13px' }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                                        background: 'linear-gradient(135deg, #E8EAFE, #D6DAFC)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <MegaphoneIcon color={ACCENT} />
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0, fontWeight: '500' }}>
                                        {new Date(a.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>

                                <div style={{
                                    fontSize: '14px', fontWeight: '700', color: '#111',
                                    marginBottom: '6px',
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                }}>
                                    {a.title}
                                </div>
                                <div style={{
                                    fontSize: '12px', color: '#9CA3AF', lineHeight: '1.55',
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                                    flex: 1,
                                }}>
                                    {a.body}
                                </div>

                                <div style={{ marginTop: '13px', fontSize: '11px', fontWeight: '700', color: ACCENT, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    Read more <span style={{ fontSize: '13px' }}>›</span>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Announcement Modal */}
            {selectedAnnouncement && (
                <div
                    onClick={closeAnnouncementModal}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(2px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '20px', animation: 'fadeIn 0.15s ease-out',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '18px', width: '100%', maxWidth: '480px',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
                            animation: 'popIn 0.18s ease-out',
                        }}
                    >
                        <div style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`, padding: '26px 28px', position: 'relative' }}>
                            <button
                                onClick={closeAnnouncementModal}
                                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: 'white', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.32)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            >
                                ×
                            </button>
                            <div style={{ width: 50, height: 50, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                                <MegaphoneIcon color="#ffffff" />
                            </div>
                            <div style={{ fontSize: '19px', fontWeight: '800', color: 'white', lineHeight: '1.3' }}>
                                {selectedAnnouncement.title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.82)', marginTop: '7px' }}>
                                {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                                {' · '}Posted by {selectedAnnouncement.admin?.name || 'Admin'}
                            </div>
                        </div>
                        <div style={{ padding: '25px 28px' }}>
                            <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                {selectedAnnouncement.body}
                            </div>
                            <button
                                onClick={closeAnnouncementModal}
                                style={{ marginTop: '22px', width: '100%', background: ACCENT, color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(87,101,242,0.25)', transition: 'transform 0.1s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assigned Task detail modal */}
            {selectedActivity && (
                <div
                    onClick={() => setSelectedActivity(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(2px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '20px', animation: 'fadeIn 0.15s ease-out',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '18px', width: '100%', maxWidth: '420px',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
                            animation: 'popIn 0.18s ease-out',
                        }}
                    >
                        <div style={{ padding: '22px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                    Task
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#111' }}>{selectedActivity.name}</div>
                            </div>
                            <button onClick={() => setSelectedActivity(null)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#6B7280', fontSize: '15px', cursor: 'pointer', flexShrink: 0 }}>×</button>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectedActivity.date && (
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px' }}>
                                        <span style={{ color: '#9CA3AF', width: '64px', flexShrink: 0 }}>Date</span>
                                        <span style={{ color: '#374151', fontWeight: '500' }}>{new Date(selectedActivity.date).toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                )}
                                {selectedActivity.start_time && (
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px' }}>
                                        <span style={{ color: '#9CA3AF', width: '64px', flexShrink: 0 }}>Time</span>
                                        <span style={{ color: '#374151', fontWeight: '500' }}>{selectedActivity.start_time.substring(0, 5)}{selectedActivity.end_time ? ` – ${selectedActivity.end_time.substring(0, 5)}` : ''}</span>
                                    </div>
                                )}
                                {selectedActivity.location_name && (
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px' }}>
                                        <span style={{ color: '#9CA3AF', width: '64px', flexShrink: 0 }}>Location</span>
                                        <span style={{ color: '#374151', fontWeight: '500' }}>{selectedActivity.location_name}</span>
                                    </div>
                                )}
                                {selectedActivity.description && (
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px', marginTop: '2px' }}>
                                        <span style={{ color: '#9CA3AF', width: '64px', flexShrink: 0 }}>Details</span>
                                        <span style={{ color: '#6B7280', lineHeight: '1.6' }}>{selectedActivity.description}</span>
                                    </div>
                                )}
                                <Link href={route('volunteer.schedule')} style={{ marginTop: '8px', fontSize: '12px', fontWeight: '700', color: ACCENT, textDecoration: 'none' }}>
                                    View in Schedule →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }

                * { font-family: 'Montserrat', sans-serif !important; }

                .dash-notif-scroll { max-height: 320px; overflow-y: auto; }
                .dash-notif-scroll::-webkit-scrollbar { width: 6px; }
                .dash-notif-scroll::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 999px; margin: 4px 0; }
                .dash-notif-scroll::-webkit-scrollbar-thumb { background-color: #4B4B4B; border-radius: 999px; }
                .dash-notif-scroll::-webkit-scrollbar-thumb:hover { background-color: #2E2E2E; }
                .dash-notif-scroll { scrollbar-width: thin; scrollbar-color: #4B4B4B #f0f0f0; }
            `}</style>
        </>
    );
}

function MegaphoneIcon({ color = '#5765F2' }) { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>; }
function ClockIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function PinIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>; }

VolunteerDashboard.layout = (page) => <VolunteerLayout title="Dashboard">{page}</VolunteerLayout>;

export default VolunteerDashboard;
