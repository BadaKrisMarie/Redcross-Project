import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function Index({ activities = [] }) {
    const [view, setView] = useState('table');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ✅ NEW: datatable state — sorting + pagination
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [currentPage, setCurrentPage] = useState(1);

    const handleDelete = (activity) => {
        setDeleteTarget(activity);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.activities.destroy', deleteTarget.id));
        setDeleteTarget(null);
    };

    const statusStyle = (status) => {
        switch (status) {
            case 'upcoming':  return { background: '#dbeafe', color: '#1e40af' };
            case 'ongoing':   return { background: '#dcfce7', color: '#166534' };
            case 'completed': return { background: '#f3f4f6', color: '#374151' };
            case 'cancelled': return { background: '#fee2e2', color: '#991b1b' };
            default:          return { background: '#f3f4f6', color: '#374151' };
        }
    };

    const filtered = activities.filter(a => {
        const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) ||
                            a.description?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // ✅ NEW: datatable column definitions — accessor pulls a comparable value out of each record
    const columns = [
        { key: 'name',        label: 'Activity',      sortable: true, accessor: (a) => a.name ?? '' },
        { key: 'date',        label: 'Date & Time',   sortable: true, accessor: (a) => `${a.date ?? ''} ${a.start_time ?? ''}` },
        { key: 'status',      label: 'Status',        sortable: true, accessor: (a) => a.status ?? '' },
        { key: 'description', label: 'Description',   sortable: false, accessor: (a) => a.description ?? '' },
        { key: 'actions',     label: 'Actions',       sortable: false, accessor: () => '' },
    ];

    // ✅ NEW: sort the filtered set before paginating
    const sorted = useMemo(() => {
        const col = columns.find((c) => c.key === sortField);
        if (!col || !col.sortable) return filtered;
        const copy = [...filtered];
        copy.sort((a, b) => {
            const valA = col.accessor(a).toString().toLowerCase();
            const valB = col.accessor(b).toString().toLowerCase();
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return copy;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtered, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

    const handleSort = (key) => {
        if (sortField === key) {
            setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(key);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const sortIndicator = (key) => {
        if (sortField !== key) return '↕';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <>
            <Head title="Activities" />

            <style>{`
                .status-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; text-transform: capitalize; white-space: nowrap; }
                .card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; }
                .act-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .act-table th { text-align: left; padding: 11px 16px; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid var(--border); background: var(--surface); }
                .act-table th.sortable { cursor: pointer; user-select: none; white-space: nowrap; }
                .act-table th.sortable:hover { color: var(--ink); }
                .act-sort-icon { margin-left: 4px; font-size: 10px; opacity: .6; }
                .act-sort-icon.active { opacity: 1; color: var(--red); }
                .act-table td { padding: 13px 16px; border-bottom: 1px solid var(--border); color: var(--ink); vertical-align: top; }
                .act-table tr:last-child td { border-bottom: none; }
                .act-table tr:hover td { background: #fafafa; }
                .act-card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.15s, transform 0.15s; }
                .act-card:hover { border-color: #ddd; transform: translateY(-2px); }
                .btn-edit { background: var(--surface); border: 1px solid var(--border); color: var(--ink); padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 500; text-decoration: none; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
                .btn-edit:hover { background: #ebebeb; }
                .btn-del { background: #fee2e2; border: none; color: #991b1b; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
                .btn-del:hover { background: #fecaca; }
                .view-toggle { display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
                .view-toggle button { background: none; border: none; padding: 7px 12px; cursor: pointer; color: var(--muted); font-size: 12px; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
                .view-toggle button.active { background: var(--white); color: var(--ink); font-weight: 500; }
                .filter-select { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; font-size: 12px; color: var(--ink); font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }
                .new-btn { background: var(--red); color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s; font-family: 'DM Sans', sans-serif; }
                .new-btn:hover { background: var(--red-dark); }
                .search-input { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 7px 12px; font-size: 12px; color: var(--ink); font-family: 'DM Sans', sans-serif; outline: none; width: 200px; transition: border-color 0.15s; }
                .search-input:focus { border-color: #ccc; }
                .search-input::placeholder { color: #aaa; }
                .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }

                /* ✅ NEW: pagination + page size controls */
                .act-table-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
                .act-page-size { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
                .act-page-size select { border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 12px; background: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif; }
                .act-pagination { display: flex; align-items: center; gap: 8px; }
                .act-page-btn { border: 1px solid var(--border); background: #fff; color: var(--ink); font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
                .act-page-btn:hover:not(:disabled) { border-color: #ccc; }
                .act-page-btn:disabled { opacity: .4; cursor: not-allowed; }
                .act-page-info { font-size: 12px; color: var(--muted); }
            `}</style>

            {/* Delete confirmation modal */}
            {deleteTarget && (
                <div
                    onClick={() => setDeleteTarget(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '380px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
                    >
                        <div style={{ padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
                            <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#991B1B" strokeWidth="2">
                                    <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </div>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '19px', fontWeight: '700', color: '#1A1A1A', textTransform: 'uppercase' }}>
                                Delete activity?
                            </div>
                            <div style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: '1.5' }}>
                                Are you sure you want to delete <strong style={{ color: '#1A1A1A' }}>{deleteTarget.name}</strong>? This action cannot be undone.
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', padding: '16px 24px 24px' }}>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                style={{ flex: 1, background: '#F7F7F5', border: '1px solid #EDEDED', color: '#1A1A1A', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{ flex: 1, background: '#ff0000', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PAGE HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                        {filtered.length} activit{filtered.length !== 1 ? 'ies' : 'y'} found
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                        className="search-input"
                        placeholder="Search activities…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                    <select className="filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
                        <option value="all">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="view-toggle">
                        <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>
                            ☰ Table
                        </button>
                        <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>
                            ⊞ Cards
                        </button>
                    </div>
                    <Link href={route('admin.activities.create')} className="new-btn">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        New Activity
                    </Link>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="card empty-state">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                    <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '6px', color: 'var(--ink)' }}>No activities found</div>
                    <div style={{ fontSize: '13px', marginBottom: '16px' }}>
                        {search || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Create your first activity to get started.'}
                    </div>
                    <Link href={route('admin.activities.create')} className="new-btn" style={{ display: 'inline-flex' }}>
                        + New Activity
                    </Link>
                </div>
            ) : view === 'table' ? (
                /* ── TABLE VIEW ── */
                <>
                    {/* ✅ NEW: pagination + page size controls (above the table) */}
                    <div className="act-table-footer">
                        <div className="act-page-size">
                            <span>Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            >
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <span className="act-page-info">
                                {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
                            </span>
                        </div>
                        <div className="act-pagination">
                            <button
                                className="act-page-btn"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                            >
                                ‹ Prev
                            </button>
                            <span className="act-page-info">Page {safePage} of {totalPages}</span>
                            <button
                                className="act-page-btn"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ overflow: 'hidden' }}>
                        <table className="act-table">
                            <thead>
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            className={col.sortable ? 'sortable' : ''}
                                            onClick={() => col.sortable && handleSort(col.key)}
                                            style={col.key === 'actions' ? { textAlign: 'right' } : undefined}
                                        >
                                            {col.label}
                                            {col.sortable && (
                                                <span className={`act-sort-icon ${sortField === col.key ? 'active' : ''}`}>
                                                    {sortIndicator(col.key)}
                                                </span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(activity => (
                                    <tr key={activity.id}>
                                        <td>
                                            <div style={{ fontWeight: '500', color: 'var(--ink)', fontSize: '13px' }}>{activity.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>📍 {activity.location_name ?? '—'}</div>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--ink)' }}>{activity.date}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{activity.start_time} – {activity.end_time}</div>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={statusStyle(activity.status)}>
                                                {activity.status}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: '260px' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {activity.description ?? '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                <Link href={route('admin.activities.edit', activity.id)} className="btn-edit">Edit</Link>
                                                <button onClick={() => handleDelete(activity)} className="btn-del">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                /* ── CARDS VIEW ── */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {filtered.map(activity => (
                        <div key={activity.id} className="act-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ink)', lineHeight: '1.3' }}>{activity.name}</div>
                                <span className="status-badge" style={{ ...statusStyle(activity.status), flexShrink: 0 }}>
                                    {activity.status}
                                </span>
                            </div>

                            {activity.description && (
                                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {activity.description}
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    {activity.date} &nbsp;·&nbsp; {activity.start_time} – {activity.end_time}
                                </div>
                                {activity.location_name && (
                                    <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                        {activity.location_name}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                <Link href={route('admin.activities.edit', activity.id)} className="btn-edit" style={{ flex: 1, textAlign: 'center' }}>Edit</Link>
                                <button onClick={() => handleDelete(activity)} className="btn-del" style={{ flex: 1 }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

Index.layout = (page) => <AdminLayout title="Activities">{page}</AdminLayout>;

export default Index;