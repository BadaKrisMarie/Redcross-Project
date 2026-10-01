import React from 'react';
import { X, Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function VolunteerActivityDetailModal({
    selectedActivity,
    setSelectedActivity,
}) {
    if (!selectedActivity) return null;

    const dateFormatted = selectedActivity.date
        ? new Date(selectedActivity.date).toLocaleDateString('en-PH', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : null;

    const timeFormatted = selectedActivity.start_time
        ? `${selectedActivity.start_time.substring(0, 5)}${
              selectedActivity.end_time ? ` – ${selectedActivity.end_time.substring(0, 5)}` : ''
          }`
        : null;

    return (
        <div
            onClick={() => setSelectedActivity(null)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100"
            >
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">
                        Activity details
                    </span>
                    <button
                        onClick={() => setSelectedActivity(null)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                            {selectedActivity.name || selectedActivity.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mt-2">
                            {selectedActivity.status || 'Assigned'}
                        </span>
                    </div>

                    {selectedActivity.description && (
                        <p className="text-xs text-gray-600 leading-relaxed pt-1">
                            {selectedActivity.description}
                        </p>
                    )}

                    <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs text-gray-700">
                        {dateFormatted && (
                            <div className="flex items-center gap-2.5">
                                <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                                <span className="font-medium">{dateFormatted}</span>
                            </div>
                        )}
                        {timeFormatted && (
                            <div className="flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-red-600 shrink-0" />
                                <span className="font-medium">{timeFormatted}</span>
                            </div>
                        )}
                        {selectedActivity.location_name && (
                            <div className="flex items-center gap-2.5">
                                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                                <span className="font-medium">{selectedActivity.location_name}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <Link
                        href={route('volunteer.schedule')}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition"
                    >
                        <span>View in Schedule</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                        onClick={() => setSelectedActivity(null)}
                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
