import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function AdminDocumentsIndex({ auth, documents = [] }) {
    const [previewDoc, setPreviewDoc] = useState(null);
    const [filter, setFilter] = useState('pending');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const admin = auth?.user;
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;
    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    const avatarColors = [
        ['#fee2e2', '#991b1b'], ['#dbeafe', '#1e40af'],
        ['#dcfce7', '#166534'], ['#ede9fe', '#5b21b6'], ['#fef3c7', '#92400e'],
    ];

    const isImage = (url) => url && /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
    const isPdf   = (url) => url && (/\.pdf(\?.*)?$/i.test(url) || /\/documents\/\d+\/file/.test(url));

    const handleDownload = async (doc) => {
        if (!doc.file_url) return;
        const ext = isPdf(doc.file_url) ? '.pdf' : '.' + doc.file_url.split('.').pop();
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

    const filtered = filter === 'all' ? documents : documents.filter(d => d.status === filter);

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

    const NavAvatar = ({ size = 32, fontSize = 12 }) => (
        <div style={{ width: size, height: size, borderRadius: '50%', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize, fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
            {photoUrl ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>
    );

    const navLinks = [
        { label: 'Dashboard',     route: 'admin.dashboard' },
        { label: 'Volunteers',    route: 'admin.volunteers' },
        { label: 'Schedule',      route: 'admin.schedule' },
        { label: 'Attendance',    route: 'admin.attendance.index' },
        { label: 'Activities',    route: 'admin.activities.index' },
        { label: '201 Files',     route: 'admin.documents.index', active: true },
        { label: 'Communication', route: 'admin.communication' },
    ];

    return (
        <>
            <Head title="201 Files" />
            <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :root { --red: #C8102E; --red-dark: #9B0B22; --ink: #1A1A1A; --muted: #6B6B6B; --border: #EDEDED; --surface: #F7F7F5; --white: #FFFFFF; }
                body { font-family: 'DM Sans', sans-serif; font-size: 13px; background: var(--surface); }
                .wrap { display: flex; min-height: 100vh; }
                .sidebar { width: 220px; background: #CC0000; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: transform 0.2s; }
                .sidebar.closed { transform: translateX(-220px); }
                .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
                .main.full { margin-left: 0; }
                .sb-brand { padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.15); }
                .sb-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .sb-cross { width: 32px; height: 32px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; flex-shrink: 0; }
                .sb-name { font-family: 'Barlow Condensed', sans-serif; color: #fff; font-size: 13px; font-weight: 600; letter-spacing: .5px; line-height: 1.3; }
                .sb-name span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; }
                .sb-user { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .sb-uname { color: #fff; font-size: 12px; font-weight: 500; line-height: 1.3; }
                .sb-uname span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; }
                .sb-nav { padding: 10px 0; flex: 1; overflow-y: auto; }
                .nav-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.6); padding: 10px 20px 4px; font-weight: 600; }
                .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; border-left: 2px solid transparent; text-decoration: none; }
                .nav-item:hover { background: rgba(0,0,0,0.12); color: #fff; }
                .nav-item.active { background: rgba(255,255,255,0.2); border-left-color: #fff; color: #fff; }
                .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
                .sb-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.15); }
                .logout-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.8); font-size: 12px; cursor: pointer; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; }
                .logout-btn:hover { color: #fff; }
                .topbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
                .menu-btn { background: none; border: none; cursor: pointer; color: var(--ink); display: flex; align-items: center; padding: 4px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: .3px; text-transform: uppercase; }
                .content { flex: 1; padding: 28px; }
                .filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
                .filter-btn { padding: 7px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: var(--white); color: var(--muted); transition: all .15s; }
                .filter-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
                .filter-btn:hover:not(.active) { border-color: #ccc; color: var(--ink); }
                .table-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
                .table-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 120px; gap: 12px; padding: 12px 20px; background: var(--surface); border-bottom: 1px solid var(--border); font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }
                .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 120px; gap: 12px; padding: 13px 20px; border-bottom: 1px solid var(--border); align-items: center; cursor: pointer; transition: background .12s; }
                .table-row:last-child { border-bottom: none; }
                .table-row:hover { background: #fafafa; }
                .vol-av { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
                .badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; display: inline-block; }
                .action-btns { display: flex; gap: 6px; }
                .btn-approve { background: #dcfce7; color: #166534; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
                .btn-approve:hover { opacity: .8; }
                .btn-reject { background: #fee2e2; color: #991b1b; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
                .btn-reject:hover { opacity: .8; }
                .empty { text-align: center; padding: 48px; color: var(--muted); font-size: 13px; }
                .doc-type { font-size: 13px; color: #C8102E; font-weight: 600; text-transform: uppercase; }
            `}</style>

            {/* PREVIEW MODAL */}
            {previewDoc && (
                <div onClick={() => setPreviewDoc(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 860, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {previewDoc.photo
                                    ? <img src={previewDoc.photo} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                    : <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColors[previewDoc.color_id ?? 0][0], color: avatarColors[previewDoc.color_id ?? 0][1], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{previewDoc.initials}</div>
                                }
                                <div>
                                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 16, fontWeight: 700, textTransform: 'uppercase' }}>{previewDoc.name}</div>
                                    <div className="doc-type">{previewDoc.type}</div>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '220px 1fr' }}>
                            <div style={{ borderRight: '1px solid #f0f0f0', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {previewDoc.photo
                                    ? <img src={previewDoc.photo} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto' }} />
                                    : <div style={{ width: 72, height: 72, borderRadius: '50%', background: avatarColors[previewDoc.color_id ?? 0][0], color: avatarColors[previewDoc.color_id ?? 0][1], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, margin: '0 auto' }}>{previewDoc.initials}</div>
                                }
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{previewDoc.name}</div>
                                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Muntinlupa City Branch</div>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Document Type</div>
                                    <div className="doc-type">{previewDoc.type}</div>
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
                            <div style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380, overflow: 'hidden' }}>
                                {previewDoc.file_url ? (
                                    isImage(previewDoc.file_url)
                                        ? <img src={previewDoc.file_url} alt={previewDoc.type} style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: 4, margin: 20 }} />
                                        : isPdf(previewDoc.file_url)
                                            ? <iframe src={`${previewDoc.file_url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`} style={{ width: '100%', height: '55vh', border: 'none' }} title={previewDoc.type} />
                                            : <div style={{ textAlign: 'center', color: '#888' }}>
                                                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                                                <div style={{ fontSize: 13, marginBottom: 8 }}>Hindi ma-preview ang file.</div>
                                                <button onClick={() => handleDownload(previewDoc)} style={{ background: 'none', border: 'none', color: '#C8102E', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>download →</button>
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
                                        <button onClick={() => { handleApprove(previewDoc.id); setPreviewDoc(null); }} className="btn-approve" style={{ padding: '8px 18px', fontSize: 13 }}>✓ Approve</button>
                                        <button onClick={() => { handleReject(previewDoc.id); setPreviewDoc(null); }} className="btn-reject" style={{ padding: '8px 18px', fontSize: 13 }}>✕ Reject</button>
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {previewDoc.file_url && (
                                    <button onClick={() => handleDownload(previewDoc)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>download</button>
                                )}
                                <button onClick={() => setPreviewDoc(null)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="wrap">
                {/* SIDEBAR */}
                <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
                    <div className="sb-brand">
                        <Link href={route('admin.dashboard')} className="sb-logo">
                            <div className="sb-cross">+</div>
                            <div className="sb-name">
                                Philippine Red Cross
                                <span>Rizal · Muntinlupa</span>
                            </div>
                        </Link>
                    </div>
                    <Link href={route('admin.profile')} className="sb-user">
                        <NavAvatar size={34} fontSize={12} />
                        <div className="sb-uname">
                            {admin?.name ?? 'Admin'}
                            <span>Administrator</span>
                        </div>
                    </Link>
                    <nav className="sb-nav">
                        <div className="nav-label">Main</div>
                        {navLinks.slice(0, 4).map(({ label, route: r, active }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${active ? 'active' : ''}`}>
                                <div className="nav-dot" />{label}
                            </Link>
                        ))}
                        <div className="nav-label">Manage</div>
                        {navLinks.slice(4).map(({ label, route: r, active }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${active ? 'active' : ''}`}>
                                <div className="nav-dot" />{label}
                            </Link>
                        ))}
                    </nav>
                    <div className="sb-footer">
                        <button className="logout-btn" onClick={() => router.post(route('logout'))}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <main className={`main ${sidebarOpen ? '' : 'full'}`}>
                    {/* TOPBAR */}
                    <div className="topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            </button>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                                    <Link href={route('admin.dashboard')} style={{ color: '#aaa', textDecoration: 'none' }}>Dashboard</Link>
                                    <span style={{ color: '#ccc' }}>›</span>
                                    <span style={{ color: '#1A1A1A', fontWeight: 500 }}>201 Files</span>
                                </div>
                                <div className="page-title">201 Files</div>
                            </div>
                        </div>
                        <NavAvatar size={32} fontSize={12} />
                    </div>

                    {/* CONTENT */}
                    <div className="content">
                        {/* Summary chips */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Total',    value: counts.all,      color: '#1A1A1A' },
                                { label: 'Pending',  value: counts.pending,  color: '#92400e', bg: '#fef3c7' },
                                { label: 'Approved', value: counts.approved, color: '#166534', bg: '#dcfce7' },
                                { label: 'Rejected', value: counts.rejected, color: '#991b1b', bg: '#fee2e2' },
                            ].map(({ label, value, color, bg }) => (
                                <div key={label} style={{ background: bg ?? '#fff', border: '1px solid #EDEDED', borderRadius: 10, padding: '14px 20px', minWidth: 100 }}>
                                    <div style={{ fontFamily: 'Barlow Condensed', fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                                    <div style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 4 }}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Filter tabs */}
                        <div className="filters">
                            {['all', 'pending', 'approved', 'rejected'].map(f => (
                                <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)} {filter === f && `(${counts[f]})`}
                                </button>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="table-card">
                            <div className="table-head">
                                <span>Volunteer</span>
                                <span>Document Type</span>
                                <span>Uploaded</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>
                            {filtered.length === 0 ? (
                                <div className="empty">Walang dokumento.</div>
                            ) : filtered.map((doc, i) => {
                                const [bg, color] = avatarColors[doc.color_id ?? i % 5];
                                return (
                                    <div key={doc.id} className="table-row" onClick={() => setPreviewDoc(doc)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {doc.photo
                                                ? <img src={doc.photo} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                                : <div className="vol-av" style={{ background: bg, color }}>{doc.initials}</div>
                                            }
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: 13 }}>{doc.name}</div>
                                                <div style={{ fontSize: 11, color: '#6B6B6B' }}>Muntinlupa City Branch</div>
                                            </div>
                                        </div>
                                        <div className="doc-type">{doc.type}</div>
                                        <div style={{ fontSize: 12, color: '#6B6B6B' }}>{doc.uploaded_at}</div>
                                        <span className="badge" style={statusStyle(doc.status)}>{doc.status}</span>
                                        <div className="action-btns" onClick={e => e.stopPropagation()}>
                                            {doc.status === 'pending' && (
                                                <>
                                                    <button className="btn-approve" onClick={() => handleApprove(doc.id)}>✓</button>
                                                    <button className="btn-reject"  onClick={() => handleReject(doc.id)}>✕</button>
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
                </main>
            </div>
        </>
    );
}