import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

// ✅ standalone Avatar component (defined OUTSIDE AdminDocumentsIndex).
// Falls back to initials if the image fails to load, or if it "silently" loads
// broken (0-byte / corrupt response with no error event, checked via naturalWidth).
// Keeping this outside the parent component prevents it from being re-created
// on every re-render, which would otherwise reset the error state each time.
function Avatar({ src, initials, bg = '#ff0000', color = 'white', size = 32, fontSize = 12 }) {
    const [broken, setBroken] = useState(false);
    const showImage = !!src && !broken;

    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize, fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
            {showImage
                ? (
                    <img
                        src={src}
                        alt="avatar"
                        onError={() => setBroken(true)}
                        onLoad={(e) => {
                            if (e.target.naturalWidth === 0) setBroken(true);
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                )
                : initials
            }
        </div>
    );
}

function AdminDocumentsIndex({ documents = [] }) {
    const [previewDoc, setPreviewDoc] = useState(null);
    const [filter, setFilter] = useState('pending');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState(null); // active "folder"

    const avatarColors = [
        ['#fee2e2', '#991b1b'], ['#dbeafe', '#1e40af'],
        ['#dcfce7', '#166534'], ['#ede9fe', '#5b21b6'], ['#fef3c7', '#92400e'],
    ];

    // ✅ gamitin ang mime_type, hindi extension ng URL
    const isImageDoc = (doc) => doc.mime_type && doc.mime_type.startsWith('image/');
    const isPdfDoc   = (doc) => doc.mime_type === 'application/pdf';

    // ✅ file type label/color based on mime_type, for quick recognition without opening
    const getFileTypeInfo = (doc) => {
        if (isPdfDoc(doc))   return { label: 'PDF', color: '#ff0000' };
        if (isImageDoc(doc)) {
            if (doc.mime_type === 'image/png') return { label: 'PNG', color: '#8B5CF6' };
            return { label: 'JPG', color: '#3B82F6' };
        }
        return { label: doc.mime_type ? doc.mime_type.split('/')[1]?.toUpperCase() : 'FILE', color: '#6B7280' };
    };

    // ✅ format bytes into readable KB/MB
    const formatFileSize = (bytes) => {
        if (bytes == null) return null;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const handleDownload = async (doc) => {
        if (!doc.file_url) return;
        const ext = isPdfDoc(doc) ? '.pdf' : (doc.mime_type ? '.' + doc.mime_type.split('/')[1] : '');
        const fileName = `${doc.name}_${doc.type}`.replace(/\s+/g, '_') + ext;
        try {
            const res = await fetch(doc.file_url);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
        } catch {
            const a = document.createElement('a');
            a.href = doc.file_url; a.download = fileName;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a);
        }
    };

    const handleApprove = (id) => router.patch(route('admin.documents.approve', id));
    const handleReject  = (id) => router.patch(route('admin.documents.reject', id));

    // ✅ "Folders" = unique document types, e.g. NBI Clearance, Medical Certificate.
    // Ito yung ginawang cards sa itaas, parang sa screenshot, pero derived
    // straight from `documents` imbes na hard-coded — kasi galing sa maraming
    // volunteer ang mga ito, hindi lang sa isang tao.
    const folders = useMemo(() => {
        const map = new Map();
        documents.forEach((d) => {
            map.set(d.type, (map.get(d.type) || 0) + 1);
        });
        return Array.from(map.entries()).map(([type, count]) => ({ type, count }));
    }, [documents]);

    const filtered = useMemo(() => {
        return documents.filter((d) => {
            const matchesStatus = filter === 'all' || d.status === filter;
            const matchesType = !typeFilter || d.type === typeFilter;
            const q = query.trim().toLowerCase();
            const matchesQuery =
                q === '' ||
                d.name.toLowerCase().includes(q) ||
                d.type.toLowerCase().includes(q);
            return matchesStatus && matchesType && matchesQuery;
        });
    }, [documents, filter, typeFilter, query]);

    const counts = {
        all:      documents.length,
        pending:  documents.filter(d => d.status === 'pending').length,
        approved: documents.filter(d => d.status === 'approved').length,
        rejected: documents.filter(d => d.status === 'rejected').length,
    };

    const statusStyle = (status) => {
        if (status === 'approved') return { background: '#dcfce7', color: '#166534' };
        if (status === 'rejected') return { background: '#fee2e2', color: '#991b1b' };
        return { background: '#fef3c7', color: '#92400e' };
    };

    return (
        <>
            <Head title="201 Files" />

            <style>{`
                .doc-wrap { font-size: 13px; }

                .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
                .search-box { position: relative; width: 100%; max-width: 320px; }
                .search-box input { width: 100%; padding: 10px 14px 10px 36px; border-radius: 10px; border: 1px solid #EDEDED; background: #F7F7F5; font-size: 13px; color: #1A1A1A; outline: none; transition: box-shadow .15s, border-color .15s; }
                .search-box input:focus { border-color: #ff0000; box-shadow: 0 0 0 3px rgba(255,0,0,0.08); }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }

                .filters { display: flex; gap: 8px; flex-wrap: wrap; }
                .filter-btn { padding: 7px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid #EDEDED; background: #FFFFFF; color: #6B6B6B; transition: all .15s; white-space: nowrap; }
                .filter-btn.active { background: #ff0000; color: #fff; border-color: #ff0000; }
                .filter-btn:hover:not(.active) { border-color: #ccc; color: #1A1A1A; }

                .section-label { font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 12px; }

                .folders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 28px; }
                .folder-card { background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 12px; padding: 16px; text-align: left; cursor: pointer; transition: box-shadow .15s, border-color .15s; }
                .folder-card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
                .folder-card.active { border-color: #ff0000; box-shadow: 0 0 0 3px rgba(255,0,0,0.08); }
                .folder-title { font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px; }
                .folder-count { font-size: 11.5px; color: #9CA3AF; }

                .files-head-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .sort-label { font-size: 11.5px; color: #9CA3AF; font-weight: 600; }

                .table-card { background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 12px; overflow: hidden; }
                .table-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px; gap: 12px; padding: 12px 20px; background: #F7F7F5; border-bottom: 1px solid #EDEDED; font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: .5px; }
                .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px; gap: 12px; padding: 13px 20px; border-bottom: 1px solid #EDEDED; align-items: center; cursor: pointer; transition: background .12s; }
                .table-row:last-child { border-bottom: none; }
                .table-row:hover { background: #fafafa; }
                .badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; display: inline-block; }
                .action-btns { display: flex; gap: 6px; }
                .btn-approve { background: #dcfce7; color: #166534; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
                .btn-approve:hover { opacity: .8; }
                .btn-reject { background: #fee2e2; color: #991b1b; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
                .btn-reject:hover { opacity: .8; }
                .empty { text-align: center; padding: 48px; color: #6B6B6B; font-size: 13px; }
                .doc-type { font-size: 13px; color: #ff0000; font-weight: 600; text-transform: uppercase; }
                .file-chip { display: inline-flex; align-items: center; gap: 5px; }
                .file-chip-label { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; }
            `}</style>

            {/* PREVIEW MODAL */}
            {previewDoc && (
                <div onClick={() => setPreviewDoc(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 860, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                        {/* Modal Header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Avatar
                                    src={previewDoc.photo}
                                    initials={previewDoc.initials}
                                    bg={avatarColors[previewDoc.color_id ?? 0][0]}
                                    color={avatarColors[previewDoc.color_id ?? 0][1]}
                                    size={36}
                                    fontSize={13}
                                />
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase' }}>{previewDoc.name}</div>
                                    <div className="doc-type">{previewDoc.type}</div>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '220px 1fr' }}>

                            {/* Left panel */}
                            <div style={{ borderRight: '1px solid #f0f0f0', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ margin: '0 auto' }}>
                                    <Avatar
                                        src={previewDoc.photo}
                                        initials={previewDoc.initials}
                                        bg={avatarColors[previewDoc.color_id ?? 0][0]}
                                        color={avatarColors[previewDoc.color_id ?? 0][1]}
                                        size={72}
                                        fontSize={22}
                                    />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{previewDoc.name}</div>
                                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Muntinlupa City Branch</div>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Document</div>
                                    <div className="doc-type">{previewDoc.type}</div>
                                </div>
                                {/* File type + size in modal */}
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>File</div>
                                    <div className="file-chip">
                                        <span className="file-chip-label" style={{ background: `${getFileTypeInfo(previewDoc).color}15`, color: getFileTypeInfo(previewDoc).color }}>
                                            {getFileTypeInfo(previewDoc).label}
                                        </span>
                                        {formatFileSize(previewDoc.file_size) && (
                                            <span style={{ fontSize: 12, color: '#6B6B6B' }}>{formatFileSize(previewDoc.file_size)}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Status</div>
                                    <span className="badge" style={statusStyle(previewDoc.status)}>{previewDoc.status}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Uploaded</div>
                                    <div style={{ fontSize: 12 }}>{previewDoc.uploaded_at}</div>
                                </div>
                            </div>

                            {/* Right panel — preview using mime_type */}
                            <div style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380, overflow: 'hidden' }}>
                                {previewDoc.file_url ? (
                                    isImageDoc(previewDoc)
                                        ? <img
                                            src={previewDoc.file_url}
                                            alt={previewDoc.type}
                                            style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: 4, margin: 20 }}
                                          />
                                        : isPdfDoc(previewDoc)
                                            ? <iframe
                                                src={`${previewDoc.file_url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                                                style={{ width: '100%', height: '55vh', border: 'none' }}
                                                title={previewDoc.type}
                                              />
                                            : <div style={{ textAlign: 'center', color: '#888' }}>
                                                <div style={{ fontSize: 13, marginBottom: 8 }}>Hindi ma-preview ang file na ito.</div>
                                                <button onClick={() => handleDownload(previewDoc)} style={{ background: 'none', border: 'none', color: '#ff0000', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Download →</button>
                                              </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13 }}>Walang file na naka-attach.</div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {previewDoc.status === 'pending' && (
                                    <>
                                        <button onClick={() => { handleApprove(previewDoc.id); setPreviewDoc(null); }} className="btn-approve" style={{ padding: '8px 18px', fontSize: 13 }}>Approve</button>
                                        <button onClick={() => { handleReject(previewDoc.id); setPreviewDoc(null); }} className="btn-reject" style={{ padding: '8px 18px', fontSize: 13 }}>Reject</button>
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {previewDoc.file_url && (
                                    <button onClick={() => handleDownload(previewDoc)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Download</button>
                                )}
                                <button onClick={() => setPreviewDoc(null)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="doc-wrap">
                {/* Search + status filters — walang "Upload" button dito dahil hindi
                    nag-uupload ang admin, nagre-review lang siya ng ipinasang files. */}
                <div className="toolbar">
                    <div className="search-box">
                        <span className="search-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search your documents"
                        />
                    </div>

                    <div className="filters">
                        {['all', 'pending', 'approved', 'rejected'].map(f => (
                            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Folders — auto-derived from the document types on file */}
                {folders.length > 0 && (
                    <>
                        <div className="section-label">Folders</div>
                        <div className="folders-grid">
                            {folders.map((folder) => (
                                <button
                                    key={folder.type}
                                    className={`folder-card ${typeFilter === folder.type ? 'active' : ''}`}
                                    onClick={() => setTypeFilter(typeFilter === folder.type ? null : folder.type)}
                                >
                                    <div className="folder-title">{folder.type}</div>
                                    <div className="folder-count">{folder.count} file{folder.count === 1 ? '' : 's'}</div>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                <div className="files-head-row">
                    <div className="section-label" style={{ marginBottom: 0 }}>Files</div>
                    {typeFilter && (
                        <button
                            onClick={() => setTypeFilter(null)}
                            style={{ background: 'none', border: 'none', color: '#ff0000', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                            Clear folder filter ✕
                        </button>
                    )}
                </div>

                <div className="table-card">
                    <div className="table-head">
                        <span>Volunteer</span>
                        <span>Document Type</span>
                        <span>File</span>
                        <span>Uploaded</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>
                    {filtered.length === 0 ? (
                        <div className="empty">Walang dokumento.</div>
                    ) : filtered.map((doc, i) => {
                        const [bg, color] = avatarColors[doc.color_id ?? i % 5];
                        const fileInfo = getFileTypeInfo(doc);
                        const sizeLabel = formatFileSize(doc.file_size);
                        return (
                            <div key={doc.id} className="table-row" onClick={() => setPreviewDoc(doc)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Avatar src={doc.photo} initials={doc.initials} bg={bg} color={color} size={32} fontSize={11} />
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: 13 }}>{doc.name}</div>
                                        <div style={{ fontSize: 11, color: '#6B6B6B' }}>Muntinlupa City Branch</div>
                                    </div>
                                </div>
                                <div className="doc-type">{doc.type}</div>
                                {/* File type + size, quick recognition before opening */}
                                <div className="file-chip">
                                    <span className="file-chip-label" style={{ background: `${fileInfo.color}15`, color: fileInfo.color }}>
                                        {fileInfo.label}
                                    </span>
                                    {sizeLabel && <span style={{ fontSize: 11, color: '#9CA3AF' }}>{sizeLabel}</span>}
                                </div>
                                <div style={{ fontSize: 12, color: '#6B6B6B' }}>{doc.uploaded_at}</div>
                                <span className="badge" style={statusStyle(doc.status)}>{doc.status}</span>
                                <div className="action-btns" onClick={e => e.stopPropagation()}>
                                    {doc.status === 'pending' && (
                                        <>
                                            <button className="btn-approve" onClick={() => handleApprove(doc.id)}>Approve</button>
                                            <button className="btn-reject"  onClick={() => handleReject(doc.id)}>Reject</button>
                                        </>
                                    )}
                                    {doc.status !== 'pending' && (
                                        <span style={{ fontSize: 11, color: '#aaa' }}>—</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

// ✅ Persistent layout — parehong AdminLayout ng ibang admin pages,
// kaya lalabas na rin ang notification bell dito, at hindi na mag-re-render
// ang sidebar sa navigation.
AdminDocumentsIndex.layout = (page) => <AdminLayout title="201 Files">{page}</AdminLayout>;

export default AdminDocumentsIndex;