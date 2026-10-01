import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    MapPin,
    Calendar,
    Clock,
    Users,
    Search,
    Plus,
    Edit3,
    Trash2,
    LayoutGrid,
    List,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    X,
} from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function Index({ activities = [] }) {
    const [view, setView] = useState('table');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState(null);

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

    const statusBadge = (status) => {
        switch (status) {
            case 'upcoming':
                return { bg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-600' };
            case 'ongoing':
                return { bg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-600' };
            case 'completed':
                return { bg: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' };
            case 'cancelled':
                return { bg: 'bg-red-50 text-red-600', dot: 'bg-red-600' };
            default:
                return { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-600' };
        }
    };

    const filtered = activities.filter((a) => {
        const matchSearch =
            (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (a.description || '').toLowerCase().includes(search.toLowerCase()) ||
            (a.location_name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const columns = [
        { key: 'name', label: 'Activity', sortable: true, accessor: (a) => a.name ?? '' },
        { key: 'date', label: 'Date & Time', sortable: true, accessor: (a) => `${a.date ?? ''} ${a.start_time ?? ''}` },
        { key: 'location', label: 'Location', sortable: true, accessor: (a) => a.location_name ?? '' },
        { key: 'volunteers', label: 'Volunteers', sortable: false, accessor: (a) => a.volunteers?.length ?? 0 },
        { key: 'status', label: 'Status', sortable: true, accessor: (a) => a.status ?? '' },
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

    return (
        <>
            <Head title="Activities - Admin Portal" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header & Controls Bar */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Activity Management</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {filtered.length} {filtered.length === 1 ? 'activity' : 'activities'} listed
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:flex-initial sm:w-56">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search activities..."
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
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex items-center p-1 bg-gray-100 rounded-xl">
                            <button
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

                        {/* New Activity CTA */}
                        <Link
                            href={route('admin.activities.create')}
                            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Activity</span>
                        </Link>
                    </div>
                </div>

                {/* Empty State */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center space-y-3">
                        <Calendar className="w-10 h-10 mx-auto text-gray-300" />
                        <h3 className="text-sm font-bold text-gray-900">No activities found</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            {search || filterStatus !== 'all'
                                ? 'No records match your active search or filter criteria.'
                                : 'Get started by creating the first volunteer activity schedule.'}
                        </p>
                        <Link
                            href={route('admin.activities.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Activity</span>
                        </Link>
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
                                    {paged.map((a) => {
                                        const badge = statusBadge(a.status);
                                        return (
                                            <tr key={a.id} className="hover:bg-gray-50/60 transition">
                                                <td className="p-3.5 sm:px-5">
                                                    <div className="font-bold text-gray-900">{a.name}</div>
                                                    {a.description && (
                                                        <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                                                            {a.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3.5 sm:px-5 text-gray-700 whitespace-nowrap">
                                                    <div className="font-semibold text-gray-900">{a.date}</div>
                                                    {(a.start_time || a.end_time) && (
                                                        <div className="text-[11px] text-gray-400">
                                                            {a.start_time} – {a.end_time}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3.5 sm:px-5 text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span className="truncate max-w-[180px]">{a.location_name || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3.5 sm:px-5">
                                                    <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{a.volunteers?.length || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3.5 sm:px-5">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}
                                                    >
                                                        {a.status}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 sm:px-5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={route('admin.activities.edit', a.id)}
                                                            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                                                            title="Edit Activity"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(a)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                                            title="Delete Activity"
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
                        {paged.map((a) => {
                            const badge = statusBadge(a.status);
                            return (
                                <div
                                    key={a.id}
                                    className="bg-white rounded-2xl p-5 space-y-4 hover:shadow-xs transition flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-bold text-gray-900 leading-snug">{a.name}</h3>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badge.bg}`}
                                            >
                                                {a.status}
                                            </span>
                                        </div>

                                        {a.description && (
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                {a.description}
                                            </p>
                                        )}

                                        <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span>{a.date}</span>
                                            </div>
                                            {(a.start_time || a.end_time) && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span>{a.start_time} – {a.end_time}</span>
                                                </div>
                                            )}
                                            {a.location_name && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate">{a.location_name}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span>{a.volunteers?.length || 0} volunteers assigned</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                        <Link
                                            href={route('admin.activities.edit', a.id)}
                                            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition flex items-center gap-1.5"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>Edit</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(a)}
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
                                <h3 className="text-sm font-bold text-gray-900">Delete Activity?</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition"
                            >
                                Delete Activity
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = (page) => <AdminLayout title="Activities">{page}</AdminLayout>;

export default Index;