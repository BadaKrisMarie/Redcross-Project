import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import VolunteerLayout from '@/Layouts/VolunteerLayout';
import { detectDocumentType } from '@/utils/detectDocumentType';

// 🎨 ACCENT is the sidebar's indigo/violet — used for all primary UI actions
// (upload button, active states, links). RED is kept ONLY for destructive
// actions (delete) and error states, so the meaning of red stays consistent.
const ACCENT = '#4F46E5';
const ACCENT_TINT = '#EEEDFE';
const ACCENT_TINT_STRONG = '#C7C3F7';
const RED = '#DC2626';
const RADIUS = '12px';
const BORDER = '1px solid #E9EAEC';

const UploadCloudIcon = ({ size = 22, color = '#9CA3AF' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 18a4.5 4.5 0 0 1-.5-8.98A6 6 0 0 1 18 8.5a4 4 0 0 1-1.5 7.5" />
        <path d="M12 12v9" />
        <path d="m8.5 15.5 3.5-3.5 3.5 3.5" />
    </svg>
);

const DotsIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="12" cy="19" r="1.8" />
    </svg>
);

const SearchIcon = ({ size = 15, color = '#80868B' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const FolderIcon = ({ size = 16, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
);

const FileIcon = ({ size = 14, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
    </svg>
);

// Small spinner used while OCR/detection is running
const SpinnerIcon = ({ size = 14, color = '#9CA3AF' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
);

const CheckIcon = ({ size = 14, color = '#3E9C6E' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

// ── Bulk-select checkbox icons (Gmail-style select all / select one) ──
const CheckboxEmptyIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#B0B4BA" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="4" />
    </svg>
);

const CheckboxCheckedIcon = ({ size = 16, color = ACCENT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" fill={color} />
        <path d="M7 12.5 10.5 16 17 8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

const CheckboxIndeterminateIcon = ({ size = 16, color = ACCENT }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" fill={color} />
        <line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
);

const TrashIcon = ({ size = 14, color = 'white' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

function VolunteerDocuments({ documents, categories: initialCategories = [] }) {
    const [showUpload, setShowUpload] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [dragActive, setDragActive] = useState(false);
    const [search, setSearch] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [sortBy, setSortBy] = useState('modified'); // modified | name | type
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const sortMenuRef = useRef(null);
    const rowMenuRef = useRef(null);

    // ── Bulk-select state (Gmail-style) ──
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

    // ✅ document type "folders" come from the backend (document_categories
    // table) instead of a hardcoded list of 4. Any custom folder an admin
    // creates shows up here automatically, next time this page loads.
    const [categories, setCategories] = useState(initialCategories);
    useEffect(() => { setCategories(initialCategories); }, [initialCategories]);

    const [fileError, setFileError] = useState('');
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = {
        'application/pdf': { label: 'PDF', color: '#DC2626' },
        'image/jpeg':      { label: 'JPG', color: '#2563EB' },
        'image/jpg':       { label: 'JPG', color: '#2563EB' },
        'image/png':       { label: 'PNG', color: '#7C3AED' },
    };

    // ── Auto-detect state ──
    const [detecting, setDetecting] = useState(false);
    const [detectionResult, setDetectionResult] = useState(null); // { type, confidence, source }
    const [manualOverride, setManualOverride] = useState(false);
    const detectionRunId = useRef(0); // guards against stale async results

    const { data, setData, post, processing, reset, errors } = useForm({
        type: initialCategories[0]?.key || 'nbi',
        detection_source: 'manual',
        file: null,
    });

    const docs = documents || [];

    // ✅ docTypes is built dynamically from `categories` (key -> { label, color })
    // instead of a hardcoded object. Everything below that used to reference
    // the old hardcoded `docTypes` object keeps working unchanged.
    const docTypes = useMemo(() => {
        const map = {};
        categories.forEach((c) => {
            map[c.key] = { label: c.label, color: c.color || ACCENT };
        });
        return map;
    }, [categories]);

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const validateAndSetFile = async (file) => {
        if (!file) {
            setData('file', null);
            setFileError('');
            setDetectionResult(null);
            return;
        }
        const isAllowedType = Object.keys(ALLOWED_TYPES).includes(file.type);
        const isTooBig = file.size > MAX_FILE_SIZE;

        if (!isAllowedType) {
            setFileError('Invalid file type. Only PDF, JPG, or PNG files are allowed.');
            setData('file', null);
            setDetectionResult(null);
            return;
        }
        if (isTooBig) {
            setFileError(`File is too large (${formatFileSize(file.size)}). Max size is 5MB.`);
            setData('file', null);
            setDetectionResult(null);
            return;
        }

        setFileError('');
        setData('file', file);
        setManualOverride(false);
        setDetectionResult(null);

        // 🔍 Auto-detect document type (OCR first, filename fallback).
        // Note: this only recognizes the original 4 document types — custom
        // folders an admin creates won't be auto-detected and will need to
        // be picked manually from the dropdown, which is expected.
        const runId = ++detectionRunId.current;
        setDetecting(true);
        const result = await detectDocumentType(file);

        // Ignore result if a newer file was selected while this was running
        if (runId !== detectionRunId.current) return;

        setDetecting(false);
        setDetectionResult(result);

        if (result.type) {
            setData(data => ({ ...data, type: result.type, detection_source: result.source }));
        } else {
            setData(data => ({ ...data, detection_source: 'manual' }));
        }
    };

    const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndSetFile(file);
    };

    const handleManualTypeChange = (value) => {
        setData(data => ({ ...data, type: value, detection_source: 'manual' }));
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!data.file || fileError) return;
        post(route('volunteer.documents.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setFileError('');
                setShowUpload(false);
                setDetectionResult(null);
                setManualOverride(false);
            },
        });
    };

    const handleDelete = (id) => { setDeleteModal({ open: true, id }); setMenuOpenId(null); };
    const confirmDelete = () => {
        router.delete(route('volunteer.documents.destroy', deleteModal.id));
        setDeleteModal({ open: false, id: null });
    };
    const cancelDelete = () => setDeleteModal({ open: false, id: null });

    // Close dropdown menus on outside click
    useEffect(() => {
        const onClick = (e) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setSortMenuOpen(false);
            if (rowMenuRef.current && !rowMenuRef.current.contains(e.target)) setMenuOpenId(null);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    // ✅ counts built dynamically from `categories` instead of a hardcoded
    // nbi/medical/training/barangay lookup.
    const counts = useMemo(() => {
        const c = { all: docs.length };
        categories.forEach((cat) => {
            c[cat.key] = docs.filter((d) => d.type === cat.key).length;
        });
        return c;
    }, [docs, categories]);

    const filtered = useMemo(() => {
        let list = docs;
        if (filterType !== 'all') {
            list = list.filter(d => d.type === filterType);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(d =>
                (d.original_name || '').toLowerCase().includes(q) ||
                (docTypes[d.type]?.label || '').toLowerCase().includes(q)
            );
        }
        const sorted = [...list];
        if (sortBy === 'name') sorted.sort((a, b) => (a.original_name || '').localeCompare(b.original_name || ''));
        else if (sortBy === 'type') sorted.sort((a, b) => (docTypes[a.type]?.label || '').localeCompare(docTypes[b.type]?.label || ''));
        else sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return sorted;
    }, [docs, search, sortBy, filterType, docTypes]);

    // ── Bulk-select derived state + handlers (Gmail-style) ──
    const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    const toggleSelectAll = () => {
        setSelectedIds(allSelected ? [] : filtered.map(d => d.id));
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const clearSelection = () => setSelectedIds([]);

    const confirmBulkDelete = () => {
        router.delete(route('volunteer.documents.bulkDestroy'), {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                setBulkDeleteModal(false);
            },
        });
    };

    // Reset selection whenever the visible list changes (filter/search),
    // so we never keep "selected" ids that are no longer visible.
    useEffect(() => { setSelectedIds([]); }, [filterType, search]);

    const filePreview = data.file ? ALLOWED_TYPES[data.file.type] : null;
    const showAutoBadge = detectionResult?.type && !manualOverride;

    const sortLabels = { modified: 'Last modified', name: 'Name', type: 'Type' };

    return (
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>
            <Head title="201 - Documents" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* ── SINGLE DELETE MODAL ── */}
            {deleteModal.open && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(2px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.15s ease-out',
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px',
                        padding: '32px 28px', width: '380px', maxWidth: '90vw',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
                        animation: 'popIn 0.18s ease-out',
                    }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', textAlign: 'center', margin: '0 0 8px' }}>
                            Delete Document
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', margin: '0 0 26px', lineHeight: '1.6' }}>
                            Are you sure you want to delete this document? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px',
                                    border: '1px solid #E5E7EB', background: 'white',
                                    color: '#374151', fontSize: '13px', fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                            >Cancel</button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px',
                                    border: 'none', background: RED,
                                    color: 'white', fontSize: '13px', fontWeight: '600',
                                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
                                }}
                            >Yes, delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── BULK DELETE MODAL ── */}
            {bulkDeleteModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(2px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.15s ease-out',
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px',
                        padding: '32px 28px', width: '380px', maxWidth: '90vw',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
                        animation: 'popIn 0.18s ease-out',
                    }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', textAlign: 'center', margin: '0 0 8px' }}>
                            Delete {selectedIds.length} Document{selectedIds.length > 1 ? 's' : ''}
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', margin: '0 0 26px', lineHeight: '1.6' }}>
                            Are you sure you want to delete {selectedIds.length} document{selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setBulkDeleteModal(false)}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px',
                                    border: '1px solid #E5E7EB', background: 'white',
                                    color: '#374151', fontSize: '13px', fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                            >Cancel</button>
                            <button
                                onClick={confirmBulkDelete}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px',
                                    border: 'none', background: RED,
                                    color: 'white', fontSize: '13px', fontWeight: '600',
                                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
                                }}
                            >Yes, delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Local toolbar: search + upload trigger ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{
                    flex: 1, maxWidth: '420px', display: 'flex', alignItems: 'center', gap: '10px',
                    background: searchFocused ? 'white' : '#F1F3F4',
                    borderRadius: '10px', padding: '0 14px', height: '42px',
                    border: searchFocused ? `1.5px solid ${ACCENT}` : '1.5px solid transparent',
                    boxShadow: searchFocused ? `0 0 0 3px ${ACCENT_TINT}` : 'none',
                    transition: 'all 0.15s',
                }}>
                    <SearchIcon color={searchFocused ? ACCENT : '#80868B'} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Search your documents"
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13.5px', color: '#111', width: '100%', fontFamily: "'Montserrat', sans-serif" }}
                    />
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={() => setShowUpload(!showUpload)} style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    background: ACCENT, color: 'white', border: 'none',
                    borderRadius: '8px', padding: '0 20px', height: '42px',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
                    transition: 'transform 0.1s, box-shadow 0.15s', flexShrink: 0,
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.32)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.25)'; }}
                >
                    Upload Document
                </button>
            </div>

            {/* ── UPLOAD PANEL ── */}
            {showUpload && (
                <div style={{ background: 'white', borderRadius: RADIUS, border: BORDER, padding: '28px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(16,24,40,0.04)' }}>
                    <div style={{ marginBottom: '22px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>Upload New Document</span>
                    </div>
                    <form onSubmit={handleUpload}>
                        {/* File dropzone comes FIRST now — type is detected from it */}
                        <label
                            htmlFor="doc-file-input"
                            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                gap: '10px', padding: '36px 20px', borderRadius: '10px',
                                border: `1.5px dashed ${dragActive ? ACCENT : '#D1D5DB'}`,
                                background: dragActive ? ACCENT_TINT : '#FAFAFB',
                                cursor: 'pointer', transition: 'all 0.15s', marginBottom: '6px',
                            }}
                        >
                            <input
                                id="doc-file-input"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <UploadCloudIcon color={dragActive ? ACCENT : '#9CA3AF'} />
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                Click to browse or drag a file here
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>
                                PDF, JPG, or PNG — max 5MB. We'll detect the document type automatically.
                            </div>
                        </label>
                        {errors.file && <div style={{ fontSize: '11.5px', color: RED, marginTop: '6px', fontWeight: '500' }}>{errors.file}</div>}

                        {fileError && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: '#FCE8E6', border: '1px solid #F6C1BC',
                                borderRadius: '10px', padding: '11px 15px', marginTop: '14px',
                            }}>
                                <span style={{ fontSize: '12.5px', color: '#8A1E1A', fontWeight: '500' }}>{fileError}</span>
                            </div>
                        )}

                        {!fileError && data.file && filePreview && (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: '#F9FAFB', border: '1px solid #E5E7EB',
                                borderRadius: '10px', padding: '12px 15px', marginTop: '14px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: '7px', flexShrink: 0,
                                        background: `${filePreview.color}14`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <FileIcon color={filePreview.color} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '12.5px', fontWeight: '600', color: '#111',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px',
                                        }}>
                                            {data.file.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                                            {formatFileSize(data.file.size)}
                                        </div>
                                    </div>
                                </div>
                                <span style={{
                                    background: `${filePreview.color}14`, color: filePreview.color,
                                    padding: '3px 10px', borderRadius: '20px', fontSize: '10.5px', fontWeight: '700',
                                    flexShrink: 0,
                                }}>
                                    {filePreview.label}
                                </span>
                            </div>
                        )}

                        {/* ── Document type — auto-detected, or manual dropdown built
                             dynamically from the categories prop (includes any custom
                             folders an admin has created) ── */}
                        {data.file && !fileError && (
                            <div style={{ marginTop: '18px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
                                    Document Type
                                    {showAutoBadge && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#3E9C6E', fontWeight: '600', fontSize: '11px' }}>
                                            <CheckIcon size={12} /> Auto-detected
                                        </span>
                                    )}
                                </label>

                                {detecting && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '9px',
                                        background: '#F9FAFB', border: '1px solid #E5E7EB',
                                        borderRadius: '8px', padding: '11px 14px',
                                        fontSize: '12.5px', color: '#6B7280',
                                    }}>
                                        <SpinnerIcon />
                                        Analyzing document…
                                    </div>
                                )}

                                {!detecting && showAutoBadge && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: '#F0FDF4', border: '1px solid #BBF7D0',
                                        borderRadius: '8px', padding: '10px 14px',
                                    }}>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
                                            {docTypes[data.type]?.label}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setManualOverride(true)}
                                            style={{ background: 'none', border: 'none', color: '#3E9C6E', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                        >
                                            Not correct? Change
                                        </button>
                                    </div>
                                )}

                                {!detecting && !showAutoBadge && (
                                    <>
                                        <select
                                            value={data.type}
                                            onChange={e => handleManualTypeChange(e.target.value)}
                                            style={{ width: '280px', maxWidth: '100%', padding: '11px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: 'white', color: '#111', outline: 'none', fontFamily: "'Montserrat', sans-serif" }}
                                        >
                                            {categories.map((c) => (
                                                <option key={c.key} value={c.key}>{c.label}</option>
                                            ))}
                                        </select>
                                        {detectionResult && !detectionResult.type && (
                                            <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '6px' }}>
                                                Couldn't auto-detect this document. Please select the type manually.
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                            <button type="submit" disabled={processing || !data.file || !!fileError || detecting} style={{
                                background: (!data.file || fileError || detecting) ? '#C7C3F7' : ACCENT,
                                color: 'white', border: 'none',
                                borderRadius: '8px', padding: '11px 22px',
                                fontSize: '13px', fontWeight: '600',
                                cursor: (!data.file || fileError || detecting) ? 'not-allowed' : 'pointer',
                                boxShadow: (!data.file || fileError || detecting) ? 'none' : '0 2px 8px rgba(79,70,229,0.22)',
                            }}>
                                {processing ? 'Uploading…' : 'Upload Document'}
                            </button>
                            <button type="button" onClick={() => {
                                setShowUpload(false);
                                reset();
                                setFileError('');
                                setDetectionResult(null);
                                setManualOverride(false);
                            }} style={{
                                background: 'white', color: '#374151', border: '1px solid #E5E7EB',
                                borderRadius: '8px', padding: '11px 22px',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── FOLDERS (document type cards) — driven by `docTypes`, which is
                 itself built from the `categories` prop, so any admin-created
                 folder appears here automatically. Empty folders are dimmed so
                 folders with files stand out at a glance. ── */}
            <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#9AA0A6', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px' }}>Folders</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '32px' }}>
                {Object.entries(docTypes).map(([key, val]) => {
                    const count = counts[key] || 0;
                    const hasDoc = count > 0;
                    const isSelected = filterType === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilterType(isSelected ? 'all' : key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '13px',
                                background: 'white',
                                border: isSelected ? `1.5px solid ${ACCENT}` : BORDER,
                                boxShadow: isSelected ? `0 0 0 3px ${ACCENT_TINT}` : '0 1px 2px rgba(16,24,40,0.03)',
                                borderRadius: RADIUS, padding: '16px', cursor: 'pointer',
                                textAlign: 'left', font: 'inherit', transition: 'box-shadow .15s, border-color .15s, opacity .15s',
                                opacity: hasDoc || isSelected ? 1 : 0.6,
                            }}
                            onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,24,40,0.06)'; e.currentTarget.style.opacity = '1'; } }}
                            onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.boxShadow = '0 1px 2px rgba(16,24,40,0.03)'; e.currentTarget.style.opacity = hasDoc ? '1' : '0.6'; } }}
                        >
                            <div style={{
                                width: 38, height: 38, borderRadius: '9px', flexShrink: 0,
                                background: hasDoc ? ACCENT_TINT : '#F1F3F4',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <FolderIcon color={hasDoc ? ACCENT : '#9CA3AF'} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val.label}</div>
                                <div style={{ fontSize: '11.5px', color: '#9AA0A6', marginTop: '2px' }}>
                                    {hasDoc ? `${count} file${count > 1 ? 's' : ''}` : 'Empty'}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ── FILES LIST HEADER (sort control) ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#9AA0A6', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Files
                </div>
                {filterType !== 'all' && (
                    <button
                        onClick={() => setFilterType('all')}
                        style={{ background: 'none', border: 'none', color: ACCENT, fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginRight: 'auto', marginLeft: '12px' }}
                    >
                        Clear folder filter ✕
                    </button>
                )}
                <div ref={sortMenuRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setSortMenuOpen(o => !o)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: '12.5px', color: '#5F6368', fontWeight: '600', padding: '6px 8px', borderRadius: '6px',
                            fontFamily: "'Montserrat', sans-serif",
                        }}
                    >
                        Sort: {sortLabels[sortBy]}
                    </button>
                    {sortMenuOpen && (
                        <div style={{
                            position: 'absolute', right: 0, top: '34px', background: 'white',
                            border: '1px solid #EAECEF', borderRadius: '8px', boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
                            width: '160px', zIndex: 20, overflow: 'hidden',
                        }}>
                            {Object.entries(sortLabels).map(([key, label]) => (
                                <div
                                    key={key}
                                    onClick={() => { setSortBy(key); setSortMenuOpen(false); }}
                                    style={{
                                        padding: '9px 14px', fontSize: '12.5px', cursor: 'pointer',
                                        color: sortBy === key ? ACCENT : '#374151',
                                        fontWeight: sortBy === key ? '600' : '400',
                                        background: sortBy === key ? ACCENT_TINT : 'white',
                                    }}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── BULK ACTION BAR (appears when 1+ files selected, Gmail-style) ── */}
            {selectedIds.length > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: ACCENT_TINT, border: `1px solid ${ACCENT_TINT_STRONG}`,
                    borderRadius: RADIUS, padding: '10px 18px', marginBottom: '14px',
                }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: ACCENT }}>
                        {selectedIds.length} selected
                    </span>
                    <button onClick={clearSelection} style={{
                        background: 'none', border: 'none', color: '#5F6368',
                        fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
                    }}>Clear</button>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setBulkDeleteModal(true)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: RED, color: 'white', border: 'none',
                        borderRadius: '8px', padding: '8px 16px',
                        fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
                    }}>
                        <TrashIcon /> Delete
                    </button>
                </div>
            )}

            {/* ── FILES LIST ── */}
            {filtered.length === 0 ? (
                <div style={{ background: 'white', borderRadius: RADIUS, border: BORDER, padding: '64px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                        {search ? 'No documents match your search' : 'No documents yet'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '22px' }}>
                        {search ? 'Try a different name or clear your search.' : 'Upload your clearances and certificates to get started.'}
                    </div>
                    {!search && (
                        <button onClick={() => setShowUpload(true)} style={{
                            background: ACCENT, color: 'white', border: 'none',
                            borderRadius: '8px', padding: '10px 22px',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
                        }}>Upload your first document</button>
                    )}
                </div>
            ) : (
                <div className={`doc-files-list${selectedIds.length > 0 ? ' selecting' : ''}`} style={{ background: 'white', borderRadius: RADIUS, border: BORDER, overflow: 'visible' }}>
                    <div className="doc-row doc-header-row" style={{
                        display: 'grid', gridTemplateColumns: '32px 1fr 130px 44px',
                        padding: '12px 20px', borderBottom: '1px solid #EEF0F2',
                        fontSize: '11px', fontWeight: '700', color: '#9AA0A6', letterSpacing: '0.5px',
                        background: '#FBFBFC', borderRadius: `${RADIUS} ${RADIUS} 0 0`,
                        alignItems: 'center',
                    }}>
                        <span className="doc-checkbox" onClick={toggleSelectAll} style={{ cursor: 'pointer', display: 'flex' }} title="Select all">
                            {allSelected ? <CheckboxCheckedIcon /> : someSelected ? <CheckboxIndeterminateIcon /> : <CheckboxEmptyIcon />}
                        </span>
                        <span>NAME</span>
                        <span>DATE</span>
                        <span />
                    </div>
                    {filtered.map((doc, i) => {
                        const dt = docTypes[doc.type];
                        const isLast = i === filtered.length - 1;
                        const isChecked = selectedIds.includes(doc.id);
                        return (
                            <div
                                key={doc.id}
                                className={`doc-row${isChecked ? ' checked' : ''}`}
                                style={{
                                    display: 'grid', gridTemplateColumns: '32px 1fr 130px 44px', alignItems: 'center',
                                    padding: '13px 20px', borderBottom: isLast ? 'none' : '1px solid #F5F5F6',
                                    position: 'relative', transition: 'background .12s',
                                    background: isChecked ? '#F5F4FE' : 'transparent',
                                }}
                                onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = '#FAFAFB'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = isChecked ? '#F5F4FE' : 'transparent'; }}
                            >
                                <span className="doc-checkbox" onClick={() => toggleSelectOne(doc.id)} style={{ cursor: 'pointer', display: 'flex' }}>
                                    {isChecked ? <CheckboxCheckedIcon /> : <CheckboxEmptyIcon />}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '7px', flexShrink: 0,
                                        background: ACCENT_TINT,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <FileIcon color={ACCENT} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {doc.original_name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
                                            {dt?.label || doc.type}{doc.file_size != null ? ` · ${formatFileSize(doc.file_size)}` : ''}
                                            {doc.detection_source && doc.detection_source !== 'manual' && (
                                                <span style={{ color: '#3E9C6E', fontWeight: '600' }}> · Auto-detected</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span style={{ fontSize: '12.5px', color: '#5F6368' }}>
                                    {new Date(doc.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }} ref={menuOpenId === doc.id ? rowMenuRef : null}>
                                    <button
                                        onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)}
                                        style={{
                                            background: 'transparent', border: 'none', cursor: 'pointer',
                                            color: '#9AA0A6', width: 28, height: 28, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'background .12s, color .12s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#F1F3F4'; e.currentTarget.style.color = '#374151'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9AA0A6'; }}
                                    >
                                        <DotsIcon />
                                    </button>
                                    {menuOpenId === doc.id && (
                                        <div style={{
                                            position: 'absolute', right: 0, top: '32px', background: 'white',
                                            border: '1px solid #EAECEF', borderRadius: '8px', boxShadow: '0 8px 24px rgba(16,24,40,0.14)',
                                            width: '140px', zIndex: 30, overflow: 'hidden',
                                        }}>
                                            <div
                                                onClick={() => handleDelete(doc.id)}
                                                style={{
                                                    padding: '9px 14px', fontSize: '12.5px', color: RED,
                                                    cursor: 'pointer', fontWeight: '500',
                                                    borderBottom: '1px solid #F5F5F6',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                Delete
                                            </div>
                                            <div
                                                onClick={() => setMenuOpenId(null)}
                                                style={{
                                                    padding: '9px 14px', fontSize: '12.5px', color: '#374151',
                                                    cursor: 'pointer', fontWeight: '500',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                Cancel
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* ── Checkboxes invisible by default, like Gmail ──
                   They only appear when: hovering the row/header, a row is
                   already checked, or the list is in "selecting" mode
                   (i.e. at least one document is currently selected). */
                .doc-checkbox {
                    opacity: 0;
                    transition: opacity 0.12s ease;
                }
                .doc-row:hover .doc-checkbox,
                .doc-row.checked .doc-checkbox,
                .doc-files-list.selecting .doc-checkbox {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}

// ✅ Persistent layout — the sidebar stays mounted and doesn't re-render
// or reset every time the volunteer navigates to or away from this page.
VolunteerDocuments.layout = (page) => <VolunteerLayout title="201 / Documents">{page}</VolunteerLayout>;

export default VolunteerDocuments;