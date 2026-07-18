import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

function AdminDashboard({
    pendingCount,
    totalVolunteers,
    activeToday,
    recentVolunteers = [],
    pendingDocuments = [],
    volunteerStats = { active: 0, incompleteDocs: 0, inactive: 0 },
    upcomingEvents = [],
    quickStats = {},
    // shape: { "2026": [{ month: 'Jan', attended: 62, missed: 10 }, ...], "2025": [...] }
    // Awtomatikong galing sa backend (Attendance table) — walang naka-hardcode na dummy data.
    activityStatsByYear = {},
}) {
    const [previewDoc, setPreviewDoc] = useState(null);
    const thisYear = new Date().getFullYear();
    const availableYears = Object.keys(activityStatsByYear).map(Number).sort((a, b) => b - a);
    const yearOptions = availableYears.includes(thisYear) ? availableYears : [thisYear, ...availableYears];
    const [selectedYear, setSelectedYear] = useState(thisYear);
    const activityStats = activityStatsByYear[selectedYear] ?? [];

    const avatarColors = [
        ['#fee2e2', '#991b1b'], ['#dbeafe', '#1e40af'],
        ['#dcfce7', '#166534'], ['#ede9fe', '#5b21b6'], ['#fef3c7', '#92400e'],
    ];

    const qs = {
        avgHours: quickStats.avgHours ?? 0,
        totalHours: quickStats.totalHours ?? 0,
        activeBranches: quickStats.activeBranches ?? 0,
        trainingsThisMonth: quickStats.trainingsThisMonth ?? 0,
        totalActivities: quickStats.totalActivities ?? 0,
    };

    const statusBadge = (status) => {
        if (status === 'Active') return { background: '#dcfce7', color: '#166534' };
        if (status === 'Incomplete docs') return { background: '#fef3c7', color: '#92400e' };
        return { background: '#f5f5f5', color: '#555' };
    };

    const availabilityBadgeStyle = { background: '#dbeafe', color: '#1e40af' };

    const isImage = (url) => url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isPdf   = (url) => url && /\.pdf$/i.test(url);

    const handleDownload = async (doc) => {
        if (!doc.file_url) return;
        const fileName = `${doc.name}_${doc.type}`.replace(/\s+/g, '_') + (isPdf(doc.file_url) ? '.pdf' : '');
        try {
            const response = await fetch(doc.file_url);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = fileName;
            document.body.appendChild(link); link.click();
            document.body.removeChild(link); URL.revokeObjectURL(url);
        } catch {
            const link = document.createElement('a');
            link.href = doc.file_url; link.download = fileName;
            document.body.appendChild(link); link.click();
            document.body.removeChild(link);
        }
    };

    const AnalyticsChart = ({ data }) => {
        const W = 340, H = 190, padL = 28, padB = 22, padT = 8;
        const chartW = W - padL - 8;
        const chartH = H - padT - padB;
        const maxVal = Math.max(...data.map(d => d.attended + d.missed), 1);
        const barGroupW = chartW / data.length;
        const barW = Math.min(20, barGroupW * 0.45);
        const yTicks = Math.max(1, Math.min(4, maxVal));

        return (
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                {Array.from({ length: yTicks + 1 }).map((_, i) => {
                    const y = padT + (chartH / yTicks) * i;
                    const val = Math.round(maxVal - (maxVal / yTicks) * i);
                    return (
                        <g key={i}>
                            <line x1={padL} y1={y} x2={W - 4} y2={y} stroke="#F0F0F0" strokeWidth="1" />
                            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#999" fontFamily="'DM Sans', sans-serif">{val}</text>
                        </g>
                    );
                })}
                {data.map((d, i) => {
                    const total = d.attended + d.missed;
                    const barH = (total / maxVal) * chartH;
                    const attendedH = (d.attended / maxVal) * chartH;
                    const missedH = (d.missed / maxVal) * chartH;
                    const x = padL + barGroupW * i + (barGroupW - barW) / 2;
                    const yBottom = padT + chartH;
                    return (
                        <g key={i}>
                            <rect x={x} y={yBottom - attendedH} width={barW} height={Math.max(attendedH, 0)} rx="3" fill="#FF0000" />
                            <rect x={x} y={yBottom - barH} width={barW} height={Math.max(missedH - 2, 0)} rx="3" fill="#F0C7CC" />
                            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#6B6B6B" fontFamily="'DM Sans', sans-serif">{d.month}</text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    const ProfileAvatar = ({ doc, size = 64 }) => {
        const [bg, color] = avatarColors[doc.color_id ?? 0];
        return doc.photo ? (
            <img src={doc.photo} alt={doc.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
        ) : (
            <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.3, fontWeight: '600', color }}>
                {doc.initials}
            </div>
        );
    };

    return (
        <>
            <Head title="Admin Dashboard" />

            <style>{`
                .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                .metric-card { background: var(--white); padding: 20px; border-radius: 10px; border: 1px solid var(--border); text-decoration: none; display: block; transition: border-color 0.15s; }
                .metric-card:hover { border-color: #ccc; }
                .metric-val { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; color: var(--red); line-height: 1; }
                .metric-val.highlight { color: #f59e0b; }
                .metric-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
                .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .full-card { margin-bottom: 16px; }
                .card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
                .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .3px; margin-bottom: 14px; }
                .vol-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-decoration: none; }
                .vol-row:last-child { border-bottom: none; }
                .vol-name { font-size: 13px; color: var(--ink); font-weight: 500; }
                .vol-sub { font-size: 11px; color: var(--muted); }
                .badge { font-size: 11px; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
                .view-all { font-size: 12px; color: var(--red); text-decoration: none; font-weight: 600; }
                .quick-actions { display: flex; gap: 10px; flex-wrap: wrap; }
                .btn-red   { background: var(--red); color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: background 0.15s; font-family: 'DM Sans', sans-serif; }
                .btn-red:hover { background: var(--red-dark); }
                .btn-blue  { background: #1d4ed8; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'DM Sans', sans-serif; }
                .btn-green { background: #16a34a; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'DM Sans', sans-serif; }
                .btn-gray  { background: #f5f5f5; border: 1px solid var(--border); padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--ink); text-decoration: none; display: inline-block; font-family: 'DM Sans', sans-serif; }
                .alert { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
            `}</style>

            {/* MODAL */}
            {previewDoc && (
                <div onClick={() => setPreviewDoc(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '860px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <ProfileAvatar doc={previewDoc} size={36} />
                                <div>
                                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase' }}>{previewDoc.name}</div>
                                    <div style={{ fontSize: '12px', color: '#ff0000', fontWeight: '600', marginTop: '2px' }}>{previewDoc.type}</div>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '240px 1fr' }}>
                            <div style={{ borderRight: '1px solid #f0f0f0', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <ProfileAvatar doc={previewDoc} size={80} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{previewDoc.name}</div>
                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Muntinlupa City Branch</div>
                                </div>
                                <div style={{ width: '100%', marginTop: '8px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Document</div>
                                    <div style={{ fontSize: '13px', color: '#ff0000', fontWeight: '600' }}>{previewDoc.type}</div>
                                </div>
                            </div>
                            <div style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', overflow: 'hidden' }}>
                                {previewDoc.file_url ? (
                                    isImage(previewDoc.file_url) ? (
                                        <img src={previewDoc.file_url} alt={previewDoc.type} style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', margin: '20px' }} />
                                    ) : isPdf(previewDoc.file_url) ? (
                                        <iframe src={`${previewDoc.file_url}#toolbar=1`} style={{ width: '100%', height: '55vh', border: 'none' }} title={previewDoc.type} />
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#888' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                                            <button onClick={() => handleDownload(previewDoc)} style={{ background: 'none', border: 'none', color: '#FF0000', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Download →</button>
                                        </div>
                                    )
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Walang file na naka-attach.</div>
                                )}
                            </div>
                        </div>
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {previewDoc.file_url && <button onClick={() => handleDownload(previewDoc)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Download</button>}
                            <button onClick={() => setPreviewDoc(null)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* METRICS */}
            <div className="metrics-grid">
                {[
                    { label: 'Total Volunteers', value: totalVolunteers ?? 0, href: route('admin.volunteers') },
                    { label: 'Active Today',     value: activeToday ?? 0,     href: route('admin.attendance.index') },
                    { label: 'Pending Approval', value: pendingCount ?? 0, highlight: true, href: route('admin.volunteers') },
                    { label: 'Total Activities', value: qs.totalActivities,  href: route('admin.activities.index') },
                ].map(({ label, value, highlight, href }) => (
                    <Link key={label} href={href} className="metric-card">
                        <div className={`metric-val ${highlight && value > 0 ? 'highlight' : ''}`}>{value}</div>
                        <div className="metric-label">{label}</div>
                    </Link>
                ))}
            </div>

            {/* ALERT */}
            {pendingCount > 0 && (
                <div className="alert">
                    <span style={{ fontSize: '14px', color: '#92400e', fontWeight: '500' }}>
                        You have <strong>{pendingCount}</strong> volunteer{pendingCount > 1 ? 's' : ''} waiting for approval.
                    </span>
                    <Link href={route('admin.volunteers')} style={{ background: '#f59e0b', color: 'white', padding: '7px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>Review Now →</Link>
                </div>
            )}

            {/* RECENT VOLUNTEERS + ANALYTICS CHART */}
            <div className="grid2">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div className="card-title">Recent Volunteers</div>
                        <Link href={route('admin.volunteers')} className="view-all">View all →</Link>
                    </div>
                    {recentVolunteers.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '20px 0' }}>No volunteers yet</div>
                    ) : recentVolunteers.map((vol, i) => {
                        const [bg, color] = avatarColors[i % avatarColors.length];
                        return (
                            <Link key={i} href={route('admin.volunteers')} className="vol-row">
                                {vol.photo
                                    ? <img src={vol.photo} alt={vol.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                    : <div style={{ width: 34, height: 34, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color, flexShrink: 0 }}>{vol.initials}</div>
                                }
                                <div style={{ flex: 1 }}>
                                    <div className="vol-name">{vol.name}</div>
                                    <div className="vol-sub">{vol.branch}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {vol.is_available ? (
                                        <span className="badge" style={availabilityBadgeStyle}>● Available</span>
                                    ) : (
                                        <span className="badge" style={{ background: '#f5f5f5', color: '#999' }}>○ Offline</span>
                                    )}
                                    <span className="badge" style={statusBadge(vol.status)}>{vol.status}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div className="card-title" style={{ marginBottom: 0 }}>Volunteer Activity</div>
                        <div style={{ display: 'flex', gap: 12, fontSize: '11px', color: '#6B6B6B' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#ff0000', display: 'inline-block' }} />Attended
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#F0C7CC', display: 'inline-block' }} />Missed
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#999' }}>Monthly totals</span>
                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A1A', border: '1px solid #EDEDED', borderRadius: '6px', padding: '4px 8px', background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    {activityStats.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '50px 0' }}>Wala pang attendance record ngayong {selectedYear}</div>
                    ) : (
                        <AnalyticsChart data={activityStats} />
                    )}
                </div>
            </div>

            {/* PENDING DOCUMENTS */}
            <div className="card full-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="card-title" style={{ marginBottom: 0 }}>Pending Documents</div>
                    <Link href={route('admin.volunteers')} className="view-all">View all →</Link>
                </div>
                {pendingDocuments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '20px 0' }}>No pending documents</div>
                ) : pendingDocuments.map((doc, i) => {
                    const [bg, color] = avatarColors[doc.color_id ?? i % avatarColors.length];
                    return (
                        <div key={i} onClick={() => setPreviewDoc(doc)} className="vol-row" style={{ cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {doc.photo
                                ? <img src={doc.photo} alt={doc.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                : <div style={{ width: 34, height: 34, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color, flexShrink: 0 }}>{doc.initials}</div>
                            }
                            <div style={{ flex: 1 }}>
                                <div className="vol-name">{doc.name}</div>
                                <div className="vol-sub">{doc.type}</div>
                            </div>
                            <span style={{ fontSize: '11px', color: '#ff0000', fontWeight: '600' }}>View →</span>
                        </div>
                    );
                })}
            </div>

            {/* QUICK ACTIONS */}
            <div className="card">
                <div className="card-title">Quick Actions</div>
                <div className="quick-actions">
                    <Link href={route('admin.volunteers')}           className="btn-red">Manage Volunteers</Link>
                    <Link href={route('admin.activities.index')}     className="btn-blue">Manage Activities</Link>
                    <Link href={route('admin.activities.create')}    className="btn-green">+ New Activity</Link>
                    <Link href={route('admin.attendance.index')}     className="btn-gray">View Attendance</Link>
                    <Link href={route('admin.attendance.export.pdf')} className="btn-gray">Export PDF</Link>
                    <Link href={route('admin.communication')}        className="btn-gray">Communication</Link>
                </div>
            </div>
        </>
    );
}

// ✅ ITO ANG SUSI: sinasabi sa Inertia na gamitin ang AdminLayout bilang persistent wrapper.
// Hindi na nire-render ulit ang sidebar sa tuwing magpapalit ng page.
AdminDashboard.layout = (page) => <AdminLayout title="Dashboard">{page}</AdminLayout>;

export default AdminDashboard;