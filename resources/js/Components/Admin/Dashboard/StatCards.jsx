import React from 'react';
import { Users, Clock, CheckCircle2, Wifi, ArrowUpRight } from 'lucide-react';

export default function StatCards({
    totalVolunteers = 0,
    pendingCount = 0,
    activeToday = 0,
    onlineNowCount = 0,
    onPendingClick,
    newVolunteersThisMonth,
}) {
    const stats = [
        {
            label: 'Total Volunteers',
            value: totalVolunteers,
            subtext: newVolunteersThisMonth ? `+${newVolunteersThisMonth} this month` : 'Registered members',
            icon: Users,
            iconColor: 'text-red-600 bg-red-50/80 border-red-100',
            badge: 'Active',
            badgeColor: 'bg-red-50 text-red-700',
        },
        {
            label: 'Pending Approvals',
            value: pendingCount,
            subtext: pendingCount > 0 ? 'Action required' : 'All verified',
            icon: Clock,
            iconColor: pendingCount > 0 ? 'text-amber-600 bg-amber-50/80 border-amber-100' : 'text-gray-500 bg-gray-50',
            badge: pendingCount > 0 ? 'Review' : 'Clear',
            badgeColor: pendingCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
            onClick: onPendingClick,
            clickable: true,
        },
        {
            label: 'Checked-in Today',
            value: activeToday,
            subtext: 'Active operations',
            icon: CheckCircle2,
            iconColor: 'text-emerald-600 bg-emerald-50/80 border-emerald-100',
            badge: 'Attendance',
            badgeColor: 'bg-emerald-50 text-emerald-700',
        },
        {
            label: 'Online Volunteers',
            value: onlineNowCount,
            subtext: 'Live active sessions',
            icon: Wifi,
            iconColor: 'text-rose-600 bg-rose-50/80 border-rose-100',
            badge: 'Live',
            badgeColor: 'bg-emerald-50 text-emerald-700',
            hasPulse: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
                const Icon = stat.icon;
                const CardWrapper = stat.clickable ? 'button' : 'div';

                return (
                    <CardWrapper
                        key={i}
                        onClick={stat.clickable ? stat.onClick : undefined}
                        className={`p-5 rounded-3xl bg-white shadow-sm border border-gray-100 flex items-start justify-between text-left transition-all hover:shadow-md hover:border-red-100/80 group ${
                            stat.clickable ? 'cursor-pointer hover:bg-red-50/30' : ''
                        }`}
                    >
                        <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 truncate">
                                    {stat.label}
                                </span>
                                {stat.hasPulse && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                )}
                            </div>

                            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                {stat.value}
                            </div>

                            <div className="text-xs text-gray-400 font-medium pt-0.5 flex items-center gap-1">
                                <span>{stat.subtext}</span>
                                {stat.clickable && (
                                    <ArrowUpRight className="w-3 h-3 text-red-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                )}
                            </div>
                        </div>

                        <div className={`p-3 rounded-2xl border ${stat.iconColor} shrink-0`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </CardWrapper>
                );
            })}
        </div>
    );
}
