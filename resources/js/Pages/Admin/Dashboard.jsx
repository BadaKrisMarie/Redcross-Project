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
    // NEW props
    flaggedThisWeek = 0,
    topVolunteers = [],
    todaysActivities = [],
    recentActivityLog = [],
}) {
    const [previewDoc, setPreviewDoc] = useState(null);
    const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const thisYear = new Date().getFullYear();
    const availableYears = Object.keys(activityStatsByYear).map(Number).sort((a, b) => b - a);
    const yearOptions = availableYears.includes(thisYear) ? availableYears : [thisYear, ...availableYears];
    const [selectedYear, setSelectedYear] = useState(thisYear);
    const activityStats = activityStatsByYear[selectedYear] ?? [];

    const avatarColors = [
        ['#fee2e2', '#991b1b'], ['#dbeafe', '#1e40af'],
        ['#dcfce7', '#166534'], ['#ede9fe', '#0000ff'], ['#fef3c7', '#92400e'],
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

    const isImage = (doc) => {
        if (!doc?.file_url) return false;
        if (doc.mime_type) return doc.mime_type.startsWith('image/');
        if (doc.file_type) return /jpg|jpeg|png|gif|webp/i.test(doc.file_type);
        return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(doc.file_url);
    };
    const isPdf = (doc) => {
        if (!doc?.file_url) return false;
        if (doc.mime_type) return doc.mime_type === 'application/pdf';
        if (doc.file_type) return /pdf/i.test(doc.file_type);
        return /\.pdf(\?.*)?$/i.test(doc.file_url);
    };

    const handleDownload = async (doc) => {
        if (!doc.file_url) return;
        const fileName = `${doc.name}_${doc.type}`.replace(/\s+/g, '_') + (isPdf(doc) ? '.pdf' : '');
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
                            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#999" fontFamily="'Montserrat', sans-serif">{val}</text>
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
                            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#6B6B6B" fontFamily="'Montserrat', sans-serif">{d.month}</text>
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
                .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .full-card { margin-bottom: 16px; }
                .card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
                .card-title { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .3px; margin-bottom: 14px; display: flex; align-items: center; }
                .vol-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-decoration: none; }
                .vol-row:last-child { border-bottom: none; }
                .vol-name { font-size: 13px; color: var(--ink); font-weight: 500; }
                .vol-sub { font-size: 11px; color: var(--muted); }
                .badge { font-size: 11px; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
                .view-all { font-size: 12px; color: var(--red); text-decoration: none; font-weight: 600; }
                .quick-actions { display: flex; gap: 10px; flex-wrap: wrap; }
                .btn-red   { background: var(--red); color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: background 0.15s; font-family: 'Montserrat', sans-serif; }
                .btn-red:hover { background: var(--red-dark); }
                .btn-blue  { background: #1d4ed8; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'Montserrat', sans-serif; }
                .btn-green { background: #16a34a; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: 'Montserrat', sans-serif; }
                .btn-gray  { background: #f5f5f5; border: 1px solid var(--border); padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--ink); text-decoration: none; display: inline-block; font-family: 'Montserrat', sans-serif; }
                .alert { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }

                /* Recent Volunteers scrollable list + custom scrollbar */
                .vol-list-scroll { max-height: 320px; overflow-y: auto; padding-right: 6px; }
                .vol-list-scroll::-webkit-scrollbar { width: 6px; }
                .vol-list-scroll::-webkit-scrollbar-track { background: transparent; }
                .vol-list-scroll::-webkit-scrollbar-thumb { background-color: #4B4B4B; border-radius: 999px; }
                .vol-list-scroll::-webkit-scrollbar-thumb:hover { background-color: #2E2E2E; }
                .vol-list-scroll { scrollbar-width: thin; scrollbar-color: #4B4B4B transparent; }

                /* NEW: mini stat card (Flagged This Week) */
                .mini-stat-card { display: flex; flex-direction: column; justify-content: center; gap: 10px; height: 100%; }
                .mini-stat-val { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; line-height: 1; }
                .mini-stat-val.warn { color: #0000ff; }
                .mini-stat-sub { font-size: 11px; color: var(--muted); margin-top: 4px; }

                /* NEW: top volunteers leaderboard */
                .lb-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
                .lb-row:last-child { border-bottom: none; }
                .lb-rank { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 14px; color: #999; width: 18px; }
                .lb-hours { font-size: 12px; font-weight: 700; color: var(--red); margin-left: auto; }

                /* Today's activities horizontal strip — click opens a modal instead of expanding inline */
                .today-strip { display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; padding-bottom: 4px; }
                .today-pill { flex: 0 0 auto; width: 220px; border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s; }
                .today-pill:hover { border-color: #ccc; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
                .today-pill .name { font-size: 13px; font-weight: 600; color: var(--ink); }
                .today-pill .meta { font-size: 11px; color: var(--muted); margin-top: 4px; }
                .today-pill .count { font-size: 11px; color: #0000ff; margin-top: 6px; font-weight: 600; }

                /* Activity detail modal status tag (reused in modal + card) */
                .status-tag { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px; background: #f0f0f0; color: #666; text-transform: capitalize; }

                /* NEW: recent activity log */
                .log-row { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
                .log-row:last-child { border-bottom: none; }
                .log-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--red); margin-top: 5px; flex-shrink: 0; }
                .log-time { color: #999; font-size: 11px; white-space: nowrap; margin-left: auto; }

                /* NEW: pending document count badge sa card title */
                .count-badge { margin-left: 8px; background: #fee2e2; color: #ff0000; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
            `}</style>

            {/* MODAL: Document Preview */}
            {previewDoc && (
                <div onClick={() => { setPreviewDoc(null); setIsPreviewMaximized(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '8px',
                            width: '100%',
                            maxWidth: isPreviewMaximized ? '95vw' : '860px',
                            maxHeight: isPreviewMaximized ? '95vh' : '90vh',
                            height: isPreviewMaximized ? '95vh' : 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            transition: 'max-width 0.2s ease, max-height 0.2s ease',
                        }}
                    >
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <ProfileAvatar doc={previewDoc} size={36} />
                                <div>
                                    <div style={{ fontFamily: 'Montserrat', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase' }}>{previewDoc.name}</div>
                                    <div style={{ fontSize: '12px', color: '#0000ff', fontWeight: '600', marginTop: '2px' }}>{previewDoc.type}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {(isImage(previewDoc) || isPdf(previewDoc)) && (
                                    <button
                                        onClick={() => setIsPreviewMaximized(m => !m)}
                                        title={isPreviewMaximized ? 'Shrink' : 'Palakihin ang preview'}
                                        style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#444' }}
                                    >
                                        {isPreviewMaximized ? '⤡ Shrink' : '⤢ Palakihin'}
                                    </button>
                                )}
                                <button onClick={() => { setPreviewDoc(null); setIsPreviewMaximized(false); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: isPreviewMaximized ? '0px 1fr' : '240px 1fr' }}>
                            {!isPreviewMaximized && (
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
                            )}
                            <div style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isPreviewMaximized ? '100%' : '400px', overflow: 'hidden' }}>
                                {previewDoc.file_url ? (
                                    isImage(previewDoc) ? (
                                        <img
                                            src={previewDoc.file_url}
                                            alt={previewDoc.type}
                                            onClick={() => setIsPreviewMaximized(m => !m)}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: isPreviewMaximized ? '90vh' : '55vh',
                                                objectFit: 'contain',
                                                margin: isPreviewMaximized ? 0 : '20px',
                                                cursor: 'zoom-in',
                                            }}
                                        />
                                    ) : isPdf(previewDoc) ? (
                                        <iframe
                                            src={`${previewDoc.file_url}#toolbar=1`}
                                            style={{ width: '100%', height: isPreviewMaximized ? '100%' : '55vh', border: 'none' }}
                                            title={previewDoc.type}
                                        />
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
                            <button onClick={() => { setPreviewDoc(null); setIsPreviewMaximized(false); }} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Today's Activity detail (replaces old inline accordion expand) */}
            {selectedActivity && (
                <div
                    onClick={() => setSelectedActivity(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'white', borderRadius: '10px', width: '100%', maxWidth: '480px', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '17px', fontWeight: '700', color: '#111' }}>{selectedActivity.name}</div>
                                {selectedActivity.status && (
                                    <span className="status-tag" style={{ marginTop: '6px', display: 'inline-block' }}>{selectedActivity.status}</span>
                                )}
                            </div>
                            <button onClick={() => setSelectedActivity(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
                        </div>
                        <div style={{ padding: '20px 22px' }}>
                            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '10px' }}>
                                <strong style={{ color: '#111' }}>Time:</strong> {selectedActivity.time}
                            </div>
                            {selectedActivity.location && (
                                <div style={{ fontSize: '13px', color: '#374151', marginBottom: '10px' }}>
                                    <strong style={{ color: '#111' }}>Location:</strong> {selectedActivity.location}
                                </div>
                            )}
                            <div style={{ fontSize: '13px', color: '#0000ff', fontWeight: '600', marginBottom: '14px' }}>
                                {selectedActivity.assignedCount} assigned
                            </div>
                            {selectedActivity.description && (
                                <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', marginBottom: '14px' }}>
                                    {selectedActivity.description}
                                </div>
                            )}
                            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6', marginBottom: '18px' }}>
                                <strong style={{ color: '#333' }}>Assigned:</strong>{' '}
                                {selectedActivity.assignedNames && selectedActivity.assignedNames.length > 0
                                    ? selectedActivity.assignedNames.join(', ')
                                    : 'Wala pang naka-assign'}
                            </div>
                            <Link href={route('admin.activities.edit', selectedActivity.id)} style={{ fontSize: '13px', fontWeight: '600', color: '#0000ff', textDecoration: 'none' }}>
                                View full activity →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERT */}
            {pendingCount > 0 && (
                <div className="alert">
                    <span style={{ fontSize: '14px', color: '#92400e', fontWeight: '500' }}>
                        You have <strong>{pendingCount}</strong> volunteer{pendingCount > 1 ? 's' : ''} waiting for approval.
                    </span>
                    <Link href={route('admin.volunteers')} style={{ background: '#f59e0b', color: 'white', padding: '7px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>Review Now →</Link>
                </div>
            )}

            {/* FLAGGED THIS WEEK / TOP VOLUNTEERS */}
            <div className="grid2">
                <Link href={route('admin.reports.index', { status: 'flagged' })} className="card mini-stat-card" style={{ textDecoration: 'none' }}>
                    <div className="card-title" style={{ marginBottom: 0 }}>Flagged This Week</div>
                    <div>
                        <div className={`mini-stat-val ${flaggedThisWeek > 0 ? 'warn' : ''}`}>{flaggedThisWeek}</div>
                        <div className="mini-stat-sub">Geofence violations · click to review</div>
                    </div>
                </Link>

                <div className="card">
                    <div className="card-title">Top Volunteers</div>
                    {topVolunteers.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '10px 0' }}>No hours recorded yet</div>
                    ) : topVolunteers.map((v, i) => {
                        const [bg, color] = avatarColors[i % avatarColors.length];
                        return (
                            <div key={i} className="lb-row">
                                <span className="lb-rank">{i + 1}</span>
                                {v.photo
                                    ? <img src={v.photo} alt={v.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                    : <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', color }}>{v.initials}</div>
                                }
                                <span className="vol-name" style={{ fontSize: '12px' }}>{v.name}</span>
                                <span className="lb-hours">{v.hours}h</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* TODAY'S ACTIVITIES — click a pill to open the detail modal */}
            <div className="card full-card">
                <div className="card-title">Today's Activities</div>
                {todaysActivities.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '10px 0' }}>Walang naka-schedule ngayong araw</div>
                ) : (
                    <div className="today-strip">
                        {todaysActivities.map((a) => (
                            <div
                                key={a.id}
                                className="today-pill"
                                onClick={() => setSelectedActivity(a)}
                            >
                                <div className="name">{a.name}</div>
                                <div className="meta">{a.time}{a.location ? ` · ${a.location}` : ''}</div>
                                <div className="count">{a.assignedCount} assigned</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RECENT VOLUNTEERS + ANALYTICS CHART */}
            <div className="grid2">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div className="card-title">Recent Volunteers</div>
                        <Link href={route('admin.volunteers')} className="view-all">View all →</Link>
                    </div>
                    <div className="vol-list-scroll">
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
                                        {vol.is_online ? (
                                            <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>● Online</span>
                                        ) : (
                                            <span className="badge" style={{ background: '#f5f5f5', color: '#999' }}>○ Offline</span>
                                        )}
                                        <span className="badge" style={statusBadge(vol.status)}>{vol.status}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
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
                            style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A1A', border: '1px solid #EDEDED', borderRadius: '6px', padding: '4px 8px', background: '#fff', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}
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
                    <div className="card-title" style={{ marginBottom: 0 }}>
                        Pending Documents
                        {pendingDocuments.length > 0 && (
                            <span className="count-badge">{pendingDocuments.length}</span>
                        )}
                    </div>
                    <Link href={route('admin.documents.index')} className="view-all">View all →</Link>
                </div>
                {pendingDocuments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '20px 0' }}>No pending documents</div>
                ) : pendingDocuments.map((doc, i) => {
                    const [bg, color] = avatarColors[doc.color_id ?? i % avatarColors.length];
                    return (
                        <div key={i} onClick={() => { setPreviewDoc(doc); setIsPreviewMaximized(false); }} className="vol-row" style={{ cursor: 'pointer' }}
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

            {/* NEW: RECENT ACTIVITY LOG */}
            <div className="card full-card">
                <div className="card-title">Recent Activity</div>
                {recentActivityLog.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '10px 0' }}>No recent activity</div>
                ) : recentActivityLog.map((log, i) => (
                    <div key={i} className="log-row">
                        <span className="log-dot" />
                        <span>{log.text}</span>
                        <span className="log-time">{log.time}</span>
                    </div>
                ))}
            </div>

        </>
    );
}

// ✅ ITO ANG SUSI: sinasabi sa Inertia na gamitin ang AdminLayout bilang persistent wrapper.
// Hindi na nire-render ulit ang sidebar sa tuwing magpapalit ng page.
AdminDashboard.layout = (page) => <AdminLayout title="Dashboard">{page}</AdminLayout>;

export default AdminDashboard;