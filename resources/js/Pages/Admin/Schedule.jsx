import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

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
                .sched-content { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
                .cal-card { background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 12px; overflow: hidden; }
                .cal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #EDEDED; }
                .cal-month { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #1A1A1A; }
                .cal-nav { background: none; border: 1px solid #EDEDED; border-radius: 6px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #1A1A1A; font-size: 14px; transition: background 0.15s; }
                .cal-nav:hover { background: #F7F7F5; }
                .day-names { display: grid; grid-template-columns: repeat(7, 1fr); background: #F7F7F5; border-bottom: 1px solid #EDEDED; }
                .day-name { text-align: center; padding: 8px 4px; font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: .5px; }
                .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
                .cal-cell { min-height: 80px; border-right: 1px solid #EDEDED; border-bottom: 1px solid #EDEDED; padding: 6px; cursor: pointer; transition: background 0.12s; position: relative; }
                .cal-cell:nth-child(7n) { border-right: none; }
                .cal-cell:hover { background: #fafafa; }
                .cal-cell.selected { background: #fff5f5; }
                .cal-cell.empty { background: #F7F7F5; cursor: default; }
                .day-num { font-size: 12px; font-weight: 600; color: #1A1A1A; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-bottom: 4px; }
                .day-num.today { background: #ff0000; color: #fff; }
                .event-pill { font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
                .more-tag { font-size: 10px; color: #6B6B6B; padding: 1px 4px; }
                .detail-card { background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 12px; padding: 20px; }
                .detail-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; margin-bottom: 14px; }
                .activity-item { padding: 12px; border: 1px solid #EDEDED; border-radius: 8px; margin-bottom: 10px; }
                .activity-item:last-child { margin-bottom: 0; }
                .activity-name { font-weight: 600; font-size: 13px; color: #1A1A1A; margin-bottom: 4px; }
                .activity-meta { font-size: 11px; color: #6B6B6B; display: flex; flex-direction: column; gap: 2px; }
                .status-badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-top: 6px; }
                .no-events { text-align: center; padding: 32px 0; color: #6B6B6B; font-size: 13px; }
                @media (max-width: 900px) { .sched-content { grid-template-columns: 1fr; } }
            `}</style>

            <div className="sched-content">
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
                                    <span>{a.start_time} – {a.end_time}</span>
                                    <span> {a.location_name}</span>
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
        </>
    );
}

// ✅ Gamit na rin ang AdminLayout dito — kaya kasama na ang notification bell
// (katabi ng profile sa topbar), at persistent na siya sa lahat ng admin pages.
AdminSchedule.layout = (page) => <AdminLayout title="Schedule">{page}</AdminLayout>;