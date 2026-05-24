import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function VolunteerDocuments({ auth, documents }) {
    const volunteer = auth.user;
    const avatarUrl = volunteer?.photo_url || null;
    const initials = volunteer?.name
        ? volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    const [showUpload, setShowUpload] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    const { data, setData, post, processing, reset, errors } = useForm({
        type: 'nbi',
        file: null,
    });

    const docs = documents || [];

    const docTypes = {
        nbi:      { label: 'NBI Clearance',        icon: '🪪', color: '#3B82F6' },
        medical:  { label: 'Medical Certificate',   icon: '🏥', color: '#10B981' },
        training: { label: 'Training Certificate',  icon: '📜', color: '#8B5CF6' },
        barangay: { label: 'Barangay Clearance',    icon: '🏛️', color: '#F59E0B' },
    };

    // ✅ CHANGED: "pending" → "submitted" (visible agad sa admin, walang approval needed)
    const statusStyle = {
        submitted: { background: '#E6F1FB', color: '#185FA5', label: 'Submitted' },
        approved:  { background: '#DCFCE7', color: '#166534', label: 'Approved' },
        rejected:  { background: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
    };

    const sidebarLinks = [
        { key: 'dashboard',     label: 'Dashboard',     href: route('volunteer.dashboard'),     icon: <GridIcon /> },
        { key: 'schedule',      label: 'Schedule',      href: route('volunteer.schedule'),      icon: <CalIcon /> },
        { key: 'communication', label: 'Communication', href: route('volunteer.communication'), icon: <ChatIcon /> },
        { key: 'attendance',    label: 'Attendance',    href: route('volunteer.attendance'),    icon: <CheckIcon /> },
        { key: 'documents',     label: '201',           href: route('volunteer.documents'),     icon: <FolderIcon /> },
    ];

    const handleLogout = () => router.post(route('logout'));

    const handleUpload = (e) => {
        e.preventDefault();
        post(route('volunteer.documents.store'), {
            forceFormData: true,
            onSuccess: () => { reset(); setShowUpload(false); },
        });
    };

    const handleDelete = (id) => {
        setDeleteModal({ open: true, id });
    };

    const confirmDelete = () => {
        router.delete(route('volunteer.documents.destroy', deleteModal.id));
        setDeleteModal({ open: false, id: null });
    };

    const cancelDelete = () => {
        setDeleteModal({ open: false, id: null });
    };

    const filtered = filterType === 'all' ? docs : docs.filter(d => d.type === filterType);

    const counts = {
        all:      docs.length,
        nbi:      docs.filter(d => d.type === 'nbi').length,
        medical:  docs.filter(d => d.type === 'medical').length,
        training: docs.filter(d => d.type === 'training').length,
        barangay: docs.filter(d => d.type === 'barangay').length,
    };

    return (
        <>
            <Head title="201 - Documents" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            {/* ── CUSTOM DELETE MODAL ── */}
            {deleteModal.open && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        background: 'white', borderRadius: '12px',
                        padding: '32px 28px', width: '380px', maxWidth: '90vw',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: '#FEE2E2', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 16px', fontSize: '22px',
                        }}>🗑️</div>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', textAlign: 'center', margin: '0 0 8px' }}>
                            Delete Document
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', margin: '0 0 24px', lineHeight: '1.6' }}>
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
                                    border: 'none', background: '#DC2626',
                                    color: 'white', fontSize: '13px', fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                            >Yes, delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F3F4F6' }}>

                {/* SIDEBAR */}
                <aside style={{
                    width: '160px', minHeight: '100vh', background: '#CC0000',
                    display: 'flex', flexDirection: 'column', flexShrink: 0,
                    position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
                }}>
                    <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'white', lineHeight: '1.4' }}>
                            Rizal Chapter<br />
                            <span style={{ fontWeight: '400', opacity: 0.85 }}>Muntinlupa City Branch</span>
                        </div>
                    </div>

                    <nav style={{ flex: 1, paddingTop: '8px' }}>
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
                                    <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
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
                            <span style={{ fontSize: '16px' }}>⏻</span> Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div style={{ marginLeft: '160px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Topbar */}
                    <header style={{
                        background: 'white', padding: '0 28px', height: '56px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link href={route('volunteer.dashboard')} style={{ fontSize: '13px', color: '#9CA3AF', textDecoration: 'none' }}>Dashboard</Link>
                            <span style={{ color: '#D1D5DB' }}>›</span>
                            <span style={{ fontSize: '13px', color: '#111', fontWeight: '600' }}>201 / Documents</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button onClick={() => setShowUpload(!showUpload)} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: '#CC0000', color: 'white', border: 'none',
                                borderRadius: '6px', padding: '8px 16px',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}>
                                <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
                                Upload Document
                            </button>
                            <div title={volunteer?.name} style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: avatarUrl ? 'transparent' : '#CC0000',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '13px', fontWeight: '700',
                                flexShrink: 0, overflow: 'hidden',
                            }}>
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    : initials
                                }
                            </div>
                        </div>
                    </header>

                    <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

                        <div style={{ marginBottom: '24px' }}>
                            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: 0, marginBottom: '4px' }}>My Documents</h1>
                            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Upload and manage your clearances and certifications for Philippine Red Cross.</p>
                        </div>

                        {showUpload && (
                            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Upload New Document</div>
                                <form onSubmit={handleUpload}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Document Type</label>
                                            <select
                                                value={data.type}
                                                onChange={e => setData('type', e.target.value)}
                                                style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px', background: 'white', color: '#111', outline: 'none' }}
                                            >
                                                <option value="nbi">NBI Clearance</option>
                                                <option value="medical">Medical Certificate</option>
                                                <option value="training">Training Certificate</option>
                                                <option value="barangay">Barangay Clearance</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>File <span style={{ color: '#9CA3AF', fontWeight: '400' }}>(PDF, JPG, PNG — max 5MB)</span></label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={e => setData('file', e.target.files[0])}
                                                style={{ width: '100%', padding: '7px 0', fontSize: '13px' }}
                                            />
                                            {errors.file && <div style={{ fontSize: '11px', color: '#CC0000', marginTop: '4px' }}>{errors.file}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" disabled={processing} style={{
                                            background: '#CC0000', color: 'white', border: 'none',
                                            borderRadius: '6px', padding: '9px 20px',
                                            fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                        }}>
                                            {processing ? 'Uploading...' : 'Upload Document'}
                                        </button>
                                        <button type="button" onClick={() => { setShowUpload(false); reset(); }} style={{
                                            background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB',
                                            borderRadius: '6px', padding: '9px 20px',
                                            fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                                        }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                            {Object.entries(docTypes).map(([key, val]) => {
                                const count = counts[key];
                                const hasDoc = count > 0;
                                const docOfType = docs.find(d => d.type === key);
                                return (
                                    <div key={key} onClick={() => setFilterType(filterType === key ? 'all' : key)} style={{
                                        background: 'white', borderRadius: '10px',
                                        border: filterType === key ? `2px solid ${val.color}` : '1px solid #E5E7EB',
                                        padding: '16px', cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '22px' }}>{val.icon}</span>
                                            {hasDoc && (
                                                <span style={{
                                                    // ✅ CHANGED: fallback to 'submitted' style kung hindi pa na-update ang existing records
                                                    ...(statusStyle[docOfType?.status] ?? statusStyle['submitted']),
                                                    padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600'
                                                }}>
                                                    {statusStyle[docOfType?.status]?.label ?? 'Submitted'}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#111', marginBottom: '2px' }}>{val.label}</div>
                                        <div style={{ fontSize: '11px', color: hasDoc ? '#6B7280' : '#D1D5DB' }}>
                                            {hasDoc ? `${count} file${count > 1 ? 's' : ''} uploaded` : 'Not uploaded'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid #E5E7EB', width: 'fit-content' }}>
                            {[['all', 'All Documents'], ['nbi', 'NBI'], ['medical', 'Medical'], ['training', 'Training'], ['barangay', 'Barangay']].map(([key, label]) => (
                                <button key={key} onClick={() => setFilterType(key)} style={{
                                    padding: '6px 14px', borderRadius: '6px', border: 'none',
                                    background: filterType === key ? '#CC0000' : 'transparent',
                                    color: filterType === key ? 'white' : '#6B7280',
                                    fontSize: '12px', fontWeight: filterType === key ? '600' : '400',
                                    cursor: 'pointer'
                                }}>
                                    {label} {counts[key] > 0 && <span style={{ opacity: 0.75 }}>({counts[key]})</span>}
                                </button>
                            ))}
                        </div>

                        {filtered.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '60px', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>No documents yet</div>
                                <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>Upload your clearances and certificates to get started.</div>
                                <button onClick={() => setShowUpload(true)} style={{
                                    background: '#CC0000', color: 'white', border: 'none',
                                    borderRadius: '6px', padding: '9px 20px',
                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                }}>Upload your first document</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                                {filtered.map(doc => (
                                    <div key={doc.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '18px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${docTypes[doc.type]?.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                                    {docTypes[doc.type]?.icon || '📄'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{docTypes[doc.type]?.label || doc.type}</div>
                                                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.original_name}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(doc.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer', color: '#DC2626', fontSize: '12px', flexShrink: 0 }}>✕</button>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{
                                                // ✅ CHANGED: fallback to 'submitted' style para sa existing records na may 'pending' status
                                                ...(statusStyle[doc.status] ?? statusStyle['submitted']),
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                                            }}>
                                                {statusStyle[doc.status]?.label ?? 'Submitted'}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                                                {new Date(doc.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}

function GridIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function CalIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ChatIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function CheckIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
}
function FolderIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}