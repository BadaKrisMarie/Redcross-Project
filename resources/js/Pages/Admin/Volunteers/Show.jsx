import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Check,
    X,
    RotateCcw,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Award,
    FileText,
    Shield,
} from 'lucide-react';

const statusBadge = (status) => {
    switch (status) {
        case 'approved':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                    <Check className="w-3 h-3" />
                    <span>Active / Approved</span>
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                    <Clock className="w-3 h-3" />
                    <span>Pending Approval</span>
                </span>
            );
        case 'rejected':
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                    <X className="w-3 h-3" />
                    <span>Rejected</span>
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    Inactive
                </span>
            );
    }
};

function VolunteerShow({ volunteer }) {
    const initials = volunteer.name
        ? volunteer.name
              .split(' ')
              .map((w) => w[0]?.toUpperCase() ?? '')
              .slice(0, 2)
              .join('')
        : '?';

    const getAge = (birthdate) => {
        if (!birthdate) return null;
        const dob = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };
    const age = getAge(volunteer.birthdate);
    const skillsList = Array.isArray(volunteer.skills) ? volunteer.skills : [];

    const handleApprove = () =>
        router.patch(route('admin.volunteers.approve', volunteer.id), {}, { preserveScroll: true });
    const handleReject = () =>
        router.patch(route('admin.volunteers.reject', volunteer.id), {}, { preserveScroll: true });

    return (
        <>
            <Head title={`${volunteer.name} — Volunteer Profile`} />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back Button & Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('admin.volunteers')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition mb-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Volunteers Roster</span>
                        </Link>
                        <h2 className="text-xl font-bold text-gray-900">Volunteer Details</h2>
                    </div>
                </div>

                {/* Profile Overview Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 overflow-hidden">
                                {volunteer.photo ? (
                                    <img
                                        src={volunteer.photo}
                                        alt={volunteer.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                                    {volunteer.name}
                                </h3>
                                <p className="text-xs text-gray-500">{volunteer.email}</p>
                                <div className="pt-1">{statusBadge(volunteer.status)}</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {volunteer.status !== 'approved' && (
                                <button
                                    onClick={handleApprove}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Approve Volunteer</span>
                                </button>
                            )}
                            {volunteer.status !== 'rejected' && (
                                <button
                                    onClick={handleReject}
                                    className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition flex items-center gap-1.5"
                                >
                                    <X className="w-4 h-4" />
                                    <span>{volunteer.status === 'approved' ? 'Revoke Approval' : 'Reject'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3.5 bg-gray-50 rounded-xl space-y-1">
                            <span className="text-xs font-semibold text-gray-400 block">Chapter Branch</span>
                            <span className="text-xs font-bold text-gray-900">Muntinlupa City Branch</span>
                        </div>

                        <div className="p-3.5 bg-gray-50 rounded-xl space-y-1">
                            <span className="text-xs font-semibold text-gray-400 block">Member Since</span>
                            <span className="text-xs font-bold text-gray-900">
                                {volunteer.created_at
                                    ? new Date(volunteer.created_at).toLocaleDateString('en-PH', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                      })
                                    : '-'}
                            </span>
                        </div>

                        <div className="p-3.5 bg-gray-50 rounded-xl space-y-1">
                            <span className="text-xs font-semibold text-gray-400 block">Contact Phone</span>
                            <span className="text-xs font-bold text-gray-900">{volunteer.phone ?? '-'}</span>
                        </div>

                        <div className="p-3.5 bg-gray-50 rounded-xl space-y-1">
                            <span className="text-xs font-semibold text-gray-400 block">Residential Address</span>
                            <span className="text-xs font-bold text-gray-900 truncate block">
                                {volunteer.address ?? '-'}
                            </span>
                        </div>

                        <div className="p-3.5 bg-gray-50 rounded-xl space-y-1">
                            <span className="text-xs font-semibold text-gray-400 block">Birth Date</span>
                            <span className="text-xs font-bold text-gray-900">
                                {volunteer.birthdate
                                    ? new Date(volunteer.birthdate).toLocaleDateString('en-PH', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                      })
                                    : '-'}
                            </span>
                        </div>

                        <div className="p-3.5 bg-gray-50 rounded-xl space-y-1">
                            <span className="text-xs font-semibold text-gray-400 block">Age</span>
                            <span className="text-xs font-bold text-gray-900">
                                {age !== null ? `${age} years old` : '-'}
                            </span>
                        </div>

                        <div className="p-3.5 bg-gray-50 rounded-xl space-y-1">
                            <span className="text-xs font-semibold text-gray-400 block">Gender</span>
                            <span className="text-xs font-bold text-gray-900">{volunteer.gender ?? '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Skills & Trainings Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Skills & Trainings</h3>
                    {skillsList.length === 0 ? (
                        <p className="text-xs text-gray-400">
                            This volunteer hasn't listed any specialized skills or certifications yet.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {skillsList.map((skill, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                    {volunteer.skills_notes && (
                        <div className="p-3.5 bg-gray-50 rounded-xl text-xs text-gray-700 leading-relaxed">
                            {volunteer.skills_notes}
                        </div>
                    )}
                </div>

                {/* Activity Summary Stats */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Activity & Participation Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 text-center space-y-1">
                            <div className="text-2xl font-extrabold text-red-600 tracking-tight">
                                {volunteer.total_hours ?? 0}
                            </div>
                            <span className="text-xs font-semibold text-gray-500">Hours Rendered</span>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 text-center space-y-1">
                            <div className="text-2xl font-extrabold text-red-600 tracking-tight">
                                {volunteer.attendance_count ?? 0}
                            </div>
                            <span className="text-xs font-semibold text-gray-500">Activities Attended</span>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 text-center space-y-1">
                            <div className="text-2xl font-extrabold text-red-600 tracking-tight">
                                {volunteer.documents_count ?? 0}
                            </div>
                            <span className="text-xs font-semibold text-gray-500">201 Documents Filed</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

VolunteerShow.layout = (page) => <AdminLayout title="Volunteer Profile">{page}</AdminLayout>;

export default VolunteerShow;