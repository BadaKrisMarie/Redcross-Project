import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

// ✅ standalone Avatar component (defined OUTSIDE AdminDocumentsIndex).
// Falls back to initials if the image fails to load, or if it "silently" loads
// broken (0-byte / corrupt response with no error event, checked via naturalWidth).
// Keeping this outside the parent component prevents it from being re-created
// on every re-render, which would otherwise reset the error state each time.
function Avatar({ src, initials, bg = '#4f46e5', color = 'white', size = 32, fontSize = 12 }) {
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

// ✅ small status pill used in the modal + could be reused in the table later
function StatusPill({ status }) {
    const map = {
        approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
        rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
        pending:  { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    };
    const s = map[status] ?? map.pending;
    return (
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '.3px' }}>
            {s.label}
        </span>
    );
}

function AdminDocumentsIndex({ documents: initialDocuments = [], categories: initialCategories = [] }) {
    // ✅ documents is now local state (not just a prop passthrough) so we can
    // do an OPTIMISTIC delete: remove the row from the UI immediately instead
    // of waiting for the full server round-trip + Inertia page reload, which
    // is what was making the modal feel stuck on "Deleting...".
    const [documents, setDocuments] = useState(initialDocuments);
    useEffect(() => { setDocuments(initialDocuments); }, [initialDocuments]);

    // ✅ NEW — folders/categories now come from the backend (document_categories
    // table) instead of being hardcoded to 4 fixed types. Syncs the same way
    // `documents` does, so a partial reload after creating a folder updates
    // the grid without a full page refresh.
    const [categories, setCategories] = useState(initialCategories);
    useEffect(() => { setCategories(initialCategories); }, [initialCategories]);

    const [previewDoc, setPreviewDoc] = useState(null);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState(null); // active "folder"
    const [deleteTarget, setDeleteTarget] = useState(null); // doc na ide-delete (custom modal)
    const [deleteVisible, setDeleteVisible] = useState(false); // controls enter/exit animation
    const [approving, setApproving] = useState(false); // disables buttons while a request is in flight
    const deleteBtnRef = useRef(null);

    // ✅ NEW — "Create New Folder" modal state
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderLabel, setNewFolderLabel] = useState('');
    const [newFolderError, setNewFolderError] = useState('');
    const [creatingFolder, setCreatingFolder] = useState(false);
    const newFolderInputRef = useRef(null);

    // ✅ NEW — "Delete Folder" confirmation modal state. Separate from the
    // per-document delete modal above since deleting a folder is a bigger,
    // cascading action (wipes every document filed under it).
    const [folderDeleteTarget, setFolderDeleteTarget] = useState(null);
    const [folderDeleteVisible, setFolderDeleteVisible] = useState(false);
    const folderDeleteBtnRef = useRef(null);

    const avatarColors = [
        ['#fee2e2', '#991b1b'], ['#dbeafe', '#1e40af'],
        ['#dcfce7', '#166534'], ['#ede9fe', '#5b21b6'], ['#fef3c7', '#92400e'],
    ];

    // ✅ gamitin ang mime_type, hindi extension ng URL
    const isImageDoc = (doc) => doc.mime_type && doc.mime_type.startsWith('image/');
    const isPdfDoc   = (doc) => doc.mime_type === 'application/pdf';

    // ✅ file type label/color based on mime_type, for quick recognition without opening
    const getFileTypeInfo = (doc) => {
        if (isPdfDoc(doc))   return { label: 'PDF', color: '#EA4335' };
        if (isImageDoc(doc)) {
            if (doc.mime_type === 'image/png') return { label: 'PNG', color: '#8B5CF6' };
            return { label: 'JPG', color: '#4285F4' };
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

    // ✅ UPDATED — download is now gated by status AND hits the dedicated
    // guarded `admin.documents.download` route (not the inline preview
    // route). Even if this function is somehow called on a non-approved
    // doc, the early return + the server-side 403 in DocumentController
    // both prevent the file from actually being served.
    const handleDownload = (doc) => {
        if (!doc.file_url || doc.status !== 'approved') return;
        window.location.href = route('admin.documents.download', doc.id);
    };

    // ✅ Delete flow: opens the custom modal (no native browser confirm()).
    // deleteVisible drives the fade/scale-in animation via a rAF tick so the
    // "enter" transition actually plays instead of snapping straight to open.
    const handleDelete = (doc) => {
        setDeleteTarget(doc);
        requestAnimationFrame(() => setDeleteVisible(true));
    };

    // Smoothly closes the modal (plays exit animation) then clears the target
    // after the transition finishes, so it doesn't just disappear.
    const closeDeleteModal = () => {
        setDeleteVisible(false);
        setTimeout(() => setDeleteTarget(null), 160);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const target = deleteTarget;

        // ✅ OPTIMISTIC UPDATE: close the modal and remove the row from the
        // list right away. The delete request still fires in the background,
        // but the admin doesn't sit staring at a "Deleting..." spinner while
        // waiting for a full Inertia page reload — that round trip was the
        // main source of the perceived slowness.
        setDeleteVisible(false);
        setTimeout(() => setDeleteTarget(null), 160);
        setDocuments((prev) => prev.filter((d) => d.id !== target.id));

        router.delete(route('admin.documents.destroy', target.id), {
            preserveScroll: true,
            preserveState: true,
            only: ['documents'], // ✅ partial reload — don't re-fetch the whole page's props
            onError: () => {
                // Rollback: deletion failed server-side, put the row back
                setDocuments((prev) =>
                    prev.some((d) => d.id === target.id) ? prev : [...prev, target]
                );
                alert('Hindi na-delete ang document. Pakisubukan ulit.');
            },
        });
    };

    // ✅ NEW — Folder delete flow. Opens a confirmation modal (same animated
    // pattern as the document delete modal) warning the admin that this will
    // also wipe every document filed under the folder.
    const handleDeleteFolder = (folder) => {
        setFolderDeleteTarget(folder);
        requestAnimationFrame(() => setFolderDeleteVisible(true));
    };

    const closeFolderDeleteModal = () => {
        setFolderDeleteVisible(false);
        setTimeout(() => setFolderDeleteTarget(null), 160);
    };

    const confirmDeleteFolder = () => {
        if (!folderDeleteTarget) return;
        const target = folderDeleteTarget;

        setFolderDeleteVisible(false);
        setTimeout(() => setFolderDeleteTarget(null), 160);

        // Keep snapshots for rollback in case the server call fails.
        const prevCategories = categories;
        const prevDocuments = documents;

        // ✅ OPTIMISTIC UPDATE — remove the folder card immediately, and
        // remove every document that belonged to it from the table too,
        // since deleting the folder cascades and deletes those documents
        // server-side as well.
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
                alert('Hindi na-delete ang folder. Pakisubukan ulit.');
            },
        });
    };

    // ESC to dismiss, and auto-focus the primary action for keyboard users.
    useEffect(() => {
        if (!deleteTarget) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeDeleteModal();
        };
        window.addEventListener('keydown', onKey);
        const focusTimer = setTimeout(() => deleteBtnRef.current?.focus(), 50);
        return () => {
            window.removeEventListener('keydown', onKey);
            clearTimeout(focusTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deleteTarget]);

    // ✅ NEW — ESC to dismiss the folder delete modal + auto-focus its
    // primary action, same pattern as the document delete modal.
    useEffect(() => {
        if (!folderDeleteTarget) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeFolderDeleteModal();
        };
        window.addEventListener('keydown', onKey);
        const focusTimer = setTimeout(() => folderDeleteBtnRef.current?.focus(), 50);
        return () => {
            window.removeEventListener('keydown', onKey);
            clearTimeout(focusTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [folderDeleteTarget]);

    // ✅ ESC to dismiss the "Create New Folder" modal + auto-focus the input.
    useEffect(() => {
        if (!showNewFolder) return;
        const onKey = (e) => {
            if (e.key === 'Escape' && !creatingFolder) setShowNewFolder(false);
        };
        window.addEventListener('keydown', onKey);
        const focusTimer = setTimeout(() => newFolderInputRef.current?.focus(), 50);
        return () => {
            window.removeEventListener('keydown', onKey);
            clearTimeout(focusTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showNewFolder]);

    // ✅ auto-open the preview modal when arriving from the Dashboard's
    // "Review Now →" button, which links here as ?document=<id>. Runs once
    // documents are available, matches on id, and cleans the query string
    // afterwards so a refresh doesn't keep reopening the same modal.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const docId = params.get('document');
        if (!docId) return;

        const match = documents.find((d) => String(d.id) === String(docId));
        if (match) {
            setPreviewDoc(match);
            const url = new URL(window.location.href);
            url.searchParams.delete('document');
            window.history.replaceState({}, '', url.pathname + url.search);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documents]);

    // ✅ Approve / Reject — optimistic status update in both the table
    // row and the open modal, then persisted in the background. Rolls back
    // on error.
    const handleApprove = (doc) => {
        setApproving(true);
        const prevStatus = doc.status;
        setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: 'approved' } : d));
        setPreviewDoc((p) => p && p.id === doc.id ? { ...p, status: 'approved' } : p);

        router.patch(route('admin.documents.approve', doc.id), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['documents'],
            onSuccess: () => {
                // ✅ Isara na ang modal kapag matagumpay ang pag-approve
                setPreviewDoc((p) => p && p.id === doc.id ? null : p);
            },
            onFinish: () => setApproving(false),
            onError: () => {
                setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: prevStatus } : d));
                setPreviewDoc((p) => p && p.id === doc.id ? { ...p, status: prevStatus } : p);
                alert('Hindi na-approve ang document. Pakisubukan ulit.');
            },
        });
    };

    const handleReject = (doc) => {
        setApproving(true);
        const prevStatus = doc.status;
        setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: 'rejected' } : d));
        setPreviewDoc((p) => p && p.id === doc.id ? { ...p, status: 'rejected' } : p);

        router.patch(route('admin.documents.reject', doc.id), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['documents'],
            onSuccess: () => {
                // ✅ Isara na rin ang modal kapag matagumpay ang pag-reject
                setPreviewDoc((p) => p && p.id === doc.id ? null : p);
            },
            onFinish: () => setApproving(false),
            onError: () => {
                setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: prevStatus } : d));
                setPreviewDoc((p) => p && p.id === doc.id ? { ...p, status: prevStatus } : p);
                alert('Hindi na-reject ang document. Pakisubukan ulit.');
            },
        });
    };

    // ✅ NEW — Create Folder submit handler. Posts to
    // route('admin.documents.categories.store'), then only reloads the
    // `categories` prop (documents/table stay untouched, no flicker).
    const handleCreateFolder = (e) => {
        e.preventDefault();
        const label = newFolderLabel.trim();
        if (!label) {
            setNewFolderError('Folder name is required.');
            return;
        }

        setCreatingFolder(true);
        setNewFolderError('');

        router.post(route('admin.documents.categories.store'), { label }, {
            preserveScroll: true,
            preserveState: true,
            only: ['categories'],
            onSuccess: () => {
                setShowNewFolder(false);
                setNewFolderLabel('');
            },
            onError: (errors) => {
                setNewFolderError(errors.label || 'Hindi nagawa ang folder. Pakisubukan ulit.');
            },
            onFinish: () => setCreatingFolder(false),
        });
    };

    const closeNewFolderModal = () => {
        if (creatingFolder) return;
        setShowNewFolder(false);
        setNewFolderLabel('');
        setNewFolderError('');
    };

    // ✅ Display labels for folders — raw `d.type` values from the database
    // (e.g. "nbi", "medical", "training") get mapped to their proper display
    // names here. Static fallback map kept for the 4 original types (and the
    // legacy "bangray" typo) in case `categories` hasn't loaded yet; anything
    // beyond that is resolved dynamically from the `categories` prop below.
    const FOLDER_LABELS = {
        nbi: 'NBI Clearance',
        medical: 'Medical Certificate',
        training: 'Training Certificate',
        barangay: 'Barangay Clearance',
        bangray: 'Barangay Clearance', // tolerate common misspelling in data
    };

    const getFolderLabel = (type) => {
        const t = type?.toLowerCase();
        const cat = categories.find((c) => c.key?.toLowerCase() === t)
            || (t === 'bangray' ? categories.find((c) => c.key === 'barangay') : null);
        if (cat) return cat.label;
        return FOLDER_LABELS[t] || type?.toUpperCase();
    };

    // ✅ UPDATED — folders are now derived from the `categories` prop
    // (document_categories table) instead of a hardcoded list of 4. Any
    // folder an admin creates shows up here automatically. "barangay" keeps
    // its legacy typo tolerance ("bangray") for older rows in the DB.
    // Now also carries `id` and `is_default` so the delete button can be
    // hidden on the 4 seeded/default folders.
    const DYNAMIC_FOLDERS = useMemo(() => {
        return categories.map((c) => ({
            id: c.id,
            key: c.key,
            label: c.label,
            is_default: !!c.is_default,
            types: c.key === 'barangay' ? ['barangay', 'bangray'] : [c.key],
        }));
    }, [categories]);

    // ✅ "Folders" = every category on file. Count is derived from
    // `documents` (case-insensitive match against each folder's known type
    // values), but the folders themselves always render regardless of data.
    const folders = useMemo(() => {
        return DYNAMIC_FOLDERS.map((f) => {
            const count = documents.filter((d) =>
                f.types.includes(d.type?.toLowerCase())
            ).length;
            return { id: f.id, key: f.key, types: f.types, label: f.label, is_default: f.is_default, count };
        });
    }, [documents, DYNAMIC_FOLDERS]);

    const activeFolder = DYNAMIC_FOLDERS.find((f) => f.key === typeFilter);

    const filtered = useMemo(() => {
        return documents.filter((d) => {
            const matchesType = !activeFolder || activeFolder.types.includes(d.type?.toLowerCase());
            const q = query.trim().toLowerCase();
            const matchesQuery =
                q === '' ||
                d.name.toLowerCase().includes(q) ||
                d.type.toLowerCase().includes(q);
            return matchesType && matchesQuery;
        });
    }, [documents, typeFilter, query, activeFolder]);

    return (
        <>
            <Head title="201 Files" />

            <style>{`
                .doc-wrap { font-size: 13px; }

                .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }

                /* ✅ Drive-style search pill: soft blue-gray fill, no border, rounds fully */
                .search-box { position: relative; width: 100%; max-width: 340px; }
                .search-box input { width: 100%; padding: 10px 14px 10px 40px; border-radius: 24px; border: 1px solid transparent; background: #eef1f4; font-size: 13px; color: #1A1A1A; outline: none; transition: box-shadow .15s, background .15s; }
                .search-box input:focus { background: #fff; box-shadow: 0 1px 1px 0 rgba(65,69,73,.3), 0 1px 3px 1px rgba(65,69,73,.15); }
                .search-box input::placeholder { color: #5f6368; }
                .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #5f6368; pointer-events: none; }

                /* ✅ NEW — "Create New Folder" button, sits beside the search box */
                .btn-new-folder { display: flex; align-items: center; gap: 7px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; padding: 0 18px; height: 42px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(79,70,229,0.22); transition: transform .1s, box-shadow .15s; flex-shrink: 0; white-space: nowrap; }
                .btn-new-folder:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(79,70,229,0.3); }

                .section-label { font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 12px; }

                .folders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 28px; }
                .folder-card { position: relative; background: #FFFFFF; border: 1px solid #EDEDED; border-radius: 12px; padding: 16px; text-align: left; cursor: pointer; transition: box-shadow .15s, border-color .15s; }
                .folder-card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
                .folder-card.active { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.08); }
                .folder-title { font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px; padding-right: 20px; }
                .folder-count { font-size: 11.5px; color: #9CA3AF; }

                /* ✅ NEW — trash icon on folder cards, hidden until hover, hidden entirely on default folders */
                .folder-delete-btn { position: absolute; top: 10px; right: 10px; background: #fff; border: 1px solid #EDEDED; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; opacity: 0; transition: opacity .15s, background .15s, color .15s, border-color .15s; cursor: pointer; padding: 0; }
                .folder-card:hover .folder-delete-btn { opacity: 1; }
                .folder-delete-btn:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
                .folder-delete-btn:focus-visible { opacity: 1; outline: 2px solid #4f46e5; outline-offset: 1px; }

                .files-head-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
                .sort-label { font-size: 11.5px; color: #9CA3AF; font-weight: 600; }

                /* ✅ Drive-style table: flush edges, thin hairline rows, no card border */
                .table-card { background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #EDEDED; }
                .table-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 100px; gap: 12px; padding: 0 20px; height: 40px; align-items: center; border-bottom: 1px solid #EDEDED; font-size: 12px; font-weight: 500; color: #5f6368; }
                .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 100px; gap: 12px; padding: 0 20px; height: 52px; border-bottom: 1px solid #EDEDED; align-items: center; cursor: pointer; transition: background .12s; }
                .table-row:last-child { border-bottom: none; }
                .table-row:hover { background: #f1f3f4; }
                .action-btns { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
                /* ✅ delete icon button, laging nasa right side ng ACTIONS column */
                .btn-delete-icon { background: none; border: none; cursor: pointer; padding: 5px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #9CA3AF; transition: background .15s, color .15s; margin-left: auto; }
                .btn-delete-icon:hover { background: #e0e0e0; color: #c5221f; }
                .empty { text-align: center; padding: 48px; color: #6B6B6B; font-size: 13px; }
                .doc-type { font-size: 13px; color: #1A1A1A; font-weight: 400; }

                /* ✅ Drive-style file chip: little colored file-type icon + label, not a solid badge */
                .file-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #5f6368; }
                .file-chip-icon { width: 18px; height: 18px; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .file-chip-icon svg { width: 12px; height: 12px; }

                /* ✅ Delete modal animation */
                .delete-overlay {
                    position: fixed; inset: 0; z-index: 1100;
                    display: flex; align-items: center; justify-content: center; padding: 24px;
                    background: rgba(17, 17, 17, 0);
                    backdrop-filter: blur(0px);
                    transition: background .18s ease, backdrop-filter .18s ease;
                }
                .delete-overlay.show {
                    background: rgba(17, 17, 17, 0.55);
                    backdrop-filter: blur(2px);
                }
                .delete-card {
                    background: #fff; border-radius: 14px; width: 100%; max-width: 420px;
                    overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.3);
                    transform: translateY(8px) scale(0.96); opacity: 0;
                    transition: transform .18s cubic-bezier(.2,.8,.2,1), opacity .18s ease;
                }
                .delete-card.show { transform: translateY(0) scale(1); opacity: 1; }
                .btn-cancel-outline:focus-visible,
                .btn-delete-solid:focus-visible {
                    outline: 2px solid #4f46e5; outline-offset: 2px;
                }
                .btn-approve:disabled, .btn-reject:disabled { opacity: .6; cursor: not-allowed; }

                /* ✅ NEW — Create Folder modal */
                .new-folder-overlay { position: fixed; inset: 0; z-index: 1200; background: rgba(17,17,17,0.55); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 24px; }
                .new-folder-card { background: #fff; border-radius: 14px; width: 100%; max-width: 400px; padding: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.3); }
                .new-folder-input { width: 100%; padding: 10px 14px; border-radius: 8px; font-size: 13px; outline: none; box-sizing: border-box; transition: border-color .12s; }
                .new-folder-input:focus { border-color: #4f46e5; }
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase' }}>{previewDoc.name}</div>
                                        <StatusPill status={previewDoc.status} />
                                    </div>
                                    <div className="doc-type">{getFolderLabel(previewDoc.type)}</div>
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
                                    <div className="doc-type">{getFolderLabel(previewDoc.type)}</div>
                                </div>
                                {/* File type + size in modal */}
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>File</div>
                                    <div className="file-chip">
                                        <span className="file-chip-icon" style={{ background: getFileTypeInfo(previewDoc).color }}>
                                            <svg viewBox="0 0 24 24" fill="#fff"><path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/></svg>
                                        </span>
                                        {getFileTypeInfo(previewDoc).label}
                                        {formatFileSize(previewDoc.file_size) && (
                                            <span style={{ fontSize: 12, color: '#6B6B6B' }}>· {formatFileSize(previewDoc.file_size)}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Uploaded</div>
                                    <div style={{ fontSize: 12 }}>{previewDoc.uploaded_at}</div>
                                </div>
                            </div>

                            {/* Right panel — preview using mime_type. Preview stays available
                                regardless of status, since the admin needs to see the file's
                                content in order to decide whether to approve or reject it. */}
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
                                                <div style={{ fontSize: 13, marginBottom: 8 }}>Cannot preview this file.</div>
                                                {previewDoc.status === 'approved' && (
                                                    <button onClick={() => handleDownload(previewDoc)} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Download →</button>
                                                )}
                                              </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13 }}>No file attached.</div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer — Approve / Reject + Download / Close.
                            🔒 Download is only shown once status === 'approved'. Kahit pending
                            or rejected, walang download button — nakikita lang via preview.
                            🔒 UPDATED — Reject button na lang ay lumalabas habang PENDING pa
                            ang document. Kapag na-approve na, hindi na dapat pwedeng i-reject
                            sa modal na ito. */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {previewDoc.status !== 'approved' && (
                                    <button
                                        className="btn-approve"
                                        disabled={approving}
                                        onClick={() => handleApprove(previewDoc)}
                                        style={{ background: '#16a34a', border: 'none', color: '#fff', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Approve
                                    </button>
                                )}
                                {previewDoc.status !== 'rejected' && previewDoc.status !== 'approved' && (
                                    <button
                                        className="btn-reject"
                                        disabled={approving}
                                        onClick={() => handleReject(previewDoc)}
                                        style={{ background: '#fff', border: '1px solid #dc2626', color: '#dc2626', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Reject
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {previewDoc.file_url && previewDoc.status === 'approved' && (
                                    <button onClick={() => handleDownload(previewDoc)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Download</button>
                                )}
                                {previewDoc.file_url && previewDoc.status !== 'approved' && (
                                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>Download locked until approved</span>
                                )}
                                <button onClick={() => setPreviewDoc(null)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL — animated, professional, no native browser confirm() */}
            {deleteTarget && (
                <div
                    className={`delete-overlay ${deleteVisible ? 'show' : ''}`}
                    onClick={closeDeleteModal}
                    role="presentation"
                >
                    <div
                        className={`delete-card ${deleteVisible ? 'show' : ''}`}
                        onClick={e => e.stopPropagation()}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                        aria-describedby="delete-modal-desc"
                    >
                        <div style={{ padding: '24px 24px 0 24px', display: 'flex', gap: 14 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%', background: '#fee2e2',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <div id="delete-modal-title" style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>Delete this document?</div>
                                <div id="delete-modal-desc" style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4, lineHeight: 1.5 }}>
                                    This will permanently remove the <strong>{getFolderLabel(deleteTarget.type)}</strong> uploaded by <strong>{deleteTarget.name}</strong>. This action cannot be undone.
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '20px 24px 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button
                                className="btn-cancel-outline"
                                onClick={closeDeleteModal}
                                style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#1A1A1A' }}
                            >
                                Cancel
                            </button>
                            <button
                                ref={deleteBtnRef}
                                className="btn-delete-solid"
                                onClick={confirmDelete}
                                style={{ background: '#dc2626', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff' }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ NEW — DELETE FOLDER CONFIRMATION MODAL — warns that this
                cascades and also deletes every document filed under it. */}
            {folderDeleteTarget && (
                <div
                    className={`delete-overlay ${folderDeleteVisible ? 'show' : ''}`}
                    onClick={closeFolderDeleteModal}
                    role="presentation"
                >
                    <div
                        className={`delete-card ${folderDeleteVisible ? 'show' : ''}`}
                        onClick={e => e.stopPropagation()}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="folder-delete-modal-title"
                        aria-describedby="folder-delete-modal-desc"
                    >
                        <div style={{ padding: '24px 24px 0 24px', display: 'flex', gap: 14 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%', background: '#fee2e2',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <div id="folder-delete-modal-title" style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>Delete "{folderDeleteTarget.label}" folder?</div>
                                <div id="folder-delete-modal-desc" style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4, lineHeight: 1.5 }}>
                                    {folderDeleteTarget.count > 0
                                        ? <>This will permanently delete this folder <strong>and all {folderDeleteTarget.count} document{folderDeleteTarget.count === 1 ? '' : 's'} filed under it</strong>, including the files themselves. This action cannot be undone.</>
                                        : <>This folder is empty. Deleting it cannot be undone.</>
                                    }
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '20px 24px 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button
                                className="btn-cancel-outline"
                                onClick={closeFolderDeleteModal}
                                style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#1A1A1A' }}
                            >
                                Cancel
                            </button>
                            <button
                                ref={folderDeleteBtnRef}
                                className="btn-delete-solid"
                                onClick={confirmDeleteFolder}
                                style={{ background: '#dc2626', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff' }}
                            >
                                Delete Folder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ NEW — CREATE NEW FOLDER MODAL */}
            {showNewFolder && (
                <div
                    className="new-folder-overlay"
                    onClick={closeNewFolderModal}
                    role="presentation"
                >
                    <div
                        className="new-folder-card"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="new-folder-title"
                    >
                        <div id="new-folder-title" style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
                            Create New Folder
                        </div>
                        <div style={{ fontSize: 12.5, color: '#6B6B6B', marginBottom: 16, lineHeight: 1.5 }}>
                            Gagamitin ito bilang bagong document category. Makikita rin ito bilang option sa upload form ng mga volunteer.
                        </div>
                        <form onSubmit={handleCreateFolder}>
                            <input
                                ref={newFolderInputRef}
                                className="new-folder-input"
                                value={newFolderLabel}
                                onChange={(e) => { setNewFolderLabel(e.target.value); setNewFolderError(''); }}
                                placeholder="e.g. Police Clearance"
                                disabled={creatingFolder}
                                style={{ border: `1px solid ${newFolderError ? '#dc2626' : '#E5E7EB'}` }}
                            />
                            {newFolderError && (
                                <div style={{ fontSize: 11.5, color: '#dc2626', marginTop: 6 }}>{newFolderError}</div>
                            )}
                            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    disabled={creatingFolder}
                                    onClick={closeNewFolderModal}
                                    style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: creatingFolder ? 'not-allowed' : 'pointer', color: '#1A1A1A' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingFolder}
                                    style={{ background: creatingFolder ? '#a5b4fc' : '#4f46e5', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: creatingFolder ? 'not-allowed' : 'pointer', color: '#fff' }}
                                >
                                    {creatingFolder ? 'Creating…' : 'Create Folder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="doc-wrap">
                {/* Search + Create New Folder. Walang status filter tabs at walang
                    "Upload" button dito dahil hindi nag-uupload ang admin ng document
                    files mismo — nagre-review lang siya ng ipinasang files. Ang
                    "Create New Folder" ay para sa pag-add ng bagong document
                    CATEGORY (hindi file), kaya hiwalay itong konsepto. */}
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

                    <button className="btn-new-folder" onClick={() => setShowNewFolder(true)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create New Folder
                    </button>
                </div>

                {/* Folders — auto-derived from the document categories on file.
                    ✅ Converted from <button> to a div with role="button" so a
                    real <button> (the delete trash icon) can be nested safely
                    inside it — buttons can't be nested inside buttons in HTML. */}
                {folders.length > 0 && (
                    <>
                        <div className="section-label">Folders</div>
                        <div className="folders-grid">
                            {folders.map((folder) => {
                                const isActive = typeFilter === folder.key;
                                return (
                                    <div
                                        key={folder.key}
                                        className={`folder-card ${isActive ? 'active' : ''}`}
                                        onClick={() => setTypeFilter(isActive ? null : folder.key)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setTypeFilter(isActive ? null : folder.key);
                                            }
                                        }}
                                    >
                                        {/* ✅ delete icon — hidden on default folders (NBI, Medical,
                                            Training, Barangay), only shows for custom folders admins
                                            created themselves. Visible on hover / keyboard focus. */}
                                        {!folder.is_default && (
                                            <button
                                                className="folder-delete-btn"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                                                title="Delete folder"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    <line x1="10" y1="11" x2="10" y2="17" />
                                                    <line x1="14" y1="11" x2="14" y2="17" />
                                                </svg>
                                            </button>
                                        )}
                                        <div className="folder-title">{folder.label}</div>
                                        <div className="folder-count">
                                            {folder.count === 0 ? 'Empty' : `${folder.count} file${folder.count === 1 ? '' : 's'}`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="files-head-row">
                    <div className="section-label" style={{ marginBottom: 0 }}>Files</div>
                    {typeFilter && (
                        <button
                            onClick={() => setTypeFilter(null)}
                            style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
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
                        <span style={{ textAlign: 'right' }}>Actions</span>
                    </div>
                    {filtered.length === 0 ? (
                        <div className="empty">No files available.</div>
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
                                <div className="doc-type">{getFolderLabel(doc.type)}</div>
                                {/* ✅ Drive-style file chip: small colored file icon + type label + size */}
                                <div className="file-chip">
                                    <span className="file-chip-icon" style={{ background: fileInfo.color }}>
                                        <svg viewBox="0 0 24 24" fill="#fff"><path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/></svg>
                                    </span>
                                    {fileInfo.label}
                                    {sizeLabel && <span style={{ color: '#9CA3AF' }}>· {sizeLabel}</span>}
                                </div>
                                <div style={{ fontSize: 12, color: '#5f6368' }}>{doc.uploaded_at}</div>
                                <div className="action-btns" onClick={e => e.stopPropagation()}>
                                    {/* ✅ delete icon, laging nasa right side, gagana kahit anong status */}
                                    <button className="btn-delete-icon" onClick={() => handleDelete(doc)} title="Delete">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                        </svg>
                                    </button>
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