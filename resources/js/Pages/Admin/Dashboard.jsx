import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

// ✅ small status pill — same visual language as the one used in 201 Files
function StatusPill({ status }) {
    const map = {
        approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
        rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
        pending:  { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    };
    const s = map[status] ?? map.pending;
    return (
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '.3px' }}>
            {s.label}
        </span>
    );
}

// ✅ NEW — small outline SVG icons for the stat cards, replacing the old emoji
// icons (👥📋✅🟢) for a more professional look. Stroke color is passed in so
// it can flip to the "active/attention" tint on the Pending Approvals card.
function StatIcon({ name, stroke = '#6B6B6B' }) {
    const common = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (name === 'users') {
        return (
            <svg {...common}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        );
    }
    if (name === 'pending') {
        return (
            <svg {...common}>
                <rect x="9" y="2" width="6" height="4" rx="1" />
                <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
                <path d="M9 14l2 2 4-4" />
            </svg>
        );
    }
    if (name === 'checkedin') {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        );
    }
    // 'available'
    return (
        <svg {...common}>
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" fill={stroke} stroke="none" />
        </svg>
    );
}

// ✅ NEW — plain SVG icons replacing the raw unicode symbols (✕, ⤢, ⤡) that
// were causing 
//  style mojibake when the file's encoding wasn't
// preserved end-to-end. SVGs render identically regardless of file/HTTP
// encoding, so this fixes it for good.
function CloseIcon({ size = 16, stroke = '#888' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
        </svg>
    );
}
function ExpandIcon({ size = 14, stroke = '#444' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" />
        </svg>
    );
}
function ShrinkIcon({ size = 14, stroke = '#444' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14h6v6" /><path d="M20 10h-6V4" /><path d="M14 10l7-7" /><path d="M3 21l7-7" />
        </svg>
    );
}

function AdminDashboard({
    pendingCount,
    totalVolunteers,
    activeToday,
    onlineNowCount = 0, // ✅ BAGO — totoong "online ngayon" count galing sa is_online column
    recentVolunteers = [],
    pendingDocuments = [],
    volunteerStats = { active: 0, incompleteDocs: 0, inactive: 0 },
    upcomingEvents = [],
    quickStats = {},
    // shape: { "2026": [{ month: 'Jan', attended: 62, missed: 10 }, ...], "2025": [...] }
    // Automatically comes from the backend (Attendance table) — no hardcoded dummy data.
    activityStatsByYear = {},
    // NEW props
    flaggedThisWeek = 0,
    topVolunteers = [],
    todaysActivities = [],
    recentActivityLog = [],
    // NEW: optional trend text for the "Active Volunteers" stat card. Wire this up to a
    // real backend value (e.g. volunteers created this month) once available; falls back
    // to a generic label if not provided.
    newVolunteersThisMonth = null,
}) {
    const [previewDoc, setPreviewDoc] = useState(null);
    const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [volunteerAlertDismissed, setVolunteerAlertDismissed] = useState(false);
    const [dismissedDocKeys, setDismissedDocKeys] = useState(() => new Set());
    // ✅ NEW — disables Approve/Reject buttons while a request is in flight
    const [approving, setApproving] = useState(false);
    // ✅ controls the "Pending Approvals" list modal opened from the stat card
    const [showPendingList, setShowPendingList] = useState(false);
    const thisYear = new Date().getFullYear();
    const availableYears = Object.keys(activityStatsByYear).map(Number).sort((a, b) => b - a);
    const yearOptions = availableYears.includes(thisYear) ? availableYears : [thisYear, ...availableYears];
    const [selectedYear, setSelectedYear] = useState(thisYear);
    const activityStats = activityStatsByYear[selectedYear] ?? [];

    // ✅ BAGO — auto-refresh ng live counters (online now, checked-in, pending, atbp.)
    // kada 10 seconds gamit ang Inertia partial reload. Walang full page reload,
    // walang scroll jump, at hindi mawawala yung mga naka-open na modal/state.
    React.useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: [
                    'onlineNowCount',
                    'recentVolunteers',
                    'activeToday',
                    'pendingCount',
                    'pendingDocuments',
                    'totalVolunteers',
                ],
                preserveScroll: true,
                preserveState: true,
            });
        }, 10000); // 10 seconds — i-adjust kung gusto mas mabilis/mabagal

        return () => clearInterval(interval);
    }, []);

    // ✅ UPDATED — coordinated avatar palette (coral / blue / green / purple / teal)
    // instead of the old mismatched set. Used consistently across Top Volunteers,
    // Recent Volunteers, and the Pending Documents modal so the same person always
    // reads with the same "identity color" across the dashboard.
    const avatarColors = [
        ['#F0997B', '#4A1B0C'], // coral
        ['#85B7EB', '#042C53'], // blue
        ['#97C459', '#173404'], // green
        ['#AFA9EC', '#26215C'], // purple
        ['#5DCAA5', '#04342C'], // teal
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

    // ✅ UPDATED — download is gated by status. Docs on this dashboard are
    // pending by default (that's why they're here), so this mostly guards
    // against the brief moment right after Approve succeeds. The real
    // enforcement lives server-side in DocumentController@download.
    const handleDownload = async (doc) => {
        if (!doc.file_url) return;
        if ((doc.status ?? 'pending') !== 'approved') return;
        const fileName = `${doc.name}_${doc.type}`.replace(/\s+/g, '_') + (isPdf(doc) ? '.pdf' : '');
        try {
            const response = await fetch(route('admin.documents.download', doc.id));
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = fileName;
            document.body.appendChild(link); link.click();
            document.body.removeChild(link); URL.revokeObjectURL(url);
        } catch {
            window.location.href = route('admin.documents.download', doc.id);
        }
    };

    // ✅ UPDATED — chart colors reworked so the dashboard has a single, clean
    // color language:
    //   • Attended  → brand red (#ff0000) stays, since it's the "positive"
    //     metric we want the eye drawn to on this chart specifically.
    //   • Missed    → neutral gray (#B4B2A9), unambiguous "off" state.
    // NOTE: if you want Attended fully decoupled from the "Pending Approvals"
    // alert red, swap ATTENDED_COLOR below to a blue (e.g. '#1d4ed8') — left
    // as a single constant so it's a one-line change.
    const ATTENDED_COLOR = '#1d4ed8'; // blue — no longer visually competes with the red "attention" cards
    const MISSED_COLOR = '#B4B2A9';   // neutral gray

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
                            <rect x={x} y={yBottom - attendedH} width={barW} height={Math.max(attendedH, 0)} rx="3" fill={ATTENDED_COLOR} />
                            <rect x={x} y={yBottom - barH} width={barW} height={Math.max(missedH - 2, 0)} rx="3" fill={MISSED_COLOR} />
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

    // --- PENDING DOCUMENTS: list state ---
    const [pendingDocs, setPendingDocs] = useState(pendingDocuments);

    React.useEffect(() => {
        setPendingDocs(pendingDocuments);
    }, [pendingDocuments]);

    // --- PENDING DOCUMENTS: "viewed" state (only affects the badge count, not the list) ---
    // A doc's key is its id (falls back to array index if no id is present, matching the list render below).
    const [viewedDocKeys, setViewedDocKeys] = useState(() => new Set());

    const docKey = (doc, idx) => doc.id ?? idx;

    const unviewedCount = pendingDocs.filter((doc, idx) => !viewedDocKeys.has(docKey(doc, idx))).length;

    // Group pending documents by volunteer (prefer volunteer_id kung meron, fallback sa name)
    // para isang banner lang per volunteer kahit marami silang pending docs, may count na.
    const groupedPendingDocs = React.useMemo(() => {
        const groups = new Map();
        pendingDocs.forEach((doc, idx) => {
            const groupKey = doc.volunteer_id ?? doc.name;
            if (!groups.has(groupKey)) {
                groups.set(groupKey, { groupKey, name: doc.name, docs: [] });
            }
            groups.get(groupKey).docs.push({ ...doc, _idx: idx });
        });
        return Array.from(groups.values());
    }, [pendingDocs]);

    const handleViewDocument = (doc, idx) => {
        setPreviewDoc(doc);
        setIsPreviewMaximized(false);

        const key = docKey(doc, idx);
        if (!viewedDocKeys.has(key)) {
            setViewedDocKeys(prev => new Set(prev).add(key));

            // OPTIONAL: persist "viewed" state to the backend so the badge stays correct
            // after a page refresh / for other admins. Wire this up to a real route once
            // you have one, e.g.:
            // router.post(route('admin.documents.markViewed', doc.id), {}, { preserveState: true, preserveScroll: true });
        }
    };

    // ✅ NEW — Approve / Reject right here on the Dashboard, walang navigate
    // papuntang 201 Files. Optimistic: agad na-remove sa pendingDocs list at
    // sa banner count, saka isinasara ang modal, habang tumatakbo sa likod
    // ang actual request. Naka-rollback kung mag-fail sa server.
    const handleApprove = (doc) => {
        setApproving(true);
        router.patch(route('admin.documents.approve', doc.id), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['pendingDocuments', 'pendingCount'],
            onSuccess: () => {
                setPendingDocs((prev) => prev.filter((d) => d.id !== doc.id));
                setPreviewDoc((p) => (p && p.id === doc.id ? null : p));
            },
            onFinish: () => setApproving(false),
            onError: () => {
                alert('Hindi na-approve ang document. Pakisubukan ulit.');
            },
        });
    };

    const handleReject = (doc) => {
        setApproving(true);
        router.patch(route('admin.documents.reject', doc.id), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['pendingDocuments', 'pendingCount'],
            onSuccess: () => {
                setPendingDocs((prev) => prev.filter((d) => d.id !== doc.id));
                setPreviewDoc((p) => (p && p.id === doc.id ? null : p));
            },
            onFinish: () => setApproving(false),
            onError: () => {
                alert('Hindi na-reject ang document. Pakisubukan ulit.');
            },
        });
    };

    // --- STAT CARDS (Active Volunteers / Pending Approvals / Checked In Today / Available Volunteers) ---
    const pendingDocsCount = pendingDocs.filter((doc, idx) => !dismissedDocKeys.has(docKey(doc, idx))).length;
    const totalPendingApprovals = (pendingCount ?? 0) + pendingDocsCount;

    // ✅ BAGO — SAFE route lookup helper, reusable sa lahat ng stat cards.
    // Kung wala pang route na ganyan sa web.php, huwag mag-crash ang buong
    // Dashboard — bumalik na lang sa null (card mag-i-display pero hindi
    // clickable) hanggang magawa yung route/controller/page.
    const safeRoute = (name, params) => {
        try {
            return route(name, params);
        } catch (e) {
            return null;
        }
    };

    // ✅ UPDATED — "needsAttention" flag drives the tinted/urgent treatment on
    // the Pending Approvals card. icon/iconBg are now only used as fallbacks;
    // the actual rendering below picks colors based on this flag.
    const statCards = [
        {
            key: 'active',
            label: 'Active Volunteers',
            icon: 'users',
            value: totalVolunteers ?? 0,
            sub: newVolunteersThisMonth
                ? `+${newVolunteersThisMonth} this month`
                : 'Total registered volunteers',
            // ✅ BAGO — clickable papunta sa Volunteers list
            href: safeRoute('admin.volunteers'),
        },
        {
            key: 'pending',
            label: 'Pending Approvals',
            icon: 'pending',
            value: totalPendingApprovals,
            sub: `${pendingDocsCount} document${pendingDocsCount === 1 ? '' : 's'}, ${pendingCount ?? 0} account${(pendingCount ?? 0) === 1 ? '' : 's'}`,
            // Click → bubuksan yung "Pending Approvals" list modal (see showPendingList).
            href: null,
            onClick: () => setShowPendingList(true),
            needsAttention: totalPendingApprovals > 0,
        },
        {
            key: 'checkedin',
            label: 'Checked In Today',
            icon: 'checkedin',
            value: activeToday ?? 0,
            sub: `of ${totalVolunteers ?? 0} available`,
            // ⏳ TODO: palitan 'admin.attendance.index' ng tamang route name mo
            // pag alam mo na (o gawin muna natin yung Attendance page/route).
            href: null,
        },
        {
            key: 'available',
            label: 'Available Volunteers',
            icon: 'available',
            // ✅ BAGO — totoong online-ngayon count (is_online), hindi na yung
            // "hindi pa naka-check-in ngayon" na dating logic. Ito rin yung
            // nire-refresh ng polling useEffect sa taas, kaya "real-time" na siya.
            value: onlineNowCount,
            sub: 'Online right now',
            href: safeRoute('admin.volunteers', { online: 1 }),
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />

            <style>{`
                .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
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
                .btn-red:disabled, .btn-green:disabled { opacity: 0.6; cursor: not-allowed; }
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

                /* ✅ UPDATED — top-of-dashboard overview stat cards now support a
                   "needs attention" tinted state (used by Pending Approvals when
                   its value > 0), so it visually stands out from the neutral cards
                   instead of looking identical to Active Volunteers / Checked In. */
                .stat-card { display: flex; flex-direction: column; border-color: #EDEDED; }
                .stat-card.attention { background: #FCEBEB; border-color: #F0C9C9; }
                .stat-card-top { display: flex; align-items: flex-start; justify-content: space-between; }
                .stat-card-label { font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: .4px; line-height: 1.4; max-width: 75%; }
                .stat-card.attention .stat-card-label { color: #791F1F; }
                .stat-card-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #F5F5F5; }
                .stat-card.attention .stat-card-icon { background: #F7C1C1; }
                .stat-card-value { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; color: #111; margin-top: 16px; line-height: 1; }
                .stat-card.attention .stat-card-value { color: #791F1F; }
                .stat-card-sub { font-size: 11px; color: var(--muted); margin-top: 6px; }
                .stat-card.attention .stat-card-sub { color: #A32D2D; }
                .stat-card-clickable { cursor: pointer; text-decoration: none; color: inherit; transition: box-shadow 0.15s, border-color 0.15s, transform 0.1s; }
                .stat-card-clickable:hover { border-color: #d4d4d4; box-shadow: 0 4px 14px rgba(0,0,0,0.07); transform: translateY(-1px); }
                .stat-card.attention.stat-card-clickable:hover { border-color: #e29a9a; }
                @media (max-width: 1100px) {
                    .grid4.stat-grid { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 560px) {
                    .grid4.stat-grid { grid-template-columns: 1fr; }
                }

                /* ✅ UPDATED — top volunteers leaderboard. Rank is now a small
                   circular badge (instead of a bare number) so every row reads
                   as "ranked list item" at a glance, not just row #1. #1 gets an
                   amber badge + slightly bigger avatar + bold name for weight;
                   #2-#4 get a neutral gray badge, all same size — consistent
                   instead of "only #1 looks special, rest look like a flat list". */
                .lb-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
                .lb-row:last-child { border-bottom: none; }
                .lb-rank-badge { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 11px; flex-shrink: 0; background: #F0F0F0; color: #888; }
                .lb-row.lb-first .lb-rank-badge { background: #FAC775; color: #633806; }
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

                /* NEW: pending document count badge on card title */
                .count-badge { margin-left: 8px; background: #fee2e2; color: #ff0000; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }

                /* NEW: "unread" dot next to a pending document row that hasn't been viewed yet */
                .unread-dot { width: 7px; height: 7px; border-radius: 50%; background: #ff0000; flex-shrink: 0; margin-right: 2px; }

                .btn-approve:disabled, .btn-reject:disabled { opacity: .6; cursor: not-allowed; }
            `}</style>

            {/* MODAL: Pending Approvals List — bubukas pag-click sa "Pending Approvals" stat
                card. Listahan ng mga volunteer na may pending documents. Click ng row →
                sasara ang modal na ito at bubukas ang document review modal (existing
                handleViewDocument), doon na mag-a-approve/reject si admin. */}
            {showPendingList && (
                <div onClick={() => setShowPendingList(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'white', borderRadius: '10px', width: '100%', maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: '700', color: '#111' }}>
                                Pending Document Review ({pendingDocsCount})
                            </div>
                            <button onClick={() => setShowPendingList(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}><CloseIcon /></button>
                        </div>
                        <div style={{ overflowY: 'auto' }}>
                            {groupedPendingDocs.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '30px 0' }}>No pending documents.</div>
                            ) : groupedPendingDocs.flatMap((group, gi) => {
                                const remainingDocs = group.docs.filter(d => !dismissedDocKeys.has(docKey(d, d._idx)));
                                const [bg, color] = avatarColors[gi % avatarColors.length];
                                return remainingDocs.map((doc) => (
                                    <div
                                        key={docKey(doc, doc._idx)}
                                        onClick={() => {
                                            setShowPendingList(false);
                                            handleViewDocument(doc, doc._idx);
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            padding: '16px 24px', borderBottom: '1px solid #f0f0f0',
                                            cursor: 'pointer', transition: 'background .12s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {doc.photo
                                            ? <img src={doc.photo} alt={group.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                            : <div style={{ width: 44, height: 44, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color, flexShrink: 0 }}>{doc.initials}</div>
                                        }
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 15, fontWeight: 500, color: '#111' }}>{group.name}</div>
                                            <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, marginTop: 2 }}>{doc.type}</div>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ff0000', whiteSpace: 'nowrap' }}>Review →</div>
                                    </div>
                                ));
                            })}
                        </div>
                        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowPendingList(false)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '9px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Document Preview — ✅ NOW WITH APPROVE / REJECT built right in,
                kaya hindi na kailangan mag-navigate papuntang 201 Files para lang mag-review. */}
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ fontFamily: 'Montserrat', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase' }}>{previewDoc.name}</div>
                                        <StatusPill status={previewDoc.status ?? 'pending'} />
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#0000ff', fontWeight: '600', marginTop: '2px' }}>{previewDoc.type}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {(isImage(previewDoc) || isPdf(previewDoc)) && (
                                    <button
                                        onClick={() => setIsPreviewMaximized(m => !m)}
                                        title={isPreviewMaximized ? 'Shrink' : 'Enlarge preview'}
                                        style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#444', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        {isPreviewMaximized ? <ShrinkIcon /> : <ExpandIcon />}
                                        {isPreviewMaximized ? 'Shrink' : 'Enlarge'}
                                    </button>
                                )}
                                <button onClick={() => { setPreviewDoc(null); setIsPreviewMaximized(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}><CloseIcon /></button>
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
                                            {(previewDoc.status ?? 'pending') === 'approved' && (
                                                <button onClick={() => handleDownload(previewDoc)} style={{ background: 'none', border: 'none', color: '#FF0000', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Download →</button>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px' }}>No file attached.</div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer — ✅ NEW: Approve / Reject on the left, Download / Close on the right.
                            🔒 Download only shows once status === 'approved' — kaya't hangga't pending,
                            walang paraan i-download ang file dito. */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {(previewDoc.status ?? 'pending') !== 'approved' && (
                                    <button
                                        className="btn-approve"
                                        disabled={approving}
                                        onClick={() => handleApprove(previewDoc)}
                                        style={{ background: '#16a34a', border: 'none', color: '#fff', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Approve
                                    </button>
                                )}
                                {(previewDoc.status ?? 'pending') !== 'rejected' && (
                                    <button
                                        className="btn-reject"
                                        disabled={approving}
                                        onClick={() => handleReject(previewDoc)}
                                        style={{ background: '#fff', border: '1px solid #dc2626', color: '#dc2626', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Reject
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {previewDoc.file_url && (previewDoc.status ?? 'pending') === 'approved' && (
                                    <button onClick={() => handleDownload(previewDoc)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Download</button>
                                )}
                                {previewDoc.file_url && (previewDoc.status ?? 'pending') !== 'approved' && (
                                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>Download locked until approved</span>
                                )}
                                <button onClick={() => { setPreviewDoc(null); setIsPreviewMaximized(false); }} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                            </div>
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
                            <button onClick={() => setSelectedActivity(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}><CloseIcon /></button>
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
                                    : 'No one assigned yet'}
                            </div>
                            <Link href={route('admin.activities.edit', selectedActivity.id)} style={{ fontSize: '13px', fontWeight: '600', color: '#0000ff', textDecoration: 'none' }}>
                                View full activity →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERT: volunteer approval — disappears immediately once "Review Now" is clicked */}
            {pendingCount > 0 && !volunteerAlertDismissed && (
                <div className="alert">
                    <span style={{ fontSize: '14px', color: '#92400e', fontWeight: '500' }}>
                        You have <strong>{pendingCount}</strong> volunteer{pendingCount > 1 ? 's' : ''} waiting for approval.
                    </span>
                    <button
                        onClick={() => {
                            setVolunteerAlertDismissed(true);
                            router.visit(route('admin.volunteers'));
                        }}
                        style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '7px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Review Now →
                    </button>
                </div>
            )}

            {/* OVERVIEW STAT CARDS — Active Volunteers / Pending Approvals / Checked In Today / Available Volunteers.
                Supports both href (Link navigation) at onClick (opens the Pending Approvals
                list modal in-page). ✅ UPDATED — Pending Approvals now gets a tinted
                "needs attention" treatment when its value > 0, and all icons are now
                clean outline SVGs instead of emoji. */}
            <div className="grid4 stat-grid">
                {statCards.map(sc => {
                    const CardTag = sc.href ? Link : 'div';
                    const attentionClass = sc.needsAttention ? ' attention' : '';
                    const cardProps = sc.href
                        ? { href: sc.href, className: `card stat-card stat-card-clickable${attentionClass}` }
                        : sc.onClick
                            ? { onClick: sc.onClick, className: `card stat-card stat-card-clickable${attentionClass}`, role: 'button', tabIndex: 0 }
                            : { className: `card stat-card${attentionClass}` };
                    const iconStroke = sc.needsAttention ? '#A32D2D' : '#6B6B6B';
                    return (
                        <CardTag key={sc.key} {...cardProps}>
                            <div className="stat-card-top">
                                <div className="stat-card-label">{sc.label}</div>
                                <div className="stat-card-icon">
                                    <StatIcon name={sc.icon} stroke={iconStroke} />
                                </div>
                            </div>
                            <div className="stat-card-value">{sc.value}</div>
                            <div className="stat-card-sub">{sc.sub}</div>
                        </CardTag>
                    );
                })}
            </div>

            {/* TOP VOLUNTEERS + VOLUNTEER ACTIVITY (moved here, side by side) */}
            <div className="grid2">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div className="card-title" style={{ marginBottom: 0 }}>Top Volunteers</div>
                        <Link href={route('admin.volunteers')} className="view-all">View all →</Link>
                    </div>
                    {topVolunteers.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '10px 0' }}>No hours recorded yet</div>
                    ) : topVolunteers.map((v, i) => {
                        const [bg, color] = avatarColors[i % avatarColors.length];
                        const isFirst = i === 0;
                        return (
                            <div key={i} className={`lb-row${isFirst ? ' lb-first' : ''}`}>
                                <span className="lb-rank-badge">{i + 1}</span>
                                {v.photo
                                    ? <img src={v.photo} alt={v.name} style={{ width: isFirst ? 32 : 28, height: isFirst ? 32 : 28, borderRadius: '50%', objectFit: 'cover' }} />
                                    : <div style={{ width: isFirst ? 32 : 28, height: isFirst ? 32 : 28, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isFirst ? 11 : 10, fontWeight: '600', color }}>{v.initials}</div>
                                }
                                <span className="vol-name" style={{ fontSize: isFirst ? 13 : 12, fontWeight: isFirst ? 700 : 500 }}>{v.name}</span>
                                <span className="lb-hours" style={{ fontSize: isFirst ? 13 : 12 }}>{v.hours}h</span>
                            </div>
                        );
                    })}
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div className="card-title" style={{ marginBottom: 0 }}>Volunteer Activity</div>
                        <div style={{ display: 'flex', gap: 12, fontSize: '11px', color: '#6B6B6B' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: ATTENDED_COLOR, display: 'inline-block' }} />Attended
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: MISSED_COLOR, display: 'inline-block' }} />Missed
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
                        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '50px 0' }}>No attendance records yet for {selectedYear}</div>
                    ) : (
                        <AnalyticsChart data={activityStats} />
                    )}
                </div>
            </div>

            {/* TODAY'S ACTIVITIES — click a pill to open the detail modal */}
            <div className="card full-card">
                <div className="card-title">Today's Activities</div>
                {todaysActivities.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '10px 0' }}>Nothing scheduled for today</div>
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

            {/* RECENT VOLUNTEERS — now on its own full-width row */}
            <div className="card full-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="card-title" style={{ marginBottom: 0 }}>Recent Volunteers</div>
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

// ✅ THIS IS THE KEY PART: tells Inertia to use AdminLayout as the persistent wrapper.
// The sidebar is no longer re-rendered every time the page changes.
AdminDashboard.layout = (page) => <AdminLayout title="Dashboard">{page}</AdminLayout>;

export default AdminDashboard;
