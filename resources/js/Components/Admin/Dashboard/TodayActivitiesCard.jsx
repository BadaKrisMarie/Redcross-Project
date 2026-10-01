import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, Search, Calendar, Clock, MapPin, Plus } from 'lucide-react';

export default function TodayActivitiesCard({
    todaysActivities = [],
    upcomingEvents = [],
    onSelectActivity,
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const hasToday = todaysActivities.length > 0;
    const allActivities = useMemo(() => {
        if (hasToday) return todaysActivities;
        return upcomingEvents.map((evt, idx) => ({
            id: evt.id ?? `evt-${idx}`,
            name: evt.name,
            title: evt.name,
            description: 'Master clear and coordinated community operation for daily deployments.',
            date: evt.date,
            time: '06:15 PM',
            location: 'Muntinlupa Branch',
            assignedCount: 4,
            assignedNames: [],
            status: 'Upcoming',
        }));
    }, [todaysActivities, upcomingEvents, hasToday]);

    const filteredActivities = useMemo(() => {
        if (!searchQuery.trim()) return allActivities;
        const q = searchQuery.toLowerCase();
        return allActivities.filter(
            (act) =>
                (act.name || act.title || '').toLowerCase().includes(q) ||
                (act.location || '').toLowerCase().includes(q) ||
                (act.description || '').toLowerCase().includes(q)
        );
    }, [allActivities, searchQuery]);

    const formatDayTime = (act) => {
        if (act.time && act.time !== '—') return act.time;
        return 'Monday 06:15 PM';
    };

    const formatDateBadge = (act, idx) => {
        if (act.date) {
            const parts = act.date.split(' ');
            if (parts.length >= 2) {
                return { day: parts[1], month: parts[0] };
            }
            return { day: act.date, month: 'DATE' };
        }
        // Realistic sample dates matching the mockup (27 Apr, 29 Apr, 17 May)
        const defaults = [
            { day: '27', month: 'Apr' },
            { day: '29', month: 'Apr' },
            { day: '17', month: 'May' },
        ];
        return defaults[idx % defaults.length];
    };

    return (
        <div className="bg-white rounded-[32px] p-7 shadow-sm border-0 flex flex-col justify-between space-y-5 transition-all hover:shadow-md h-full">
            {/* Header with Title and Open Arrow Button */}
            <div>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                            Select an Operation
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">
                            Start daily deployment today.
                        </p>
                    </div>

                    <Link
                        href={route('admin.activities.index')}
                        className="w-10 h-10 rounded-full bg-gray-50/80 hover:bg-red-50 hover:text-red-600 text-gray-500 border-0 flex items-center justify-center transition-all shrink-0 group"
                        title="View all operations"
                        aria-label="View all operations"
                    >
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Inner Search Bar matching EdTech+ layout */}
                <div className="mt-5 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search anything..."
                        className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFC] focus:bg-white rounded-full text-xs text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/10 border-0 outline-none transition"
                    />
                </div>
            </div>

            {/* Activities List */}
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {filteredActivities.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-gray-600">No operations found</span>
                        <p className="text-[11px] text-gray-400 max-w-xs">
                            There are no scheduled activities matching your search query.
                        </p>
                        <Link
                            href={route('admin.activities.index')}
                            className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Schedule Operation</span>
                        </Link>
                    </div>
                ) : (
                    filteredActivities.map((act, idx) => {
                        const dateBadge = formatDateBadge(act, idx);

                        return (
                            <div
                                key={act.id ?? idx}
                                onClick={() => onSelectActivity && onSelectActivity(act)}
                                className="p-4 rounded-2xl bg-[#F8FAFC]/80 hover:bg-red-50/40 border-0 transition-all cursor-pointer space-y-3 group"
                            >
                                {/* Top row: Overlapping Avatars + Date/Time block on right */}
                                <div className="flex items-center justify-between">
                                    {/* Double volunteer avatars */}
                                    <div className="flex -space-x-2.5 overflow-hidden">
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                                            RC
                                        </div>
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center">
                                            VL
                                        </div>
                                    </div>

                                    {/* Date & Time pill container */}
                                    <div className="flex items-center gap-3 text-right">
                                        <div className="text-[11px] text-gray-500 font-medium">
                                            <div className="font-semibold text-gray-700">
                                                Monday
                                            </div>
                                            <div className="text-gray-400 text-[10px]">
                                                {formatDayTime(act)}
                                            </div>
                                        </div>
                                        <div className="w-10 h-11 rounded-xl bg-white shadow-xs border-0 flex flex-col items-center justify-center leading-none text-center shrink-0">
                                            <span className="text-sm font-extrabold text-gray-900">
                                                {dateBadge.day}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500">
                                                {dateBadge.month}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Title and Description */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                                        {act.name || act.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                                        {act.description || (act.location ? `Deployment location at ${act.location}` : 'Master clear and confident coordination for community outreach.')}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
