import React from 'react';
import { X, Calendar, Clock, MapPin, Users } from 'lucide-react';

export default function ActivityDetailModal({
    selectedActivity,
    setSelectedActivity,
}) {
    if (!selectedActivity) return null;

    return (
        <div
            onClick={() => setSelectedActivity(null)}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Activity Details</span>
                    <button
                        onClick={() => setSelectedActivity(null)}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">
                            {selectedActivity.title || selectedActivity.name}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-1">
                            {selectedActivity.status || 'Active'}
                        </span>
                    </div>

                    {selectedActivity.description && (
                        <p className="text-xs text-gray-600 leading-relaxed">
                            {selectedActivity.description}
                        </p>
                    )}

                    <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                        {selectedActivity.date && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{selectedActivity.date}</span>
                            </div>
                        )}
                        {selectedActivity.time && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{selectedActivity.time}</span>
                            </div>
                        )}
                        {selectedActivity.location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{selectedActivity.location}</span>
                            </div>
                        )}
                        {selectedActivity.volunteers_count !== undefined && (
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{selectedActivity.volunteers_count} Volunteers assigned</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button
                        onClick={() => setSelectedActivity(null)}
                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
