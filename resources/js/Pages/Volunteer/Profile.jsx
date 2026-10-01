import React, { useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import VolunteerLayout from '@/Layouts/VolunteerLayout';
import {
    User,
    Lock,
    Camera,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    Save,
    ChevronRight,
} from 'lucide-react';

export default function Profile({ user }) {
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(
        user.photo ? `/storage/${user.photo}` : null
    );
    const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method:                  'PATCH',
        phone:                    user.phone                    ?? '',
        address:                  user.address                  ?? '',
        birthdate:                user.birthdate                ?? '',
        gender:                   user.gender                   ?? '',
        emergency_contact_name:   user.emergency_contact_name   ?? '',
        emergency_contact_phone:  user.emergency_contact_phone  ?? '',
        photo:                    null,
    });

    function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('photo', file);
        setPreview(URL.createObjectURL(file));
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(route('volunteer.profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    const initials = user.name
        ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
        : 'VO';

    return (
        <div className="font-sans text-gray-900">
            <Head title="My Profile — Volunteer Portal" />

            <div className="max-w-3xl mx-auto space-y-6 pb-16 px-2 sm:px-4">

                {/* ── BREADCRUMB & HEADER ── */}
                <div className="pt-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mt-1">
                        Profile
                    </h1>
                </div>

                {/* ── PROFILE OVERVIEW HEADER CARD ── */}
                <div className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div
                                onClick={() => fileRef.current?.click()}
                                title="Click to change photo"
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 overflow-hidden cursor-pointer shadow-inner group"
                            >
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt={user.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition"
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-red-600 text-white shadow-xs flex items-center justify-center hover:bg-red-700 transition cursor-pointer"
                                title="Change photo"
                            >
                                <Camera className="w-3 h-3" />
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </div>

                        {/* User Details */}
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900">
                                {user.name}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                            <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                                    Volunteer
                                </span>
                            </div>
                        </div>
                    </div>

                    {recentlySuccessful && (
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Saved successfully</span>
                        </div>
                    )}
                </div>

                {/* ── MAIN CONTENT CARD WITH TABS ── */}
                <div className="bg-white rounded-2xl shadow-xs overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-100 px-5 sm:px-6 gap-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                                activeTab === 'info'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            <span>Profile Information</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('password')}
                            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                                activeTab === 'password'
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Lock className="w-4 h-4" />
                            <span>Change Password</span>
                        </button>
                    </div>

                    {/* ── TAB 1: PROFILE INFORMATION ── */}
                    {activeTab === 'info' && (
                        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={user.name || ''}
                                        disabled
                                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed outline-none"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email || ''}
                                        disabled
                                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed outline-none"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="09171234567"
                                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {errors.phone && <p className="text-[11px] text-red-600 font-semibold">{errors.phone}</p>}
                                </div>

                                {/* Birthdate */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Birthdate
                                    </label>
                                    <input
                                        type="date"
                                        value={data.birthdate}
                                        onChange={(e) => setData('birthdate', e.target.value)}
                                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {errors.birthdate && <p className="text-[11px] text-red-600 font-semibold">{errors.birthdate}</p>}
                                </div>

                                {/* Gender */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Gender
                                    </label>
                                    <select
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value)}
                                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition cursor-pointer"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-[11px] text-red-600 font-semibold">{errors.gender}</p>}
                                </div>

                                {/* Address */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="House No., Street, Barangay, City"
                                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {errors.address && <p className="text-[11px] text-red-600 font-semibold">{errors.address}</p>}
                                </div>

                                {/* Emergency Contact Person */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Emergency Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.emergency_contact_name}
                                        onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                        placeholder="Full name"
                                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {errors.emergency_contact_name && (
                                        <p className="text-[11px] text-red-600 font-semibold">{errors.emergency_contact_name}</p>
                                    )}
                                </div>

                                {/* Emergency Contact Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Emergency Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.emergency_contact_phone}
                                        onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                        placeholder="09181234567"
                                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {errors.emergency_contact_phone && (
                                        <p className="text-[11px] text-red-600 font-semibold">{errors.emergency_contact_phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{processing ? 'Saving…' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── TAB 2: CHANGE PASSWORD ── */}
                    {activeTab === 'password' && <ChangePasswordTab />}
                </div>
            </div>
        </div>
    );
}

function ChangePasswordTab() {
    const [form, setForm] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: null }));
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccess(false);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            await axios.put(route('volunteer.password.update'), form, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            setSuccess(true);
            setForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: 'Failed to update password. Please check your current password.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {success && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Password updated successfully.</span>
                </div>
            )}

            {errors.general && (
                <div className="flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errors.general}</span>
                </div>
            )}

            <div className="space-y-3.5 max-w-md">
                {/* Current Password */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            type={showCurrent ? 'text' : 'password'}
                            name="current_password"
                            value={form.current_password}
                            onChange={handleChange}
                            placeholder="Enter current password"
                            className="w-full pl-3.5 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                        >
                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.current_password && (
                        <p className="text-[11px] text-red-600 font-semibold">{errors.current_password[0] || errors.current_password}</p>
                    )}
                </div>

                {/* New Password */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showNew ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="At least 8 characters"
                            className="w-full pl-3.5 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                        >
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-[11px] text-red-600 font-semibold">{errors.password[0] || errors.password}</p>
                    )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            name="password_confirmation"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            placeholder="Re-type new password"
                            className="w-full pl-3.5 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                        >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{loading ? 'Updating…' : 'Update Password'}</span>
                </button>
            </div>
        </form>
    );
}

Profile.layout = (page) => <VolunteerLayout title="My Profile">{page}</VolunteerLayout>;