import React, { useRef, useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    User,
    Lock,
    History,
    Camera,
    Check,
    Eye,
    EyeOff,
    Save,
    Clock,
    Shield,
    Plus,
    X,
    Edit3,
    Trash2,
    FileText,
} from 'lucide-react';

function getActionStyle(action = '') {
    const a = action.toLowerCase();
    if (a.includes('approv')) return { bg: 'bg-emerald-50 text-emerald-600', icon: Check };
    if (a.includes('reject') || a.includes('revoke')) return { bg: 'bg-red-50 text-red-600', icon: X };
    if (a.includes('creat') || a.includes('add')) return { bg: 'bg-blue-50 text-blue-600', icon: Plus };
    if (a.includes('update') || a.includes('edit')) return { bg: 'bg-amber-50 text-amber-600', icon: Edit3 };
    if (a.includes('delet') || a.includes('remov')) return { bg: 'bg-red-50 text-red-600', icon: Trash2 };
    return { bg: 'bg-gray-100 text-gray-700', icon: FileText };
}

export default function AdminProfile({ auth, activityLogs = [] }) {
    const admin = auth.user;
    const fileRef = useRef();
    const [activeTab, setActiveTab] = useState('info');

    const photoUrl = (path) => (path ? (path.startsWith('http') ? path : `/storage/${path}`) : null);

    const [preview, setPreview] = useState(
        admin.photo ? photoUrl(admin.photo) : null
    );

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const profileForm = useForm({
        _method: 'PATCH',
        name: admin.name ?? '',
        email: admin.email ?? '',
        phone: admin.phone ?? '',
        photo: null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (admin.photo) {
            setPreview(photoUrl(admin.photo));
        }
    }, [admin.photo]);

    function handlePhotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        profileForm.setData('photo', file);
        setPreview(URL.createObjectURL(file));
    }

    function handleProfileSubmit(e) {
        e.preventDefault();
        profileForm.post(route('admin.profile.update'), { forceFormData: true });
    }

    function handlePasswordSubmit(e) {
        e.preventDefault();
        passwordForm.post(route('admin.profile.password'), {
            onSuccess: () => {
                passwordForm.reset();
                setShowCurrent(false);
                setShowNew(false);
                setShowConfirm(false);
            },
        });
    }

    const initials = admin.name
        ? admin.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    const tabs = [
        { key: 'info', label: 'Personal Information', icon: User },
        { key: 'password', label: 'Security & Password', icon: Lock },
        { key: 'logs', label: 'Activity Logs', icon: History },
    ];

    return (
        <>
            <Head title="Admin Profile - Admin Portal" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Overview Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        {/* Avatar with Camera Trigger */}
                        <div className="relative shrink-0">
                            <div
                                onClick={() => fileRef.current?.click()}
                                title="Click to upload new photo"
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 overflow-hidden cursor-pointer group"
                            >
                                {preview ? (
                                    <img src={preview} alt="Admin avatar" className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-300 transition"
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

                        {/* Name & Role */}
                        <div className="space-y-1">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                                {admin.name}
                            </h2>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                            <div className="flex items-center gap-2 pt-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                                    <Shield className="w-3 h-3" />
                                    <span>Administrator</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {profileForm.recentlySuccessful && (
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Profile updated successfully</span>
                        </div>
                    )}
                </div>

                {/* Tabs & Content Card */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-100 px-5 sm:px-6 overflow-x-auto gap-4 sm:gap-6">
                        {tabs.map((tab) => {
                            const IconComp = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                                        isActive
                                            ? 'border-red-600 text-red-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    <IconComp className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab 1: Personal Info */}
                    {activeTab === 'info' && (
                        <form onSubmit={handleProfileSubmit} className="p-5 sm:p-6 space-y-5">
                            <h3 className="text-xs font-bold text-gray-500">Basic Information</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {profileForm.errors.name && (
                                        <p className="text-xs text-red-600 mt-1">{profileForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                        placeholder="admin@example.com"
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {profileForm.errors.email && (
                                        <p className="text-xs text-red-600 mt-1">{profileForm.errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileForm.data.phone}
                                        onChange={(e) => profileForm.setData('phone', e.target.value)}
                                        placeholder="e.g. 09171234567"
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {profileForm.errors.phone && (
                                        <p className="text-xs text-red-600 mt-1">{profileForm.errors.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-3 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{profileForm.processing ? 'Saving...' : 'Save Profile Changes'}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tab 2: Change Password */}
                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="p-5 sm:p-6 space-y-5 max-w-lg">
                            <h3 className="text-xs font-bold text-gray-500">Update Account Password</h3>

                            {passwordForm.recentlySuccessful && (
                                <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Password updated successfully</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            placeholder="Enter your current password"
                                            className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordForm.errors.current_password && (
                                        <p className="text-xs text-red-600 mt-1">{passwordForm.errors.current_password}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={passwordForm.data.password}
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            placeholder="Minimum 8 characters"
                                            className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordForm.errors.password && (
                                        <p className="text-xs text-red-600 mt-1">{passwordForm.errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                            placeholder="Re-enter your new password"
                                            className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {passwordForm.errors.password_confirmation && (
                                        <p className="text-xs text-red-600 mt-1">{passwordForm.errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>{passwordForm.processing ? 'Updating...' : 'Update Password'}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tab 3: Activity Logs */}
                    {activeTab === 'logs' && (
                        <div className="p-5 sm:p-6 space-y-4">
                            <h3 className="text-xs font-bold text-gray-500">Recent Administrator Actions</h3>

                            {activityLogs.length === 0 ? (
                                <div className="py-12 text-center text-xs text-gray-400">
                                    <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    No administrative action logs recorded yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {activityLogs.map((log, i) => {
                                        const style = getActionStyle(log.action);
                                        const IconComponent = style.icon;
                                        return (
                                            <div key={i} className="py-3.5 flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-xl shrink-0 ${style.bg}`}>
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-900">
                                                            {log.description}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span>
                                                                {log.created_at
                                                                    ? new Date(log.created_at).toLocaleString('en-PH', {
                                                                          year: 'numeric',
                                                                          month: 'short',
                                                                          day: 'numeric',
                                                                          hour: '2-digit',
                                                                          minute: '2-digit',
                                                                      })
                                                                    : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${style.bg}`}>
                                                    {log.action}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AdminProfile.layout = (page) => <AdminLayout title="My Profile">{page}</AdminLayout>;