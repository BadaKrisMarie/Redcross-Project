import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import VolunteerLayout from '@/Layouts/VolunteerLayout';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    LogIn,
    Info,
    CheckCircle2,
    CalendarCheck,
    ChevronRight,
    UserCheck,
} from 'lucide-react';

export default function VolunteerSchedule({ activities = [] }) {
    const calendarContainerRef = useRef(null);
    const calendarInstanceRef = useRef(null);
    const [selectedActivity, setSelectedActivity] = useState(() => {
        return activities.length > 0 ? activities[0] : null;
    });

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
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

    const formatFullDate = (dateStr) => {
        if (!dateStr) return 'Date to be announced';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-PH', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Format activities into FullCalendar events
    const events = useMemo(() => {
        return activities.map((act) => {
            const dateOnly = act.date ? act.date.slice(0, 10) : '';
            let start = dateOnly;
            let end = dateOnly;

            if (act.start_time) {
                const sTime = act.start_time.length === 5 ? `${act.start_time}:00` : act.start_time;
                start = `${dateOnly}T${sTime}`;
            }

            if (act.end_time) {
                const eTime = act.end_time.length === 5 ? `${act.end_time}:00` : act.end_time;
                end = `${dateOnly}T${eTime}`;
            }

            let bg = '#dc2626'; // Red Cross red
            let border = '#b91c1c';
            let text = '#ffffff';

            if (act.status === 'completed') {
                bg = '#4b5563';
                border = '#374151';
            } else if (act.status === 'ongoing') {
                bg = '#059669';
                border = '#047857';
            } else if (act.status === 'cancelled') {
                bg = '#991b1b';
                border = '#7f1d1d';
            }

            return {
                id: String(act.id),
                title: act.name || 'Activity',
                start,
                end,
                allDay: !act.start_time,
                backgroundColor: bg,
                borderColor: border,
                textColor: text,
                extendedProps: {
                    ...act,
                },
            };
        });
    }, [activities]);

    const handleEventClick = (info) => {
        if (info.event.extendedProps) {
            setSelectedActivity(info.event.extendedProps);
        }
    };

    const handleDateClick = (info) => {
        // Find activity matching date
        const match = activities.find(
            (a) => a.date && a.date.slice(0, 10) === info.dateStr
        );
        if (match) {
            setSelectedActivity(match);
        }
    };

    const upcomingList = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        return activities
            .filter((a) => a.date && a.date.slice(0, 10) >= todayStr)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
    }, [activities]);

    useEffect(() => {
        if (!calendarContainerRef.current) return;

        const calendar = new Calendar(calendarContainerRef.current, {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
            },
            buttonText: {
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day',
            },
            events: events,
            eventClick: handleEventClick,
            dateClick: handleDateClick,
            dayMaxEvents: 3,
            height: 'auto',
            eventTimeFormat: {
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
            },
        });

        calendar.render();
        calendarInstanceRef.current = calendar;

        return () => {
            calendar.destroy();
            calendarInstanceRef.current = null;
        };
    }, [events]);

    return (
        <>
            <Head title="Schedule - Volunteer Portal" />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Header */}
                <div className="pt-1 pb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Deployment schedule
                    </h1>
                </div>

                {/* Main Content: FullCalendar (left) + Detail Panel (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* FullCalendar Card */}
                    <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs">
                        <div className="fullcalendar-custom-theme">
                            <div ref={calendarContainerRef} />
                        </div>
                    </div>

                    {/* Right Panel: Selected Activity Details & Upcoming List */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Selected Activity Detail Box */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <CalendarCheck className="w-4 h-4 text-red-600" />
                                <h3 className="text-base font-bold text-gray-900">
                                    Activity details
                                </h3>
                            </div>

                            {selectedActivity ? (
                                <div className="space-y-3.5">
                                    <div>
                                        <h4 className="text-sm sm:text-base font-bold text-gray-900">
                                            {selectedActivity.name || selectedActivity.title || 'Red Cross activity'}
                                        </h4>
                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100 mt-1.5">
                                            {selectedActivity.status || 'Assigned'}
                                        </span>
                                    </div>

                                    {selectedActivity.description && (
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {selectedActivity.description}
                                        </p>
                                    )}

                                    <div className="pt-2 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                                        <div className="flex items-start gap-2.5">
                                            <CalendarIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                            <span>{formatFullDate(selectedActivity.date)}</span>
                                        </div>

                                        {(selectedActivity.start_time || selectedActivity.end_time) && (
                                            <div className="flex items-start gap-2.5">
                                                <Clock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                                <span>
                                                    {formatTime(selectedActivity.start_time)}
                                                    {selectedActivity.end_time ? ` – ${formatTime(selectedActivity.end_time)}` : ''}
                                                </span>
                                            </div>
                                        )}

                                        {selectedActivity.location_name && (
                                            <div className="flex items-start gap-2.5">
                                                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                                <span>{selectedActivity.location_name}</span>
                                            </div>
                                        )}

                                        {selectedActivity.assigned_by && (
                                            <div className="flex items-start gap-2.5">
                                                <UserCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                                <span>Assigned by {selectedActivity.assigned_by}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-gray-100">
                                        <Link
                                            href={route('volunteer.attendance')}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-xs"
                                        >
                                            <LogIn className="w-3.5 h-3.5" />
                                            <span>Proceed to check in</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                                    <Info className="w-5 h-5 text-gray-300" />
                                    <span>Click on any activity or date in the calendar to view its details</span>
                                </div>
                            )}
                        </div>

                        {/* Upcoming Schedule Mini List */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-3.5">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900">
                                    Upcoming schedule
                                </h3>
                                <span className="text-xs text-gray-400 font-medium">
                                    {upcomingList.length} scheduled
                                </span>
                            </div>

                            {upcomingList.length === 0 ? (
                                <div className="py-6 text-center text-xs text-gray-400">
                                    No upcoming shifts found.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {upcomingList.map((act) => {
                                        const d = new Date(act.date);
                                        const dateLabel = isNaN(d.getTime())
                                            ? act.date
                                            : d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });

                                        const isSelected = selectedActivity?.id === act.id;

                                        return (
                                            <div
                                                key={act.id}
                                                onClick={() => setSelectedActivity(act)}
                                                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 text-xs ${
                                                    isSelected
                                                        ? 'bg-red-50/60 border-red-200'
                                                        : 'bg-gray-50/70 hover:bg-gray-50 border-gray-100'
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-gray-900 truncate">
                                                        {act.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                        <span>{dateLabel}</span>
                                                        {act.start_time && (
                                                            <>
                                                                <span>·</span>
                                                                <span>{formatTime(act.start_time)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styling for FullCalendar to match clean Red Cross theme without uppercase */}
            <style>{`
                .fullcalendar-custom-theme .fc {
                    font-family: inherit;
                }
                .fullcalendar-custom-theme .fc-header-toolbar {
                    margin-bottom: 1.25rem !important;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .fullcalendar-custom-theme .fc-toolbar-title {
                    font-size: 1.125rem !important;
                    font-weight: 700 !important;
                    color: #111827 !important;
                    text-transform: none !important;
                }
                .fullcalendar-custom-theme .fc-button {
                    background-color: #ffffff !important;
                    color: #374151 !important;
                    border: 1px solid #e5e7eb !important;
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                    border-radius: 0.5rem !important;
                    padding: 0.4rem 0.75rem !important;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.04) !important;
                    transition: all 0.15s ease !important;
                    text-transform: none !important;
                }
                .fullcalendar-custom-theme .fc-button:hover {
                    background-color: #f9fafb !important;
                    color: #111827 !important;
                    border-color: #d1d5db !important;
                }
                .fullcalendar-custom-theme .fc-button-primary:not(:disabled).fc-button-active,
                .fullcalendar-custom-theme .fc-button-primary:not(:disabled):active {
                    background-color: #dc2626 !important;
                    color: #ffffff !important;
                    border-color: #dc2626 !important;
                }
                .fullcalendar-custom-theme .fc-button:disabled {
                    opacity: 0.45 !important;
                }
                .fullcalendar-custom-theme .fc-col-header-cell-cushion {
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                    color: #6b7280 !important;
                    padding: 0.5rem 0 !important;
                    text-decoration: none !important;
                    text-transform: none !important;
                }
                .fullcalendar-custom-theme .fc-theme-standard td,
                .fullcalendar-custom-theme .fc-theme-standard th {
                    border-color: #f1f5f9 !important;
                }
                .fullcalendar-custom-theme .fc-day-today {
                    background-color: #fef2f2 !important;
                }
                .fullcalendar-custom-theme .fc-daygrid-day-number {
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                    color: #374151 !important;
                    padding: 0.35rem 0.5rem !important;
                    text-decoration: none !important;
                }
                .fullcalendar-custom-theme .fc-day-today .fc-daygrid-day-number {
                    color: #dc2626 !important;
                    font-weight: 700 !important;
                }
                .fullcalendar-custom-theme .fc-event {
                    border-radius: 0.375rem !important;
                    padding: 2px 4px !important;
                    font-size: 0.7rem !important;
                    font-weight: 600 !important;
                    cursor: pointer !important;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.06) !important;
                    transition: transform 0.12s ease !important;
                }
                .fullcalendar-custom-theme .fc-event:hover {
                    transform: translateY(-1px) !important;
                }
                .fullcalendar-custom-theme .fc-more-link {
                    font-size: 0.7rem !important;
                    font-weight: 600 !important;
                    color: #dc2626 !important;
                    text-decoration: none !important;
                }
            `}</style>
        </>
    );
}

VolunteerSchedule.layout = (page) => <VolunteerLayout title="Schedule">{page}</VolunteerLayout>;