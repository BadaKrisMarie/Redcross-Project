import React from 'react';
import { Link } from '@inertiajs/react';
import {
    UserPlus,
    CalendarPlus,
    ClipboardCheck,
    FolderUp,
    Calendar,
    MessageSquare,
    Zap,
} from 'lucide-react';

export default function QuickActionsCard() {
    const actions = [
        { label: 'Volunteers', href: route('admin.volunteers'), icon: UserPlus, color: 'text-red-600 bg-red-50 hover:bg-red-100' },
        { label: 'Activities', href: route('admin.activities.index'), icon: CalendarPlus, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
        { label: 'Attendance', href: route('admin.attendance.index'), icon: ClipboardCheck, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
        { label: '201 Files', href: route('admin.documents.index'), icon: FolderUp, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
        { label: 'Schedule', href: route('admin.schedule'), icon: Calendar, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
        { label: 'Messages', href: route('admin.communication'), icon: MessageSquare, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-50 text-red-600">
                    <Zap className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Quick Shortcuts</h3>
                    <p className="text-[11px] text-gray-400">Frequently used operations</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
                {actions.map((act, i) => {
                    const Icon = act.icon;
                    return (
                        <Link
                            key={i}
                            href={act.href}
                            className="p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 flex flex-col items-center justify-center text-center gap-2 transition group"
                        >
                            <div className={`p-2 rounded-lg ${act.color} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-gray-800 line-clamp-1">{act.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
