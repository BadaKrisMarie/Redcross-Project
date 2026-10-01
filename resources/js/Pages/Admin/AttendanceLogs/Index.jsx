import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ClipboardList,
    Scan,
    CheckCircle2,
    Users,
    AlertCircle,
    Search,
    Filter,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Cpu,
    Calendar,
} from 'lucide-react';

const statusBadge = (label, code) => {
    const styles = {
        0: 'bg-emerald-50 text-emerald-600', // Check In
        1: 'bg-blue-50 text-blue-600',       // Check Out
        2: 'bg-amber-50 text-amber-600',    // Break Out
        3: 'bg-amber-50 text-amber-600',    // Break In
        4: 'bg-purple-50 text-purple-600', // OT In
        5: 'bg-purple-50 text-purple-600', // OT Out
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[code] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
};

export default function AttendanceLogsIndex({ logs = { data: [], links: [] }, filters = {}, devices = [], stats = {} }) {
    const [form, setForm] = useState({
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        device_sn: filters.device_sn ?? '',
        status_code: filters.status_code ?? '',
        recognized: filters.recognized ?? '',
        search: filters.search ?? '',
    });

    const applyFilters = (e) => {
        e?.preventDefault();
        router.get(route('admin.attendance-logs.index'), form, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const cleared = { date_from: '', date_to: '', device_sn: '', status_code: '', recognized: '', search: '' };
        setForm(cleared);
        router.get(route('admin.attendance-logs.index'), cleared, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Attendance Scanner Logs - Admin Portal" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Attendance Scanner Logs</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Raw biometric scanner logs received from all registered Red Cross attendance devices
                        </p>
                    </div>

                    <Link
                        href={route('admin.attendance.index')}
                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>View Attendance Summary</span>
                    </Link>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    <div className="p-4 rounded-2xl bg-white space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Total Logs</span>
                            <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
                                <ClipboardList className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                            {stats.total_logs ?? 0}
                        </div>
                        <p className="text-[11px] text-gray-400">All-time scans</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Today Scans</span>
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <Scan className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                            {stats.today_scans ?? 0}
                        </div>
                        <p className="text-[11px] text-blue-600 font-semibold">Today's activity</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Valid Time-Ins</span>
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                            {stats.time_ins_today ?? 0}
                        </div>
                        <p className="text-[11px] text-emerald-600 font-semibold">Valid time-ins</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Volunteers Today</span>
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                            {stats.unique_volunteers_today ?? 0}
                        </div>
                        <p className="text-[11px] text-indigo-600 font-semibold">Unique volunteers</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white space-y-1 col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Failed Scans</span>
                            <div className="p-2 rounded-xl bg-red-50 text-red-600">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                            {stats.failed_scans_today ?? 0}
                        </div>
                        <p className="text-[11px] text-red-600 font-semibold">Unmatched/Rejected</p>
                    </div>
                </div>

                {/* Filter Card */}
                <form onSubmit={applyFilters} className="bg-white rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Filter Scanner Logs</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                        <div className="lg:col-span-2">
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                Volunteer Search
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by volunteer name or PIN..."
                                    value={form.search}
                                    onChange={(e) => setForm({ ...form, search: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={form.date_from}
                                onChange={(e) => setForm({ ...form, date_from: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                Date To
                            </label>
                            <input
                                type="date"
                                value={form.date_to}
                                onChange={(e) => setForm({ ...form, date_to: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                Scanner Device
                            </label>
                            <select
                                value={form.device_sn}
                                onChange={(e) => setForm({ ...form, device_sn: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            >
                                <option value="">All Devices</option>
                                {devices.map((d) => (
                                    <option key={d.device_sn} value={d.device_sn}>
                                        {d.device_location || d.device_sn}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                Log Status
                            </label>
                            <select
                                value={form.status_code}
                                onChange={(e) => setForm({ ...form, status_code: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            >
                                <option value="">All Status</option>
                                <option value="0">Check In</option>
                                <option value="1">Check Out</option>
                                <option value="2">Break Out</option>
                                <option value="3">Break In</option>
                                <option value="4">OT In</option>
                                <option value="5">OT Out</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Apply Filters</span>
                        </button>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                        </button>
                    </div>
                </form>

                {/* Table Card */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[850px]">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/50 text-xs font-medium text-gray-400">
                                    <th className="p-3.5 sm:px-5">Volunteer</th>
                                    <th className="p-3.5 sm:px-5">Device Location</th>
                                    <th className="p-3.5 sm:px-5">Date & Time</th>
                                    <th className="p-3.5 sm:px-5">Verification Mode</th>
                                    <th className="p-3.5 sm:px-5">Status</th>
                                    <th className="p-3.5 sm:px-5">Confidence</th>
                                    <th className="p-3.5 sm:px-5 text-right">Recognition Result</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-gray-400">
                                            No attendance scanner logs found for the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/60 transition">
                                            <td className="p-3.5 sm:px-5">
                                                {log.volunteer ? (
                                                    <div className="font-bold text-gray-900">
                                                        {log.volunteer.first_name} {log.volunteer.last_name}
                                                    </div>
                                                ) : (
                                                    <span className="text-red-600 font-semibold italic">
                                                        Unregistered (PIN {log.device_pin})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3.5 sm:px-5 text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span>{log.device_location || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-3.5 sm:px-5 text-gray-700 whitespace-nowrap">
                                                {new Date(log.log_datetime).toLocaleString('en-PH', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </td>
                                            <td className="p-3.5 sm:px-5 text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Cpu className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{log.verify_mode_label}</span>
                                                </div>
                                            </td>
                                            <td className="p-3.5 sm:px-5">
                                                {statusBadge(log.status_label, log.status_code)}
                                            </td>
                                            <td className="p-3.5 sm:px-5 text-gray-700 font-semibold">
                                                {log.match_confidence ? `${log.match_confidence}%` : '-'}
                                            </td>
                                            <td className="p-3.5 sm:px-5 text-right">
                                                {log.is_recognized ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Recognized</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                                                        <AlertCircle className="w-3 h-3" />
                                                        <span>Unrecognized</span>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.links && logs.links.length > 3 && (
                        <div className="p-4 border-t border-gray-50 flex items-center justify-between gap-2 flex-wrap bg-gray-50/50">
                            <span className="text-xs text-gray-500">
                                Showing page results
                            </span>
                            <div className="flex items-center gap-1">
                                {logs.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                            link.active
                                                ? 'bg-red-600 text-white border-red-600'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AttendanceLogsIndex.layout = (page) => <AdminLayout title="Attendance Logs">{page}</AdminLayout>;
