import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import VolunteerLayout from '@/Layouts/VolunteerLayout';
import { detectDocumentType } from '@/utils/detectDocumentType';
import {
    Folder,
    FileText,
    Upload,
    Search,
    X,
    Trash2,
    Award,
    Briefcase,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    MapPin,
    Timer,
    GraduationCap,
    ClipboardList,
    BarChart3,
    Check,
    Minus,
    Download,
    Eye,
    ChevronRight,
    MoreVertical,
    FolderOpen,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   201 FILE — Volunteer Record Management (Google Drive Style)
   Patterned directly after the application's folder card design.
   ═══════════════════════════════════════════════════════════════ */

// ── Helpers ──
const fmtDate = (d, opts) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-PH', opts || { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtTime = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const fmtHours = (h) => {
    if (h == null) return '—';
    const num = parseFloat(h);
    if (isNaN(num)) return '—';
    return `${num.toFixed(1)}h`;
};

const fmtFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Arrival / Departure status calculators
function buildScheduleDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const datePart = String(dateStr).split('T')[0];
    const timePart = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    const dt = new Date(`${datePart}T${timePart}`);
    return isNaN(dt.getTime()) ? null : dt;
}

function minutesOfDay(date) {
    return date.getHours() * 60 + date.getMinutes();
}

function getArrivalStatus(record) {
    if (!record.time_in) return '—';
    const scheduleDate = record.activity?.date || record.date;
    const startTime = record.activity?.start_time;
    if (!startTime) return 'Present';

    const start = buildScheduleDateTime(scheduleDate, startTime);
    if (!start) return 'Present';

    const timeIn = new Date(record.time_in);
    const diff = minutesOfDay(timeIn) - minutesOfDay(start);

    if (diff < 0) return 'Early In';
    if (diff === 0) return 'On Time';
    return 'Late';
}

function getDepartureStatus(record) {
    if (!record.time_out) return '—';
    const scheduleDate = record.activity?.date || record.date;
    const endTime = record.activity?.end_time;
    if (!endTime) return 'Departed';

    const end = buildScheduleDateTime(scheduleDate, endTime);
    if (!end) return 'Departed';

    const timeOut = new Date(record.time_out);
    const diff = minutesOfDay(timeOut) - minutesOfDay(end);

    if (diff < 0) return 'Early Out';
    return 'On Time';
}

const statusBadgeClasses = (status) => {
    const key = String(status || '').toLowerCase().trim();
    if (['completed', 'approved', 'active', 'on time', 'early in', 'present', 'departed'].includes(key)) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (['pending', 'upcoming', 'early out', 'under review'].includes(key)) {
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (['rejected', 'late', 'cancelled'].includes(key)) {
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
};

const statusIcon = (status) => {
    const key = String(status || '').toLowerCase().trim();
    if (['completed', 'approved', 'active', 'on time', 'early in'].includes(key)) {
        return <CheckCircle2 className="w-3 h-3 shrink-0" />;
    }
    if (['pending', 'upcoming', 'under review', 'early out'].includes(key)) {
        return <Clock className="w-3 h-3 shrink-0" />;
    }
    if (['rejected', 'late', 'cancelled'].includes(key)) {
        return <AlertCircle className="w-3 h-3 shrink-0" />;
    }
    return null;
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function VolunteerDocuments({
    documents = [],
    categories: initialCategories = [],
    activities = [],
    attendances = [],
    attendanceSummary = {},
}) {
    // Current active main folder: 'training' | 'activities' | 'attendance' | 'documents'
    const [activeFolder, setActiveFolder] = useState('training');
    const [search, setSearch] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadPreselectedType, setUploadPreselectedType] = useState('training');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState('');
    const [detecting, setDetecting] = useState(false);
    const [detectionResult, setDetectionResult] = useState(null);
    const [manualOverride, setManualOverride] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [activityDetail, setActivityDetail] = useState(null);
    const [rowMenuOpenId, setRowMenuOpenId] = useState(null);

    const detectionRunId = useRef(0);
    const menuRef = useRef(null);

    const [categories, setCategories] = useState(initialCategories);
    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    const { data, setData, post, processing, reset, errors } = useForm({
        type: initialCategories[0]?.key || 'nbi',
        detection_source: 'manual',
        file: null,
    });

    const docs = documents || [];

    const docTypes = useMemo(() => {
        const map = {};
        categories.forEach((c) => {
            map[c.key] = { label: c.label, color: c.color || '#DC2626' };
        });
        return map;
    }, [categories]);

    // Close row menu on click outside
    useEffect(() => {
        const fn = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setRowMenuOpenId(null);
            }
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    useEffect(() => {
        setSelectedIds([]);
    }, [filterCategory, search, activeFolder]);

    // ── Training Records ──
    const trainingRecords = useMemo(() => {
        const list = docs.filter((d) => {
            const t = (d.type || '').toLowerCase();
            const n = (d.original_name || '').toLowerCase();
            return t === 'training' || t.includes('cert') || n.includes('training') || n.includes('cert');
        });

        if (!search.trim()) return list;
        const q = search.trim().toLowerCase();
        return list.filter(
            (d) =>
                (d.original_name || '').toLowerCase().includes(q) ||
                (docTypes[d.type]?.label || '').toLowerCase().includes(q)
        );
    }, [docs, search, docTypes]);

    // ── Filtered Activities ──
    const filteredActivities = useMemo(() => {
        if (!search.trim()) return activities;
        const q = search.trim().toLowerCase();
        return activities.filter(
            (a) =>
                (a.name || '').toLowerCase().includes(q) ||
                (a.location_name || '').toLowerCase().includes(q) ||
                (a.description || '').toLowerCase().includes(q)
        );
    }, [activities, search]);

    // ── Filtered Attendances ──
    const filteredAttendances = useMemo(() => {
        if (!search.trim()) return attendances;
        const q = search.trim().toLowerCase();
        return attendances.filter(
            (a) =>
                (a.activity?.name || '').toLowerCase().includes(q) ||
                fmtDate(a.date).toLowerCase().includes(q)
        );
    }, [attendances, search]);

    // ── Filtered 201 Documents ──
    const filteredDocs = useMemo(() => {
        let list = docs;
        if (filterCategory !== 'all') {
            list = list.filter((d) => d.type === filterCategory);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (d) =>
                    (d.original_name || '').toLowerCase().includes(q) ||
                    (docTypes[d.type]?.label || '').toLowerCase().includes(q)
            );
        }
        return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [docs, search, filterCategory, docTypes]);

    // ── Upload Handlers ──
    const openUploadModal = (preselected = 'training') => {
        setUploadPreselectedType(preselected);
        setData('type', preselected || categories[0]?.key || 'training');
        setShowUpload(true);
    };

    const validateAndSetFile = async (file) => {
        if (!file) {
            setData('file', null);
            setFileError('');
            setDetectionResult(null);
            return;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            setFileError('Only PDF, JPG, or PNG files are allowed.');
            setData('file', null);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`File too large (${fmtFileSize(file.size)}). Maximum size is 5MB.`);
            setData('file', null);
            return;
        }
        setFileError('');
        setData('file', file);
        setManualOverride(false);
        setDetectionResult(null);

        const runId = ++detectionRunId.current;
        setDetecting(true);
        const result = await detectDocumentType(file);
        if (runId !== detectionRunId.current) return;
        setDetecting(false);
        setDetectionResult(result);

        if (result.type) {
            setData((d) => ({ ...d, type: result.type, detection_source: result.source }));
        } else {
            setData((d) => ({ ...d, detection_source: 'manual' }));
        }
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!data.file || fileError) return;
        post(route('volunteer.documents.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setFileError('');
                setShowUpload(false);
                setDetectionResult(null);
                setManualOverride(false);
            },
        });
    };

    // ── Deletion Handlers ──
    const handleDelete = (id) => {
        setDeleteModal({ open: true, id });
        setRowMenuOpenId(null);
    };

    const confirmDelete = () => {
        router.delete(route('volunteer.documents.destroy', deleteModal.id), {
            onSuccess: () => setDeleteModal({ open: false, id: null }),
        });
    };

    const confirmBulkDelete = () => {
        router.delete(route('volunteer.documents.bulkDestroy'), {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                setBulkDeleteModal(false);
            },
        });
    };

    // ── Multi-selection ──
    const allSelected = filteredDocs.length > 0 && selectedIds.length === filteredDocs.length;
    const someSelected = selectedIds.length > 0 && !allSelected;
    const toggleSelectAll = () => setSelectedIds(allSelected ? [] : filteredDocs.map((d) => d.id));
    const toggleSelectOne = (id) =>
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const showAutoBadge = detectionResult?.type && !manualOverride;

    const handleDownload = (doc) => {
        if (doc.download_url) {
            window.location.href = doc.download_url;
        } else {
            window.location.href = route('volunteer.documents.download', doc.id);
        }
    };

    // Google Drive 4 main 201 File folders configuration
    const mainFolders = [
        {
            key: 'training',
            label: 'Training & Certifications',
            countLabel: `${trainingRecords.length} ${trainingRecords.length === 1 ? 'file' : 'files'}`,
        },
        {
            key: 'activities',
            label: 'Assignment History',
            countLabel: `${activities.length} ${activities.length === 1 ? 'activity' : 'activities'}`,
        },
        {
            key: 'attendance',
            label: 'Attendance & Hours',
            countLabel: `${attendanceSummary.totalDays || attendances.length} records • ${attendanceSummary.totalHours || 0}h`,
        },
        {
            key: 'documents',
            label: '201 Documents',
            countLabel: `${docs.length} ${docs.length === 1 ? 'file' : 'files'}`,
        },
    ];

    const currentFolderInfo = mainFolders.find((f) => f.key === activeFolder) || mainFolders[0];

    return (
        <div className="font-sans text-gray-900">
            <Head title="201 File — Volunteer Portal" />

            <div className="max-w-7xl mx-auto space-y-6 pb-16 px-2 sm:px-4">

                {/* ── TOP HEADER ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-1">
                            201 File
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => openUploadModal(activeFolder === 'training' ? 'training' : categories[0]?.key)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{activeFolder === 'training' ? 'Upload Certificate' : 'Upload Document'}</span>
                        </button>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    GOOGLE DRIVE "DOCUMENT FOLDERS" GRID
                    (Patterned directly after AdminDocumentsIndex)
                ══════════════════════════════════════════════ */}
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {mainFolders.map((folder) => {
                            const isSelected = activeFolder === folder.key;
                            return (
                                <div
                                    key={folder.key}
                                    onClick={() => {
                                        setActiveFolder(folder.key);
                                        setSearch('');
                                        setFilterCategory('all');
                                    }}
                                    className={`p-4 rounded-2xl transition cursor-pointer flex flex-col justify-between gap-3 relative group ${
                                        isSelected
                                            ? 'bg-red-50/70 ring-2 ring-red-500/20'
                                            : 'bg-white hover:bg-gray-50/80 shadow-xs'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div
                                            className={`p-2.5 rounded-xl shrink-0 transition ${
                                                isSelected ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-600'
                                            }`}
                                        >
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        {isSelected && (
                                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px] tracking-wide uppercase">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 truncate">
                                            {folder.label}
                                        </h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                                            {folder.countLabel}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    SUB-FOLDERS: CATEGORY TILES (When in 201 Documents)
                    Allows volunteer to click into NBI, Medical, Barangay, etc.
                ══════════════════════════════════════════════ */}
                {activeFolder === 'documents' && (
                    <div className="space-y-2.5 pt-1">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Document Categories
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {/* All Files Category Folder */}
                            <div
                                onClick={() => setFilterCategory('all')}
                                className={`p-3 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                                    filterCategory === 'all'
                                        ? 'bg-red-50 ring-2 ring-red-500/20'
                                        : 'bg-white hover:bg-gray-50/80 shadow-2xs'
                                }`}
                            >
                                <div className={`p-2 rounded-lg shrink-0 ${
                                    filterCategory === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    <Folder className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-gray-900 truncate">All Files</div>
                                    <div className="text-[10px] text-gray-400">{docs.length} files</div>
                                </div>
                            </div>

                            {/* Dynamic Category Folders */}
                            {categories.map((cat) => {
                                const count = docs.filter((d) => d.type === cat.key).length;
                                const isSelected = filterCategory === cat.key;
                                return (
                                    <div
                                        key={cat.key}
                                        onClick={() => setFilterCategory(isSelected ? 'all' : cat.key)}
                                        className={`p-3 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                                            isSelected
                                                ? 'bg-red-50 ring-2 ring-red-500/20'
                                                : 'bg-white hover:bg-gray-50/80 shadow-2xs'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg shrink-0 ${
                                            isSelected ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'
                                        }`}>
                                            <Folder className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-gray-900 truncate">
                                                {cat.label}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {count} {count === 1 ? 'file' : 'files'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════
                    MAIN CONTENT CARD (Patterned after Admin Table Card)
                ══════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
                    
                    {/* Folder Header + Search Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-red-50 text-red-600 shrink-0">
                                <FolderOpen className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {activeFolder === 'documents' && filterCategory !== 'all'
                                            ? `${categories.find((c) => c.key === filterCategory)?.label || filterCategory} Files`
                                            : currentFolderInfo.label}
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                                        {activeFolder === 'training' && trainingRecords.length}
                                        {activeFolder === 'activities' && filteredActivities.length}
                                        {activeFolder === 'attendance' && filteredAttendances.length}
                                        {activeFolder === 'documents' && filteredDocs.length}
                                    </span>
                                    {activeFolder === 'documents' && filterCategory !== 'all' && (
                                        <button
                                            type="button"
                                            onClick={() => setFilterCategory('all')}
                                            className="text-xs font-bold text-red-600 hover:text-red-700 ml-1 cursor-pointer"
                                        >
                                            Show all
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={`Search in ${currentFolderInfo.label}...`}
                                className="w-full pl-9 pr-8 py-1.5 bg-gray-50 hover:bg-gray-100/70 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-red-500/20 outline-none transition"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════
                        FOLDER CONTENT 1: TRAINING & CERTIFICATIONS
                        • Training/Certification Name
                        • Date Completed
                        • Certificate/Document
                        • Expiration Date
                        • Remarks
                        • View / Download
                    ══════════════════════════════════════════════ */}
                    {activeFolder === 'training' && (
                        <div>
                            {trainingRecords.length === 0 ? (
                                <EmptyState
                                    icon={GraduationCap}
                                    title={search ? 'No matching certifications found' : 'This folder is empty'}
                                    subtitle={
                                        search
                                            ? 'Try searching with different keywords.'
                                            : 'Upload training certificates or courses to keep them archived in this folder.'
                                    }
                                    action={
                                        !search && (
                                            <button
                                                type="button"
                                                onClick={() => openUploadModal('training')}
                                                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                                            >
                                                <Upload className="w-3.5 h-3.5" /> Upload Certificate
                                            </button>
                                        )
                                    }
                                />
                            ) : (
                                <div className="overflow-x-auto -mx-5 -mb-5">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="border-t border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500">
                                                <th className="p-3.5 sm:px-5">Training / Certification Name</th>
                                                <th className="p-3.5 sm:px-5">Date Completed</th>
                                                <th className="p-3.5 sm:px-5">Certificate / Document</th>
                                                <th className="p-3.5 sm:px-5">Expiration Date</th>
                                                <th className="p-3.5 sm:px-5">Remarks</th>
                                                <th className="p-3.5 sm:px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {trainingRecords.map((doc) => (
                                                <tr key={doc.id} className="hover:bg-gray-50/60 transition">
                                                    {/* Name */}
                                                    <td className="p-3.5 sm:px-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                                                <Award className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-gray-900 truncate max-w-[220px]">
                                                                    {doc.original_name.replace(/\.[^/.]+$/, '')}
                                                                </div>
                                                                <div className="text-[11px] text-gray-400">
                                                                    {docTypes[doc.type]?.label || 'Accredited Course'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Date Completed */}
                                                    <td className="p-3.5 sm:px-5 text-gray-600 font-medium whitespace-nowrap">
                                                        {fmtDate(doc.created_at)}
                                                    </td>

                                                    {/* Certificate Document */}
                                                    <td className="p-3.5 sm:px-5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewDoc(doc)}
                                                            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium max-w-[200px] truncate hover:underline cursor-pointer"
                                                            title="Click to view file"
                                                        >
                                                            <FileText className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                                            <span className="truncate">{doc.original_name}</span>
                                                        </button>
                                                        {doc.file_size && (
                                                            <div className="text-[10px] text-gray-400 pl-5">
                                                                {fmtFileSize(doc.file_size)}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Expiration Date */}
                                                    <td className="p-3.5 sm:px-5 text-gray-500 whitespace-nowrap">
                                                        <span className="text-[11px]">No expiration</span>
                                                    </td>

                                                    {/* Remarks */}
                                                    <td className="p-3.5 sm:px-5 whitespace-nowrap">
                                                        <StatusBadge status={doc.status || 'approved'} />
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="p-3.5 sm:px-5 text-right whitespace-nowrap">
                                                        <div className="inline-flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewDoc(doc)}
                                                                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                                                                title="Preview document"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDownload(doc)}
                                                                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                                                                title="Download file"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════
                        FOLDER CONTENT 2: ASSIGNMENT HISTORY
                        • Activity Name
                        • Date
                        • Location
                        • Role
                        • Assignment / Schedule
                        • Status
                    ══════════════════════════════════════════════ */}
                    {activeFolder === 'activities' && (
                        <div>
                            {filteredActivities.length === 0 ? (
                                <EmptyState
                                    icon={Briefcase}
                                    title={search ? 'No matching assignments' : 'This folder is empty'}
                                    subtitle={
                                        search
                                            ? 'Try searching with another activity title or location.'
                                            : 'Activities and deployment assignments will populate here once scheduled.'
                                    }
                                />
                            ) : (
                                <div className="overflow-x-auto -mx-5 -mb-5">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="border-t border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500">
                                                <th className="p-3.5 sm:px-5">Activity Name</th>
                                                <th className="p-3.5 sm:px-5">Date</th>
                                                <th className="p-3.5 sm:px-5">Location</th>
                                                <th className="p-3.5 sm:px-5">Role</th>
                                                <th className="p-3.5 sm:px-5">Assignment / Schedule</th>
                                                <th className="p-3.5 sm:px-5">Status</th>
                                                <th className="p-3.5 sm:px-5 text-right">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {filteredActivities.map((act) => (
                                                <tr key={act.id} className="hover:bg-gray-50/60 transition">
                                                    {/* Activity Name */}
                                                    <td className="p-3.5 sm:px-5">
                                                        <div className="font-bold text-gray-900 truncate max-w-[200px]">
                                                            {act.name}
                                                        </div>
                                                        {act.description && (
                                                            <div className="text-[11px] text-gray-400 truncate max-w-[200px] mt-0.5">
                                                                {act.description}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Date */}
                                                    <td className="p-3.5 sm:px-5 text-gray-600 font-medium whitespace-nowrap">
                                                        {fmtDate(act.date)}
                                                    </td>

                                                    {/* Location */}
                                                    <td className="p-3.5 sm:px-5 text-gray-600">
                                                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                                                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            <span className="truncate">{act.location_name || 'Chapter Office'}</span>
                                                        </div>
                                                    </td>

                                                    {/* Role */}
                                                    <td className="p-3.5 sm:px-5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                            Volunteer
                                                        </span>
                                                    </td>

                                                    {/* Schedule */}
                                                    <td className="p-3.5 sm:px-5 text-gray-600 whitespace-nowrap">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            <span>
                                                                {act.start_time
                                                                    ? `${act.start_time.substring(0, 5)}${
                                                                          act.end_time ? ` – ${act.end_time.substring(0, 5)}` : ''
                                                                      }`
                                                                    : 'Standard Shift'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="p-3.5 sm:px-5 whitespace-nowrap">
                                                        <StatusBadge status={act.status || 'upcoming'} />
                                                    </td>

                                                    {/* Action */}
                                                    <td className="p-3.5 sm:px-5 text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => setActivityDetail(act)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                                                        >
                                                            <span>View</span>
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════
                        FOLDER CONTENT 3: ATTENDANCE & HOURS
                        • Summary cards on top
                        • History table: Date, Activity, Time In, Arrival Status,
                          Time Out, Departure Status, Total Hours
                    ══════════════════════════════════════════════ */}
                    {activeFolder === 'attendance' && (
                        <div className="space-y-4">
                            {/* Summary row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <StatCard
                                    label="Total Hours Rendered"
                                    value={`${attendanceSummary.totalHours || 0} hrs`}
                                    subtitle="Accredited duty hours"
                                    icon={BarChart3}
                                />
                                <StatCard
                                    label="Days Attended"
                                    value={attendanceSummary.totalDays || 0}
                                    subtitle="Recorded service shifts"
                                    icon={Calendar}
                                />
                                <StatCard
                                    label="Average Hours / Session"
                                    value={
                                        attendanceSummary.totalDays > 0
                                            ? `${(attendanceSummary.totalHours / attendanceSummary.totalDays).toFixed(1)} hrs`
                                            : '0.0 hrs'
                                    }
                                    subtitle="Average time per check-in"
                                    icon={Timer}
                                />
                            </div>

                            {filteredAttendances.length === 0 ? (
                                <EmptyState
                                    icon={ClipboardList}
                                    title={search ? 'No matching attendance records' : 'This folder is empty'}
                                    subtitle={
                                        search
                                            ? 'Try searching with another activity title or date.'
                                            : 'Attendance logs will accumulate here as you check in to activities.'
                                    }
                                />
                            ) : (
                                <div className="overflow-x-auto -mx-5 -mb-5">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="border-t border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500">
                                                <th className="p-3.5 sm:px-5">Date</th>
                                                <th className="p-3.5 sm:px-5">Activity</th>
                                                <th className="p-3.5 sm:px-5">Time In</th>
                                                <th className="p-3.5 sm:px-5">Arrival Status</th>
                                                <th className="p-3.5 sm:px-5">Time Out</th>
                                                <th className="p-3.5 sm:px-5">Departure Status</th>
                                                <th className="p-3.5 sm:px-5 text-right">Total Hours</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {filteredAttendances.map((att) => {
                                                const arrivalStatus = getArrivalStatus(att);
                                                const departureStatus = getDepartureStatus(att);
                                                return (
                                                    <tr key={att.id} className="hover:bg-gray-50/60 transition">
                                                        {/* Date */}
                                                        <td className="p-3.5 sm:px-5 text-gray-900 font-medium whitespace-nowrap">
                                                            {fmtDate(att.date)}
                                                        </td>

                                                        {/* Activity */}
                                                        <td className="p-3.5 sm:px-5">
                                                            <div className="font-bold text-gray-900 truncate max-w-[200px]">
                                                                {att.activity?.name || 'Assigned Duty'}
                                                            </div>
                                                            {att.method && (
                                                                <div className="text-[10px] text-gray-400 capitalize">
                                                                    Verified via {att.method}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Time In */}
                                                        <td className="p-3.5 sm:px-5 text-gray-700 whitespace-nowrap">
                                                            {fmtTime(att.time_in)}
                                                        </td>

                                                        {/* Arrival Status */}
                                                        <td className="p-3.5 sm:px-5 whitespace-nowrap">
                                                            {arrivalStatus !== '—' ? (
                                                                <StatusBadge status={arrivalStatus} />
                                                            ) : (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </td>

                                                        {/* Time Out */}
                                                        <td className="p-3.5 sm:px-5 text-gray-700 whitespace-nowrap">
                                                            {att.time_out ? fmtTime(att.time_out) : '—'}
                                                        </td>

                                                        {/* Departure Status */}
                                                        <td className="p-3.5 sm:px-5 whitespace-nowrap">
                                                            {departureStatus !== '—' ? (
                                                                <StatusBadge status={departureStatus} />
                                                            ) : (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </td>

                                                        {/* Total Hours */}
                                                        <td className="p-3.5 sm:px-5 text-right font-bold text-gray-900 whitespace-nowrap">
                                                            {fmtHours(att.hours_rendered)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════
                        FOLDER CONTENT 4: 201 DOCUMENTS
                        • Checkbox (bulk selection)
                        • Document Name
                        • Document Type
                        • Date
                        • Status
                        • View, Download, Delete actions
                    ══════════════════════════════════════════════ */}
                    {activeFolder === 'documents' && (
                        <div className="space-y-4">
                            {/* Bulk Action Bar */}
                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                                    <span className="text-xs font-bold text-red-700">
                                        {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedIds([])}
                                        className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                    <div className="flex-1" />
                                    <button
                                        type="button"
                                        onClick={() => setBulkDeleteModal(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                                    </button>
                                </div>
                            )}

                            {filteredDocs.length === 0 ? (
                                <EmptyState
                                    icon={FileText}
                                    title={search ? 'No documents match your query' : 'This folder is empty'}
                                    subtitle={
                                        search
                                            ? 'Try searching with another document name.'
                                            : 'Upload clearances, valid IDs, or approved forms to store them in this folder.'
                                    }
                                    action={
                                        !search && (
                                            <button
                                                type="button"
                                                onClick={() => openUploadModal(filterCategory !== 'all' ? filterCategory : categories[0]?.key)}
                                                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                                            >
                                                <Upload className="w-3.5 h-3.5" /> Upload First Document
                                            </button>
                                        )
                                    }
                                />
                            ) : (
                                <div className="overflow-x-auto -mx-5 -mb-5">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="border-t border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500">
                                                <th className="p-3.5 sm:px-5 w-10">
                                                    <span className="cursor-pointer flex" onClick={toggleSelectAll} title="Select all">
                                                        <SelectBox checked={allSelected} indeterminate={someSelected} />
                                                    </span>
                                                </th>
                                                <th className="p-3.5 sm:px-5">Document Name</th>
                                                <th className="p-3.5 sm:px-5">Document Type</th>
                                                <th className="p-3.5 sm:px-5">Date Uploaded</th>
                                                <th className="p-3.5 sm:px-5">Status</th>
                                                <th className="p-3.5 sm:px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs">
                                            {filteredDocs.map((doc) => {
                                                const dt = docTypes[doc.type];
                                                const isChecked = selectedIds.includes(doc.id);
                                                return (
                                                    <tr
                                                        key={doc.id}
                                                        className={`transition ${
                                                            isChecked ? 'bg-red-50/40' : 'hover:bg-gray-50/60'
                                                        }`}
                                                    >
                                                        {/* Checkbox */}
                                                        <td className="p-3.5 sm:px-5 w-10">
                                                            <span
                                                                className="cursor-pointer flex"
                                                                onClick={() => toggleSelectOne(doc.id)}
                                                            >
                                                                <SelectBox checked={isChecked} />
                                                            </span>
                                                        </td>

                                                        {/* Document Name */}
                                                        <td className="p-3.5 sm:px-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                                                    <FileText className="w-4 h-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPreviewDoc(doc)}
                                                                        className="font-bold text-gray-900 hover:text-red-600 truncate block text-left transition cursor-pointer max-w-[280px]"
                                                                        title={doc.original_name}
                                                                    >
                                                                        {doc.original_name}
                                                                    </button>
                                                                    {doc.file_size && (
                                                                        <div className="text-[10px] text-gray-400 mt-0.5">
                                                                            {fmtFileSize(doc.file_size)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Document Type */}
                                                        <td className="p-3.5 sm:px-5 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                                {dt?.label || doc.type}
                                                            </span>
                                                        </td>

                                                        {/* Date */}
                                                        <td className="p-3.5 sm:px-5 text-gray-500 whitespace-nowrap">
                                                            {fmtDate(doc.created_at)}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="p-3.5 sm:px-5 whitespace-nowrap">
                                                            <StatusBadge status={doc.status || 'pending'} />
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="p-3.5 sm:px-5 text-right whitespace-nowrap">
                                                            <div className="inline-flex items-center gap-1 relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPreviewDoc(doc)}
                                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                                                                    title="Preview document"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDownload(doc)}
                                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                                                                    title="Download file"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setRowMenuOpenId(rowMenuOpenId === doc.id ? null : doc.id)
                                                                    }
                                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                                                                    title="More options"
                                                                >
                                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                                </button>

                                                                {/* Dropdown */}
                                                                {rowMenuOpenId === doc.id && (
                                                                    <div
                                                                        ref={menuRef}
                                                                        className="absolute right-0 top-8 bg-white rounded-xl border border-gray-200 shadow-xl z-30 w-32 overflow-hidden py-1"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDelete(doc.id)}
                                                                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer flex items-center gap-2"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ════════════════════════════════════════════════════
                PREVIEW DOCUMENT MODAL (Google Drive Style)
            ════════════════════════════════════════════════════ */}
            {previewDoc && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
                        onClick={() => setPreviewDoc(null)}
                    />
                    <div
                        className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0 pr-3">
                                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">
                                        {previewDoc.original_name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                        <span>{docTypes[previewDoc.type]?.label || previewDoc.type}</span>
                                        {previewDoc.file_size && (
                                            <>
                                                <span>•</span>
                                                <span>{fmtFileSize(previewDoc.file_size)}</span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <StatusBadge status={previewDoc.status} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => handleDownload(previewDoc)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewDoc(null)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Preview Body */}
                        <div className="flex-1 bg-gray-100 overflow-auto p-4 flex items-center justify-center min-h-[380px]">
                            {previewDoc.mime_type?.startsWith('image/') ||
                            previewDoc.original_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img
                                    src={previewDoc.file_url || route('volunteer.documents.file', previewDoc.id)}
                                    alt={previewDoc.original_name}
                                    className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-sm bg-white"
                                />
                            ) : (
                                <iframe
                                    src={previewDoc.file_url || route('volunteer.documents.file', previewDoc.id)}
                                    title={previewDoc.original_name}
                                    className="w-full h-[72vh] border-0 rounded-xl shadow-sm bg-white"
                                />
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ════════════════════════════════════════════════════
                ACTIVITY DETAIL MODAL
            ════════════════════════════════════════════════════ */}
            {activityDetail && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        onClick={() => setActivityDetail(null)}
                    />
                    <div
                        className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 space-y-4 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Activity Details
                            </span>
                            <button
                                type="button"
                                onClick={() => setActivityDetail(null)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                {activityDetail.name}
                            </h3>
                            <div className="mt-1">
                                <StatusBadge status={activityDetail.status || 'upcoming'} />
                            </div>
                        </div>

                        {activityDetail.description && (
                            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                                {activityDetail.description}
                            </p>
                        )}

                        <div className="space-y-2 text-xs text-gray-600 pt-1">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                                <span>{fmtDate(activityDetail.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                                <span>
                                    {activityDetail.start_time
                                        ? `${activityDetail.start_time.substring(0, 5)}${
                                              activityDetail.end_time ? ` – ${activityDetail.end_time.substring(0, 5)}` : ''
                                          }`
                                        : 'Not specified'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                                <span>{activityDetail.location_name || 'Chapter Office'}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActivityDetail(null)}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ════════════════════════════════════════════════════
                UPLOAD DOCUMENT MODAL
            ════════════════════════════════════════════════════ */}
            {showUpload && createPortal(
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        onClick={() => {
                            setShowUpload(false);
                            reset();
                            setFileError('');
                            setDetectionResult(null);
                            setManualOverride(false);
                        }}
                    />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 relative z-10 flex flex-col overflow-hidden animate-fadeIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                        <Upload className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        {uploadPreselectedType === 'training'
                                            ? 'Upload Training Certificate'
                                            : 'Upload Document'}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpload(false);
                                        reset();
                                        setFileError('');
                                        setDetectionResult(null);
                                        setManualOverride(false);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                                {/* Dropzone */}
                                <label
                                    htmlFor="doc-file-input"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragActive(true);
                                    }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragActive(false);
                                        validateAndSetFile(e.dataTransfer.files?.[0]);
                                    }}
                                    className={`flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition ${
                                        dragActive
                                            ? 'border-red-500 bg-red-50/20'
                                            : 'border-gray-200 bg-gray-50/40 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        id="doc-file-input"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => validateAndSetFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                    <Upload className={`w-7 h-7 ${dragActive ? 'text-red-500' : 'text-gray-400'}`} />
                                    <div className="text-xs font-bold text-gray-700">
                                        Click to browse or drag and drop a file
                                    </div>
                                    <div className="text-[11px] text-gray-400">
                                        PDF, JPG, or PNG up to 5MB
                                    </div>
                                </label>

                                {errors.file && <p className="text-xs text-red-600 font-medium">{errors.file}</p>}
                                {fileError && (
                                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-xs text-rose-700 font-medium">
                                        <AlertCircle className="w-4 h-4 shrink-0" /> {fileError}
                                    </div>
                                )}

                                {/* Selected File Preview Card */}
                                {!fileError && data.file && (
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-gray-900 truncate">
                                                {data.file.name}
                                            </div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">
                                                {fmtFileSize(data.file.size)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Document Type Selection */}
                                {data.file && !fileError && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                            Document Category / Type
                                            {detecting && (
                                                <span className="text-gray-400 font-normal animate-pulse">
                                                    Analyzing…
                                                </span>
                                            )}
                                            {showAutoBadge && (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                                                    <CheckCircle2 className="w-3 h-3" /> Auto-detected
                                                </span>
                                            )}
                                        </label>

                                        {!detecting && showAutoBadge ? (
                                            <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 rounded-xl px-4 py-2.5">
                                                <span className="text-xs font-bold text-gray-900">
                                                    {docTypes[data.type]?.label || data.type}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setManualOverride(true)}
                                                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer underline"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        ) : !detecting ? (
                                            <>
                                                <select
                                                    value={data.type}
                                                    onChange={(e) =>
                                                        setData((d) => ({
                                                            ...d,
                                                            type: e.target.value,
                                                            detection_source: 'manual',
                                                        }))
                                                    }
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition font-sans cursor-pointer"
                                                >
                                                    {categories.map((c) => (
                                                        <option key={c.key} value={c.key}>
                                                            {c.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {detectionResult && !detectionResult.type && (
                                                    <p className="text-[11px] text-gray-400 mt-1">
                                                        Could not auto-detect type — please select manually.
                                                    </p>
                                                )}
                                            </>
                                        ) : null}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUpload(false);
                                            reset();
                                            setFileError('');
                                            setDetectionResult(null);
                                            setManualOverride(false);
                                        }}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.file || !!fileError || detecting}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>{processing ? 'Uploading…' : 'Upload'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ── Single Delete Confirmation Modal ── */}
            {deleteModal.open && createPortal(
                <ConfirmModal
                    title="Delete Document"
                    message="Are you sure you want to remove this document from your 201 file? This action cannot be undone."
                    onCancel={() => setDeleteModal({ open: false, id: null })}
                    onConfirm={confirmDelete}
                />,
                document.body
            )}

            {/* ── Bulk Delete Confirmation Modal ── */}
            {bulkDeleteModal && createPortal(
                <ConfirmModal
                    title={`Delete ${selectedIds.length} Document${selectedIds.length > 1 ? 's' : ''}`}
                    message={`Are you sure you want to delete ${selectedIds.length} selected document${
                        selectedIds.length > 1 ? 's' : ''
                    }? This action cannot be undone.`}
                    onCancel={() => setBulkDeleteModal(false)}
                    onConfirm={confirmBulkDelete}
                />,
                document.body
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS (Unified Red Cross Design System)
   ═══════════════════════════════════════════════════════════════ */

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadgeClasses(
                status
            )}`}
        >
            {statusIcon(status)}
            <span>{capitalize(status || 'pending')}</span>
        </span>
    );
}

function StatCard({ label, value, subtitle, icon: Icon }) {
    return (
        <div className="bg-white rounded-2xl shadow-xs p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <div className="text-xl font-bold text-gray-900 tracking-tight">{value}</div>
                <div className="text-xs font-bold text-gray-700">{label}</div>
                {subtitle && <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>}
            </div>
        </div>
    );
}

function SelectBox({ checked, indeterminate }) {
    if (checked) {
        return (
            <span className="w-4 h-4 rounded bg-red-600 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
            </span>
        );
    }
    if (indeterminate) {
        return (
            <span className="w-4 h-4 rounded bg-red-600 flex items-center justify-center shrink-0">
                <Minus className="w-3 h-3 text-white" />
            </span>
        );
    }
    return <span className="w-4 h-4 rounded border-2 border-gray-300 shrink-0 hover:border-gray-400 transition" />;
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
    return (
        <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">{subtitle}</p>
            {action}
        </div>
    );
}

function ConfirmModal({ title, message, onCancel, onConfirm }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onCancel} />
            <div
                className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-sm border border-gray-100 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                    <Trash2 className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-gray-900 text-center mb-1.5">{title}</h2>
                <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">{message}</p>
                <div className="flex gap-2.5">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

VolunteerDocuments.layout = (page) => <VolunteerLayout title="201 File">{page}</VolunteerLayout>;