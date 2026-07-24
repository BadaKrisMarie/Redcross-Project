import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function AdminReport({ records = [], totals = {}, weeklyTrend = [], filters = {} }) {
    const [query, setQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // ✅ NEW: datatable state — sorting + pagination (client-side, runs on the current page of records)
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [currentPage, setCurrentPage] = useState(1);

    const applyFilters = (next = {}) => {
        router.get(
            route('admin.reports.index'),
            {
                from: filters.from,
                to: filters.to,
                status: statusFilter,
                search: query,
                ...next,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (value) => {
        setQuery(value);
        setCurrentPage(1);
        applyFilters({ search: value });
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
        applyFilters({ status: value });
    };

    const handleExportPdf = () => {
        window.location.href = route('admin.reports.export.pdf', {
            from: filters.from,
            to: filters.to,
        });
    };

    const statusBadge = (status) => {
        if (status === 'present') return { background: '#dcfce7', color: '#166534', label: 'Present' };
        if (status === 'ongoing') return { background: '#fef3c7', color: '#92400e', label: 'On duty' };
        if (status === 'absent') return { background: '#fee2e2', color: '#991b1b', label: 'Absent' };
        if (status === 'flagged') return { background: '#ede9fe', color: '#5b21b6', label: 'Flagged' };
        return { background: '#f5f5f5', color: '#555', label: status };
    };

    // ✅ NEW: column definitions for the datatable — sortKey maps to a field (or accessor) on each record
    const columns = [
        { key: 'name',     label: 'Volunteer',      sortable: true },
        { key: 'activity', label: 'Activity',        sortable: true },
        { key: 'timeIn',   label: 'Time in / out',   sortable: true },
        { key: 'geofence', label: 'Geofence',        sortable: true },
        { key: 'scan',     label: 'Method',          sortable: true },
        { key: 'status',   label: 'Status',          sortable: true },
    ];

    // ✅ NEW: sort the full (filtered) record set before paginating
    const sortedRecords = useMemo(() => {
        const copy = [...records];
        copy.sort((a, b) => {
            const valA = (a[sortField] ?? '').toString().toLowerCase();
            const valB = (b[sortField] ?? '').toString().toLowerCase();
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return copy;
    }, [records, sortField, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const pagedRecords = sortedRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

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

    const TrendChart = ({ data }) => {
        const W = 600, H = 130, padL = 28, padB = 20, padT = 8;
        const chartW = W - padL - 8;
        const chartH = H - padT - padB;
        const maxVal = Math.max(...data.map((d) => d.present + d.absent), 1);
        const barGroupW = chartW / Math.max(data.length, 1);
        const barW = Math.min(28, barGroupW * 0.45);
        const yTicks = Math.max(1, Math.min(4, maxVal));

        return (
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: '180px', height: 'auto', display: 'block' }}>
                {Array.from({ length: yTicks + 1 }).map((_, i) => {
                    const y = padT + (chartH / yTicks) * i;
                    const val = Math.round(maxVal - (maxVal / yTicks) * i);
                    return (
                        <g key={i}>
                            <line x1={padL} y1={y} x2={W - 4} y2={y} stroke="#F0F0F0" strokeWidth="1" />
                            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#999" fontFamily="'DM Sans', sans-serif">{val}</text>
                        </g>
                    );
                })}
                {data.map((d, i) => {
                    const total = d.present + d.absent;
                    const barH = (total / maxVal) * chartH;
                    const presentH = (d.present / maxVal) * chartH;
                    const absentH = (d.absent / maxVal) * chartH;
                    const x = padL + barGroupW * i + (barGroupW - barW) / 2;
                    const yBottom = padT + chartH;
                    return (
                        <g key={i}>
                            <rect x={x} y={yBottom - presentH} width={barW} height={Math.max(presentH, 0)} rx="3" fill="#ff0000" />
                            <rect x={x} y={yBottom - barH} width={barW} height={Math.max(absentH - 2, 0)} rx="3" fill="#F0C7CC" />
                            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#6B6B6B" fontFamily="'DM Sans', sans-serif">{d.day}</text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    return (
        <>
            <Head title="Admin Report" />

            <style>{`
                .rp-card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 20px; margin-bottom: 16px; }
                .rp-card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .3px; margin-bottom: 14px; }
                .rp-filters { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
                .rp-search { flex: 1; min-width: 220px; border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; font-size: 13px; font-family: 'DM Sans', sans-serif; }
                .rp-status-tabs { display: flex; gap: 4px; background: #f5f5f5; border-radius: 6px; padding: 4px; }
                .rp-status-tab { border: none; background: transparent; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; text-transform: capitalize; font-family: 'DM Sans', sans-serif; color: var(--ink); }
                .rp-status-tab.active { background: var(--red); color: #fff; }
                .rp-export { background: var(--red); color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
                .rp-export:hover { background: var(--red-dark); }

                /* ✅ NEW: datatable-specific styles */
                .rp-table-scroll { overflow-x: auto; }
                table.rp-table { width: 100%; min-width: 720px; border-collapse: collapse; font-size: 13px; font-family: 'DM Sans', sans-serif; }
                table.rp-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .3px; color: var(--muted); padding: 8px 10px; border-bottom: 1px solid var(--border); user-select: none; }
                table.rp-table th.sortable { cursor: pointer; white-space: nowrap; }
                table.rp-table th.sortable:hover { color: var(--ink); }
                table.rp-table th .sort-icon { margin-left: 4px; font-size: 10px; opacity: .6; }
                table.rp-table th.sorted .sort-icon { opacity: 1; color: var(--red); }
                table.rp-table td { padding: 10px; border-bottom: 1px solid #f0f0f0; color: var(--ink); }
                .rp-badge { font-size: 11px; padding: 3px 9px; border-radius: 20px; white-space: nowrap; font-weight: 600; }
                .rp-empty { text-align: center; color: #aaa; font-size: 13px; padding: 30px 0; }
                .rp-table-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
                .rp-page-size { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
                .rp-page-size select { border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 12px; font-family: 'DM Sans', sans-serif; background: #fff; cursor: pointer; }
                .rp-pagination { display: flex; align-items: center; gap: 6px; }
                .rp-page-btn { border: 1px solid var(--border); background: #fff; color: var(--ink); font-size: 12px; font-weight: 600; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
                .rp-page-btn:hover:not(:disabled) { border-color: #ccc; }
                .rp-page-btn:disabled { opacity: .4; cursor: not-allowed; }
                .rp-page-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
                .rp-page-info { font-size: 12px; color: var(--muted); }
            `}</style>

            <div className="rp-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div className="rp-card-title" style={{ marginBottom: 0 }}>Weekly attendance trend</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '11px', color: '#6B6B6B' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#ff0000', display: 'inline-block' }} />Present
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#F0C7CC', display: 'inline-block' }} />Absent
                        </span>
                    </div>
                </div>
                {weeklyTrend.length === 0 ? (
                    <div className="rp-empty">Wala pang attendance record sa date range na ito.</div>
                ) : (
                    <TrendChart data={weeklyTrend} />
                )}
            </div>

            <div className="rp-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div className="rp-card-title" style={{ marginBottom: 0 }}>Attendance manifest</div>
                    <button className="rp-export" onClick={handleExportPdf}>Export PDF</button>
                </div>

                <div className="rp-filters">
                    <input
                        className="rp-search"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search name or activity"
                    />
                    <div className="rp-status-tabs">
                        {['all', 'present', 'ongoing', 'absent', 'flagged'].map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusFilter(s)}
                                className={`rp-status-tab ${statusFilter === s ? 'active' : ''}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ✅ NEW: pagination + page size controls (moved above the table) */}
                {sortedRecords.length > 0 && (
                    <div className="rp-table-footer">
                        <div className="rp-page-size">
                            <span>Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            >
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <span className="rp-page-info">
                                {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sortedRecords.length)} of {sortedRecords.length}
                            </span>
                        </div>
                        <div className="rp-pagination">
                            <button
                                className="rp-page-btn"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                            >
                                ‹ Prev
                            </button>
                            <span className="rp-page-info">Page {safePage} of {totalPages}</span>
                            <button
                                className="rp-page-btn"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                )}

                {/* ✅ NEW: sortable, paginated datatable */}
                <div className="rp-table-scroll">
                    <table className="rp-table">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={`${col.sortable ? 'sortable' : ''} ${sortField === col.key ? 'sorted' : ''}`}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                    >
                                        {col.label}
                                        {col.sortable && <span className="sort-icon">{sortIndicator(col.key)}</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pagedRecords.map((r) => {
                                const badge = statusBadge(r.status);
                                return (
                                    <tr key={r.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{r.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.id} · {r.branch}</div>
                                        </td>
                                        <td>{r.activity}</td>
                                        <td>{r.timeIn} — {r.timeOut}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{r.geofence}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{r.scan}</td>
                                        <td>
                                            <span className="rp-badge" style={{ background: badge.background, color: badge.color }}>
                                                {badge.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedRecords.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="rp-empty">No records match your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

AdminReport.layout = (page) => <AdminLayout title="Reports">{page}</AdminLayout>;

export default AdminReport;