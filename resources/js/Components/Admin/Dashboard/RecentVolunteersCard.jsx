import React from 'react';
import { Link } from '@inertiajs/react';
import { Users, ChevronRight, UserCheck } from 'lucide-react';

export default function RecentVolunteersCard({ recentVolunteers = [] }) {
    return (
        <div className="bg-white rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Recent Volunteers</h3>
                        <p className="text-[11px] text-gray-400">Newly registered members</p>
                    </div>
                </div>
                <Link
                    href={route('admin.volunteers')}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="divide-y divide-gray-50">
                {recentVolunteers.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-1">
                        <UserCheck className="w-6 h-6 text-gray-300 mb-1" />
                        <span>No recent volunteers registered yet.</span>
                    </div>
                ) : (
                    recentVolunteers.slice(0, 5).map((vol, i) => {
                        const initials = (vol.name || '?')
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();
                        const photoUrl = vol.photo
                            ? (vol.photo.startsWith('http') || vol.photo.startsWith('/') ? vol.photo : `/storage/${vol.photo}`)
                            : null;

                        return (
                            <Link
                                key={vol.id ?? i}
                                href={vol.id ? route('admin.volunteers.show', vol.id) : route('admin.volunteers')}
                                className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/70 rounded-xl px-2.5 -mx-2.5 transition group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs overflow-hidden">
                                            {photoUrl ? (
                                                <img src={photoUrl} alt={vol.name} className="w-full h-full object-cover" />
                                            ) : (
                                                initials
                                            )}
                                        </div>
                                        {vol.is_online && (
                                            <span
                                                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                                                title="Online now"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                                            {vol.name}
                                        </div>
                                        <div className="text-[11px] text-gray-400 truncate">
                                            {vol.branch || 'Muntinlupa City Branch'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            vol.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : vol.status === 'Incomplete docs'
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {vol.status || 'Active'}
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
