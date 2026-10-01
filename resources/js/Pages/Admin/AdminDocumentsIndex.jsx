import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Folder,
    Plus,
    Trash2,
    Search,
    Eye,
    Download,
    X,
    FileText,
    Check,
    FolderPlus,
    AlertTriangle,
} from 'lucide-react';

function Avatar({ src, initials, size = 32 }) {
    const [broken, setBroken] = useState(false);
    const showImage = !!src && !broken;

    return (
        <div
            style={{ width: size, height: size }}
            className="rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden"
        >
            {showImage ? (
                <img
                    src={src}
                    alt="avatar"
                    onError={() => setBroken(true)}
                    onLoad={(e) => {
                        if (e.target.naturalWidth === 0) setBroken(true);
                    }}
                    className="w-full h-full object-cover"
                />
            ) : (
                initials
            )}
        </div>
    );
}

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

function AdminDocumentsIndex({ documents: initialDocuments = [], categories: initialCategories = [] }) {
    const [documents, setDocuments] = useState(initialDocuments);
    useEffect(() => { setDocuments(initialDocuments); }, [initialDocuments]);

    const [categories, setCategories] = useState(initialCategories);
    useEffect(() => { setCategories(initialCategories); }, [initialCategories]);

    const [previewDoc, setPreviewDoc] = useState(null);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [approving, setApproving] = useState(false);
    const deleteBtnRef = useRef(null);

    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderLabel, setNewFolderLabel] = useState('');
    const [newFolderError, setNewFolderError] = useState('');
    const [creatingFolder, setCreatingFolder] = useState(false);
    const newFolderInputRef = useRef(null);

    const [folderDeleteTarget, setFolderDeleteTarget] = useState(null);
    const folderDeleteBtnRef = useRef(null);

    const isImageDoc = (doc) => doc.mime_type && doc.mime_type.startsWith('image/');
    const isPdfDoc = (doc) => doc.mime_type === 'application/pdf';

    const getFileTypeInfo = (doc) => {
        if (isPdfDoc(doc)) return { label: 'PDF', color: 'bg-red-100 text-red-700' };
        if (isImageDoc(doc)) {
            if (doc.mime_type === 'image/png') return { label: 'PNG', color: 'bg-purple-100 text-purple-700' };
            return { label: 'JPG', color: 'bg-blue-100 text-blue-700' };
        }
        return { label: doc.mime_type ? doc.mime_type.split('/')[1]?.toUpperCase() : 'FILE', color: 'bg-gray-100 text-gray-700' };
    };

    const formatFileSize = (bytes) => {
        if (bytes == null) return null;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const handleDownload = (doc) => {
        if (!doc.file_url || doc.status !== 'approved') return;
        window.location.href = route('admin.documents.download', doc.id);
    };

    const handleDelete = (doc) => {
        setDeleteTarget(doc);
    };

    const closeDeleteModal = () => {
        setDeleteTarget(null);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const target = deleteTarget;
        setDeleteTarget(null);
        setDocuments((prev) => prev.filter((d) => d.id !== target.id));

        router.delete(route('admin.documents.destroy', target.id), {
            preserveScroll: true,
            preserveState: true,
            only: ['documents'],
            onError: () => {
                setDocuments((prev) => (prev.some((d) => d.id === target.id) ? prev : [...prev, target]));
                alert('Failed to delete document. Please try again.');
            },
        });
    };

    const handleDeleteFolder = (folder) => {
        setFolderDeleteTarget(folder);
    };

    const closeFolderDeleteModal = () => {
        setFolderDeleteTarget(null);
    };

    const confirmDeleteFolder = () => {
        if (!folderDeleteTarget) return;
        const target = folderDeleteTarget;
        setFolderDeleteTarget(null);

        const prevCategories = categories;
        const prevDocuments = documents;

        setCategories((prev) => prev.filter((c) => c.id !== target.id));
        setDocuments((prev) => prev.filter((d) => !target.types.includes(d.type?.toLowerCase())));
        if (typeFilter === target.key) setTypeFilter(null);

        router.delete(route('admin.documents.categories.destroy', target.id), {
            preserveScroll: true,
            preserveState: true,
            only: ['categories', 'documents'],
            onError: () => {
                setCategories(prevCategories);
                setDocuments(prevDocuments);
                alert('Failed to delete folder. Please try again.');
            },
        });
    };

    const openNewFolderModal = () => {
        setNewFolderLabel('');
        setNewFolderError('');
        setShowNewFolder(true);
        setTimeout(() => newFolderInputRef.current?.focus(), 80);
    };

    const closeNewFolderModal = () => {
        if (creatingFolder) return;
        setShowNewFolder(false);
        setNewFolderLabel('');
        setNewFolderError('');
    };

    const handleCreateFolder = (e) => {
        e.preventDefault();
        const trimmed = newFolderLabel.trim();
        if (!trimmed) {
            setNewFolderError('Please enter a folder name.');
            return;
        }

        setCreatingFolder(true);
        router.post(
            route('admin.documents.categories.store'),
            { label: trimmed },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['categories'],
                onSuccess: () => {
                    setCreatingFolder(false);
                    closeNewFolderModal();
                },
                onError: (errors) => {
                    setCreatingFolder(false);
                    setNewFolderError(errors.label || 'Failed to create folder.');
                },
            }
        );
    };

    const handleApprove = (doc) => {
        setApproving(true);
        router.patch(
            route('admin.documents.approve', doc.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['documents'],
                onSuccess: () => {
                    setDocuments((prev) =>
                        prev.map((d) => (d.id === doc.id ? { ...d, status: 'approved' } : d))
                    );
                    setPreviewDoc((p) => (p && p.id === doc.id ? { ...p, status: 'approved' } : p));
                },
                onFinish: () => setApproving(false),
                onError: () => alert('Failed to approve document. Please try again.'),
            }
        );
    };

    const handleReject = (doc) => {
        setApproving(true);
        router.patch(
            route('admin.documents.reject', doc.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['documents'],
                onSuccess: () => {
                    setDocuments((prev) =>
                        prev.map((d) => (d.id === doc.id ? { ...d, status: 'rejected' } : d))
                    );
                    setPreviewDoc((p) => (p && p.id === doc.id ? { ...p, status: 'rejected' } : p));
                },
                onFinish: () => setApproving(false),
                onError: () => alert('Failed to reject document. Please try again.'),
            }
        );
    };

    const folderMap = useMemo(() => {
        const map = new Map();
        categories.forEach((cat) => {
            const types = [cat.key.toLowerCase()];
            if (cat.key === 'barangay') types.push('bangray');
            map.set(cat.key, {
                id: cat.id,
                key: cat.key,
                label: cat.label,
                types,
            });
        });
        return map;
    }, [categories]);

    const folderList = useMemo(() => {
        return Array.from(folderMap.values()).map((folder) => {
            const count = documents.filter((d) => folder.types.includes(d.type?.toLowerCase())).length;
            return { ...folder, count };
        });
    }, [folderMap, documents]);

    const getFolderLabel = (rawType) => {
        if (!rawType) return 'Document';
        for (const folder of folderMap.values()) {
            if (folder.types.includes(rawType.toLowerCase())) return folder.label;
        }
        return rawType.toUpperCase();
    };

    const filtered = useMemo(() => {
        return documents.filter((doc) => {
            if (typeFilter) {
                const folder = folderMap.get(typeFilter);
                const matchesFolder = folder
                    ? folder.types.includes(doc.type?.toLowerCase())
                    : doc.type?.toLowerCase() === typeFilter;
                if (!matchesFolder) return false;
            }
            if (query) {
                const q = query.toLowerCase();
                const name = (doc.name || '').toLowerCase();
                const type = (getFolderLabel(doc.type) || '').toLowerCase();
                return name.includes(q) || type.includes(q);
            }
            return true;
        });
    }, [documents, typeFilter, query, folderMap]);

    return (
        <>
            <Head title="201 Files - Admin Portal" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Folder Categories Grid */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">Document Folders</h3>
                        <button
                            onClick={openNewFolderModal}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Folder</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {folderList.map((folder) => {
                            const isSelected = typeFilter === folder.key;
                            return (
                                <div
                                    key={folder.key}
                                    onClick={() => setTypeFilter(isSelected ? null : folder.key)}
                                    className={`p-4 rounded-2xl transition cursor-pointer flex flex-col justify-between gap-3 relative group ${
                                        isSelected
                                            ? 'bg-red-50 ring-2 ring-red-500/20'
                                            : 'bg-white hover:bg-gray-50/80'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className={`p-2.5 rounded-xl shrink-0 ${
                                            isSelected ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'
                                        }`}>
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFolder(folder);
                                            }}
                                            className="p-1 rounded-lg text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                                            title="Delete folder"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 truncate">{folder.label}</h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            {folder.count} {folder.count === 1 ? 'file' : 'files'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Documents Table Card */}
                <div className="bg-white rounded-2xl overflow-hidden space-y-4 p-5">
                    {/* Header + Search & Filter reset */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">
                                {typeFilter ? `${getFolderLabel(typeFilter)} Files` : 'All 201 Files'}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                                {filtered.length}
                            </span>
                            {typeFilter && (
                                <button
                                    onClick={() => setTypeFilter(null)}
                                    className="text-xs font-bold text-red-600 hover:text-red-700 ml-1"
                                >
                                    Show all
                                </button>
                            )}
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name or document..."
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto -mx-5 -mb-5">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-t border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500">
                                    <th className="p-3.5 sm:px-5">Volunteer</th>
                                    <th className="p-3.5 sm:px-5">Document</th>
                                    <th className="p-3.5 sm:px-5">File</th>
                                    <th className="p-3.5 sm:px-5">Uploaded</th>
                                    <th className="p-3.5 sm:px-5">Status</th>
                                    <th className="p-3.5 sm:px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-400">
                                            No documents found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((doc) => {
                                        const typeInfo = getFileTypeInfo(doc);
                                        return (
                                            <tr key={doc.id} className="hover:bg-gray-50/60 transition">
                                                <td className="p-3.5 sm:px-5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar src={doc.photo} initials={doc.initials} size={32} />
                                                        <div>
                                                            <div className="font-bold text-gray-900">{doc.name}</div>
                                                            <div className="text-[11px] text-gray-400">Muntinlupa Branch</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3.5 sm:px-5 font-semibold text-gray-800">
                                                    {getFolderLabel(doc.type)}
                                                </td>
                                                <td className="p-3.5 sm:px-5">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${typeInfo.color}`}>
                                                        {typeInfo.label}
                                                    </span>
                                                    {formatFileSize(doc.file_size) && (
                                                        <span className="text-[11px] text-gray-400 ml-1.5">
                                                            {formatFileSize(doc.file_size)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3.5 sm:px-5 text-gray-500">
                                                    {doc.uploaded_at}
                                                </td>
                                                <td className="p-3.5 sm:px-5">
                                                    <StatusPill status={doc.status ?? 'pending'} />
                                                </td>
                                                <td className="p-3.5 sm:px-5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setPreviewDoc(doc)}
                                                            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                                                            title="Preview"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {doc.file_url && doc.status === 'approved' && (
                                                            <button
                                                                onClick={() => handleDownload(doc)}
                                                                className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(doc)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            {previewDoc && (
                <div
                    onClick={() => setPreviewDoc(null)}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl overflow-hidden flex flex-col w-full max-w-4xl max-h-[90vh] shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar src={previewDoc.photo} initials={previewDoc.initials} size={36} />
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{previewDoc.name}</div>
                                    <div className="text-xs font-semibold text-red-600">{getFolderLabel(previewDoc.type)}</div>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-12 min-h-0 bg-gray-50">
                            <div className="md:col-span-4 p-5 bg-white border-r border-gray-100 flex flex-col items-center text-center space-y-3">
                                <Avatar src={previewDoc.photo} initials={previewDoc.initials} size={72} />
                                <div>
                                    <div className="font-bold text-sm text-gray-900">{previewDoc.name}</div>
                                    <div className="text-xs text-gray-500">Muntinlupa City Branch</div>
                                </div>
                                <div className="w-full pt-3 border-t border-gray-100 text-left space-y-2 text-xs">
                                    <div>
                                        <span className="text-[11px] font-semibold text-gray-400">Document Type</span>
                                        <div className="font-bold text-gray-900">{getFolderLabel(previewDoc.type)}</div>
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-semibold text-gray-400">Uploaded</span>
                                        <div className="text-gray-700">{previewDoc.uploaded_at}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-8 p-4 flex items-center justify-center min-h-[360px]">
                                {previewDoc.file_url ? (
                                    isImageDoc(previewDoc) ? (
                                        <img
                                            src={previewDoc.file_url}
                                            alt={previewDoc.type}
                                            className="max-h-[60vh] max-w-full object-contain rounded-xl border border-gray-200"
                                        />
                                    ) : isPdfDoc(previewDoc) ? (
                                        <iframe
                                            src={`${previewDoc.file_url}#toolbar=1`}
                                            className="w-full h-[60vh] rounded-xl border border-gray-200"
                                            title={previewDoc.type}
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400 text-xs">
                                            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            Cannot preview this file directly.
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
                                {previewDoc.status !== 'approved' && (
                                    <button
                                        disabled={approving}
                                        onClick={() => handleApprove(previewDoc)}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
                                    >
                                        {approving ? 'Processing...' : 'Approve'}
                                    </button>
                                )}
                                {previewDoc.status !== 'rejected' && previewDoc.status !== 'approved' && (
                                    <button
                                        disabled={approving}
                                        onClick={() => handleReject(previewDoc)}
                                        className="px-4 py-2 rounded-xl border border-red-600 text-red-600 hover:bg-red-50 text-xs font-bold transition disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {previewDoc.file_url && previewDoc.status === 'approved' && (
                                    <button
                                        onClick={() => handleDownload(previewDoc)}
                                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center gap-1.5"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setPreviewDoc(null)}
                                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Document Modal */}
            {deleteTarget && (
                <div
                    onClick={closeDeleteModal}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Delete this document?</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    This will permanently remove the <strong>{getFolderLabel(deleteTarget.type)}</strong> uploaded by <strong>{deleteTarget.name}</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                ref={deleteBtnRef}
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Folder Modal */}
            {folderDeleteTarget && (
                <div
                    onClick={closeFolderDeleteModal}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    Delete "{folderDeleteTarget.label}" folder?
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {folderDeleteTarget.count > 0
                                        ? `This will permanently delete this folder and all ${folderDeleteTarget.count} document(s) filed under it.`
                                        : 'This folder is empty. Deleting it cannot be undone.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={closeFolderDeleteModal}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                ref={folderDeleteBtnRef}
                                onClick={confirmDeleteFolder}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition"
                            >
                                Delete Folder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Folder Modal */}
            {showNewFolder && (
                <div
                    onClick={closeNewFolderModal}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">Create New Folder</h3>
                            <button onClick={closeNewFolderModal} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateFolder} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                    Folder Name
                                </label>
                                <input
                                    ref={newFolderInputRef}
                                    type="text"
                                    value={newFolderLabel}
                                    onChange={(e) => {
                                        setNewFolderLabel(e.target.value);
                                        setNewFolderError('');
                                    }}
                                    placeholder="e.g. Police Clearance"
                                    disabled={creatingFolder}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                />
                                {newFolderError && (
                                    <p className="text-xs text-red-600 mt-1">{newFolderError}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeNewFolderModal}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingFolder}
                                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition disabled:opacity-50"
                                >
                                    {creatingFolder ? 'Creating...' : 'Create Folder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

AdminDocumentsIndex.layout = (page) => <AdminLayout title="201 Files">{page}</AdminLayout>;

export default AdminDocumentsIndex;