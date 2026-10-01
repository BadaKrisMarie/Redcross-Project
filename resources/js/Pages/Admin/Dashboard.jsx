import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TodayActivitiesCard from '@/Components/Admin/Dashboard/TodayActivitiesCard';
import AnalyticsChartCard from '@/Components/Admin/Dashboard/AnalyticsChartCard';
import ChapterProgressCard from '@/Components/Admin/Dashboard/ChapterProgressCard';
import TopVolunteersCard from '@/Components/Admin/Dashboard/TopVolunteersCard';
import PendingListModal from '@/Components/Admin/Dashboard/PendingListModal';
import DashboardDocModal from '@/Components/Admin/Dashboard/DashboardDocModal';
import ActivityDetailModal from '@/Components/Admin/Dashboard/ActivityDetailModal';
import { Search, SlidersHorizontal } from 'lucide-react';

function AdminDashboard({
    pendingCount = 0,
    totalVolunteers = 0,
    activeToday = 0,
    onlineNowCount = 0,
    recentVolunteers = [],
    pendingDocuments = [],
    volunteerStats = { active: 0, incompleteDocs: 0, inactive: 0 },
    upcomingEvents = [],
    quickStats = {},
    activityStatsByYear = {},
    flaggedThisWeek = 0,
    topVolunteers = [],
    todaysActivities = [],
    recentActivityLog = [],
    newVolunteersThisMonth = null,
}) {
    const [previewDoc, setPreviewDoc] = useState(null);
    const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [dismissedDocKeys, setDismissedDocKeys] = useState(() => new Set());
    const [approving, setApproving] = useState(false);
    const [showPendingList, setShowPendingList] = useState(false);
    const [dashSearch, setDashSearch] = useState('');

    const thisYear = new Date().getFullYear();
    const availableYears = Object.keys(activityStatsByYear).map(Number).sort((a, b) => b - a);
    const yearOptions = availableYears.includes(thisYear) ? availableYears : [thisYear, ...availableYears];
    const [selectedYear, setSelectedYear] = useState(thisYear);
    const activityStats = activityStatsByYear[selectedYear] ?? [];

    // Periodic live counter refresh
    useEffect(() => {
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
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const [pendingDocs, setPendingDocs] = useState(pendingDocuments);
    useEffect(() => {
        setPendingDocs(pendingDocuments);
    }, [pendingDocuments]);

    const docKey = (doc, idx) => doc?.id ?? idx;

    const groupedPendingDocs = useMemo(() => {
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
    };

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
            onError: () => alert('Failed to approve document. Please try again.'),
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
            onError: () => alert('Failed to reject document. Please try again.'),
        });
    };

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
            const response = await fetch(route('admin.documents.download', doc.id));
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            window.location.href = route('admin.documents.download', doc.id);
        }
    };

    const pendingDocsCount = pendingDocs.filter((doc, idx) => !dismissedDocKeys.has(docKey(doc, idx))).length;
    const totalPendingApprovals = (pendingCount ?? 0) + pendingDocsCount;

    return (
        <>
            <Head title="Dashboard - Admin Portal" />

            <div className="space-y-6 max-w-[1440px] mx-auto pb-12">
                {/* Header: Title & Search/Filter matching EdTech+ layout */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                            Dashboard
                        </h1>
                    </div>

                    {/* Search bar + Filter pill button matching reference mockup */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-72 md:w-80">
                            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={dashSearch}
                                onChange={(e) => setDashSearch(e.target.value)}
                                placeholder="Search anything..."
                                className="w-full pl-11 pr-4 py-2.5 bg-white border-0 rounded-full text-xs text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/10 outline-none shadow-xs transition"
                            />
                        </div>

                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121212] hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {/* 2-Column Asymmetric Grid matching EdTech+ layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left Column (col-span-4): Select an Operation / Activities */}
                    <div className="lg:col-span-4">
                        <TodayActivitiesCard
                            todaysActivities={todaysActivities}
                            upcomingEvents={upcomingEvents}
                            onSelectActivity={setSelectedActivity}
                        />
                    </div>

                    {/* Right Column (col-span-8): Top Performance Graph + Bottom 2-col Split */}
                    <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
                        {/* Top: Performance Area Graph with Red Gradient */}
                        <AnalyticsChartCard
                            activityStats={activityStats}
                            selectedYear={selectedYear}
                            setSelectedYear={setSelectedYear}
                            yearOptions={yearOptions}
                        />

                        {/* Bottom Split (2 Columns): Chapter Progress & Top Volunteers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Chapter Operational Progress Card */}
                            <ChapterProgressCard
                                volunteerStats={volunteerStats}
                                pendingCount={totalPendingApprovals}
                                totalVolunteers={totalVolunteers}
                                onPendingClick={() => setShowPendingList(true)}
                            />

                            {/* Top Volunteers Leaderboard with Segmented Sliders */}
                            <TopVolunteersCard
                                topVolunteers={topVolunteers}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PendingListModal
                showPendingList={showPendingList}
                setShowPendingList={setShowPendingList}
                groupedPendingDocs={groupedPendingDocs}
                dismissedDocKeys={dismissedDocKeys}
                handleViewDocument={handleViewDocument}
                pendingDocsCount={pendingDocsCount}
                docKey={docKey}
            />

            <DashboardDocModal
                previewDoc={previewDoc}
                setPreviewDoc={setPreviewDoc}
                isPreviewMaximized={isPreviewMaximized}
                setIsPreviewMaximized={setIsPreviewMaximized}
                approving={approving}
                handleApprove={handleApprove}
                handleReject={handleReject}
                handleDownload={handleDownload}
                isImage={isImage}
                isPdf={isPdf}
            />

            <ActivityDetailModal
                selectedActivity={selectedActivity}
                setSelectedActivity={setSelectedActivity}
            />
        </>
    );
}

AdminDashboard.layout = (page) => <AdminLayout title="Dashboard">{page}</AdminLayout>;

export default AdminDashboard;
