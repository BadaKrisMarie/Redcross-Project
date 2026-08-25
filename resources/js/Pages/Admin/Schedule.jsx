import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/* Small inline icons — same 1.75px stroke language used elsewhere in the
   admin panel, so this page doesn't feel like it's borrowing a different
   icon set from the rest of the app. */
const Icon = {
    chevronLeft: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="m15 18-6-6 6-6" />
        </svg>
    ),
    chevronRight: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    ),
    calendar: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
    ),
    plus: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    ),
    users: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
            <circle cx="10" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    clock: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
        </svg>
    ),
    pin: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
};

export default function AdminSchedule({ activities = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const firstDay  = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // ✅ Itago na sa calendar ang mga activity na lumipas na ang petsa,
    // kahit anong status pa nila (upcoming/ongoing/completed/cancelled) —
    // "tapos na" = nakalipas na ang date kumpara sa ngayon.
    const todayStr = (() => {
        const t = new Date();
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    })();
    const visibleActivities = activities.filter(a => a.date && a.date.slice(0, 10) >= todayStr);

    const getActivitiesForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return visibleActivities.filter(a => a.date && a.date.startsWith(dateStr));
    };

    const statusColor = (status) => {
        if (status === 'upcoming')  return { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' };
        if (status === 'ongoing')   return { bg: '#dcfce7', color: '#166534', dot: '#22c55e' };
        if (status === 'completed') return { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };
        if (status === 'cancelled') return { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' };
        return { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' };
    };

    const today = new Date();
    const isToday = (day) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const selectedActivities = selectedDay ? getActivitiesForDay(selectedDay) : [];

    // Route the "+ Add" hover affordance to the Activities page with the
    // clicked date pre-filled. Swap 'admin.activities.create' below for
    // whatever your actual create-activity route name is.
    const addActivityOnDay = (e, day) => {
        e.stopPropagation();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        router.visit(route('admin.activities.create', { date: dateStr }));
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <>
            <Head title="Schedule" />
            <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            <style>{`
                .sched-content { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
                .cal-card { background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 12px; overflow: hidden; }
                .cal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #EDEDED; }
                .cal-month { font-family: 'Barlow Condensed', sans-serif; font-size: 19px; font-weight: 700; color: #1A1A1A; letter-spacing: 0.2px; }
                .cal-nav { background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 8px; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #1A1A1A; transition: background 0.15s, border-color 0.15s; }
                .cal-nav:hover { background: #F7F7F5; border-color: #DCDCDC; }
                .day-names { display: grid; grid-template-columns: repeat(7, 1fr); background: #F7F7F5; border-bottom: 1px solid #EDEDED; }
                .day-name { text-align: center; padding: 9px 4px; font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: .5px; }
                .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
                .cal-cell { min-height: 84px; border-right: 1px solid #EDEDED; border-bottom: 1px solid #EDEDED; padding: 7px; cursor: pointer; transition: background 0.12s; position: relative; }
                .cal-cell:nth-child(7n) { border-right: none; }
                .cal-cell:hover { background: #FAFAFA; }
                .cal-cell:hover .add-hint { opacity: 1; }
                .cal-cell.selected { background: #FFF0F0; }
                .cal-cell.today { background: #FFF3F3; }
                .cal-cell.today.selected { background: #FFE6E6; }
                .cal-cell.empty { background: #FBFBFA; cursor: default; }
                .day-num { font-size: 12px; font-weight: 600; color: #1A1A1A; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-bottom: 5px; }
                .day-num.today { background: #C8102E; color: #fff; }
                .event-pill { display: flex; align-items: center; gap: 5px; font-size: 10px; padding: 3px 6px; border-radius: 5px; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
                .event-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
                .event-label { overflow: hidden; text-overflow: ellipsis; }
                .more-tag { font-size: 10px; color: #6B6B6B; padding: 1px 4px; font-weight: 500; }
                .add-hint { position: absolute; bottom: 6px; right: 7px; display: flex; align-items: center; gap: 2px; font-size: 10px; color: #C8102E; font-weight: 600; opacity: 0; transition: opacity 0.12s; background: #fff; border-radius: 4px; padding: 1px 4px 1px 2px; }
                .detail-card { background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 12px; padding: 22px; }
                .detail-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; margin-bottom: 16px; }
                .activity-item { padding: 13px; border: 1px solid #EDEDED; border-radius: 8px; margin-bottom: 10px; }
                .activity-item:last-child { margin-bottom: 0; }
                .activity-name { font-weight: 600; font-size: 13px; color: #1A1A1A; margin-bottom: 6px; }
                .activity-meta { font-size: 11.5px; color: #6B6B6B; display: flex; flex-direction: column; gap: 5px; }
                .activity-meta-row { display: flex; align-items: flex-start; gap: 6px; }
                .status-badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-top: 8px; }
                .no-events { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 40px 12px; color: #6B6B6B; font-size: 13px; }
                .no-events-icon { width: 44px; height: 44px; border-radius: 50%; background: #FDECEE; display: flex; align-items: center; justify-content: center; color: #C8102E; }
                @media (max-width: 900px) { .sched-content { grid-template-columns: 1fr; } }
            `}</style>

            <div className="sched-content">
                {/* CALENDAR */}
                <div className="cal-card">
                    <div className="cal-header">
                        <button className="cal-nav" onClick={prevMonth} aria-label="Previous month">
                            <Icon.chevronLeft width={16} height={16} />
                        </button>
                        <div className="cal-month">{monthNames[month]} {year}</div>
                        <button className="cal-nav" onClick={nextMonth} aria-label="Next month">
                            <Icon.chevronRight width={16} height={16} />
                        </button>
                    </div>
                    <div className="day-names">
                        {dayNames.map(d => <div key={d} className="day-name">{d}</div>)}
                    </div>
                    <div className="cal-grid">
                        {cells.map((day, i) => {
                            if (!day) return <div key={`empty-${i}`} className="cal-cell empty" />;
                            const dayActivities = getActivitiesForDay(day);
                            const isSelected = selectedDay === day;
                            const cellClasses = [
                                'cal-cell',
                                isSelected ? 'selected' : '',
                                isToday(day) ? 'today' : '',
                            ].filter(Boolean).join(' ');
                            return (
                                <div
                                    key={day}
                                    className={cellClasses}
                                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                >
                                    <div className={`day-num ${isToday(day) ? 'today' : ''}`}>{day}</div>
                                    {dayActivities.slice(0, 2).map((a, idx) => {
                                        const { bg, color, dot } = statusColor(a.status);
                                        return (
                                            <div key={idx} className="event-pill" style={{ background: bg, color }}>
                                                <span className="event-dot" style={{ background: dot }} />
                                                <span className="event-label">{a.name}</span>
                                            </div>
                                        );
                                    })}
                                    {dayActivities.length > 2 && (
                                        <div className="more-tag">+{dayActivities.length - 2} more</div>
                                    )}
                                    {dayActivities.length === 0 && (
                                        <button
                                            type="button"
                                            className="add-hint"
                                            onClick={(e) => addActivityOnDay(e, day)}
                                            style={{ border: 'none', cursor: 'pointer' }}
                                        >
                                            <Icon.plus width={11} height={11} /> Add
                                        </button>
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
                        <div className="no-events">
                            <div className="no-events-icon"><Icon.calendar width={20} height={20} /></div>
                            Click a date to see activities scheduled for that day.
                        </div>
                    )}
                    {selectedDay && selectedActivities.length === 0 && (
                        <div className="no-events">
                            <div className="no-events-icon"><Icon.calendar width={20} height={20} /></div>
                            No activities on this day.
                        </div>
                    )}
                    {selectedActivities.map((a, i) => {
                        const { bg, color } = statusColor(a.status);
                        return (
                            <div key={i} className="activity-item">
                                <div className="activity-name">{a.name}</div>
                                <div className="activity-meta">
                                    <div className="activity-meta-row">
                                        <Icon.clock width={13} height={13} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <span>{a.start_time} – {a.end_time}</span>
                                    </div>
                                    <div className="activity-meta-row">
                                        <Icon.pin width={13} height={13} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <span>{a.location_name}</span>
                                    </div>
                                    {a.volunteers?.length > 0 && (
                                        <div className="activity-meta-row">
                                            <Icon.users width={13} height={13} style={{ flexShrink: 0, marginTop: 1 }} />
                                            <span>{a.volunteers.map(v => v.name).join(', ')}</span>
                                        </div>
                                    )}
                                    {a.description && <span style={{ marginTop: 2 }}>{a.description}</span>}
                                </div>
                                <span className="status-badge" style={{ background: bg, color }}>{a.status}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

// ✅ Gamit na rin ang AdminLayout dito — kaya kasama na ang notification bell
// (katabi ng profile sa topbar), at persistent na siya sa lahat ng admin pages.
AdminSchedule.layout = (page) => <AdminLayout title="Schedule">{page}</AdminLayout>;