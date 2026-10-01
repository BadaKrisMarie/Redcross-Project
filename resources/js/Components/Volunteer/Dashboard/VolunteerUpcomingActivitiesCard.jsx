import React from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, Clock, MapPin, ArrowUpRight, ChevronRight } from 'lucide-react';

export default function VolunteerUpcomingActivitiesCard({
    activities = [],
    onSelectActivity,
}) {
    const formatDateBadge = (dateStr) => {
        if (!dateStr) return { day: '—', month: '—' };
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return { day: '—', month: '—' };
            const day = d.toLocaleDateString('en-PH', { day: 'numeric' });
            const month = d.toLocaleDateString('en-PH', { month: 'short' });
            return { day, month };
        } catch {
            return { day: '—', month: '—' };
        }
    };

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
                    <Calendar className="w-4 h-4 text-red-600" />
                    <h2 className="text-base font-bold text-gray-900">
                        Upcoming activities
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                    </span>
                </div>

                <Link
                    href={route('volunteer.schedule')}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition"
                >
                    <span>View all</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Activities List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-0.5">
                {activities.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-600">
                            No upcoming activities scheduled
                        </span>
                    </div>
                ) : (
                    activities.map((act, idx) => {
                        const dateBadge = formatDateBadge(act.date);
                        const timeText = formatTimeRange(act.start_time, act.end_time);

                        return (
                            <div
                                key={act.id ?? idx}
                                onClick={() => onSelectActivity && onSelectActivity(act)}
                                className="p-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 transition cursor-pointer flex items-center justify-between gap-3 group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Date Badge (Clean red box like previous layout, NO uppercase) */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-red-600 to-red-700 text-white shadow-xs flex flex-col items-center justify-center leading-none text-center shrink-0">
                                        <span className="text-[10px] font-semibold opacity-90">
                                            {dateBadge.month}
                                        </span>
                                        <span className="text-base font-bold mt-0.5">
                                            {dateBadge.day}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 space-y-0.5">
                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                                            {act.name || act.title || 'Red Cross activity'}
                                        </h4>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{timeText}</span>
                                            </span>
                                            {act.location_name && (
                                                <span className="flex items-center gap-1 truncate max-w-[180px]">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{act.location_name}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                        {act.status || 'Assigned'}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
