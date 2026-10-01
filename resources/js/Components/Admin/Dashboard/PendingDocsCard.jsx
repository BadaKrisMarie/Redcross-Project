import React from 'react';
import { Link } from '@inertiajs/react';
import { FolderUp, ChevronRight, Eye, CheckCircle2 } from 'lucide-react';

export default function PendingDocsCard({
    pendingDocuments = [],
    handleViewDocument,
    dismissedDocKeys = new Set(),
    docKey,
}) {
    const activeDocs = pendingDocuments.filter((d, i) => !dismissedDocKeys.has(docKey ? docKey(d, i) : d.id));

    return (
        <div className="bg-white rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                        <FolderUp className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">Pending 201 Files</h3>
                            {activeDocs.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                                    {activeDocs.length} new
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-400">Volunteer documents for review</p>
                    </div>
                </div>
                <Link
                    href={route('admin.documents.index')}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                    <span>All files</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="divide-y divide-gray-50">
                {activeDocs.length === 0 ? (
                    <div className="py-7 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        <span className="font-medium text-gray-600">All documents are reviewed!</span>
                        <span className="text-[11px] text-gray-400">No pending verification items.</span>
                    </div>
                ) : (
                    activeDocs.slice(0, 5).map((doc, i) => {
                        const initials = (doc.name || '?')
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();

                        return (
                            <div
                                key={doc.id ?? i}
                                className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/70 rounded-xl px-2.5 -mx-2.5 transition"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                        {doc.photo ? (
                                            <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold text-gray-900 truncate">{doc.name}</div>
                                        <div className="text-[11px] text-amber-600 font-medium truncate">{doc.type}</div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleViewDocument(doc, i)}
                                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Review</span>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
