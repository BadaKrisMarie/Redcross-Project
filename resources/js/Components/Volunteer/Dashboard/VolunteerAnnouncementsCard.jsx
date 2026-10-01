import React from 'react';
import { Link } from '@inertiajs/react';

export default function VolunteerAnnouncementsCard({
    announcements = [],
    readAnnIds = new Set(),
    onSelectAnnouncement,
}) {
    const defaultList = [
        { id: '1', title: 'Annual Chapter Assembly', author: 'Anna Morgan', score: 67, date: 'Apr 27' },
        { id: '2', title: 'Disaster Relief Mobilization', author: 'Marvin McKinney', score: 42, date: 'Apr 29' },
        { id: '3', title: 'First Aid Recertification', author: 'Savannah Nguyen', score: 83, date: 'May 17' },
        { id: '4', title: 'Blood Donation Drive Update', author: 'Jane Cooper', score: 31, date: 'May 20' },
    ];

    const displayList = announcements && announcements.length > 0
        ? announcements.slice(0, 4).map((ann, idx) => ({
            id: ann.id,
            title: ann.title,
            author: ann.admin?.name || defaultList[idx]?.author || 'Chapter Coordinator',
            score: defaultList[idx]?.score || 55,
            date: ann.created_at ? new Date(ann.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : 'Recent',
            raw: ann,
        }))
        : defaultList;

    return (
        <div className="bg-white rounded-[32px] p-7 shadow-sm border-0 flex flex-col justify-between space-y-5 transition-all hover:shadow-md h-full">
            {/* Header matching EdTech+ layout */}
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
                    href={route('volunteer.communication')}
                    className="px-4 py-1.5 rounded-full bg-gray-50/80 hover:bg-gray-100 text-xs font-semibold text-gray-700 border-0 transition-colors"
                >
                    All
                </Link>
            </div>

            {/* List with segmented slider track matching EdTech+ layout */}
            <div className="space-y-4 pt-1">
                {displayList.map((item, idx) => {
                    const initials = item.author
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                    return (
                        <div
                            key={item.id ?? idx}
                            onClick={() => item.raw && onSelectAnnouncement && onSelectAnnouncement(item.raw)}
                            className="flex items-center justify-between gap-4 group cursor-pointer"
                        >
                            {/* Avatar & Name */}
                            <div className="flex items-center gap-3 min-w-[130px] max-w-[150px] shrink-0">
                                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                                    {initials}
                                </div>
                                <span className="text-xs font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">
                                    {item.author}
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
                                        style={{ width: `${item.score}%` }}
                                    >
                                        {/* Slider knob / handle */}
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-black shadow-xs transition-transform group-hover:scale-110" />
                                    </div>
                                </div>
                            </div>

                            {/* Percentage Metric */}
                            <div className="text-right min-w-[42px] shrink-0">
                                <span className="text-sm font-extrabold text-gray-900">
                                    {item.score}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
