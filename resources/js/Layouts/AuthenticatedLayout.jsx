import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LogOut, User, Menu, X, Shield, ChevronDown } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const isVolunteer = user?.role === 'volunteer';
    const isAdmin = user?.role === 'admin';

    const dashboardRoute = isAdmin
        ? route('admin.dashboard')
        : isVolunteer
        ? route('volunteer.dashboard')
        : route('profile.edit');

    const photoUrl = user?.photo ? `/storage/${user.photo}` : null;
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'RC';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
            {/* Top Navigation Bar */}
            <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 sticky top-0 z-40 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-8">
                            <Link href={dashboardRoute} className="flex items-center gap-3 group focus:outline-none">
                                <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
                                    +
                                </div>
                                <div className="hidden sm:block text-left">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white tracking-tight leading-tight">
                                        Philippine Red Cross
                                    </div>
                                    <div className="text-[10px] font-semibold text-red-600 dark:text-red-400 tracking-wider uppercase">
                                        {isAdmin ? 'Admin Portal' : 'Volunteer Portal'}
                                    </div>
                                </div>
                            </Link>

                            {/* Main Navigation Links */}
                            <div className="hidden space-x-4 sm:-my-px sm:flex">
                                <Link
                                    href={dashboardRoute}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href={route('profile.edit')}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                >
                                    Profile Settings
                                </Link>
                            </div>
                        </div>

                        {/* Right Topbar Profile Dropdown */}
                        <div className="hidden sm:flex sm:items-center sm:gap-4">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2.5 rounded-lg p-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0 shadow-sm">
                                            {photoUrl ? (
                                                <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                initials
                                            )}
                                        </div>
                                        <span className="font-semibold text-sm">{user?.name}</span>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700">
                                        Signed in as <strong className="text-gray-800 dark:text-gray-200">{user?.email}</strong>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile Hamburger Button */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 focus:outline-none transition"
                            >
                                {showingNavigationDropdown ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Responsive Navigation Dropdown */}
                {showingNavigationDropdown && (
                    <div className="border-t border-gray-200 dark:border-gray-700 sm:hidden bg-white dark:bg-gray-800 pb-3 pt-2">
                        <div className="space-y-1 px-4">
                            <Link
                                href={dashboardRoute}
                                className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href={route('profile.edit')}
                                className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200"
                            >
                                Profile Settings
                            </Link>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-1 px-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm">
                                    {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover rounded-full" /> : initials}
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-800 dark:text-white">{user?.name}</div>
                                    <div className="text-xs text-gray-500">{user?.email}</div>
                                </div>
                            </div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full text-left text-sm font-medium text-red-600 dark:text-red-400 py-1.5"
                            >
                                Log Out
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Page Header (if provided) */}
            {header && (
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className="py-6">
                {children}
            </main>
        </div>
    );
}
