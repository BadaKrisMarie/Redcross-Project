import React from 'react';
import { X, ChevronRight } from 'lucide-react';

export default function PendingListModal({
    showPendingList,
    setShowPendingList,
    groupedPendingDocs = [],
    dismissedDocKeys = new Set(),
    handleViewDocument,
    pendingDocsCount = 0,
    docKey,
}) {
    if (!showPendingList) return null;

    return (
        <div
            onClick={() => setShowPendingList(false)}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">
                        Pending Document Review ({pendingDocsCount})
                    </h3>
                    <button
                        onClick={() => setShowPendingList(false)}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
                    {groupedPendingDocs.length === 0 ? (
                        <div className="py-12 text-center text-xs text-gray-400">No pending documents.</div>
                    ) : (
                        groupedPendingDocs.flatMap((group, gi) => {
                            const remainingDocs = group.docs.filter((d) => !dismissedDocKeys.has(docKey ? docKey(d, d._idx) : d.id));
                            return remainingDocs.map((doc) => {
                                const initials = (group.name || '?')
                                    .split(' ')
                                    .map((w) => w[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase();

                                return (
                                    <div
                                        key={docKey ? docKey(doc, doc._idx) : `${doc.id}-${doc._idx}`}
                                        onClick={() => {
                                            setShowPendingList(false);
                                            handleViewDocument(doc, doc._idx);
                                        }}
                                        className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50 rounded-xl cursor-pointer transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                                {doc.photo ? (
                                                    <img src={doc.photo} alt={group.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    initials
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-gray-900 truncate">{group.name}</div>
                                                <div className="text-[11px] text-amber-600 font-semibold truncate">{doc.type}</div>
                                            </div>
                                        </div>

                                        <div className="text-xs font-bold text-red-600 flex items-center gap-1 shrink-0">
                                            <span>Review</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                );
                            });
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={() => setShowPendingList(false)}
                        className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
