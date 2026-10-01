import React from 'react';
import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Calendar,
    ClipboardCheck,
    MessageSquare,
    Folder,
    Settings,
    LogOut,
    X,
} from 'lucide-react';

const dockLinks = [
    { label: 'Dashboard', route: 'volunteer.dashboard', icon: LayoutDashboard },
    { label: 'Schedule', route: 'volunteer.schedule', icon: Calendar },
    { label: 'Attendance', route: 'volunteer.attendance', icon: ClipboardCheck },
    { label: 'Communication', route: 'volunteer.communication', icon: MessageSquare },
    { label: '201 Files', route: 'volunteer.documents', icon: Folder },
    { label: 'Settings', route: 'volunteer.profile', icon: Settings },
];

export default function VolunteerSidebar({
    sidebarOpen,
    setSidebarOpen,
    volunteer,
    photoUrl,
    initials,
    isActive,
    handleLogout,
}) {
    const resolveRoute = (routeName) => {
        try {
            return route(routeName);
        } catch {
            return '#';
        }
    };

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
                            href={resolveRoute(item.route)}
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
                            <h4 className="text-base font-extrabold text-gray-900">Volunteer Portal</h4>
                            <span className="text-xs text-gray-400">Philippine Red Cross</span>
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
                        {dockLinks.map((link) => {
                            const active = isActive(link.route);
                            const Icon = link.icon;

                            return (
                                <Link
                                    key={link.route}
                                    href={resolveRoute(link.route)}
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
                                <img src={photoUrl} alt={volunteer?.name} className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-900 truncate">{volunteer?.name}</div>
                            <div className="text-[10px] text-gray-400">Volunteer</div>
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
