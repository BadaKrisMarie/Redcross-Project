import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function AdminSchedule({ auth, activities = [] }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const admin = auth?.user;
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;
    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    const navLinks = [
        { label: 'Dashboard',     route: 'admin.dashboard' },
        { label: 'Volunteers',    route: 'admin.volunteers' },
        { label: 'Schedule',      route: 'admin.schedule', active: true },
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

    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const firstDay  = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const getActivitiesForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return activities.filter(a => a.date && a.date.startsWith(dateStr));
    };

    const statusColor = (status) => {
        if (status === 'upcoming')  return { bg: '#dbeafe', color: '#1e40af' };
        if (status === 'ongoing')   return { bg: '#dcfce7', color: '#166534' };
        if (status === 'completed') return { bg: '#f3f4f6', color: '#374151' };
        if (status === 'cancelled') return { bg: '#fee2e2', color: '#991b1b' };
        return { bg: '#fef3c7', color: '#92400e' };
    };

    const today = new Date();
    const isToday = (day) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const selectedActivities = selectedDay ? getActivitiesForDay(selectedDay) : [];

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <>
            <Head title="Schedule" />
            <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :root { --red: #C8102E; --ink: #1A1A1A; --muted: #6B6B6B; --border: #EDEDED; --surface: #F7F7F5; --white: #FFFFFF; }
                body { font-family: 'DM Sans', sans-serif; font-size: 13px; background: var(--surface); }
                .wrap { display: flex; min-height: 100vh; }
                .sidebar { width: 220px; background: var(--red); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: transform 0.2s; }
                .sidebar.closed { transform: translateX(-220px); }
                .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
                .main.full { margin-left: 0; }
                .sb-brand { padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.15); }
                .sb-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .sb-cross { width: 32px; height: 32px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; }
                .sb-name { font-family: 'Barlow Condensed', sans-serif; color: #fff; font-size: 13px; font-weight: 600; letter-spacing: .5px; line-height: 1.3; }
                .sb-name span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; }
                .sb-user { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .sb-uname { color: #fff; font-size: 12px; font-weight: 500; line-height: 1.3; }
                .sb-uname span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; }
                .sb-nav { padding: 10px 0; flex: 1; overflow-y: auto; }
                .nav-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.6); padding: 10px 20px 4px; font-weight: 600; }
                .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; border-left: 2px solid transparent; text-decoration: none; }
                .nav-item:hover { background: rgba(0,0,0,0.15); }
                .nav-item.active { background: rgba(0,0,0,0.2); border-left-color: #fff; }
                .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
                .sb-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.15); }
                .logout-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.8); font-size: 12px; cursor: pointer; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; }
                .topbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
                .menu-btn { background: none; border: none; cursor: pointer; color: var(--ink); display: flex; align-items: center; padding: 4px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: .3px; text-transform: uppercase; }
                .content { flex: 1; padding: 28px; display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
                .cal-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
                .cal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
                .cal-month { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: var(--ink); }
                .cal-nav { background: none; border: 1px solid var(--border); border-radius: 6px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--ink); font-size: 14px; transition: background 0.15s; }
                .cal-nav:hover { background: var(--surface); }
                .day-names { display: grid; grid-template-columns: repeat(7, 1fr); background: var(--surface); border-bottom: 1px solid var(--border); }
                .day-name { text-align: center; padding: 8px 4px; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
                .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
                .cal-cell { min-height: 80px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 6px; cursor: pointer; transition: background 0.12s; position: relative; }
                .cal-cell:nth-child(7n) { border-right: none; }
                .cal-cell:hover { background: #fafafa; }
                .cal-cell.selected { background: #fff5f5; }
                .cal-cell.empty { background: var(--surface); cursor: default; }
                .day-num { font-size: 12px; font-weight: 600; color: var(--ink); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-bottom: 4px; }
                .day-num.today { background: var(--red); color: #fff; }
                .event-pill { font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
                .more-tag { font-size: 10px; color: var(--muted); padding: 1px 4px; }
                .detail-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
                .detail-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: var(--ink); text-transform: uppercase; margin-bottom: 14px; }
                .activity-item { padding: 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 10px; }
                .activity-item:last-child { margin-bottom: 0; }
                .activity-name { font-weight: 600; font-size: 13px; color: var(--ink); margin-bottom: 4px; }
                .activity-meta { font-size: 11px; color: var(--muted); display: flex; flex-direction: column; gap: 2px; }
                .status-badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-top: 6px; }
                .no-events { text-align: center; padding: 32px 0; color: var(--muted); font-size: 13px; }
                @media (max-width: 900px) { .content { grid-template-columns: 1fr; } }
            `}</style>

            <div className="wrap">
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
                        <div className="nav-label">Main</div>
                        {navLinks.slice(0, 4).map(({ label, route: r, active }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${active ? 'active' : ''}`}>
                                <div className="nav-dot" />{label}
                            </Link>
                        ))}
                        <div className="nav-label">Manage</div>
                        {navLinks.slice(4).map(({ label, route: r, active }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${active ? 'active' : ''}`}>
                                <div className="nav-dot" />{label}
                            </Link>
                        ))}
                    </nav>
                    <div className="sb-footer">
                        <button className="logout-btn" onClick={() => router.post(route('logout'))}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Log out
                        </button>
                    </div>
                </aside>

                <main className={`main ${sidebarOpen ? '' : 'full'}`}>
                    <div className="topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            </button>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                                    <Link href={route('admin.dashboard')} style={{ color: '#aaa', textDecoration: 'none' }}>Dashboard</Link>
                                    <span style={{ color: '#ccc' }}>›</span>
                                    <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Schedule</span>
                                </div>
                                <div className="page-title">Schedule</div>
                            </div>
                        </div>
                        <NavAvatar size={32} fontSize={12} />
                    </div>

                    <div className="content">
                        {/* CALENDAR */}
                        <div className="cal-card">
                            <div className="cal-header">
                                <button className="cal-nav" onClick={prevMonth}>‹</button>
                                <div className="cal-month">{monthNames[month]} {year}</div>
                                <button className="cal-nav" onClick={nextMonth}>›</button>
                            </div>
                            <div className="day-names">
                                {dayNames.map(d => <div key={d} className="day-name">{d}</div>)}
                            </div>
                            <div className="cal-grid">
                                {cells.map((day, i) => {
                                    if (!day) return <div key={`empty-${i}`} className="cal-cell empty" />;
                                    const dayActivities = getActivitiesForDay(day);
                                    const isSelected = selectedDay === day;
                                    return (
                                        <div
                                            key={day}
                                            className={`cal-cell ${isSelected ? 'selected' : ''}`}
                                            onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                        >
                                            <div className={`day-num ${isToday(day) ? 'today' : ''}`}>{day}</div>
                                            {dayActivities.slice(0, 2).map((a, idx) => {
                                                const { bg, color } = statusColor(a.status);
                                                return (
                                                    <div key={idx} className="event-pill" style={{ background: bg, color }}>
                                                        {a.name}
                                                    </div>
                                                );
                                            })}
                                            {dayActivities.length > 2 && (
                                                <div className="more-tag">+{dayActivities.length - 2} more</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* DETAIL PANEL */}
                        <div className="detail-card">
                            <div className="detail-title">
                                {selectedDay
                                    ? `${monthNames[month]} ${selectedDay}, ${year}`
                                    : 'Select a day'}
                            </div>
                            {!selectedDay && (
                                <div className="no-events">Click a date to see activities</div>
                            )}
                            {selectedDay && selectedActivities.length === 0 && (
                                <div className="no-events">No activities on this day</div>
                            )}
                            {selectedActivities.map((a, i) => {
                                const { bg, color } = statusColor(a.status);
                                return (
                                    <div key={i} className="activity-item">
                                        <div className="activity-name">{a.name}</div>
                                        <div className="activity-meta">
                                            <span>🕐 {a.start_time} – {a.end_time}</span>
                                            <span>📍 {a.location_name}</span>
                                            {a.volunteers?.length > 0 && (
                                                <span>👥 {a.volunteers.map(v => v.name).join(', ')}</span>
                                            )}
                                            {a.description && <span style={{ marginTop: 4 }}>{a.description}</span>}
                                        </div>
                                        <span className="status-badge" style={{ background: bg, color }}>{a.status}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}