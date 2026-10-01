import React from 'react';
import { Clock, CalendarCheck, CheckCircle2, Radio } from 'lucide-react';

export default function VolunteerStatCards({
    totalHours = 0,
    totalDays = 0,
    monthDays = 0,
    isCheckedIn = false,
    hoursToday = 0,
    availability = true,
    savingAvailability = false,
    onToggleAvailability,
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Total Rendered Hours */}
            <div className="p-5 rounded-2xl bg-white flex items-start justify-between text-left transition-colors shadow-xs border border-gray-100">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Rendered Hours</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {typeof totalHours === 'number' ? totalHours.toFixed(1) : totalHours}{' '}
                        <span className="text-sm font-semibold text-gray-400">hrs</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-0.5">
                        <span>{hoursToday > 0 ? `+${hoursToday.toFixed(1)} hrs today` : 'Lifetime service'}</span>
                    </div>
                </div>
                <div className="p-3 rounded-xl text-red-600 bg-red-50 shrink-0">
                    <Clock className="w-5 h-5" />
                </div>
            </div>

            {/* 2. Total Active Days */}
            <div className="p-5 rounded-2xl bg-white flex items-start justify-between text-left transition-colors shadow-xs border border-gray-100">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Active Days</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {totalDays}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-0.5">
                        <span>{monthDays} {monthDays === 1 ? 'day' : 'days'} this month</span>
                    </div>
                </div>
                <div className="p-3 rounded-xl text-emerald-600 bg-emerald-50 shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                </div>
            </div>

            {/* 3. Today's Status */}
            <div className="p-5 rounded-2xl bg-white flex items-start justify-between text-left transition-colors shadow-xs border border-gray-100">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Today's Status</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        {isCheckedIn ? 'Checked In' : 'Not In'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-0.5">
                        {isCheckedIn && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        )}
                        <span>{isCheckedIn ? 'Active shift in progress' : 'No active check-in'}</span>
                    </div>
                </div>
                <div className={`p-3 rounded-xl shrink-0 ${isCheckedIn ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                </div>
            </div>

            {/* 4. Volunteer Availability with Toggle */}
            <div className="p-5 rounded-2xl bg-white flex items-start justify-between text-left transition-colors shadow-xs border border-gray-100">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Availability</span>
                    <div className="flex items-center gap-3 pt-0.5">
                        <span className={`text-xl sm:text-2xl font-extrabold tracking-tight ${availability ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {availability ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                    <div className="pt-1.5 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={savingAvailability ? undefined : onToggleAvailability}
                            disabled={savingAvailability}
                            role="switch"
                            aria-checked={availability}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                availability ? 'bg-emerald-500' : 'bg-gray-300'
                            } ${savingAvailability ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    availability ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                        <span className="text-[11px] font-medium text-gray-400">
                            {savingAvailability ? 'Updating...' : 'Toggle status'}
                        </span>
                    </div>
                </div>
                <div className={`p-3 rounded-xl shrink-0 ${availability ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'}`}>
                    <Radio className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}
