import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import FaceAttendance from '@/Components/FaceAttendance';
import VolunteerLayout from '@/Layouts/VolunteerLayout'; // ⚠️ ayusin ang path base sa project mo

// ✅ activities.start_time / end_time are TIME-only columns (e.g. "18:00:00"),
// so `new Date("18:00:00")` alone becomes Invalid Date. Combine with the activity's
// date to build a real, comparable datetime. Same helper as the admin side.
function buildScheduleDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;

    const datePart = dateStr.split('T')[0];
    const timePart = timeStr.length === 5 ? `${timeStr}:00` : timeStr;

    const dt = new Date(`${datePart}T${timePart}`);
    return isNaN(dt.getTime()) ? null : dt;
}

function minutesOfDay(date) {
    return date.getHours() * 60 + date.getMinutes();
}

// Time-In status computed on its own — Late / On Time / Early In
function getTimeInStatus(record, start) {
    if (!record.time_in || !start) return null;

    const timeIn = new Date(record.time_in);
    const diff = minutesOfDay(timeIn) - minutesOfDay(start);

    if (diff === 0) return 'On Time';
    if (diff > 0) return 'Late';
    return 'Early In';
}

// Time-Out status computed independently — Early Out / On Time only
// (walang special badge kung nag-time-out pa lampas sa schedule; normal lang iyon)
function getTimeOutStatus(record, end) {
    if (!record.time_out || !end) return null;

    const timeOut = new Date(record.time_out);
    const diff = minutesOfDay(timeOut) - minutesOfDay(end);

    if (diff === 0) return 'On Time';
    if (diff < 0) return 'Early Out';
    return null;
}

// uses real activity schedule (activity.date + start_time/end_time)
// instead of the old hardcoded 8AM/5PM limits, and separates Time-In vs Time-Out checks
function getStatuses(record) {
    const scheduleDate = record.activity?.date ?? record.date;
    const start = buildScheduleDateTime(scheduleDate, record.activity?.start_time);
    const end = buildScheduleDateTime(scheduleDate, record.activity?.end_time);

    const statuses = [];
    const timeInStatus = getTimeInStatus(record, start);
    const timeOutStatus = getTimeOutStatus(record, end);

    if (timeInStatus) statuses.push(timeInStatus);
    if (timeOutStatus) statuses.push(timeOutStatus);

    return statuses.length ? statuses : ['-'];
}

const STATUS_STYLES = {
    'Early In': { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
    'On Time':  { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
    Late:       { background: '#fef2f2', color: '#ff0000', border: '1px solid #fecaca' },
    'Early Out':{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
    Absent:     { background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' },
    '-':        { background: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb' },
};

const FILTER_ACTIVE = {
    'Early In': { background: '#1d4ed8', color: '#fff', border: '1px solid #1d4ed8' },
    'On Time':  { background: '#15803d', color: '#fff', border: '1px solid #15803d' },
    Late:       { background: '#ff0000', color: '#fff', border: '1px solid #ff0000' },
    'Early Out':{ background: '#c2410c', color: '#fff', border: '1px solid #c2410c' },
    Absent:     { background: '#374151', color: '#fff', border: '1px solid #374151' },
};

function StatusBadge({ status }) {
    return (
        <span style={{
            ...STATUS_STYLES[status],
            padding: '2px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.3px',
            display: 'inline-block',
            marginRight: '4px',
        }}>{status}</span>
    );
}

function FilterChip({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                ...(active ? FILTER_ACTIVE[label] : STATUS_STYLES[label]),
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.3px',
            }}
        >{label}</button>
    );
}

/**
 * ✅ Hindi na dito ginagawa ang sidebar/topbar — galing na sa VolunteerLayout.
 * Kaya persistent na siya at hindi na "magbabago" tuwing lilipat ka ng page.
 */
function VolunteerAttendance({ attendances, todayRecords, totalHours, activities, hasFaceDescriptor }) {
    const { flash } = usePage().props;
    const [activeFilter, setActiveFilter] = useState(null);

    const formatTime = (datetime) => {
        if (!datetime) return '—';
        return new Date(datetime).toLocaleTimeString('en-PH', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const records = attendances.map(r => ({
        ...r,
        statuses: r.time_in ? getStatuses(r) : ['Absent'],
    }));

    const filtered = activeFilter
        ? records.filter(r => r.statuses.includes(activeFilter))
        : records;

    const handleFilter = (label) => {
        setActiveFilter(prev => prev === label ? null : label);
    };

    return (
        <>
            <Head title="Attendance" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            {flash?.success && (
                <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: '6px', padding: '12px 16px',
                    marginBottom: '20px', fontSize: '13px', color: '#166534'
                }}>✅ {flash.success}</div>
            )}
            {flash?.error && (
                <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: '6px', padding: '12px 16px',
                    marginBottom: '20px', fontSize: '13px', color: '#991b1b'
                }}>⚠️ {flash.error}</div>
            )}

            <FaceAttendance todayRecords={todayRecords} activities={activities} hasFaceDescriptor={hasFaceDescriptor} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                    <div style={{ fontSize: '36px', color: '#ff0000', fontWeight: '700' }}>
                        {attendances.length}
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Total Days Present</div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                    <div style={{ fontSize: '36px', color: '#ff0000', fontWeight: '700' }}>
                        {parseFloat(totalHours || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Total Hours Rendered</div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8e8' }}>
                    <div style={{
                        fontSize: '14px', fontWeight: '700', color: '#111',
                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px'
                    }}>Attendance History</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Early In', 'On Time', 'Late', 'Early Out', 'Absent'].map(label => (
                            <FilterChip
                                key={label}
                                label={label}
                                active={activeFilter === label}
                                onClick={() => handleFilter(label)}
                            />
                        ))}
                        {activeFilter && (
                            <button
                                onClick={() => setActiveFilter(null)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #e5e7eb',
                                    color: '#6b7280',
                                    padding: '6px 14px',
                                    borderRadius: '999px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >✕ Clear</button>
                        )}
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb' }}>
                            {['Date', 'Activity', 'Time In', 'Time Out', 'Hours', 'Status'].map(h => (
                                <th key={h} style={{
                                    padding: '12px 20px', textAlign: 'left',
                                    fontSize: '11px', fontWeight: '600',
                                    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888'
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{
                                    padding: '32px', textAlign: 'center',
                                    color: '#aaa', fontSize: '14px'
                                }}>No records found.</td>
                            </tr>
                        ) : filtered.map((record) => (
                            <tr key={record.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#111' }}>{formatDate(record.date)}</td>
                                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#111' }}>{record.activity?.name ?? '—'}</td>
                                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#16a34a' }}>{formatTime(record.time_in)}</td>
                                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#ff0000' }}>{formatTime(record.time_out)}</td>
                                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#111' }}>{record.hours_rendered ?? '—'}</td>
                                <td style={{ padding: '14px 20px' }}>
                                    {record.statuses.map(s => <StatusBadge key={s} status={s} />)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ✅ Ito ang susi — gagamitin na ang persistent VolunteerLayout, hindi na gagawa ng sarili niyang sidebar
VolunteerAttendance.layout = (page) => <VolunteerLayout title="Attendance">{page}</VolunteerLayout>;

export default VolunteerAttendance;