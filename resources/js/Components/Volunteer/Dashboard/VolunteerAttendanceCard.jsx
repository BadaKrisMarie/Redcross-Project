import React from 'react';
import { Link } from '@inertiajs/react';
import { ClipboardCheck, ChevronRight, Clock, Calendar } from 'lucide-react';

export default function VolunteerAttendanceCard({ recentAttendance = [] }) {
    return (
        <div className="bg-white rounded-2xl p-5 space-y-4 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-bold text-gray-900">Recent Attendance Logs</h3>
                </div>
                <Link
                    href={route('volunteer.attendance')}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
                >
                    <span>View all records</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="divide-y divide-gray-50">
                {recentAttendance.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                        No recent attendance records found.
                    </div>
                ) : (
                    recentAttendance.slice(0, 5).map((att, i) => {
                        const dateFormatted = att.date
                            ? new Date(att.date).toLocaleDateString('en-PH', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                              })
                            : 'Unknown date';

                        const isCompleted = att.time_in && att.time_out;

                        return (
                            <div
                                key={att.id ?? i}
                                className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/70 rounded-xl px-2.5 -mx-2.5 transition"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold text-gray-900 truncate">
                                            {dateFormatted}
                                        </div>
                                        <div className="text-[11px] text-gray-400 flex items-center gap-2 truncate">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                In: {att.time_in ? att.time_in.substring(0, 5) : '—'}
                                            </span>
                                            <span>•</span>
                                            <span>Out: {att.time_out ? att.time_out.substring(0, 5) : 'In progress'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {att.hours_rendered ? (
                                        <span className="text-xs font-bold text-gray-700">
                                            {parseFloat(att.hours_rendered).toFixed(1)} hrs
                                        </span>
                                    ) : null}
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            isCompleted
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-blue-50 text-blue-600'
                                        }`}
                                    >
                                        {isCompleted ? 'Completed' : 'Logged In'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
