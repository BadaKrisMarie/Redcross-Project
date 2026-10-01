import React from 'react';
import { X, Maximize2, Minimize2, Download, FileText } from 'lucide-react';

export default function DashboardDocModal({
    previewDoc,
    setPreviewDoc,
    isPreviewMaximized,
    setIsPreviewMaximized,
    approving,
    handleApprove,
    handleReject,
    handleDownload,
    isImage,
    isPdf,
}) {
    if (!previewDoc) return null;

    const initials = (previewDoc.name || '?')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const showImg = isImage(previewDoc);
    const showPdfFile = isPdf(previewDoc);

    return (
        <div
            onClick={() => { setPreviewDoc(null); setIsPreviewMaximized(false); }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-white rounded-2xl overflow-hidden flex flex-col w-full transition-all duration-200 shadow-2xl ${
                    isPreviewMaximized ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl max-h-[90vh]'
                }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold overflow-hidden">
                            {previewDoc.photo ? (
                                <img src={previewDoc.photo} alt={previewDoc.name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">{previewDoc.name || 'Volunteer'}</div>
                            <div className="text-xs font-semibold text-red-600">{previewDoc.type || 'Document'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {(showImg || showPdfFile) && (
                            <button
                                onClick={() => setIsPreviewMaximized((m) => !m)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                            >
                                {isPreviewMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                <span>{isPreviewMaximized ? 'Shrink' : 'Enlarge'}</span>
                            </button>
                        )}
                        <button
                            onClick={() => { setPreviewDoc(null); setIsPreviewMaximized(false); }}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-12 min-h-0 bg-gray-50">
                    {!isPreviewMaximized && (
                        <div className="md:col-span-4 p-5 bg-white border-r border-gray-100 flex flex-col items-center text-center space-y-3">
                            <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold overflow-hidden">
                                {previewDoc.photo ? (
                                    <img src={previewDoc.photo} alt={previewDoc.name} className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-sm text-gray-900">{previewDoc.name}</div>
                                <div className="text-xs text-gray-500">Muntinlupa City Branch</div>
                            </div>
                            <div className="w-full pt-3 border-t border-gray-100 text-left">
                                <div className="text-[11px] font-semibold text-gray-400">Document Type</div>
                                <div className="text-xs font-bold text-gray-900 mt-0.5">{previewDoc.type}</div>
                            </div>
                        </div>
                    )}
                    <div className={`${isPreviewMaximized ? 'col-span-12' : 'md:col-span-8'} p-4 flex items-center justify-center min-h-[360px]`}>
                        {previewDoc.file_url ? (
                            showImg ? (
                                <img
                                    src={previewDoc.file_url}
                                    alt={previewDoc.type}
                                    className="max-h-[60vh] max-w-full object-contain rounded-xl border border-gray-200"
                                />
                            ) : showPdfFile ? (
                                <iframe
                                    src={`${previewDoc.file_url}#toolbar=1`}
                                    className="w-full h-[60vh] rounded-xl border border-gray-200"
                                    title={previewDoc.type}
                                />
                            ) : (
                                <div className="text-center text-gray-400 text-xs">
                                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    This file cannot be previewed directly.
                                </div>
                            )
                        ) : (
                            <div className="text-center text-gray-400 text-xs">No file attached.</div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            disabled={approving}
                            onClick={() => handleApprove(previewDoc)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
                        >
                            {approving ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                            disabled={approving}
                            onClick={() => handleReject(previewDoc)}
                            className="px-4 py-2 rounded-xl border border-red-600 text-red-600 hover:bg-red-50 text-xs font-bold transition disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {previewDoc.file_url && (previewDoc.status ?? 'pending') === 'approved' && (
                            <button
                                onClick={() => handleDownload(previewDoc)}
                                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                            </button>
                        )}
                        <button
                            onClick={() => { setPreviewDoc(null); setIsPreviewMaximized(false); }}
                            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
