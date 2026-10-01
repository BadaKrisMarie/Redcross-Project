import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
    Menu,
    Bell,
    CheckCheck,
    User,
    LogOut,
    ChevronDown,
    Megaphone,
    LayoutDashboard,
    Calendar,
    ClipboardCheck,
    MessageSquare,
    Folder,
} from 'lucide-react';

const topNavItems = [
    { label: 'Dashboard', route: 'volunteer.dashboard', icon: LayoutDashboard },
    { label: 'Schedule', route: 'volunteer.schedule', icon: Calendar },
    { label: 'Attendance', route: 'volunteer.attendance', icon: ClipboardCheck },
    { label: 'Communication', route: 'volunteer.communication', icon: MessageSquare },
    { label: '201 Files', route: 'volunteer.documents', icon: Folder },
];

export default function VolunteerTopbar({
    title = 'Dashboard',
    setSidebarOpen,
    volunteer,
    photoUrl,
    initials,
    handleLogout,
    notifications = [],
    unreadCount = 0,
    handleMarkAllRead,
    isActive,
}) {
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const notifRef = useRef(null);
    const profileMenuRef = useRef(null);

    const resolveRoute = (routeName) => {
        try {
            return route(routeName);
        } catch {
            return '#';
        }
    };

    const isCurrent = (routeName) => {
        if (isActive) return isActive(routeName);
        try {
            return route().current(routeName) || route().current(`${routeName}.*`);
        } catch {
            return false;
        }
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="w-full bg-transparent border-0 px-6 sm:px-10 pt-6 pb-3 flex items-center justify-between gap-4 select-none">
            {/* Left Section: Mobile Menu + Volunteer Portal Branding (No Cross Icon) */}
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
                    href={route('volunteer.dashboard')}
                    className="flex items-center gap-2 group focus:outline-none"
                >
                    <div className="text-left">
                        <div className="font-extrabold text-xl text-gray-900 tracking-tight leading-none group-hover:text-red-600 transition-colors">
                            RedCross
                        </div>
                        <div className="text-[10px] font-semibold text-gray-400 mt-1">
                            Volunteer Portal
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
                            href={resolveRoute(item.route)}
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

            {/* Right Section: Notification Bell & Profile Menu */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        type="button"
                        onClick={() => setNotifOpen((v) => !v)}
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
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-3xl shadow-xl overflow-hidden z-50 border-0">
                            <div className="p-4 flex items-center justify-between bg-gray-50/70 border-b border-gray-100/60">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-900">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="text-[11px] font-bold text-red-600 px-2 py-0.5 rounded-full bg-red-50">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && handleMarkAllRead && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllRead}
                                        className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                                    >
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        <span>Mark all read</span>
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                {notifications.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-gray-400">
                                        No notifications yet.
                                    </div>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div
                                            key={n.id ?? i}
                                            className={`p-3.5 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3 text-left ${
                                                !n.is_read ? 'bg-red-50/20' : ''
                                            }`}
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <Megaphone className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-bold text-gray-900 truncate">
                                                    {n.title || n.message}
                                                </div>
                                                {n.body && (
                                                    <div className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                                                        {n.body}
                                                    </div>
                                                )}
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Pill Badge */}
                <div className="relative" ref={profileMenuRef}>
                    <button
                        type="button"
                        onClick={() => setProfileMenuOpen((v) => !v)}
                        className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white shadow-xs border-0 hover:bg-gray-50 transition group cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs ring-1 ring-red-100 overflow-hidden shrink-0">
                            {photoUrl ? (
                                <img src={photoUrl} alt={volunteer?.name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>

                        <div className="hidden sm:block text-left min-w-0">
                            <div className="text-xs font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                                {volunteer?.name || 'Volunteer'}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium truncate">
                                @{volunteer?.email?.split('@')[0] || 'volunteer'}
                            </div>
                        </div>

                        <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors ml-0.5" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileMenuOpen && (
                        <div className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-xl border-0 p-2 z-50">
                            <div className="p-3 border-b border-gray-100">
                                <div className="text-xs font-bold text-gray-900 truncate">
                                    {volunteer?.name}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate">
                                    {volunteer?.email}
                                </div>
                            </div>

                            <div className="py-1 space-y-0.5">
                                <Link
                                    href={route('volunteer.profile')}
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
