import React from 'react';
import { X, Megaphone, Calendar, User } from 'lucide-react';

export default function VolunteerAnnouncementModal({
    selectedAnnouncement,
    setSelectedAnnouncement,
}) {
    if (!selectedAnnouncement) return null;

    const author = selectedAnnouncement.admin?.name || 'Philippine Red Cross Admin';
    const dateFormatted = selectedAnnouncement.created_at
        ? new Date(selectedAnnouncement.created_at).toLocaleDateString('en-PH', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : null;

    return (
        <div
            onClick={() => setSelectedAnnouncement(null)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100"
            >
                {/* Header Banner */}
                <div className="bg-red-600 p-6 text-white relative">
                    <button
                        onClick={() => setSelectedAnnouncement(null)}
                        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                        <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug">
                        {selectedAnnouncement.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-red-100 mt-2">
                        <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {author}
                        </span>
                        {dateFormatted && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {dateFormatted}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedAnnouncement.body}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={() => setSelectedAnnouncement(null)}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
