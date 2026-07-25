import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import LiveLocationMap from './LiveLocationMap';
import AttendanceLocationModal from './AttendanceLocationModal';
import AdminLayout from '../../Layouts/AdminLayout';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function AdminAttendance({ attendances, volunteers, activities, filters }) {
    const [volunteerFilter, setVolunteerFilter] = useState(filters?.volunteer_id || '');
    const [activityFilter, setActivityFilter] = useState(filters?.activity_id || '');
    const [dateFilter, setDateFilter] = useState(filters?.date || '');
    const [selectedRecord, setSelectedRecord] = useState(null);

    // ✅ NEW: clickable status legend filter
    const [statusFilter, setStatusFilter] = useState(null);

    // ✅ NEW: datatable state — sorting + pagination
    const [sortField, setSortField] = useState('volunteer');
    const [sortDirection, setSortDirection] = useState('desc');
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [currentPage, setCurrentPage] = useState(1);

    const applyFilters = () => {
        router.get(route('admin.attendance.index'), {
            volunteer_id: volunteerFilter,
            activity_id: activityFilter,
            date: dateFilter,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setVolunteerFilter('');
        setActivityFilter('');
        setDateFilter('');
        router.get(route('admin.attendance.index'));
    };

    // ✅ FIXED: window.open para ma-download ang PDF nang tama
    const exportPdf = () => {
        const params = new URLSearchParams({
            volunteer_id: volunteerFilter,
            activity_id: activityFilter,
            date: dateFilter,
        }).toString();

        window.open(route('admin.attendance.export.pdf') + '?' + params, '_blank');
    };

    const formatTime = (datetime) => {
        if (!datetime) return '-';
        return new Date(datetime).toLocaleTimeString('en-PH', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // ✅ NEW: badge color styles matching Attendance History design
    const statusStyles = {
        'Early In': { bg: '#eff6ff', color: '#2563eb' },
        'On Time': { bg: '#f0fdf4', color: '#15803d' },
        'Late': { bg: '#fef2f2', color: '#dc2626' },
        'Early Out': { bg: '#fff7ed', color: '#c2410c' },
        'Absent': { bg: '#f3f4f6', color: '#6b7280' },
        '-': { bg: '#f3f4f6', color: '#9ca3af' },
    };

    // ✅ NEW: badge styles for attendance method (office biometric vs field face recognition)
    const methodStyles = {
        fingerprint: { bg: '#eef2ff', color: '#4338ca', label: 'Biometric (Office)' },
        face: { bg: '#faf5ff', color: '#7e22ce', label: 'Face Recognition (Field)' },
    };

    const MethodBadge = ({ method }) => {
        const style = methodStyles[method] || { bg: '#f3f4f6', color: '#9ca3af', label: '-' };
        return (
            <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                background: style.bg,
                color: style.color,
            }}>
                {style.label}
            </span>
        );
    };

    // ✅ NEW: activities.start_time / end_time are TIME-only columns (e.g. "18:00:00"),
    // so `new Date("18:00:00")` alone becomes Invalid Date. Combine with the activity's
    // date to build a real, comparable datetime.
    const buildScheduleDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;

        // dateStr can come as "2026-07-21" or a full ISO datetime — normalize to Y-M-D
        const datePart = dateStr.split('T')[0];
        // timeStr can be "18:00:00" or "18:00" — normalize to HH:mm:ss
        const timePart = timeStr.length === 5 ? `${timeStr}:00` : timeStr;

        const dt = new Date(`${datePart}T${timePart}`);
        return isNaN(dt.getTime()) ? null : dt;
    };

    // ✅ NEW: compares by minute-of-day so "exact match" doesn't get missed over stray seconds
    const minutesOfDay = (date) => date.getHours() * 60 + date.getMinutes();

    // ✅ UPDATED: Time-In status is computed on its own — Late / On Time / Early In
    const getTimeInStatus = (record, start) => {
        if (!record.time_in || !start) return null;

        const timeIn = new Date(record.time_in);
        const diff = minutesOfDay(timeIn) - minutesOfDay(start);

        if (diff === 0) return 'On Time';
        if (diff > 0) return 'Late';
        return 'Early In';
    };

    // ✅ UPDATED: Time-Out status is computed independently — Early Out / On Time only
    // (walang special badge kung nag-time-out pa lampas sa schedule; normal lang iyon)
    const getTimeOutStatus = (record, end) => {
        if (!record.time_out || !end) return null;

        const timeOut = new Date(record.time_out);
        const diff = minutesOfDay(timeOut) - minutesOfDay(end);

        if (diff === 0) return 'On Time';
        if (diff < 0) return 'Early Out';
        return null;
    };

    // ✅ UPDATED: compute attendance status(es) — isang record pwede MAHIGIT SA ISANG badge,
    // pero hiwalay talaga ang basehan ng Time-In status at Time-Out status.
    const getAttendanceStatuses = (record) => {
        if (!record.time_in) {
            return ['Absent'];
        }

        const scheduleDate = record.activity?.date ?? record.date;
        const start = buildScheduleDateTime(scheduleDate, record.activity?.start_time);
        const end = buildScheduleDateTime(scheduleDate, record.activity?.end_time);

        const statuses = [];
        const timeInStatus = getTimeInStatus(record, start);
        const timeOutStatus = getTimeOutStatus(record, end);

        if (timeInStatus) statuses.push(timeInStatus);
        if (timeOutStatus) statuses.push(timeOutStatus);

        return statuses.length ? statuses : ['-'];
    };

    // ✅ NEW: renders one or more status pills side by side for a single record
    const StatusBadges = ({ statuses }) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {statuses.map(status => {
                const style = statusStyles[status] || statusStyles['-'];
                return (
                    <span key={status} style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        background: style.bg,
                        color: style.color,
                    }}>
                        {status}
                    </span>
                );
            })}
        </div>
    );

    // ✅ NEW: apply the clickable status legend filter BEFORE computing totals/sorting
    const filteredAttendances = useMemo(() => {
        if (!statusFilter) return attendances;
        return attendances.filter(r => getAttendanceStatuses(r).includes(statusFilter));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attendances, statusFilter]);

    const totalHours = filteredAttendances.reduce((sum, a) => sum + parseFloat(a.hours_rendered || 0), 0);

    // ✅ NEW: datatable column definitions — accessor pulls a comparable value out of each record
    const columns = [
        { key: 'volunteer', label: 'Volunteer', sortable: true, accessor: (r) => r.user?.name ?? '' },
        { key: 'activity',  label: 'Activity',  sortable: true, accessor: (r) => r.activity?.name ?? '' },
        { key: 'date',      label: 'Date',      sortable: true, accessor: (r) => r.date ?? '' },
        { key: 'time_in',   label: 'Time In',   sortable: true, accessor: (r) => r.time_in ?? '' },
        { key: 'time_out',  label: 'Time Out',  sortable: true, accessor: (r) => r.time_out ?? '' },
        { key: 'hours',     label: 'Hours',     sortable: true, accessor: (r) => parseFloat(r.hours_rendered || 0) },
        { key: 'method',    label: 'Method',    sortable: true, accessor: (r) => r.method ?? '' },
        { key: 'status',    label: 'Status',    sortable: true, accessor: (r) => getAttendanceStatuses(r)[0] ?? '' },
    ];

    // ✅ NEW: sort the filtered record set before paginating
    const sortedAttendances = useMemo(() => {
        const col = columns.find((c) => c.key === sortField);
        if (!col) return filteredAttendances;
        const copy = [...filteredAttendances];
        copy.sort((a, b) => {
            const valA = col.accessor(a);
            const valB = col.accessor(b);
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }
            const strA = valA.toString().toLowerCase();
            const strB = valB.toString().toLowerCase();
            if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
            if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return copy;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredAttendances, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedAttendances.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const pagedAttendances = sortedAttendances.slice((safePage - 1) * pageSize, safePage * pageSize);

    const handleSort = (key) => {
        if (sortField === key) {
            setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(key);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const sortIndicator = (key) => {
        if (sortField !== key) return '↕';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    // ✅ NEW: toggle a status filter on click; clicking the active one again clears it
    const handleStatusClick = (label) => {
        setStatusFilter(prev => (prev === label ? null : label));
        setCurrentPage(1);
    };

    return (
        <div>
            <Head title="Attendance Records" />

            <style>{`
                * { box-sizing: border-box; }
                html, body { margin: 0; padding: 0; }

                /* ✅ System font stack — walang external request, di na aasa sa fonts.googleapis.com */
                .at-montserrat { font-family: 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif; }

                /* ✅ NEW: datatable-specific styles */
                .at-table-scroll { overflow-x: auto; }
                .at-th-sortable { cursor: pointer; user-select: none; white-space: nowrap; }
                .at-th-sortable:hover { color: #374151 !important; }
                .at-sort-icon { margin-left: 4px; font-size: 10px; opacity: .6; }
                .at-sort-icon.active { opacity: 1; color: #ff0000; }
                .at-table-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 16px 24px; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
                .at-page-size { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
                .at-page-size select { border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 8px; font-size: 12px; background: #fff; cursor: pointer; }
                .at-pagination { display: flex; align-items: center; gap: 8px; }
                .at-page-btn { border: 1px solid #e5e7eb; background: #fff; color: #374151; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
                .at-page-btn:hover:not(:disabled) { border-color: #ccc; }
                .at-page-btn:disabled { opacity: .4; cursor: not-allowed; }
                .at-page-info { font-size: 12px; color: #6b7280; }

                /* ✅ NEW: clickable legend pill states */
                .at-legend-pill { border: none; cursor: pointer; transition: transform .1s ease, box-shadow .15s ease; }
                .at-legend-pill:hover { transform: translateY(-1px); }
                .at-legend-pill.active { box-shadow: 0 0 0 2px currentColor inset; }
                .at-clear-status { background: transparent; border: none; color: #9ca3af; font-size: 12px; font-weight: 600; cursor: pointer; padding: 5px 10px; text-decoration: underline; }
            `}</style>

            <div className="at-montserrat" style={{ minHeight: '100vh', background: '#f5f5f5' }}>

                <div style={{ padding: 0 }}>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#ff0000', marginBottom: '6px' }}>Admin Panel</div>
                        <h1 style={{ fontSize: '32px', color: '#111', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>Attendance Records</h1>
                    </div>

                    <LiveLocationMap />

                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '20px 24px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '16px', color: '#111' }}>Filter Records</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '12px', alignItems: 'end' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>VOLUNTEER</label>
                                <select value={volunteerFilter} onChange={e => setVolunteerFilter(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}>
                                    <option value="">All Volunteers</option>
                                    {volunteers.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>ACTIVITY</label>
                                <select value={activityFilter} onChange={e => setActivityFilter(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}>
                                    <option value="">All Activities</option>
                                    {activities.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.date})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>DATE</label>
                                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }} />
                            </div>
                            <button onClick={applyFilters} style={{ padding: '9px 20px', background: '#ff0000', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Filter</button>
                            <button onClick={clearFilters} style={{ padding: '9px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Clear</button>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8e8' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <div style={{ fontSize: '16px', color: '#111', fontWeight: '600', textTransform: 'uppercase' }}>
                                    All Attendance Records
                                </div>
                                <button
                                    onClick={exportPdf}
                                    style={{
                                        background: '#ff0000',
                                        color: 'white',
                                        padding: '8px 18px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Export PDF
                                </button>
                            </div>

                            {/* ✅ UPDATED: legend pills are now clickable filters */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {['Early In', 'On Time', 'Late', 'Early Out', 'Absent'].map(label => {
                                    const style = statusStyles[label];
                                    const isActive = statusFilter === label;
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => handleStatusClick(label)}
                                            className={`at-legend-pill ${isActive ? 'active' : ''}`}
                                            style={{
                                                padding: '5px 14px',
                                                borderRadius: '999px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: style.bg,
                                                color: style.color,
                                                opacity: statusFilter && !isActive ? 0.55 : 1,
                                            }}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                                {statusFilter && (
                                    <button className="at-clear-status" onClick={() => setStatusFilter(null)}>
                                        Clear status filter
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ✅ NEW: pagination + page size controls (moved above table) */}
                        {sortedAttendances.length > 0 && (
                            <div className="at-table-footer">
                                <div className="at-page-size">
                                    <span>Rows per page:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                    >
                                        {PAGE_SIZE_OPTIONS.map((n) => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                    <span className="at-page-info">
                                        {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedAttendances.length)} of {sortedAttendances.length}
                                    </span>
                                </div>
                                <div className="at-pagination">
                                    <button
                                        className="at-page-btn"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={safePage === 1}
                                    >
                                        ‹ Prev
                                    </button>
                                    <span className="at-page-info">Page {safePage} of {totalPages}</span>
                                    <button
                                        className="at-page-btn"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safePage === totalPages}
                                    >
                                        Next ›
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ✅ NEW: sortable datatable */}
                        <div className="at-table-scroll">
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                className={col.sortable ? 'at-th-sortable' : ''}
                                                onClick={() => col.sortable && handleSort(col.key)}
                                                style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888' }}
                                            >
                                                {col.label}
                                                {col.sortable && (
                                                    <span className={`at-sort-icon ${sortField === col.key ? 'active' : ''}`}>
                                                        {sortIndicator(col.key)}
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedAttendances.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>No attendance records found.</td>
                                        </tr>
                                    ) : pagedAttendances.map((record) => (
                                        <tr key={record.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '14px 24px' }}>
                                                <div
                                                    onClick={() => setSelectedRecord(record)}
                                                    style={{ fontSize: '14px', fontWeight: '600', color: '#111', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.textDecorationColor = '#ff0000'}
                                                    onMouseLeave={(e) => e.currentTarget.style.textDecorationColor = 'transparent'}
                                                >
                                                    {record.user?.name ?? '-'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{record.user?.email ?? ''}</div>
                                            </td>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#374151' }}>{record.activity?.name ?? '-'}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#374151' }}>{formatDate(record.date)}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>{formatTime(record.time_in)}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#ff0000', fontWeight: '600' }}>{formatTime(record.time_out)}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111' }}>
                                                {record.hours_rendered ? record.hours_rendered + ' hrs' : '-'}
                                            </td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <MethodBadge method={record.method} />
                                            </td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <StatusBadges statuses={getAttendanceStatuses(record)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>

            <AttendanceLocationModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        </div>
    );
}

// ✅ Persistent layout — dito lalabas ang sidebar (Dashboard, Volunteers, Schedule,
// Attendance, Reports, Activities, 201 Files, Communication) pag pumunta ka dito.
AdminAttendance.layout = (page) => <AdminLayout title="Attendance">{page}</AdminLayout>;