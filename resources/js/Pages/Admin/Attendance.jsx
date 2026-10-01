import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import LiveLocationMap from './LiveLocationMap';
import AttendanceLocationModal from './AttendanceLocationModal';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Download,
    Filter,
    RotateCcw,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    MapPin,
} from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const AVATAR_PALETTE = [
    ['bg-red-100 text-red-700', 'border-red-200'],
    ['bg-blue-100 text-blue-700', 'border-blue-200'],
    ['bg-emerald-100 text-emerald-700', 'border-emerald-200'],
    ['bg-amber-100 text-amber-700', 'border-amber-200'],
    ['bg-purple-100 text-purple-700', 'border-purple-200'],
    ['bg-teal-100 text-teal-700', 'border-teal-200'],
];

const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
};

const getAvatarColor = (name) => AVATAR_PALETTE[hashString(name || '') % AVATAR_PALETTE.length];

const toTitleCase = (name) =>
    (name || '')
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');

const getInitials = (name) =>
    (name || '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const VolunteerAvatar = ({ name, size = 32 }) => {
    const [colorClass] = getAvatarColor(name);
    return (
        <div
            style={{ width: size, height: size }}
            className={`rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}
        >
            {getInitials(name) || '-'}
        </div>
    );
};

export default function AdminAttendance({ attendances = [], volunteers = [], activities = [], filters = {} }) {
    const [volunteerFilter, setVolunteerFilter] = useState(filters?.volunteer_id || '');
    const [activityFilter, setActivityFilter] = useState(filters?.activity_id || '');
    const [dateFilter, setDateFilter] = useState(filters?.date || '');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);

    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [currentPage, setCurrentPage] = useState(1);

    const applyFilters = () => {
        router.get(
            route('admin.attendance.index'),
            {
                volunteer_id: volunteerFilter,
                activity_id: activityFilter,
                date: dateFilter,
            },
            { preserveState: true }
        );
    };

    const clearFilters = () => {
        setVolunteerFilter('');
        setActivityFilter('');
        setDateFilter('');
        router.get(route('admin.attendance.index'));
    };

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
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const statusStyles = {
        'Early In': 'bg-blue-50 text-blue-600',
        'On Time': 'bg-emerald-50 text-emerald-600',
        'Late': 'bg-red-50 text-red-600',
        'Early Out': 'bg-orange-50 text-orange-600',
        'Absent': 'bg-gray-100 text-gray-600',
        '-': 'bg-gray-100 text-gray-500',
    };

    const MethodBadge = ({ method }) => {
        const isFace = method === 'face';
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isFace
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-indigo-50 text-indigo-600'
                }`}
            >
                {isFace ? 'Face Recognition' : 'Biometric'}
            </span>
        );
    };

    const buildScheduleDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;
        const datePart = dateStr.split('T')[0];
        const timePart = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
        const dt = new Date(`${datePart}T${timePart}`);
        return isNaN(dt.getTime()) ? null : dt;
    };

    const minutesOfDay = (date) => date.getHours() * 60 + date.getMinutes();

    const getTimeInStatus = (record, start) => {
        if (!record.time_in || !start) return null;
        const timeIn = new Date(record.time_in);
        const diff = minutesOfDay(timeIn) - minutesOfDay(start);
        if (diff === 0) return 'On Time';
        if (diff > 0) return 'Late';
        return 'Early In';
    };

    const getTimeOutStatus = (record, end) => {
        if (!record.time_out || !end) return null;
        const timeOut = new Date(record.time_out);
        const diff = minutesOfDay(timeOut) - minutesOfDay(end);
        if (diff === 0) return 'On Time';
        if (diff < 0) return 'Early Out';
        return null;
    };

    const getAttendanceStatuses = (record) => {
        if (!record.time_in) return ['Absent'];
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

    const filteredAttendances = useMemo(() => {
        if (!statusFilter) return attendances;
        return attendances.filter((r) => getAttendanceStatuses(r).includes(statusFilter));
    }, [attendances, statusFilter]);

    const statusCounts = useMemo(() => {
        const counts = { 'Early In': 0, 'On Time': 0, 'Late': 0, 'Early Out': 0, 'Absent': 0 };
        attendances.forEach((r) => {
            getAttendanceStatuses(r).forEach((status) => {
                if (status in counts) counts[status] += 1;
            });
        });
        return counts;
    }, [attendances]);

    const columns = [
        { key: 'volunteer', label: 'Volunteer', sortable: true, accessor: (r) => r.user?.name ?? '' },
        { key: 'activity', label: 'Activity', sortable: true, accessor: (r) => r.activity?.name ?? '' },
        { key: 'date', label: 'Date', sortable: true, accessor: (r) => r.date ?? '' },
        { key: 'time_in', label: 'Time In', sortable: true, accessor: (r) => r.time_in ?? '' },
        { key: 'time_out', label: 'Time Out', sortable: true, accessor: (r) => r.time_out ?? '' },
        { key: 'hours', label: 'Hours', sortable: true, accessor: (r) => parseFloat(r.hours_rendered || 0) },
        { key: 'method', label: 'Method', sortable: true, accessor: (r) => r.method ?? '' },
        { key: 'status', label: 'Status', sortable: true, accessor: (r) => getAttendanceStatuses(r)[0] ?? '' },
    ];

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

    const handleStatusClick = (label) => {
        setStatusFilter((prev) => (prev === label ? null : label));
        setCurrentPage(1);
    };

    return (
        <>
            <Head title="Attendance - Admin Portal" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Live Location Map */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    <LiveLocationMap />
                </div>

                {/* Filter Controls Card */}
                <div className="bg-white rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Filter Records</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                Volunteer
                            </label>
                            <select
                                value={volunteerFilter}
                                onChange={(e) => setVolunteerFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            >
                                <option value="">All Volunteers</option>
                                {volunteers.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {toTitleCase(v.name)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                Activity
                            </label>
                            <select
                                value={activityFilter}
                                onChange={(e) => setActivityFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            >
                                <option value="">All Activities</option>
                                {activities.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} ({a.date})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                Date
                            </label>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={applyFilters}
                                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1"
                                title="Reset filters"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    {/* Header + Legend Pills */}
                    <div className="p-5 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-gray-900">Attendance Records</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                {['Early In', 'On Time', 'Late', 'Early Out', 'Absent'].map((label) => {
                                    const styleClass = statusStyles[label];
                                    const isActive = statusFilter === label;
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => handleStatusClick(label)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${styleClass} ${
                                                isActive ? 'ring-2 ring-red-500/20' : 'opacity-80 hover:opacity-100'
                                            }`}
                                        >
                                            {label} <span className="font-bold">({statusCounts[label]})</span>
                                        </button>
                                    );
                                })}
                                {statusFilter && (
                                    <button
                                        onClick={() => setStatusFilter(null)}
                                        className="text-xs font-bold text-red-600 hover:text-red-700 ml-1"
                                    >
                                        Clear filter
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={exportPdf}
                            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export PDF</span>
                        </button>
                    </div>

                    {/* Pagination Top Bar */}
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <span>Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                            >
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <span className="text-gray-400">
                                Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedAttendances.length)} of {sortedAttendances.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-semibold text-gray-700">
                                Page {safePage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/50 text-xs font-medium text-gray-400">
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            onClick={() => col.sortable && handleSort(col.key)}
                                            className={`p-3.5 sm:px-5 ${col.sortable ? 'cursor-pointer select-none hover:text-gray-900' : ''}`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>{col.label}</span>
                                                {col.sortable && (
                                                    sortField === col.key ? (
                                                        sortDirection === 'asc' ? (
                                                            <ChevronUp className="w-3.5 h-3.5 text-red-600" />
                                                        ) : (
                                                            <ChevronDown className="w-3.5 h-3.5 text-red-600" />
                                                        )
                                                    ) : (
                                                        <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
                                                    )
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs">
                                {pagedAttendances.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-gray-400">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    pagedAttendances.map((record) => {
                                        const displayName = toTitleCase(record.user?.name);
                                        const statuses = getAttendanceStatuses(record);

                                        return (
                                            <tr key={record.id} className="hover:bg-gray-50/60 transition">
                                                <td className="p-3.5 sm:px-5">
                                                    <div className="flex items-center gap-3">
                                                        <VolunteerAvatar name={record.user?.name} />
                                                        <div className="min-w-0">
                                                            <button
                                                                onClick={() => setSelectedRecord(record)}
                                                                className="font-bold text-gray-900 hover:text-red-600 text-left truncate flex items-center gap-1 transition"
                                                            >
                                                                <span>{displayName || '-'}</span>
                                                                <MapPin className="w-3 h-3 text-gray-400 hover:text-red-600" />
                                                            </button>
                                                            <div className="text-[11px] text-gray-400 truncate">
                                                                {record.user?.email ?? ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3.5 sm:px-5 font-medium text-gray-800">
                                                    {record.activity?.name ?? '-'}
                                                </td>
                                                <td className="p-3.5 sm:px-5 text-gray-600 whitespace-nowrap">
                                                    {formatDate(record.date)}
                                                </td>
                                                <td className="p-3.5 sm:px-5 font-bold text-emerald-600 whitespace-nowrap">
                                                    {formatTime(record.time_in)}
                                                </td>
                                                <td className="p-3.5 sm:px-5 font-bold text-red-600 whitespace-nowrap">
                                                    {formatTime(record.time_out)}
                                                </td>
                                                <td className="p-3.5 sm:px-5 font-semibold text-gray-800 whitespace-nowrap">
                                                    {record.hours_rendered ? `${record.hours_rendered} hrs` : '-'}
                                                </td>
                                                <td className="p-3.5 sm:px-5">
                                                    <MethodBadge method={record.method} />
                                                </td>
                                                <td className="p-3.5 sm:px-5">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {statuses.map((status) => (
                                                            <span
                                                                key={status}
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                                    statusStyles[status] || statusStyles['-']
                                                                }`}
                                                            >
                                                                {status}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Attendance Location Modal */}
            <AttendanceLocationModal
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
            />
        </>
    );
}

AdminAttendance.layout = (page) => <AdminLayout title="Attendance">{page}</AdminLayout>;