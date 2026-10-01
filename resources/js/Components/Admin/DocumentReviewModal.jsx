import React from 'react';
import {
    X,
    Maximize2,
    Minimize2,
    Download,
    FileText,
} from 'lucide-react';

const isImageMime = (mime) => !!mime && mime.startsWith('image/');
const isPdfMime = (mime) => mime === 'application/pdf';

const NOTIF_DOC_LABELS = {
    nbi: 'NBI Clearance',
    medical: 'Medical Certificate',
    training: 'Training Certificate',
    barangay: 'Barangay Clearance',
    bangray: 'Barangay Clearance',
};
const formatDocLabel = (type) =>
    NOTIF_DOC_LABELS[type?.toLowerCase()] || (type ? type.toUpperCase() : null);

const parseNotif = (n) => {
    if (!n) return {};
    const title = n.title ?? n.message ?? '';
    const match = title.match(/^(.+?)\s+submitted\s+a\s+(.+?)\s+document/i);
    const name = (n.volunteer_name ?? (match ? match[1] : title) ?? '').trim();
    const docType = n.doc_type_label ?? (match ? formatDocLabel(match[2]) : null);

    return {
        name,
        docType,
        isVolunteer: n.type === 'volunteer',
    };
};

function StatusPill({ status }) {
    const map = {
        approved: { bg: 'bg-emerald-50 text-emerald-600', label: 'Approved' },
        rejected: { bg: 'bg-red-50 text-red-600', label: 'Rejected' },
        pending: { bg: 'bg-amber-50 text-amber-600', label: 'Pending' },
    };
    const s = map[status] ?? map.pending;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg}`}>
            {s.label}
        </span>
    );
}

const getInitials = (name) =>
    (name || '?')
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

export default function DocumentReviewModal({
    selectedNotif,
    closeDetail,
    approvingNotifDoc,
    handleApproveNotifDoc,
    handleRejectNotifDoc,
    handleDownloadNotifDoc,
    isNotifPreviewMaximized,
    setIsNotifPreviewMaximized,
}) {
    if (!selectedNotif || selectedNotif.type === 'volunteer') return null;

    const { name, docType } = parseNotif(selectedNotif);
    const status = selectedNotif.status ?? 'pending';
    const hasFile = !!selectedNotif.file_url;
    const showImage = hasFile && isImageMime(selectedNotif.mime_type);
    const showPdf = hasFile && isPdfMime(selectedNotif.mime_type);
    const docInitials = getInitials(name);
    const docPhoto = selectedNotif.photo
        ? selectedNotif.photo.startsWith('/') || selectedNotif.photo.startsWith('http')
            ? selectedNotif.photo
            : `/storage/${selectedNotif.photo}`
        : null;
    const fileLabel = `${name || 'document'}_${docType || 'file'}`.replace(/\s+/g, '_');

    return (
        <div
            onClick={closeDetail}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-white rounded-2xl overflow-hidden flex flex-col w-full transition-all duration-200 ${
                    isNotifPreviewMaximized ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl max-h-[90vh]'
                }`}
            >
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold overflow-hidden">
                            {docPhoto ? <img src={docPhoto} alt={name} className="w-full h-full object-cover" /> : docInitials}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">{name || 'Volunteer'}</span>
                                <StatusPill status={status} />
                            </div>
                            <div className="text-xs font-semibold text-red-600">{docType || 'Document'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {(showImage || showPdf) && (
                            <button
                                onClick={() => setIsNotifPreviewMaximized((m) => !m)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                            >
                                {isNotifPreviewMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                <span>{isNotifPreviewMaximized ? 'Shrink' : 'Enlarge'}</span>
                            </button>
                        )}
                        <button onClick={closeDetail} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-12 min-h-0 bg-gray-50">
                    {!isNotifPreviewMaximized && (
                        <div className="md:col-span-4 p-5 bg-white border-r border-gray-100 flex flex-col items-center text-center space-y-3">
                            <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold overflow-hidden">
                                {docPhoto ? <img src={docPhoto} alt={name} className="w-full h-full object-cover" /> : docInitials}
                            </div>
                            <div>
                                <div className="font-bold text-sm text-gray-900">{name || 'Volunteer'}</div>
                                <div className="text-xs text-gray-500">Muntinlupa City Branch</div>
                            </div>
                            <div className="w-full pt-3 border-t border-gray-100 text-left">
                                <div className="text-[11px] font-semibold text-gray-400">Document Type</div>
                                <div className="text-xs font-bold text-gray-900 mt-0.5">{docType || 'Document'}</div>
                            </div>
                        </div>
                    )}
                    <div className={`${isNotifPreviewMaximized ? 'col-span-12' : 'md:col-span-8'} p-4 flex items-center justify-center min-h-[360px]`}>
                        {hasFile ? (
                            showImage ? (
                                <img
                                    src={selectedNotif.file_url}
                                    alt={docType || 'Document'}
                                    className="max-h-[60vh] max-w-full object-contain rounded-xl border border-gray-200"
                                />
                            ) : showPdf ? (
                                <iframe
                                    src={`${selectedNotif.file_url}#toolbar=1`}
                                    className="w-full h-[60vh] rounded-xl border border-gray-200"
                                    title={docType || 'Document'}
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

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {status !== 'approved' && (
                            <button
                                disabled={approvingNotifDoc}
                                onClick={() => handleApproveNotifDoc(selectedNotif.ref_id)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
                            >
                                {approvingNotifDoc ? 'Processing...' : 'Approve'}
                            </button>
                        )}
                        {status !== 'rejected' && (
                            <button
                                disabled={approvingNotifDoc}
                                onClick={() => handleRejectNotifDoc(selectedNotif.ref_id)}
                                className="px-4 py-2 rounded-xl border border-red-600 text-red-600 hover:bg-red-50 text-xs font-bold transition disabled:opacity-50"
                            >
                                Reject
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasFile && status === 'approved' && (
                            <button
                                onClick={() => handleDownloadNotifDoc(selectedNotif.ref_id, fileLabel)}
                                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                            </button>
                        )}
                        <button
                            onClick={closeDetail}
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
