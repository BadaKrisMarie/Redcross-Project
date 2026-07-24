import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';

const RED = '#ff0000';

export default function VolunteerDocuments({ auth, documents }) {
    const volunteer = auth.user;
    const avatarUrl = volunteer?.photo_url || null;
    const initials = volunteer?.name
        ? volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    const [showUpload, setShowUpload] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [dragActive, setDragActive] = useState(false);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('modified'); // modified | name | type
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const sortMenuRef = useRef(null);
    const rowMenuRef = useRef(null);

    const [fileError, setFileError] = useState('');
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = {
        'application/pdf': { label: 'PDF', color: '#DC2626' },
        'image/jpeg':      { label: 'JPG', color: '#2563EB' },
        'image/jpg':       { label: 'JPG', color: '#2563EB' },
        'image/png':       { label: 'PNG', color: '#7C3AED' },
    };

    const { data, setData, post, processing, reset, errors } = useForm({
        type: 'nbi',
        file: null,
    });

    const docs = documents || [];

    // Folder-style colors, closer to a neutral Drive palette with one PRC-red accent reserved for actions
    const docTypes = {
        nbi:      { label: 'NBI Clearance',        color: '#5B7FDE' },
        medical:  { label: 'Medical Certificate',  color: '#3E9C6E' },
        training: { label: 'Training Certificate', color: '#9066C7' },
        barangay: { label: 'Barangay Clearance',   color: '#C98A2E' },
    };

    const statusStyle = {
        submitted: { background: '#F1F3F4', color: '#5F6368', label: 'Submitted' },
        approved:  { background: '#E6F4EA', color: '#1E7E34', label: 'Approved' },
        rejected:  { background: '#FCE8E6', color: '#C5221F', label: 'Rejected' },
    };

    const sidebarLinks = [
        { key: 'dashboard',     label: 'Dashboard',     href: route('volunteer.dashboard') },
        { key: 'schedule',      label: 'Schedule',      href: route('volunteer.schedule') },
        { key: 'communication', label: 'Communication', href: route('volunteer.communication') },
        { key: 'attendance',    label: 'Attendance',    href: route('volunteer.attendance') },
        { key: 'documents',     label: '201',           href: route('volunteer.documents') },
    ];

    const handleLogout = () => router.post(route('logout'));

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const validateAndSetFile = (file) => {
        if (!file) {
            setData('file', null);
            setFileError('');
            return;
        }
        const isAllowedType = Object.keys(ALLOWED_TYPES).includes(file.type);
        const isTooBig = file.size > MAX_FILE_SIZE;

        if (!isAllowedType) {
            setFileError('Invalid file type. Only PDF, JPG, or PNG files are allowed.');
            setData('file', null);
            return;
        }
        if (isTooBig) {
            setFileError(`File is too large (${formatFileSize(file.size)}). Max size is 5MB.`);
            setData('file', null);
            return;
        }
        setFileError('');
        setData('file', file);
    };

    const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndSetFile(file);
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!data.file || fileError) return;
        post(route('volunteer.documents.store'), {
            forceFormData: true,
            onSuccess: () => { reset(); setFileError(''); setShowUpload(false); },
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

    const counts = {
        all:      docs.length,
        nbi:      docs.filter(d => d.type === 'nbi').length,
        medical:  docs.filter(d => d.type === 'medical').length,
        training: docs.filter(d => d.type === 'training').length,
        barangay: docs.filter(d => d.type === 'barangay').length,
    };

    const filtered = useMemo(() => {
        let list = docs;
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
    }, [docs, filterType, search, sortBy]);

    const filePreview = data.file ? ALLOWED_TYPES[data.file.type] : null;

    const sortLabels = { modified: 'Last modified', name: 'Name', type: 'Type' };

    return (
        <>
            <Head title="201 - Documents" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* ── DELETE MODAL ── */}
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
                                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,0,0,0.25)',
                                }}
                            >Yes, delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#FAFAFA' }}>

                {/* SIDEBAR — kept as PRC brand, one bold accent in an otherwise neutral Drive-style page */}
                <aside style={{
                    width: '160px', minHeight: '100vh', background: RED,
                    display: 'flex', flexDirection: 'column', flexShrink: 0,
                    position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
                }}>
                    <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: avatarUrl ? 'transparent' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', flexShrink: 0,
                            border: '2px solid rgba(255,255,255,0.55)',
                        }}>
                            {avatarUrl
                                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                : <span style={{ color: RED, fontSize: '13px', fontWeight: '800' }}>{initials}</span>}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{
                                fontSize: '13px', fontWeight: '700', color: 'white', lineHeight: '1.3',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '92px',
                            }}>
                                {volunteer?.name || 'Volunteer'}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '400', color: 'rgba(255,255,255,0.82)' }}>
                                Volunteer
                            </div>
                        </div>
                    </div>

                    <nav style={{ flex: 1, paddingTop: '8px' }}>
                        <div style={{ padding: '4px 16px 8px', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.6px' }}>
                            MAIN
                        </div>
                        {sidebarLinks.map(item => {
                            const isActive = item.key === 'documents';
                            return (
                                <Link key={item.key} href={item.href} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '11px 16px', textDecoration: 'none',
                                    background: isActive ? 'rgba(0,0,0,0.18)' : 'transparent',
                                    color: 'white', fontSize: '13px',
                                    fontWeight: isActive ? '600' : '400',
                                    borderLeft: isActive ? '3px solid white' : '3px solid transparent',
                                }}>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                        <button onClick={handleLogout} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,0.75)', fontSize: '12px', padding: 0, width: '100%'
                        }}>
                            Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div style={{ marginLeft: '160px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Drive-style top bar: search takes the place of the breadcrumb */}
                    <header style={{
                        background: 'white', padding: '0 28px', height: '64px',
                        display: 'flex', alignItems: 'center', gap: '20px',
                        borderBottom: '1px solid #EEF0F2', position: 'sticky', top: 0, zIndex: 50,
                    }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', flexShrink: 0 }}>201 / Documents</div>
                        <div style={{
                            flex: 1, maxWidth: '520px', display: 'flex', alignItems: 'center', gap: '10px',
                            background: '#F1F3F4', borderRadius: '10px', padding: '9px 14px',
                        }}>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search your documents"
                                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13.5px', color: '#111', width: '100%' }}
                            />
                        </div>
                        <div style={{ flex: 1 }} />
                        <button onClick={() => setShowUpload(!showUpload)} style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            background: RED, color: 'white', border: 'none',
                            borderRadius: '8px', padding: '9px 18px',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(255,0,0,0.22)',
                            transition: 'transform 0.1s, box-shadow 0.15s', flexShrink: 0,
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,0,0,0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,0,0,0.22)'; }}
                        >
                            Upload Document
                        </button>
                        <div title={volunteer?.name} style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: avatarUrl ? 'transparent' : RED,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '13px', fontWeight: '700',
                            flexShrink: 0, overflow: 'hidden',
                        }}>
                            {avatarUrl
                                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                : initials
                            }
                        </div>
                    </header>

                    <main style={{ flex: 1, padding: '26px 30px', overflowY: 'auto' }}>

                        {/* ── UPLOAD PANEL ── */}
                        {showUpload && (
                            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #EAECEF', padding: '26px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(16,24,40,0.04)' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>Upload New Document</span>
                                </div>
                                <form onSubmit={handleUpload}>
                                    <div style={{ marginBottom: '18px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '7px' }}>Document Type</label>
                                        <select
                                            value={data.type}
                                            onChange={e => setData('type', e.target.value)}
                                            style={{ width: '260px', maxWidth: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: 'white', color: '#111', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                                        >
                                            <option value="nbi">NBI Clearance</option>
                                            <option value="medical">Medical Certificate</option>
                                            <option value="training">Training Certificate</option>
                                            <option value="barangay">Barangay Clearance</option>
                                        </select>
                                    </div>

                                    <label
                                        htmlFor="doc-file-input"
                                        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={handleDrop}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            gap: '8px', padding: '30px 20px', borderRadius: '10px',
                                            border: `1.5px dashed ${dragActive ? RED : '#D1D5DB'}`,
                                            background: dragActive ? '#FFF7F7' : '#FAFAFB',
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
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                            Click to browse or drag a file here
                                        </div>
                                        <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>
                                            PDF, JPG, or PNG — max 5MB
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

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button type="submit" disabled={processing || !data.file || !!fileError} style={{
                                            background: (!data.file || fileError) ? '#F3A6A6' : RED,
                                            color: 'white', border: 'none',
                                            borderRadius: '8px', padding: '10px 22px',
                                            fontSize: '13px', fontWeight: '600',
                                            cursor: (!data.file || fileError) ? 'not-allowed' : 'pointer',
                                            boxShadow: (!data.file || fileError) ? 'none' : '0 2px 8px rgba(255,0,0,0.2)',
                                        }}>
                                            {processing ? 'Uploading…' : 'Upload Document'}
                                        </button>
                                        <button type="button" onClick={() => { setShowUpload(false); reset(); setFileError(''); }} style={{
                                            background: 'white', color: '#374151', border: '1px solid #E5E7EB',
                                            borderRadius: '8px', padding: '10px 22px',
                                            fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                        }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* ── FOLDERS (document type cards, Drive-style flat folder shape) ── */}
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#5F6368', marginBottom: '12px' }}>Folders</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '30px' }}>
                            {Object.entries(docTypes).map(([key, val]) => {
                                const count = counts[key];
                                const hasDoc = count > 0;
                                const isSelected = filterType === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setFilterType(isSelected ? 'all' : key)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            background: isSelected ? '#EFF3FF' : 'white',
                                            border: isSelected ? `1px solid ${val.color}` : '1px solid #EAECEF',
                                            borderRadius: '10px', padding: '16px', cursor: 'pointer',
                                            textAlign: 'left', font: 'inherit',
                                        }}
                                    >
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#5F6368' }}>
                                Files
                            </div>
                            <div ref={sortMenuRef} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setSortMenuOpen(o => !o)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                        fontSize: '12.5px', color: '#5F6368', fontWeight: '600', padding: '6px 8px', borderRadius: '6px',
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
                                                    color: sortBy === key ? RED : '#374151',
                                                    fontWeight: sortBy === key ? '600' : '400',
                                                    background: sortBy === key ? '#FFF5F5' : 'white',
                                                }}
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── FILES LIST (Drive-style rows) ── */}
                        {filtered.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #EAECEF', padding: '64px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                                    {search ? 'No documents match your search' : 'No documents yet'}
                                </div>
                                <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '22px' }}>
                                    {search ? 'Try a different name or clear your search.' : 'Upload your clearances and certificates to get started.'}
                                </div>
                                {!search && (
                                    <button onClick={() => setShowUpload(true)} style={{
                                        background: RED, color: 'white', border: 'none',
                                        borderRadius: '8px', padding: '10px 22px',
                                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(255,0,0,0.22)',
                                    }}>Upload your first document</button>
                                )}
                            </div>
                        ) : (
                            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #EAECEF', overflow: 'visible' }}>
                                {/* column header */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 140px 130px 40px',
                                    padding: '10px 18px', borderBottom: '1px solid #EEF0F2',
                                    fontSize: '11.5px', fontWeight: '700', color: '#9AA0A6', letterSpacing: '0.3px',
                                }}>
                                    <span>NAME</span>
                                    <span>STATUS</span>
                                    <span>DATE</span>
                                    <span />
                                </div>
                                {filtered.map((doc, i) => {
                                    const dt = docTypes[doc.type];
                                    const isLast = i === filtered.length - 1;
                                    return (
                                        <div
                                            key={doc.id}
                                            style={{
                                                display: 'grid', gridTemplateColumns: '1fr 140px 130px 40px', alignItems: 'center',
                                                padding: '11px 18px', borderBottom: isLast ? 'none' : '1px solid #F5F5F6',
                                                position: 'relative',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#FAFAFB'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {doc.original_name}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
                                                        {dt?.label || doc.type}{doc.file_size != null ? ` · ${formatFileSize(doc.file_size)}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{
                                                ...(statusStyle[doc.status] ?? statusStyle['submitted']),
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                width: 'fit-content',
                                            }}>
                                                {statusStyle[doc.status]?.label ?? 'Submitted'}
                                            </span>
                                            <span style={{ fontSize: '12.5px', color: '#5F6368' }}>
                                                {new Date(doc.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <div style={{ position: 'relative' }} ref={menuOpenId === doc.id ? rowMenuRef : null}>
                                                <button
                                                    onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)}
                                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: '700', color: '#5F6368', padding: '6px 4px' }}
                                                >
                                                    More
                                                </button>
                                                {menuOpenId === doc.id && (
                                                    <div style={{
                                                        position: 'absolute', right: 0, top: '32px', background: 'white',
                                                        border: '1px solid #EAECEF', borderRadius: '8px', boxShadow: '0 8px 24px rgba(16,24,40,0.14)',
                                                        width: '140px', zIndex: 30, overflow: 'hidden',
                                                    }}>
                                                        <div
                                                            onClick={() => handleDelete(doc.id)}
                                                            style={{ padding: '9px 14px', fontSize: '12.5px', color: '#C5221F', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            Remove
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </>
    );
}


