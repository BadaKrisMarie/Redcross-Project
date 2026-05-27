import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminAttendance({ attendances, volunteers, activities, filters }) {
    const [volunteerFilter, setVolunteerFilter] = useState(filters?.volunteer_id || '');
    const [activityFilter, setActivityFilter] = useState(filters?.activity_id || '');
    const [dateFilter, setDateFilter] = useState(filters?.date || '');

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

    const totalHours = attendances.reduce((sum, a) => sum + parseFloat(a.hours_rendered || 0), 0);

    return (
        <div>
            <Head title="Attendance Records" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

            <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Source Sans 3', sans-serif" }}>

                <nav style={{ background: '#111', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#DC2626', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '900' }}>+</div>
                        <span style={{ fontFamily: 'Oswald, sans-serif', color: 'white', fontSize: '16px', fontWeight: '600', letterSpacing: '1px' }}>RED CROSS - Admin Panel</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Link href={route('admin.dashboard')} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Dashboard</Link>
                        <Link href={route('logout')} method="post" as="button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '7px 18px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Log Out</Link>
                    </div>
                </nav>

                <div style={{ padding: '40px 32px' }}>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#DC2626', marginBottom: '6px' }}>Admin Panel</div>
                        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '32px', color: '#111', fontWeight: '600', textTransform: 'uppercase', margin: 0 }}>Attendance Records</h1>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { label: 'Total Records', value: attendances.length },
                            { label: 'Total Hours Rendered', value: totalHours.toFixed(2) },
                            { label: 'Volunteers with Records', value: [...new Set(attendances.map(a => a.user_id))].length },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '36px', color: '#DC2626', fontWeight: '600' }}>{value}</div>
                                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '20px 24px', marginBottom: '24px' }}>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '16px', color: '#111' }}>Filter Records</div>
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
                            <button onClick={applyFilters} style={{ padding: '9px 20px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Filter</button>
                            <button onClick={clearFilters} style={{ padding: '9px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Clear</button>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: '#111', fontWeight: '600', textTransform: 'uppercase' }}>
                                All Attendance Records ({attendances.length})
                            </div>
                            <button
                                onClick={exportPdf}
                                style={{
                                    background: '#DC2626',
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
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    {['Volunteer', 'Activity', 'Date', 'Time In', 'Time Out', 'Hours'].map(h => (
                                        <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {attendances.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>No attendance records found.</td>
                                    </tr>
                                ) : attendances.map((record) => (
                                    <tr key={record.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{record.user?.name ?? '-'}</div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{record.user?.email ?? ''}</div>
                                        </td>
                                        <td style={{ padding: '14px 24px', fontSize: '14px', color: '#374151' }}>{record.activity?.name ?? '-'}</td>
                                        <td style={{ padding: '14px 24px', fontSize: '14px', color: '#374151' }}>{formatDate(record.date)}</td>
                                        <td style={{ padding: '14px 24px', fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>{formatTime(record.time_in)}</td>
                                        <td style={{ padding: '14px 24px', fontSize: '14px', color: '#DC2626', fontWeight: '600' }}>{formatTime(record.time_out)}</td>
                                        <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111' }}>
                                            {record.hours_rendered ? record.hours_rendered + ' hrs' : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}