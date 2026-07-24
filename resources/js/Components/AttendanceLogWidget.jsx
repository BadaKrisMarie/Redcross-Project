import { Link } from '@inertiajs/react';

/**
 * Drop this into your existing Admin Dashboard page, e.g.:
 *
 *   import AttendanceLogWidget from '@/Components/AttendanceLogWidget';
 *   ...
 *   <AttendanceLogWidget stats={stats.attendanceLogs} />
 *
 * `stats.attendanceLogs` should come from AttendanceLogController::summaryStats()
 * merged into your DashboardController@index Inertia props. See dashboard_controller_snippet.php
 */
export default function AttendanceLogWidget({ stats }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">Scanner Activity</h3>
                    <p className="text-xs text-gray-500">Live ZKTeco attendance feed</p>
                </div>
                <Link
                    href={route('admin.attendance-logs.index')}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                    View All Logs →
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Metric label="Scans Today" value={stats.today_scans} />
                <Metric label="Check-ins Today" value={stats.today_check_ins} accent="text-emerald-600" />
                <Metric label="Volunteers Present" value={stats.unique_volunteers_today} accent="text-indigo-600" />
                <Metric label="Failed Scans" value={stats.failed_scans_today} accent="text-red-600" />
            </div>
        </div>
    );
}

function Metric({ label, value, accent = 'text-gray-900' }) {
    return (
        <div className="bg-gray-50 rounded-lg p-3">
            <p className={`text-xl font-bold ${accent}`}>{value}</p>
            <p className="text-[11px] text-gray-500">{label}</p>
        </div>
    );
}
