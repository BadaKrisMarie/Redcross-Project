import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Fingerprint,
    CheckCircle2,
    XCircle,
    Search,
    X,
    Users,
    AlertCircle,
} from 'lucide-react';

const NavAvatar = ({ photoUrl, initials, size = 36 }) => (
    <div
        style={{ width: size, height: size }}
        className="rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden"
    >
        {photoUrl ? (
            <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
            initials
        )}
    </div>
);

const getInitials = (name) =>
    (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function FingerprintEnrollmentIndex({ volunteers = [], stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [notesInput, setNotesInput] = useState('');
    const [saving, setSaving] = useState(false);

    const applyFilters = (nextSearch = search, nextStatus = statusFilter) => {
        router.get(
            route('admin.fingerprint.index'),
            { search: nextSearch, status: nextStatus },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') applyFilters(search, statusFilter);
    };

    const handleFilterClick = (status) => {
        setStatusFilter(status);
        applyFilters(search, status);
    };

    const openConfirm = (volunteer) => {
        setConfirmTarget(volunteer);
        setNotesInput(volunteer.notes || '');
    };

    const closeConfirm = () => {
        setConfirmTarget(null);
        setNotesInput('');
    };

    const handleConfirmToggle = () => {
        if (!confirmTarget) return;
        setSaving(true);
        router.patch(
            route('admin.fingerprint.toggle', confirmTarget.id),
            {
                is_enrolled: !confirmTarget.is_enrolled,
                notes: notesInput,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => closeConfirm(),
                onFinish: () => setSaving(false),
            }
        );
    };

    const filterTabs = [
        { key: '', label: 'All' },
        { key: 'enrolled', label: 'Enrolled' },
        { key: 'not_enrolled', label: 'Not Enrolled' },
    ];

    return (
        <>
            <Head title="Fingerprint Enrollment - Admin Portal" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                    <div className="p-5 rounded-2xl bg-white flex items-start justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-gray-500">Total Volunteers</span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                {stats.total ?? 0}
                            </div>
                            <p className="text-xs text-gray-400">Registered members</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white flex items-start justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-gray-500">Enrolled Biometrics</span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                {stats.enrolled ?? 0}
                            </div>
                            <p className="text-xs text-emerald-600 font-semibold">Fingerprint on file</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white flex items-start justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-gray-500">Not Enrolled</span>
                            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                {stats.not_enrolled ?? 0}
                            </div>
                            <p className="text-xs text-amber-600 font-semibold">Needs enrollment</p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filter and Search Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search by name or email (press Enter)..."
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                        />
                    </div>

                    <div className="flex items-center gap-1.5">
                        {filterTabs.map((tab) => {
                            const isSelected = statusFilter === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleFilterClick(tab.key)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                                        isSelected
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Volunteers Table Card */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500">
                                    <th className="p-3.5 sm:px-5">Volunteer</th>
                                    <th className="p-3.5 sm:px-5">Branch</th>
                                    <th className="p-3.5 sm:px-5">Status</th>
                                    <th className="p-3.5 sm:px-5">Enrolled At</th>
                                    <th className="p-3.5 sm:px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {volunteers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-400">
                                            <Fingerprint className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            No volunteers found.
                                        </td>
                                    </tr>
                                ) : (
                                    volunteers.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50/60 transition">
                                            <td className="p-3.5 sm:px-5">
                                                <div className="flex items-center gap-3">
                                                    <NavAvatar photoUrl={v.photo} initials={getInitials(v.name)} size={36} />
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-gray-900 truncate">{v.name}</div>
                                                        <div className="text-[11px] text-gray-400 truncate">{v.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3.5 sm:px-5 text-gray-600">
                                                {v.branch || 'Muntinlupa Branch'}
                                            </td>
                                            <td className="p-3.5 sm:px-5">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        v.is_enrolled
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : 'bg-red-50 text-red-600'
                                                    }`}
                                                >
                                                    {v.is_enrolled ? 'Enrolled' : 'Not Enrolled'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 sm:px-5 text-gray-500 whitespace-nowrap">
                                                {v.enrolled_at || '-'}
                                            </td>
                                            <td className="p-3.5 sm:px-5 text-right">
                                                <button
                                                    onClick={() => openConfirm(v)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                                        v.is_enrolled
                                                            ? 'border border-red-600 text-red-600 hover:bg-red-50'
                                                            : 'bg-red-600 hover:bg-red-700 text-white'
                                                    }`}
                                                >
                                                    {v.is_enrolled ? 'Unmark' : 'Mark Enrolled'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Confirm Enrollment Toggle Modal */}
            {confirmTarget && (
                <div
                    onClick={closeConfirm}
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">
                                {confirmTarget.is_enrolled ? 'Unmark Fingerprint Enrollment' : 'Confirm Fingerprint Enrollment'}
                            </h3>
                            <button onClick={closeConfirm} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <NavAvatar photoUrl={confirmTarget.photo} initials={getInitials(confirmTarget.name)} size={40} />
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-gray-900 truncate">{confirmTarget.name}</div>
                                <div className="text-[11px] text-gray-400 truncate">{confirmTarget.email}</div>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                            {confirmTarget.is_enrolled
                                ? 'Are you sure you want to unmark the fingerprint enrollment record for this volunteer?'
                                : 'Confirm that this volunteer has completed their physical fingerprint biometric registration on the device.'}
                        </p>

                        <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                                rows={2}
                                placeholder="e.g. Enrolled on office scanner device #1"
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={closeConfirm}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmToggle}
                                disabled={saving}
                                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 ${
                                    confirmTarget.is_enrolled ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                {saving ? 'Saving...' : confirmTarget.is_enrolled ? 'Yes, Unmark' : 'Yes, Confirm Enrolled'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

FingerprintEnrollmentIndex.layout = (page) => <AdminLayout title="Fingerprint Enrollment">{page}</AdminLayout>;

export default FingerprintEnrollmentIndex;