import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    Clock,
    ClipboardCheck,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
    LogIn,
    LogOut,
    ChevronRight,
} from 'lucide-react';

export default function VolunteerQuickAttendanceCard({
    volunteer = {},
    todayAttendance = null,
    recentAttendance = [],
    totalHours = 0,
    totalDays = 0,
    availability = true,
    savingAvailability = false,
    onToggleAvailability,
}) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeFormatted = currentTime.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    const dateFormatted = currentTime.toLocaleDateString('en-PH', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const isCheckedIn = Boolean(todayAttendance?.time_in && !todayAttendance?.time_out);
    const isCompletedToday = Boolean(todayAttendance?.time_in && todayAttendance?.time_out);

    const formatRecordTime = (timeStr) => {
        if (!timeStr) return '—';
        if (timeStr.includes(':')) {
            const parts = timeStr.split(':');
            let h = parseInt(parts[0], 10);
            const m = parts[1];
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return `${h}:${m} ${ampm}`;
        }
        return timeStr;
    };

    const hoursTodayNumber = todayAttendance?.hours_rendered
        ? parseFloat(todayAttendance.hours_rendered)
        : 0;

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
            {/* Header: Title and Live Clock */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                        <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        Quick Action Attendance
                    </h2>
                </div>

                <div className="text-left sm:text-right">
                    <div className="text-base font-bold text-gray-900">
                        {timeFormatted}
                    </div>
                    <div className="text-xs text-gray-500">
                        {dateFormatted}
                    </div>
                </div>
            </div>

            {/* 3 Status Tiles (Simple and Clean like previous layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Today's Status */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                        Today's status
                    </div>
                    <div className="flex items-center gap-2">
                        {isCheckedIn ? (
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                        ) : isCompletedToday ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                        )}

                        <span className="text-sm font-bold text-gray-900">
                            {isCheckedIn
                                ? 'Checked in'
                                : isCompletedToday
                                ? 'Shift completed'
                                : 'Not checked in'}
                        </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                        {isCheckedIn ? (
                            <span>Time in: {formatRecordTime(todayAttendance?.time_in)}</span>
                        ) : isCompletedToday ? (
                            <span>In: {formatRecordTime(todayAttendance?.time_in)} · Out: {formatRecordTime(todayAttendance?.time_out)}</span>
                        ) : (
                            <span>No check-in recorded yet</span>
                        )}
                    </div>
                </div>

                {/* 2. Availability */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                        Availability
                    </div>
                    <div className="flex items-center justify-between">
                        <span
                            className={`text-sm font-bold ${
                                availability ? 'text-emerald-600' : 'text-gray-600'
                            }`}
                        >
                            {availability ? 'Available' : 'Not available'}
                        </span>

                        <button
                            type="button"
                            onClick={savingAvailability ? undefined : onToggleAvailability}
                            disabled={savingAvailability}
                            role="switch"
                            aria-checked={availability}
                            title="Toggle availability"
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
                                availability ? 'bg-emerald-500' : 'bg-gray-300'
                            } ${savingAvailability ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                    availability ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                        {savingAvailability ? 'Updating status...' : 'Ready for deployment'}
                    </div>
                </div>

                {/* 3. Hours This Day */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                        Hours this day
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {hoursTodayNumber.toFixed(1)}{' '}
                        <span className="text-xs font-medium text-gray-500">hrs</span>
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                        Total lifetime: {typeof totalHours === 'number' ? totalHours.toFixed(1) : totalHours} hrs ({totalDays} days)
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Attendance Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('volunteer.attendance')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white transition shadow-xs active:scale-[0.98] ${
                            isCheckedIn
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {isCheckedIn ? (
                            <>
                                <LogOut className="w-4 h-4" />
                                <span>Proceed to time out</span>
                            </>
                        ) : isCompletedToday ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>View attendance record</span>
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                <span>Time in / Check in</span>
                            </>
                        )}
                        <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                    </Link>

                    <Link
                        href={route('volunteer.attendance')}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition"
                    >
                        <span>View all logs</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Last attendance snippet if available */}
                {recentAttendance.length > 0 && (
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <span>Last log: {recentAttendance[0].date ? new Date(recentAttendance[0].date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '—'}</span>
                        <span>·</span>
                        <span>{parseFloat(recentAttendance[0].hours_rendered || 0).toFixed(1)} hrs</span>
                    </div>
                )}
            </div>
        </div>
    );
}
