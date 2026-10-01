import React from 'react';
import { Link } from '@inertiajs/react';
import { UserPlus, X } from 'lucide-react';

const parseNotif = (n) => {
    if (!n) return {};
    const match = (n.title ?? '').match(/registered:\s*(.+)$/i);
    const name = (n.volunteer_name ?? (match ? match[1] : n.title) ?? '').trim();
    return {
        name,
        headline: 'New Volunteer Registration',
        description: `${name || 'A volunteer'} has submitted a volunteer application.`,
    };
};

export default function VolunteerNotifModal({ selectedNotif, closeDetail }) {
    if (!selectedNotif || selectedNotif.type !== 'volunteer') return null;

    const { headline, description } = parseNotif(selectedNotif);
    const href = route('admin.volunteers.show', selectedNotif.ref_id);

    return (
        <div
            onClick={closeDetail}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Notification Details</span>
                    <button onClick={closeDetail} className="text-gray-400 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-2 text-center py-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{headline}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
                    {selectedNotif.created_at && (
                        <div className="text-[10px] text-gray-400">{selectedNotif.created_at}</div>
                    )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                        onClick={closeDetail}
                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                    >
                        Close
                    </button>
                    <Link
                        href={href}
                        onClick={closeDetail}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
                    >
                        View Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}
