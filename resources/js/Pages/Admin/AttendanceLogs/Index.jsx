import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout'; // adjust path kung iba layout mo

const statusBadge = (label, code) => {
    const styles = {
        0: 'bg-emerald-100 text-emerald-700 border-emerald-200', // Check In
        1: 'bg-blue-100 text-blue-700 border-blue-200',          // Check Out
        2: 'bg-amber-100 text-amber-700 border-amber-200',       // Break Out
        3: 'bg-amber-100 text-amber-700 border-amber-200',       // Break In
        4: 'bg-purple-100 text-purple-700 border-purple-200',    // OT In
        5: 'bg-purple-100 text-purple-700 border-purple-200',    // OT Out
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[code] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {label}
        </span>
    );
};

export default function Index({ logs, filters, devices, stats }) {
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
        <AdminLayout>
            <Head title="Attendance Logs" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Attendance Scanner Logs</h1>
                        <p className="text-sm text-gray-500">Raw biometric scan records from all registered devices</p>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard label="Total Logs" value={stats.total_logs} color="bg-slate-900" />
                    <StatCard label="Today's Scans" value={stats.today_scans} color="bg-blue-600" />
                    <StatCard label="Today Check-ins" value={stats.today_check_ins} color="bg-emerald-600" />
                    <StatCard label="Unique Volunteers Today" value={stats.unique_volunteers_today} color="bg-indigo-600" />
                    <StatCard label="Failed Scans Today" value={stats.failed_scans_today} color="bg-red-600" />
                </div>

                {/* Filters */}
                <form onSubmit={applyFilters} className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 md:grid-cols-6 gap-3">
                    <input
                        type="text"
                        placeholder="Search volunteer..."
                        value={form.search}
                        onChange={(e) => setForm({ ...form, search: e.target.value })}
                        className="col-span-2 rounded-lg border-gray-300 text-sm"
                    />
                    <input
                        type="date"
                        value={form.date_from}
                        onChange={(e) => setForm({ ...form, date_from: e.target.value })}
                        className="rounded-lg border-gray-300 text-sm"
                    />
                    <input
                        type="date"
                        value={form.date_to}
                        onChange={(e) => setForm({ ...form, date_to: e.target.value })}
                        className="rounded-lg border-gray-300 text-sm"
                    />
                    <select
                        value={form.device_sn}
                        onChange={(e) => setForm({ ...form, device_sn: e.target.value })}
                        className="rounded-lg border-gray-300 text-sm"
                    >
                        <option value="">All Devices</option>
                        {devices.map((d) => (
                            <option key={d.device_sn} value={d.device_sn}>{d.device_location}</option>
                        ))}
                    </select>
                    <select
                        value={form.status_code}
                        onChange={(e) => setForm({ ...form, status_code: e.target.value })}
                        className="rounded-lg border-gray-300 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="0">Check In</option>
                        <option value="1">Check Out</option>
                        <option value="2">Break Out</option>
                        <option value="3">Break In</option>
                        <option value="4">OT In</option>
                        <option value="5">OT Out</option>
                    </select>

                    <div className="col-span-2 md:col-span-6 flex gap-2 pt-1">
                        <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800">
                            Apply Filters
                        </button>
                        <button type="button" onClick={resetFilters} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                            Reset
                        </button>
                    </div>
                </form>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-left text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Volunteer</th>
                                <th className="px-4 py-3 font-medium">Device</th>
                                <th className="px-4 py-3 font-medium">Date &amp; Time</th>
                                <th className="px-4 py-3 font-medium">Verify Mode</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Confidence</th>
                                <th className="px-4 py-3 font-medium">Recognized</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        {log.volunteer
                                            ? `${log.volunteer.first_name} ${log.volunteer.last_name}`
                                            : <span className="text-red-500 italic">Unregistered (PIN {log.device_pin})</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{log.device_location}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {new Date(log.log_datetime).toLocaleString('en-PH', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{log.verify_mode_label}</td>
                                    <td className="px-4 py-3">{statusBadge(log.status_label, log.status_code)}</td>
                                    <td className="px-4 py-3 text-gray-500">{log.match_confidence}%</td>
                                    <td className="px-4 py-3">
                                        {log.is_recognized ? (
                                            <span className="text-emerald-600 font-medium text-xs">✓ Recognized</span>
                                        ) : (
                                            <span className="text-red-600 font-medium text-xs">✕ Failed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {logs.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        No attendance logs found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap gap-2">
                    {logs.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveState
                            className={`px-3 py-1.5 rounded-lg text-sm border ${
                                link.active
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-2 h-2 rounded-full ${color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
}
