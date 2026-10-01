import React from 'react';
import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Calendar,
    ClipboardCheck,
    CalendarCheck,
    Folder,
    MessageSquare,
    Fingerprint,
    Settings,
    LogOut,
    X,
} from 'lucide-react';

const dockLinks = [
    { label: 'Dashboard', route: 'admin.dashboard', icon: LayoutDashboard },
    { label: 'Volunteers', route: 'admin.volunteers', icon: Users },
    { label: 'Schedule', route: 'admin.schedule', icon: Calendar },
    { label: '201 Files', route: 'admin.documents.index', icon: Folder },
    { label: 'Communication', route: 'admin.communication', icon: MessageSquare },
    { label: 'Settings', route: 'admin.profile', icon: Settings },
];

const mobileNavLinks = [
    { label: 'Dashboard', route: 'admin.dashboard', icon: LayoutDashboard },
    { label: 'Volunteers', route: 'admin.volunteers', icon: Users },
    { label: 'Schedule', route: 'admin.schedule', icon: Calendar },
    { label: 'Attendance', route: 'admin.attendance.index', icon: ClipboardCheck },
    { label: 'Activities', route: 'admin.activities.index', icon: CalendarCheck },
    { label: '201 Files', route: 'admin.documents.index', icon: Folder },
    { label: 'Communication', route: 'admin.communication', icon: MessageSquare },
    { label: 'Fingerprint Biometrics', route: 'admin.fingerprint.index', icon: Fingerprint },
    { label: 'Settings', route: 'admin.profile', icon: Settings },
];

export default function AdminSidebar({
    sidebarOpen,
    setSidebarOpen,
    admin,
    photoUrl,
    initials,
    isActive,
    handleLogout,
}) {
    return (
        <>
            {/* Desktop Floating Vertical Dock - Clean, compact capsule */}
            <aside className="hidden lg:flex fixed left-6 top-32 z-40 flex flex-col items-center gap-3.5 py-4 px-2 rounded-full bg-white shadow-sm border-0 select-none">
                {dockLinks.map((item) => {
                    const active = isActive(item.route);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.route}
                            href={route(item.route)}
                            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                active
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                            title={item.label}
                        >
                            <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />

                            {/* Tooltip on hover */}
                            <span className="absolute left-14 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-[11px] font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </aside>

            {/* Mobile Drawer (When small screen menu is toggled) */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
                />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-6 border-b border-gray-100/70">
                        <div>
                            <h4 className="text-base font-extrabold text-gray-900">Admin Portal</h4>
                            <span className="text-xs text-gray-400">Muntinlupa Branch</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="Close sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="mt-6 space-y-1">
                        {mobileNavLinks.map((link) => {
                            const active = isActive(link.route);
                            const Icon = link.icon;

                            return (
                                <Link
                                    key={link.route}
                                    href={route(link.route)}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                                        active
                                            ? 'bg-red-600 text-white shadow-xs'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer User Info */}
                <div className="pt-4 border-t border-gray-100/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center overflow-hidden">
                            {photoUrl ? (
                                <img src={photoUrl} alt={admin?.name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-900 truncate">{admin?.name}</div>
                            <div className="text-[10px] text-gray-400">Admin</div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </aside>
        </>
    );
}
