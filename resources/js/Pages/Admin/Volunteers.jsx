import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    Search,
    Check,
    X,
    RotateCcw,
    Trash2,
    Eye,
    LayoutGrid,
    List,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Phone,
    MapPin,
    Calendar,
} from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const fmtDate = (d, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => {
    if (!d) return '-';
    try {
        return new Date(d).toLocaleDateString('en-PH', opts);
    } catch {
        return d;
    }
};

const getInitials = (name) => {
    if (!name) return 'VO';
    const p = name.trim().split(/\s+/);
    return (p[0][0] + (p[1]?.[0] || '')).toUpperCase();
};

function NavAvatar({ photoUrl, initials, size = 36 }) {
    const s = `${size}px`;
    return (
        <div
            style={{ width: s, height: s }}
            className="rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden"
        >
            {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                initials
            )}
        </div>
    );
}

function Volunteers({ volunteers = [], flash = {} }) {
    const [view, setView] = useState('table');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [revokeTarget, setRevokeTarget] = useState(null);

    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [currentPage, setCurrentPage] = useState(1);

    const statusBadge = (status) => {
        switch (status) {
            case 'approved':
                return { bg: 'bg-emerald-50 text-emerald-600', label: 'Approved' };
            case 'rejected':
                return { bg: 'bg-red-50 text-red-600', label: 'Rejected' };
            default:
                return { bg: 'bg-amber-50 text-amber-600', label: 'Pending' };
        }
    };

    const filtered = volunteers.filter((v) => {
        const vStatus = v.status || 'pending';
        const q = search.toLowerCase().trim();
        const matchSearch =
            !q ||
            (v.name || '').toLowerCase().includes(q) ||
            (v.email || '').toLowerCase().includes(q) ||
            (v.phone || '').toLowerCase().includes(q) ||
            (v.address || '').toLowerCase().includes(q);
        const matchStatus = filterStatus === 'all' || vStatus === filterStatus;
        return matchSearch && matchStatus;
    });

    const columns = [
        { key: 'name', label: 'Volunteer', sortable: true, accessor: (v) => v.name ?? '' },
        { key: 'contact', label: 'Contact Details', sortable: true, accessor: (v) => v.email ?? '' },
        { key: 'date', label: 'Date Registered', sortable: true, accessor: (v) => v.created_at ?? '' },
        { key: 'status', label: 'Status', sortable: true, accessor: (v) => v.status || 'pending' },
        { key: 'actions', label: 'Actions', sortable: false, accessor: () => '' },
    ];

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

    const approve = (id) => {
        router.patch(route('admin.volunteers.approve', id), {}, { preserveScroll: true });
    };

    const confirmRevoke = () => {
        if (!revokeTarget) return;
        router.patch(
            route('admin.volunteers.reject', revokeTarget.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setRevokeTarget(null),
            }
        );
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.volunteers.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <>
            <Head title="Volunteers - Admin Portal" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Flash Notice */}
                {flash?.success && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Header & Controls Bar */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Volunteer Management</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {filtered.length} {filtered.length === 1 ? 'volunteer' : 'volunteers'} listed
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:flex-initial sm:w-56">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search volunteers..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none font-medium transition"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex items-center p-1 bg-gray-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setView('table')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                    view === 'table' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                                }`}
                                title="Table view"
                            >
                                <List className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Table</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('cards')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                    view === 'cards' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                                }`}
                                title="Card grid view"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Cards</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center space-y-3">
                        <Users className="w-10 h-10 mx-auto text-gray-300" />
                        <h3 className="text-sm font-bold text-gray-900">No volunteers found</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            {search || filterStatus !== 'all'
                                ? 'No records match your active search or filter criteria.'
                                : 'No volunteers have registered yet.'}
                        </p>
                    </div>
                ) : view === 'table' ? (
                    /* Table View */
                    <div className="bg-white rounded-2xl overflow-hidden">
                        {/* Pagination Top Bar */}
                        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <span>Rows per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                                >
                                    {PAGE_SIZE_OPTIONS.map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-gray-400">
                                    Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-semibold text-gray-700">
                                    Page {safePage} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[760px]">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500">
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                onClick={() => col.sortable && handleSort(col.key)}
                                                className={`p-3.5 sm:px-5 ${
                                                    col.sortable ? 'cursor-pointer select-none hover:text-gray-900' : ''
                                                } ${col.key === 'actions' ? 'text-right' : ''}`}
                                            >
                                                <div className={`flex items-center gap-1.5 ${col.key === 'actions' ? 'justify-end' : ''}`}>
                                                    <span>{col.label}</span>
                                                    {col.sortable &&
                                                        (sortField === col.key ? (
                                                            sortDirection === 'asc' ? (
                                                                <ChevronUp className="w-3.5 h-3.5 text-red-600" />
                                                            ) : (
                                                                <ChevronDown className="w-3.5 h-3.5 text-red-600" />
                                                            )
                                                        ) : (
                                                            <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
                                                        ))}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs">
                                    {paged.map((v) => {
                                        const badge = statusBadge(v.status);
                                        return (
                                            <tr key={v.id} className="hover:bg-gray-50/60 transition">
                                                <td className="p-3.5 sm:px-5">
                                                    <div className="flex items-center gap-3">
                                                        <NavAvatar
                                                            photoUrl={v.photo}
                                                            initials={getInitials(v.name)}
                                                            size={36}
                                                        />
                                                        <div className="min-w-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedVolunteer(v)}
                                                                className="font-bold text-gray-900 hover:text-red-600 transition truncate text-left block"
                                                            >
                                                                {v.name}
                                                            </button>
                                                            <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                                                                {v.address || 'Muntinlupa Branch'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3.5 sm:px-5 text-gray-700 whitespace-nowrap">
                                                    <div className="font-semibold text-gray-900">{v.email}</div>
                                                    {v.phone && (
                                                        <div className="text-[11px] text-gray-400">
                                                            {v.phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3.5 sm:px-5 text-gray-700 whitespace-nowrap">
                                                    <div className="font-semibold text-gray-900">{fmtDate(v.created_at)}</div>
                                                    <div className="text-[11px] text-gray-400">Registered member</div>
                                                </td>
                                                <td className="p-3.5 sm:px-5">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 sm:px-5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={route('admin.volunteers.show', v.id)}
                                                            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                                                            title="View Full Profile"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        {v.status !== 'approved' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => approve(v.id)}
                                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                                                title="Approve Volunteer"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {v.status === 'approved' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setRevokeTarget(v)}
                                                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                                                                title="Revoke Access"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteTarget(v)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                                            title="Delete Volunteer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Cards Grid View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {paged.map((v) => {
                            const badge = statusBadge(v.status);
                            return (
                                <div
                                    key={v.id}
                                    className="bg-white rounded-2xl p-5 space-y-4 hover:shadow-xs transition flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <NavAvatar
                                                    photoUrl={v.photo}
                                                    initials={getInitials(v.name)}
                                                    size={40}
                                                />
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">
                                                        {v.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 truncate">{v.email}</p>
                                                </div>
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badge.bg}`}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span>Joined {fmtDate(v.created_at)}</span>
                                            </div>
                                            {v.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{v.phone}</span>
                                                </div>
                                            )}
                                            {v.address && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{v.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                        <Link
                                            href={route('admin.volunteers.show', v.id)}
                                            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition flex items-center gap-1.5"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Profile</span>
                                        </Link>
                                        {v.status !== 'approved' && (
                                            <button
                                                type="button"
                                                onClick={() => approve(v.id)}
                                                className="px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition flex items-center gap-1.5"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Approve</span>
                                            </button>
                                        )}
                                        {v.status === 'approved' && (
                                            <button
                                                type="button"
                                                onClick={() => setRevokeTarget(v)}
                                                className="px-3 py-1.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-bold transition flex items-center gap-1.5"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                <span>Revoke</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(v)}
                                            className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Profile Overview Modal */}
            {selectedVolunteer && (
                <div
                    onClick={() => setSelectedVolunteer(null)}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">Volunteer Overview</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedVolunteer(null)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3.5 p-3.5 bg-gray-50 rounded-xl">
                            <NavAvatar
                                photoUrl={selectedVolunteer.photo}
                                initials={getInitials(selectedVolunteer.name)}
                                size={44}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-gray-900 truncate">
                                    {selectedVolunteer.name}
                                </div>
                                <div className="text-xs text-gray-400 truncate">{selectedVolunteer.email}</div>
                                <div className="pt-1">
                                    {(() => {
                                        const b = statusBadge(selectedVolunteer.status);
                                        return (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${b.bg}`}>
                                                {b.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-gray-50 rounded-xl space-y-0.5">
                                <span className="text-[11px] font-semibold text-gray-400 block">Phone</span>
                                <span className="font-semibold text-gray-800">
                                    {selectedVolunteer.phone || '-'}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl space-y-0.5">
                                <span className="text-[11px] font-semibold text-gray-400 block">Address</span>
                                <span className="font-semibold text-gray-800 truncate block">
                                    {selectedVolunteer.address || '-'}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl space-y-0.5 col-span-2">
                                <span className="text-[11px] font-semibold text-gray-400 block">Date Registered</span>
                                <span className="font-semibold text-gray-800">
                                    {fmtDate(selectedVolunteer.created_at, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setSelectedVolunteer(null)}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                            >
                                Close
                            </button>
                            <Link
                                href={route('admin.volunteers.show', selectedVolunteer.id)}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition flex items-center gap-1.5"
                            >
                                <span>Full Profile</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Revoke Confirmation Modal */}
            {revokeTarget && (
                <div
                    onClick={() => setRevokeTarget(null)}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Revoke Access?</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Are you sure you want to revoke active access for <strong>{revokeTarget.name}</strong>? Their status will be set to rejected.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setRevokeTarget(null)}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmRevoke}
                                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white transition"
                            >
                                Revoke Access
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div
                    onClick={() => setDeleteTarget(null)}
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
                                <h3 className="text-sm font-bold text-gray-900">Delete Volunteer?</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition"
                            >
                                Delete Volunteer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Volunteers.layout = (page) => <AdminLayout title="Volunteers">{page}</AdminLayout>;

export default Volunteers;