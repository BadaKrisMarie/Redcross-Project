import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import FaceAttendance from '@/Components/FaceAttendance';
import VolunteerLayout from '@/Layouts/VolunteerLayout';
import {
    Calendar,
    CalendarCheck,
    Clock,
    ShieldCheck,
    MapPin,
    Search,
    Filter,
    ClipboardList,
    CheckCircle2,
    AlertCircle,
    X,
    Fingerprint,
    ScanFace,
    TrendingUp,
} from 'lucide-react';

// Combine activity date + time string into a valid Date object for comparison
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
function getTimeOutStatus(record, end) {
    if (!record.time_out || !end) return null;

    const timeOut = new Date(record.time_out);
    const diff = minutesOfDay(timeOut) - minutesOfDay(end);

    if (diff === 0) return 'On Time';
    if (diff < 0) return 'Early Out';
    return null;
}

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

function MethodBadge({ method }) {
    if (method === 'fingerprint') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Biometric (Office)</span>
            </span>
        );
    }
    if (method === 'face') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
                <ScanFace className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Face recognition (Field)</span>
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
            <span>—</span>
        </span>
    );
}

function StatusBadge({ status }) {
    const badgeConfig = {
        'On Time': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'On time' },
        'Early In': { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Early in' },
        Late: { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Late' },
        'Early Out': { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Early out' },
        Absent: { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Absent' },
        '-': { bg: 'bg-gray-100 text-gray-400 border-gray-200', label: '—' },
    };

    const cfg = badgeConfig[status] || { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: status };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} mr-1.5`}>
            {cfg.label}
        </span>
    );
}

function VolunteerAttendance({ attendances = [], todayRecords = [], totalHours = 0, activities = [], hasFaceDescriptor = false }) {
    const { flash } = usePage().props;
    const [activeFilter, setActiveFilter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const formatTime = (datetime) => {
        if (!datetime) return '—';
        return new Date(datetime).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const todayFormatted = useMemo(() => {
        return new Date().toLocaleDateString('en-PH', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }, []);

    const records = useMemo(() => {
        return attendances.map((r) => ({
            ...r,
            statuses: r.time_in ? getStatuses(r) : ['Absent'],
        }));
    }, [attendances]);

    const filtered = useMemo(() => {
        return records.filter((r) => {
            const matchesFilter = !activeFilter || r.statuses.includes(activeFilter);
            const matchesSearch =
                !searchQuery.trim() ||
                (r.activity?.name && r.activity.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (r.date && r.date.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (r.activity?.location_name && r.activity.location_name.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesFilter && matchesSearch;
        });
    }, [records, activeFilter, searchQuery]);

    const filterOptions = [
        { key: 'On Time', label: 'On time' },
        { key: 'Early In', label: 'Early in' },
        { key: 'Late', label: 'Late' },
        { key: 'Early Out', label: 'Early out' },
        { key: 'Absent', label: 'Absent' },
    ];

    const avgHours = attendances.length > 0 ? (totalHours / attendances.length).toFixed(1) : '0.0';

    return (
        <>
            <Head title="Attendance - Volunteer Portal" />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 pb-1">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Volunteer attendance
                        </h1>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200/80 text-xs font-medium text-gray-600 shadow-2xs self-start sm:self-auto">
                        <Calendar className="w-3.5 h-3.5 text-red-600" />
                        <span>{todayFormatted}</span>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2.5 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-xl text-xs font-medium bg-red-50 text-red-800 border border-red-200 flex items-center gap-2.5 shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Top Summary Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Days Present */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-gray-500">
                                Total days present
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                                {attendances.length}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                                Verified duty days
                            </div>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <CalendarCheck className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Hours Rendered */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-gray-500">
                                Total hours rendered
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                                {parseFloat(totalHours || 0).toFixed(1)} <span className="text-base font-medium text-gray-500">hrs</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                                Accumulated service time
                            </div>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Average Hours per Shift */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-gray-500">
                                Average per shift
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                                {avgHours} <span className="text-base font-medium text-gray-500">hrs</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                                Across recorded sessions
                            </div>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Main Content: Left Check-in Action Card + Right Attendance History */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Today's Check-in & Biometrics */}
                    <div className="lg:col-span-4">
                        <FaceAttendance
                            todayRecords={todayRecords}
                            activities={activities}
                            hasFaceDescriptor={hasFaceDescriptor}
                        />
                    </div>

                    {/* Right Column: Attendance History Section */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    {/* Header with Search and Filter Chips */}
                    <div className="p-5 sm:p-6 border-b border-gray-100 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                                    <ClipboardList className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 leading-snug">
                                        Attendance history
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {filtered.length} {filtered.length === 1 ? 'record' : 'records'} found
                                    </p>
                                </div>
                            </div>

                            {/* Search box */}
                            <div className="relative w-full sm:w-64">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by activity or date..."
                                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter chips */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                            <button
                                type="button"
                                onClick={() => setActiveFilter(null)}
                                className={`px-3 py-1 rounded-xl text-xs transition font-semibold ${
                                    activeFilter === null
                                        ? 'bg-red-600 text-white shadow-2xs'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                All records
                            </button>

                            {filterOptions.map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setActiveFilter(prev => prev === opt.key ? null : opt.key)}
                                    className={`px-3 py-1 rounded-xl text-xs transition ${
                                        activeFilter === opt.key
                                            ? 'bg-gray-900 text-white font-semibold shadow-2xs'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}

                            {(activeFilter !== null || searchQuery) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveFilter(null);
                                        setSearchQuery('');
                                    }}
                                    className="px-2.5 py-1 text-xs text-gray-500 hover:text-red-600 transition flex items-center gap-1 font-medium"
                                >
                                    <X className="w-3 h-3" />
                                    <span>Clear filters</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Date</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Activity & location</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Time in</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Time out</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Hours</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Verification method</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ClipboardList className="w-8 h-8 text-gray-300" />
                                                <span className="font-medium text-gray-600">No attendance records found</span>
                                                <span className="text-[11px] text-gray-400">
                                                    {activeFilter || searchQuery
                                                        ? 'Try clearing your search query or filter chips above.'
                                                        : 'Your verified attendance logs will appear here once you time in.'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Date */}
                                            <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                                    <span>{formatDate(record.date)}</span>
                                                </div>
                                            </td>

                                            {/* Activity */}
                                            <td className="px-5 py-4 max-w-xs">
                                                <div className="font-semibold text-gray-900 truncate">
                                                    {record.activity?.name ?? 'Assigned activity'}
                                                </div>
                                                {record.activity?.location_name && (
                                                    <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <span className="truncate">{record.activity.location_name}</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Time In */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-emerald-700">
                                                    {formatTime(record.time_in)}
                                                </span>
                                            </td>

                                            {/* Time Out */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`font-semibold ${record.time_out ? 'text-red-700' : 'text-gray-400'}`}>
                                                    {formatTime(record.time_out)}
                                                </span>
                                            </td>

                                            {/* Hours Rendered */}
                                            <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                                {record.hours_rendered ? `${record.hours_rendered} hrs` : '—'}
                                            </td>

                                            {/* Method */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <MethodBadge method={record.method} />
                                            </td>

                                            {/* Status Badges */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center flex-wrap gap-1">
                                                    {record.statuses.map((s, idx) => (
                                                        <StatusBadge key={idx} status={s} />
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </>
);
}

VolunteerAttendance.layout = (page) => <VolunteerLayout title="Attendance">{page}</VolunteerLayout>;

export default VolunteerAttendance;