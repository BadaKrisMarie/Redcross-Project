import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import VolunteerLayout from '@/Layouts/VolunteerLayout'; // ⚠️ ayusin ang path base sa project mo

/**
 * ✅ Hindi na dito ginagawa ang sidebar/topbar — galing na sa VolunteerLayout.
 * Kaya persistent na siya at hindi na "magbabago" tuwing lilipat ka ng page.
 */
function VolunteerSchedule({ activities }) {
    const acts = activities || [];

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) calendarCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
    while (calendarCells.length % 7 !== 0) calendarCells.push(null);

    const actsByDate = {};
    acts.forEach(act => {
        const key = act.date?.substring(0, 10);
        if (!actsByDate[key]) actsByDate[key] = [];
        actsByDate[key].push(act);
    });

    const chipColors = ['#22C55E'];
    const getColor = (id) => chipColors[id % chipColors.length];

    const handleChipClick = (e, act) => {
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        let left = rect.right + 10;
        let top = rect.top - 10;
        if (left + 280 > window.innerWidth) left = rect.left - 290;
        if (top + 380 > window.innerHeight) top = window.innerHeight - 390;
        if (top < 60) top = 60;
        setPopupPos({ top, left });
        setSelectedActivity(act);
    };

    return (
        <>
            <Head title="Schedule" />
            <link href="https://fonts.googleapis.com/css2?family=monserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            <div onClick={() => setSelectedActivity(null)}>
                {/* Calendar */}
                <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
                        <button onClick={(e) => { e.stopPropagation(); prevMonth(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '18px', padding: '2px 6px', borderRadius: '4px', lineHeight: 1 }}>‹</button>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>
                            {monthNames[currentMonth]} {currentYear}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); nextMonth(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '18px', padding: '2px 6px', borderRadius: '4px', lineHeight: 1 }}>›</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
                        {dayNames.map(d => (
                            <div key={d} style={{ padding: '7px 10px', fontSize: '10px', fontWeight: '600', color: '#9CA3AF', textAlign: 'center', letterSpacing: '0.5px' }}>{d}</div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1 }}>
                        {calendarCells.map((day, idx) => {
                            const dateKey = day
                                ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                : null;
                            const dayActs = dateKey ? (actsByDate[dateKey] || []) : [];
                            const isToday = day && today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

                            return (
                                <div key={idx} style={{
                                    minHeight: '68px',
                                    padding: '6px 8px',
                                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid #F3F4F6' : 'none',
                                    borderBottom: idx < calendarCells.length - 7 ? '1px solid #F3F4F6' : 'none',
                                    background: day ? 'white' : '#FAFAFA',
                                    overflow: 'hidden',
                                }}>
                                    {day && (
                                        <>
                                            <div style={{
                                                fontSize: '12px', fontWeight: isToday ? '700' : '400',
                                                color: isToday ? 'white' : '#374151',
                                                width: '22px', height: '22px', borderRadius: '50%',
                                                background: isToday ? '#ff0000' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginBottom: '3px'
                                            }}>{day}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                {dayActs.slice(0, 2).map(act => (
                                                    <div
                                                        key={act.id}
                                                        onClick={(e) => handleChipClick(e, act)}
                                                        style={{
                                                            background: getColor(act.id), color: 'white',
                                                            borderRadius: '3px', padding: '2px 6px',
                                                            fontSize: '10px', fontWeight: '600', cursor: 'pointer',
                                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        }}
                                                        title={act.name}
                                                    >
                                                        {act.name}
                                                    </div>
                                                ))}
                                                {dayActs.length > 2 && (
                                                    <div style={{ fontSize: '9px', color: '#9CA3AF' }}>+{dayActs.length - 2} more</div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedActivity && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        top: popupPos.top,
                        left: popupPos.left,
                        width: '272px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                        zIndex: 300,
                        overflow: 'hidden',
                    }}
                >
                    <div style={{
                        background: getColor(selectedActivity.id),
                        padding: '12px 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>
                            {new Date(selectedActivity.date).toLocaleDateString('en-PH', {
                                month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </div>
                        <button
                            onClick={() => setSelectedActivity(null)}
                            style={{
                                background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '50%',
                                color: 'white', fontSize: '12px', cursor: 'pointer',
                                width: '20px', height: '20px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                                fontWeight: '700'
                            }}
                        >✕</button>
                    </div>
                    <div style={{ padding: '16px 16px 14px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '10px' }}>
                            {selectedActivity.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span style={{ fontSize: '12px', color: '#374151' }}>
                                Time: {selectedActivity.start_time?.substring(0,5)} - {selectedActivity.end_time?.substring(0,5)}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginBottom: '12px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span style={{ fontSize: '12px', color: '#374151', lineHeight: '1.4' }}>
                                Location: {selectedActivity.location_name || '—'}
                            </span>
                        </div>
                        <div style={{ borderTop: '1px solid #F3F4F6', marginBottom: '12px' }} />
                        <div style={{ marginBottom: '14px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Description:</div>
                            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.6' }}>
                                {selectedActivity.description || 'No description provided.'}
                            </div>
                        </div>
                        <div style={{
                            border: '1px solid #E5E7EB', borderRadius: '8px',
                            padding: '9px 12px',
                            display: 'flex', alignItems: 'flex-start', gap: '8px',
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#ff0000', flexShrink: 0 }}>Assigned by:</span>
                            <span style={{ fontSize: '11px', color: '#374151', lineHeight: '1.5' }}>
                                {selectedActivity.assigned_by || 'Philippine Red Cross Admin'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ✅ Ito ang susi — gagamitin na ang persistent VolunteerLayout, hindi na gagawa ng sarili niyang sidebar
VolunteerSchedule.layout = (page) => <VolunteerLayout title="Schedule">{page}</VolunteerLayout>;

export default VolunteerSchedule;