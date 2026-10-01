import React from 'react';
import { Link } from '@inertiajs/react';
import { CalendarCheck2, Clock, MapPin, ArrowUpRight, LogIn, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function VolunteerTodayActivitiesCard({
    activities = [],
    onSelectActivity,
}) {
    const formatTimeRange = (start, end) => {
        const fmt = (t) => {
            if (!t) return '';
            if (t.includes(':')) {
                const parts = t.split(':');
                let h = parseInt(parts[0], 10);
                const m = parts[1];
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return `${h}:${m} ${ampm}`;
            }
            return t;
        };
        const s = fmt(start);
        const e = fmt(end);
        if (s && e) return `${s} – ${e}`;
        if (s) return s;
        return 'Schedule to be announced';
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
            {/* Header: Title & Link */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 text-red-600" />
                    <h2 className="text-base font-bold text-gray-900">
                        Today's activities
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                    </span>
                </div>

                <Link
                    href={route('volunteer.schedule')}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
                >
                    <span>View schedule</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Activities List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-0.5">
                {activities.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-600">
                            No activities scheduled for today
                        </span>
                    </div>
                ) : (
                    activities.map((act, idx) => {
                        const timeText = formatTimeRange(act.start_time, act.end_time);

                        return (
                            <div
                                key={act.id ?? idx}
                                className="p-4 rounded-xl bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 transition space-y-2.5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div
                                        onClick={() => onSelectActivity && onSelectActivity(act)}
                                        className="min-w-0 cursor-pointer flex-1"
                                    >
                                        <h4 className="text-sm font-bold text-gray-900 hover:text-red-600 transition-colors truncate">
                                            {act.name || act.title || 'Red Cross activity'}
                                        </h4>

                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{timeText}</span>
                                            </span>
                                            {act.location_name && (
                                                <span className="flex items-center gap-1 truncate max-w-[200px]">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{act.location_name}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                        {act.status || 'Active'}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onSelectActivity && onSelectActivity(act)}
                                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 transition cursor-pointer"
                                    >
                                        <span>View details</span>
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                    </button>

                                    <Link
                                        href={route('volunteer.attendance')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition"
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        <span>Check in</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
