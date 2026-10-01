import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Clock,
    MapPin,
    Users,
} from 'lucide-react';

export default function AdminSchedule({ activities = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const todayStr = (() => {
        const t = new Date();
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    })();
    const visibleActivities = activities.filter((a) => a.date && a.date.slice(0, 10) >= todayStr);

    const getActivitiesForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return visibleActivities.filter((a) => a.date && a.date.startsWith(dateStr));
    };

    const statusBadge = (status) => {
        if (status === 'upcoming') return { bg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-600' };
        if (status === 'ongoing') return { bg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-600' };
        if (status === 'completed') return { bg: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' };
        if (status === 'cancelled') return { bg: 'bg-red-50 text-red-600', dot: 'bg-red-600' };
        return { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-600' };
    };

    const today = new Date();
    const isToday = (day) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const selectedActivities = selectedDay ? getActivitiesForDay(selectedDay) : [];

    const addActivityOnDay = (e, day) => {
        e.stopPropagation();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        router.visit(route('admin.activities.create', { date: dateStr }));
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <>
            <Head title="Schedule - Admin Portal" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto items-start">
                {/* Calendar Grid Card */}
                <div className="lg:col-span-8 bg-white rounded-2xl overflow-hidden">
                    {/* Calendar Header */}
                    <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">
                            {monthNames[month]} {year}
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={prevMonth}
                                className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
                                aria-label="Next month"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-50 text-center py-2.5">
                        {dayNames.map((d) => (
                            <div key={d} className="text-xs font-semibold text-gray-400">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day Cells */}
                    <div className="grid grid-cols-7 divide-x divide-y divide-gray-50">
                        {cells.map((day, i) => {
                            if (!day) {
                                return <div key={`empty-${i}`} className="min-h-[90px] bg-gray-50/30 p-2" />;
                            }

                            const dayActivities = getActivitiesForDay(day);
                            const isSelected = selectedDay === day;
                            const todayDay = isToday(day);

                            return (
                                <div
                                    key={day}
                                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                    className={`min-h-[90px] p-2 transition cursor-pointer relative group ${
                                        isSelected
                                            ? 'bg-red-50/60 ring-2 ring-red-500/20 ring-inset'
                                            : todayDay
                                            ? 'bg-red-50/20 hover:bg-red-50/40'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    {/* Day Number */}
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                todayDay
                                                    ? 'bg-red-600 text-white'
                                                    : isSelected
                                                    ? 'text-red-600 font-extrabold'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {day}
                                        </span>
                                    </div>

                                    {/* Activity Pills */}
                                    <div className="space-y-1">
                                        {dayActivities.slice(0, 2).map((a, idx) => {
                                            const badge = statusBadge(a.status);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 truncate ${badge.bg}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                                                    <span className="truncate">{a.name}</span>
                                                </div>
                                            );
                                        })}
                                        {dayActivities.length > 2 && (
                                            <div className="text-[10px] font-bold text-gray-500 pl-1">
                                                +{dayActivities.length - 2} more
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Add Shortcut */}
                                    {dayActivities.length === 0 && (
                                        <button
                                            type="button"
                                            onClick={(e) => addActivityOnDay(e, day)}
                                            className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold flex items-center gap-0.5"
                                        >
                                            <Plus className="w-2.5 h-2.5" />
                                            <span>Add</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Day Detail Sidebar Panel */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-red-600" />
                        <h3 className="text-sm font-bold text-gray-900">
                            {selectedDay
                                ? `${monthNames[month]} ${selectedDay}, ${year}`
                                : 'Select a Day'}
                        </h3>
                    </div>

                    {!selectedDay && (
                        <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                            <CalendarIcon className="w-8 h-8 mx-auto text-gray-300" />
                            <p>Click on any date in the calendar to view scheduled activities.</p>
                        </div>
                    )}

                    {selectedDay && selectedActivities.length === 0 && (
                        <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                            <CalendarIcon className="w-8 h-8 mx-auto text-gray-300" />
                            <p>No activities scheduled for this day.</p>
                            <button
                                onClick={(e) => addActivityOnDay(e, selectedDay)}
                                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create Activity</span>
                            </button>
                        </div>
                    )}

                    {selectedDay && selectedActivities.length > 0 && (
                        <div className="space-y-3">
                            {selectedActivities.map((a, i) => {
                                const badge = statusBadge(a.status);
                                return (
                                    <div
                                        key={i}
                                        className="p-4 rounded-xl bg-gray-50/70 space-y-2.5"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-xs font-bold text-gray-900 leading-snug">{a.name}</h4>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${badge.bg}`}>
                                                {a.status}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 text-xs text-gray-600">
                                            {(a.start_time || a.end_time) && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span>{a.start_time} – {a.end_time}</span>
                                                </div>
                                            )}
                                            {a.location_name && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{a.location_name}</span>
                                                </div>
                                            )}
                                            {a.volunteers?.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{a.volunteers.map((v) => v.name).join(', ')}</span>
                                                </div>
                                            )}
                                            {a.description && (
                                                <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                                                    {a.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AdminSchedule.layout = (page) => <AdminLayout title="Schedule">{page}</AdminLayout>;