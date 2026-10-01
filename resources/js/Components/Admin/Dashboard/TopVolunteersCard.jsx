import React from 'react';
import { Link } from '@inertiajs/react';

export default function TopVolunteersCard({ topVolunteers = [] }) {
    const defaultList = [
        { id: 1, name: 'Anna Morgan', percent: 67, photo: null, initials: 'AM' },
        { id: 2, name: 'Marvin McKinney', percent: 42, photo: null, initials: 'MM' },
        { id: 3, name: 'Savannah Nguyen', percent: 83, photo: null, initials: 'SN' },
        { id: 4, name: 'Jane Cooper', percent: 31, photo: null, initials: 'JC' },
    ];

    const displayList = topVolunteers && topVolunteers.length > 0
        ? topVolunteers.slice(0, 4).map((v, i) => ({
            id: v.id ?? i,
            name: v.name,
            percent: Math.min(100, Math.max(20, Math.round((Number(v.hours) || 40) * 1.2))),
            photo: v.photo,
            initials: v.initials || 'VL',
        }))
        : defaultList;

    return (
        <div className="bg-white rounded-[32px] p-7 shadow-sm border-0 flex flex-col justify-between space-y-5 transition-all hover:shadow-md h-full">
            {/* Header: Title and "All" Action matching EdTech+ layout */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                        Friends Score
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        Check your ranking compared to your friends
                    </p>
                </div>

                <Link
                    href={route('admin.volunteers')}
                    className="px-4 py-1.5 rounded-full bg-gray-50/80 hover:bg-gray-100 text-xs font-semibold text-gray-700 border-0 transition-colors"
                >
                    All
                </Link>
            </div>

            {/* Volunteer List with segmented slider track matching EdTech+ layout */}
            <div className="space-y-4 pt-1">
                {displayList.map((vol, idx) => (
                    <div
                        key={vol.id ?? idx}
                        className="flex items-center justify-between gap-4 group"
                    >
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-3 min-w-[130px] max-w-[150px] shrink-0">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                                {vol.photo ? (
                                    <img
                                        src={vol.photo}
                                        alt={vol.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    vol.initials || 'VL'
                                )}
                            </div>
                            <span className="text-xs font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">
                                {vol.name}
                            </span>
                        </div>

                        {/* Segmented Slider Track with Knob Handle matching EdTech+ mockup */}
                        <div className="flex-1 px-1">
                            <div className="relative w-full h-3.5 bg-gray-100/90 rounded-full flex items-center overflow-visible">
                                {/* Segmented background ticks */}
                                <div
                                    className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
                                    style={{
                                        backgroundImage:
                                            'repeating-linear-gradient(90deg, #94A3B8, #94A3B8 2px, transparent 2px, transparent 10px)',
                                    }}
                                />

                                {/* Filled progress track */}
                                <div
                                    className="h-full bg-black rounded-full transition-all duration-500 relative"
                                    style={{ width: `${vol.percent}%` }}
                                >
                                    {/* Slider knob / handle */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-black shadow-xs transition-transform group-hover:scale-110" />
                                </div>
                            </div>
                        </div>

                        {/* Percentage Metric */}
                        <div className="text-right min-w-[42px] shrink-0">
                            <span className="text-sm font-extrabold text-gray-900">
                                {vol.percent}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
