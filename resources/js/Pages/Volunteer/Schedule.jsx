import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import VolunteerLayout from '@/Layouts/VolunteerLayout'; // ⚠️ ayusin ang path base sa project mo

/**
 * ✅ Hindi na dito ginagawa ang sidebar/topbar — galing na sa VolunteerLayout.
 * Kaya persistent na siya at hindi na "magbabago" tuwing lilipat ka ng page.
 */
export default function VolunteerSchedule({ activities = [] }) {
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

   // ✅ Itago na sa calendar ang mga activity na lumipas na ang petsa —
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
        return { bg: '#22C55E', color: '#fff' };
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
                .vsched-content { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
                .vcal-card { background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 12px; overflow: hidden; }
                .vcal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #EDEDED; }
                .vcal-month { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #1A1A1A; }
                .vcal-nav { background: none; border: 1px solid #EDEDED; border-radius: 6px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #1A1A1A; font-size: 14px; transition: background 0.15s; }
                .vcal-nav:hover { background: #F7F7F5; }
                .vday-names { display: grid; grid-template-columns: repeat(7, 1fr); background: #F7F7F5; border-bottom: 1px solid #EDEDED; }
                .vday-name { text-align: center; padding: 8px 4px; font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: .5px; }
                .vcal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
                .vcal-cell { min-height: 80px; border-right: 1px solid #EDEDED; border-bottom: 1px solid #EDEDED; padding: 6px; cursor: pointer; transition: background 0.12s; position: relative; }
                .vcal-cell:nth-child(7n) { border-right: none; }
                .vcal-cell:hover { background: #fafafa; }
                .vcal-cell.selected { background: #fff5f5; }
                .vcal-cell.empty { background: #F7F7F5; cursor: default; }
                .vday-num { font-size: 12px; font-weight: 600; color: #1A1A1A; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-bottom: 4px; }
                .vday-num.today { background: #ff0000; color: #fff; }
                .vevent-pill { font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
                .vmore-tag { font-size: 10px; color: #6B6B6B; padding: 1px 4px; }
                .vdetail-card { background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 12px; padding: 20px; }
                .vdetail-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; margin-bottom: 14px; }
                .vactivity-item { padding: 12px; border: 1px solid #EDEDED; border-radius: 8px; margin-bottom: 10px; }
                .vactivity-item:last-child { margin-bottom: 0; }
                .vactivity-name { font-weight: 600; font-size: 13px; color: #1A1A1A; margin-bottom: 4px; }
                .vactivity-meta { font-size: 11px; color: #6B6B6B; display: flex; flex-direction: column; gap: 2px; }
                .vstatus-badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-top: 6px; }
                .vno-events { text-align: center; padding: 32px 0; color: #6B6B6B; font-size: 13px; }
                .vassigned-box { border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 10px; margin-top: 8px; font-size: 11px; color: #374151; }
                .vassigned-label { font-weight: 600; color: #ff0000; margin-right: 4px; }
                @media (max-width: 900px) { .vsched-content { grid-template-columns: 1fr; } }
            `}</style>

            <div className="vsched-content">
                {/* CALENDAR */}
                <div className="vcal-card">
                    <div className="vcal-header">
                        <button className="vcal-nav" onClick={prevMonth}>‹</button>
                        <div className="vcal-month">{monthNames[month]} {year}</div>
                        <button className="vcal-nav" onClick={nextMonth}>›</button>
                    </div>
                    <div className="vday-names">
                        {dayNames.map(d => <div key={d} className="vday-name">{d}</div>)}
                    </div>
                    <div className="vcal-grid">
                        {cells.map((day, i) => {
                            if (!day) return <div key={`empty-${i}`} className="vcal-cell empty" />;
                            const dayActivities = getActivitiesForDay(day);
                            const isSelected = selectedDay === day;
                            return (
                                <div
                                    key={day}
                                    className={`vcal-cell ${isSelected ? 'selected' : ''}`}
                                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                >
                                    <div className={`vday-num ${isToday(day) ? 'today' : ''}`}>{day}</div>
                                    {dayActivities.slice(0, 2).map((a, idx) => {
                                        const { bg, color } = statusColor(a.status);
                                        return (
                                            <div key={idx} className="vevent-pill" style={{ background: bg, color }}>
                                                {a.name}
                                            </div>
                                        );
                                    })}
                                    {dayActivities.length > 2 && (
                                        <div className="vmore-tag">+{dayActivities.length - 2} more</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* DETAIL PANEL */}
                <div className="vdetail-card">
                    <div className="vdetail-title">
                        {selectedDay
                            ? `${monthNames[month]} ${selectedDay}, ${year}`
                            : 'Select a day'}
                    </div>
                    {!selectedDay && (
                        <div className="vno-events">Click a date to see your activities</div>
                    )}
                    {selectedDay && selectedActivities.length === 0 && (
                        <div className="vno-events">No activities on this day</div>
                    )}
                    {selectedActivities.map((a, i) => {
                        const { bg, color } = statusColor(a.status);
                        return (
                            <div key={i} className="vactivity-item">
                                <div className="vactivity-name">{a.name}</div>
                                <div className="vactivity-meta">
                                    <span>{a.start_time?.substring(0,5)} – {a.end_time?.substring(0,5)}</span>
                                    <span>{a.location_name || '—'}</span>
                                    {a.description && <span style={{ marginTop: 4 }}>{a.description}</span>}
                                </div>
                                {a.status && (
                                    <span className="vstatus-badge" style={{ background: bg, color }}>{a.status}</span>
                                )}
                                <div className="vassigned-box">
                                    <span className="vassigned-label">Assigned by:</span>
                                    {a.assigned_by || 'Philippine Red Cross Admin'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

// ✅ Ito ang susi — gagamitin na ang persistent VolunteerLayout, hindi na gagawa ng sarili niyang sidebar
VolunteerSchedule.layout = (page) => <VolunteerLayout title="Schedule">{page}</VolunteerLayout>;