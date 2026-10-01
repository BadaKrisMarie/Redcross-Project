import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    Menu,
    Search,
    Bell,
    UserPlus,
    FileText,
    Trash2,
    X,
    ChevronRight,
    CheckCheck,
    User,
    LogOut,
    ChevronDown,
    LayoutDashboard,
    Users,
    CalendarCheck,
    ClipboardCheck,
    Folder,
    Calendar,
} from 'lucide-react';

const parseNotif = (n) => {
    const isVolunteer = n.type === 'volunteer';

    if (isVolunteer) {
        const match = (n.title ?? '').match(/registered:\s*(.+)$/i);
        const name = (n.volunteer_name ?? (match ? match[1] : n.title) ?? '').trim();
        return {
            name,
            docType: null,
            isVolunteer: true,
            headline: 'New Volunteer Application',
            description: `${name || 'A volunteer'} submitted a registration application.`,
        };
    }

    const title = n.title ?? n.message ?? '';
    const match = title.match(/^(.+?)\s+submitted\s+a\s+(.+?)\s+document/i);
    const name = (n.volunteer_name ?? (match ? match[1] : title) ?? '').trim();
    const NOTIF_DOC_LABELS = {
        nbi: 'NBI Clearance',
        medical: 'Medical Certificate',
        training: 'Training Certificate',
        barangay: 'Barangay Clearance',
        bangray: 'Barangay Clearance',
    };
    const docType =
        n.doc_type_label ??
        (match ? NOTIF_DOC_LABELS[match[2]?.toLowerCase()] || match[2] : null);

    return {
        name,
        docType,
        isVolunteer: false,
        headline: docType ? `${docType} Uploaded` : 'Document Uploaded',
        description: `${name || 'A volunteer'} submitted ${docType ? `a ${docType}` : 'a document'} for review.`,
    };
};

const topNavItems = [
    { label: 'Dashboard', route: 'admin.dashboard', icon: LayoutDashboard },
    { label: 'Volunteers', route: 'admin.volunteers', icon: Users },
    { label: 'Activities', route: 'admin.activities.index', icon: CalendarCheck },
    { label: 'Attendance', route: 'admin.attendance.index', icon: ClipboardCheck },
    { label: '201 Files', route: 'admin.documents.index', icon: Folder },
    { label: 'Schedule', route: 'admin.schedule', icon: Calendar },
];

export default function AdminTopbar({
    title,
    setSidebarOpen,
    topbarSearch,
    setTopbarSearch,
    searchResults,
    searchOpen,
    setSearchOpen,
    searching,
    searchWrapRef,
    handleSelectSearchResult,
    notifOpen,
    notifRef,
    handleToggleNotif,
    handleMarkAllRead,
    handleDeleteNotif,
    handleClearAllNotifs,
    notifList,
    unreadCount,
    openDetail,
    setCameFromQueue,
    setNotifOpen,
    admin,
    photoUrl,
    initials,
    handleLogout,
}) {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    const isCurrent = (routeName) => {
        try {
            return route().current(routeName) || route().current(`${routeName}.*`);
        } catch {
            return false;
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="w-full bg-transparent border-0 px-6 sm:px-10 pt-6 pb-3 flex items-center justify-between gap-4 select-none">
            {/* Left Section: Mobile Menu + Red Cross Branding */}
            <div className="flex items-center gap-3 shrink-0">
                <button
                    type="button"
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    className="p-2.5 rounded-2xl bg-white shadow-xs text-gray-600 hover:text-gray-900 transition lg:hidden shrink-0"
                    title="Toggle Navigation"
                    aria-label="Toggle Navigation"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <Link
                    href={route('admin.dashboard')}
                    className="flex items-center gap-2 group focus:outline-none"
                >
                    <div className="text-left">
                        <div className="font-extrabold text-xl text-gray-900 tracking-tight leading-none group-hover:text-red-600 transition-colors">
                            RedCross
                        </div>
                        <div className="text-[10px] font-semibold text-gray-400 mt-1">
                            Muntinlupa Branch
                        </div>
                    </div>
                </Link>
            </div>

            {/* Center Section: Pill Navigation Capsule matching EdTech+ layout */}
            <nav className="hidden xl:flex items-center p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-xs">
                {topNavItems.map((item) => {
                    const active = isCurrent(item.route);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.route}
                            href={route(item.route)}
                            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                                active
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/70'
                            }`}
                        >
                            <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-gray-400'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Right Section: Notification & Admin Profile Pill */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Notification Bell Pill */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={handleToggleNotif}
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-xs border-0 ${
                            notifOpen
                                ? 'text-red-600 ring-2 ring-red-200'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        aria-label="Notifications"
                        title="Notifications"
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
                        )}
                    </button>

                    {/* Notifications Dropdown Panel */}
                    {notifOpen && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-3xl shadow-xl border-0 overflow-hidden z-50">
                            <div className="p-4 flex items-center justify-between bg-gray-50/70 border-b border-gray-100/60">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-900">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="text-[11px] font-bold text-red-600 px-2 py-0.5 rounded-full bg-red-50">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllRead}
                                        className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        <span>Mark all read</span>
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                {notifList.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-gray-400">
                                        No notifications yet.
                                    </div>
                                ) : (
                                    notifList.map((notif) => {
                                        const parsed = parseNotif(notif);
                                        const isUnread = !notif.read_at;

                                        return (
                                            <div
                                                key={notif.id}
                                                onClick={() => {
                                                    openDetail(notif);
                                                    setNotifOpen(false);
                                                }}
                                                className={`p-3.5 hover:bg-gray-50 transition cursor-pointer flex items-start justify-between gap-3 text-left ${
                                                    isUnread ? 'bg-red-50/20' : ''
                                                }`}
                                            >
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                                                        {parsed.isVolunteer ? (
                                                            <UserPlus className="w-4 h-4" />
                                                        ) : (
                                                            <FileText className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-gray-900 truncate">
                                                            {parsed.headline}
                                                        </div>
                                                        <div className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                                                            {parsed.description}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteNotif(e, notif)}
                                                    className="p-1 rounded-lg text-gray-300 hover:text-red-600 transition shrink-0"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {notifList.length > 0 && (
                                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                                    <button
                                        type="button"
                                        onClick={handleClearAllNotifs}
                                        className="text-[11px] font-semibold text-gray-400 hover:text-red-600 transition"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile Pill Badge matching EdTech+ layout */}
                <div className="relative" ref={profileMenuRef}>
                    <button
                        type="button"
                        onClick={() => setProfileMenuOpen((prev) => !prev)}
                        className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white shadow-xs border-0 hover:bg-gray-50 transition group cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs ring-1 ring-red-100 overflow-hidden shrink-0">
                            {photoUrl ? (
                                <img src={photoUrl} alt={admin?.name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>

                        <div className="hidden sm:block text-left min-w-0">
                            <div className="text-xs font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                                {admin?.name || 'Carter Wogen'}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium truncate">
                                @{admin?.email?.split('@')[0] || 'oli_carter'}
                            </div>
                        </div>

                        <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors ml-0.5" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileMenuOpen && (
                        <div className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-xl border-0 p-2 z-50">
                            <div className="p-3 border-b border-gray-100">
                                <div className="text-xs font-bold text-gray-900 truncate">
                                    {admin?.name}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate">
                                    {admin?.email}
                                </div>
                            </div>

                            <div className="py-1 space-y-0.5">
                                <Link
                                    href={route('admin.profile')}
                                    onClick={() => setProfileMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                                >
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    <span>Profile Settings</span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
