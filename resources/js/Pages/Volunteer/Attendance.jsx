import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import FaceAttendance from '@/Components/FaceAttendance';

const TIME_IN_LIMIT  = 8 * 60;
const TIME_OUT_LIMIT = 17 * 60;

function getMinutes(datetime) {
    if (!datetime) return null;
    const d = new Date(datetime);
    return d.getHours() * 60 + d.getMinutes();
}

function getStatuses(record) {
    const statuses = [];
    const timeInMin  = getMinutes(record.time_in);
    const timeOutMin = getMinutes(record.time_out);

    if (timeInMin !== null) {
        if (timeInMin < TIME_IN_LIMIT)  statuses.push('Early In');
        if (timeInMin > TIME_IN_LIMIT)  statuses.push('Late');
    }
    if (timeOutMin !== null && timeOutMin < TIME_OUT_LIMIT) {
        statuses.push('Early Out');
    }
    return statuses;
}

const STATUS_STYLES = {
    'Early In': { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
    Late:       { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
    'Early Out':{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
    Absent:     { background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' },
};

const FILTER_ACTIVE = {
    'Early In': { background: '#1d4ed8', color: '#fff', border: '1px solid #1d4ed8' },
    Late:       { background: '#b91c1c', color: '#fff', border: '1px solid #b91c1c' },
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

export default function VolunteerAttendance({ auth, attendances, todayRecord, totalHours, activities }) {
    const { flash } = usePage().props;
    const [activeFilter, setActiveFilter] = useState(null);
    const volunteer = auth.user;

    // ✅ ADDED: photo_url support
    const avatarUrl = volunteer?.photo_url || null;
    const initials = volunteer?.name
        ? volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    const handleLogout = () => router.post(route('logout'));

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

    const sidebarLinks = [
        { key: 'dashboard',     label: 'Dashboard',     href: route('volunteer.dashboard'),     icon: <GridIcon /> },
        { key: 'schedule',      label: 'Schedule',      href: route('volunteer.schedule'),      icon: <CalIcon /> },
        { key: 'communication', label: 'Communication', href: route('volunteer.communication'), icon: <ChatIcon /> },
        { key: 'attendance',    label: 'Attendance',    href: route('volunteer.attendance'),    icon: <CheckIcon /> },
        { key: 'documents',     label: '201',           href: route('volunteer.documents'),     icon: <FolderIcon /> },
    ];

    return (
        <>
            <Head title="Attendance" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F3F4F6' }}>

                {/* ✅ UPDATED: Sidebar — same layout as other pages */}
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
                            const isActive = item.key === 'attendance';
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
                        background: 'white', padding: '0 28px', height: '52px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50
                    }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Attendance</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            

                            {/* ✅ Avatar — plain div, not clickable */}
                            <div
                                title={volunteer?.name}
                                style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: avatarUrl ? 'transparent' : '#CC0000',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '12px', fontWeight: '700',
                                    flexShrink: 0, overflow: 'hidden',
                                }}
                            >
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    : initials
                                }
                            </div>
                        </div>
                    </header>

                    <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

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

                        <FaceAttendance todayRecord={todayRecord} activities={activities} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                                <div style={{ fontSize: '36px', color: '#CC0000', fontWeight: '700' }}>
                                    {attendances.length}
                                </div>
                                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Total Days Present</div>
                            </div>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                                <div style={{ fontSize: '36px', color: '#CC0000', fontWeight: '700' }}>
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
                                    {['Early In', 'Late', 'Early Out', 'Absent'].map(label => (
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
                                            <td style={{ padding: '14px 20px', fontSize: '14px', color: '#CC0000' }}>{formatTime(record.time_out)}</td>
                                            <td style={{ padding: '14px 20px', fontSize: '14px', color: '#111' }}>{record.hours_rendered ?? '—'}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                {record.statuses.map(s => <StatusBadge key={s} status={s} />)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>
            </div>
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