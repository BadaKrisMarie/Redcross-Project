import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';

/**
 * AdminSidebar — Reusable sidebar for all admin pages
 *
 * Props:
 *   auth         — { user: { name, photo } }
 *   activeRoute  — string, e.g. 'admin.dashboard'
 *   sidebarOpen  — boolean
 *   setSidebarOpen — setter
 *
 * Usage:
 *   import AdminSidebar from '@/Components/AdminSidebar';
 *
 *   <AdminSidebar
 *       auth={auth}
 *       activeRoute="admin.dashboard"
 *       sidebarOpen={sidebarOpen}
 *       setSidebarOpen={setSidebarOpen}
 *   />
 */

const NAV_LINKS = [
    // Main section
    { label: 'Dashboard',     routeName: 'admin.dashboard',          section: 'main' },
    { label: 'Volunteers',    routeName: 'admin.volunteers',          section: 'main' },
    { label: 'Schedule',      routeName: 'admin.schedule',            section: 'main' },
    { label: 'Attendance',    routeName: 'admin.attendance.index',    section: 'main' },
    // Manage section
    { label: 'Activities',    routeName: 'admin.activities.index',    section: 'manage' },
    { label: '201 Files',     routeName: 'admin.documents.index',     section: 'manage' },
    { label: 'Communication', routeName: 'admin.communication',       section: 'manage' },
    // Reports — PDF download, NOT an Inertia page
    { label: 'Reports',       routeName: 'admin.attendance.export.pdf', section: 'manage', isPdf: true },
];

export default function AdminSidebar({ auth, activeRoute, sidebarOpen, setSidebarOpen }) {
    const admin    = auth?.user;
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;
    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    const mainLinks   = NAV_LINKS.filter(l => l.section === 'main');
    const manageLinks = NAV_LINKS.filter(l => l.section === 'manage');

    const Avatar = ({ size = 34, fontSize = 12 }) => (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: '#C8102E', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize, fontWeight: '700',
            overflow: 'hidden', flexShrink: 0,
        }}>
            {photoUrl
                ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
            }
        </div>
    );

    const NavItem = ({ label, routeName, isPdf }) => {
        const isActive = activeRoute === routeName;
        const className = `sidebar-nav-item${isActive ? ' active' : ''}`;

        if (isPdf) {
            // Regular <a> so Inertia doesn't intercept — triggers browser download
            return (
                <a href={route(routeName)} className={className}>
                    <span className="sidebar-nav-dot" />
                    {label}
                    <span className="sidebar-nav-badge-pdf">PDF</span>
                </a>
            );
        }

        return (
            <Link href={route(routeName)} className={className}>
                <span className="sidebar-nav-dot" />
                {label}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile overlay — closes sidebar when tapping outside */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        display: 'none',
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 99,
                    }}
                    className="sidebar-overlay"
                />
            )}

            <aside className={`admin-sidebar${sidebarOpen ? '' : ' closed'}`}>
                {/* Brand */}
                <div className="sidebar-brand">
                    <Link href={route('admin.dashboard')} className="sidebar-logo">
                        <div className="sidebar-cross">+</div>
                        <div className="sidebar-org-name">
                            Philippine Red Cross
                            <span>Rizal · Muntinlupa</span>
                        </div>
                    </Link>
                </div>

                {/* Admin user */}
                <Link href={route('admin.profile')} className="sidebar-user">
                    <Avatar size={34} fontSize={12} />
                    <div className="sidebar-user-info">
                        {admin?.name ?? 'Admin'}
                        <span>Administrator</span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Main</div>
                    {mainLinks.map(link => <NavItem key={link.routeName} {...link} />)}

                    <div className="sidebar-section-label">Manage</div>
                    {manageLinks.map(link => <NavItem key={link.routeName} {...link} />)}
                </nav>

                {/* Logout */}
                <div className="sidebar-footer">
                    <button className="sidebar-logout" onClick={() => router.post(route('logout'))}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Log out
                    </button>
                </div>
            </aside>

            {/* Scoped styles */}
            <style>{`
                .admin-sidebar {
                    width: 220px;
                    background: #C8102E;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0; left: 0;
                    height: 100vh;
                    z-index: 100;
                    transition: transform 0.25s ease;
                }
                .admin-sidebar.closed {
                    transform: translateX(-220px);
                }

                /* ── Brand ── */
                .sidebar-brand {
                    padding: 18px 20px 14px;
                    border-bottom: 1px solid rgba(255,255,255,0.15);
                    flex-shrink: 0;
                }
                .sidebar-logo {
                    display: flex; align-items: center; gap: 10px;
                    text-decoration: none;
                }
                .sidebar-cross {
                    width: 32px; height: 32px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff;
                    font-family: 'Barlow Condensed', sans-serif;
                    font-size: 20px; font-weight: 700;
                    flex-shrink: 0;
                }
                .sidebar-org-name {
                    font-family: 'Barlow Condensed', sans-serif;
                    color: #fff; font-size: 13px; font-weight: 600;
                    letter-spacing: .5px; line-height: 1.3;
                }
                .sidebar-org-name span {
                    display: block;
                    color: rgba(255,255,255,0.7);
                    font-size: 11px; font-weight: 400;
                    letter-spacing: 1px; text-transform: uppercase;
                }

                /* ── User ── */
                .sidebar-user {
                    padding: 14px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.15);
                    display: flex; align-items: center; gap: 10px;
                    text-decoration: none;
                    transition: background 0.15s;
                    flex-shrink: 0;
                }
                .sidebar-user:hover { background: rgba(0,0,0,0.1); }
                .sidebar-user-info {
                    color: #fff; font-size: 12px; font-weight: 500; line-height: 1.3;
                }
                .sidebar-user-info span {
                    display: block;
                    color: rgba(255,255,255,0.7);
                    font-size: 11px; font-weight: 400;
                }

                /* ── Nav ── */
                .sidebar-nav {
                    padding: 10px 0;
                    flex: 1;
                    overflow-y: auto;
                }
                .sidebar-section-label {
                    font-size: 10px; letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.55);
                    padding: 10px 20px 4px;
                    font-weight: 600;
                }
                .sidebar-nav-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 20px;
                    color: rgba(255,255,255,0.85);
                    font-size: 13px; font-weight: 500;
                    cursor: pointer;
                    transition: all .15s;
                    border-left: 2px solid transparent;
                    text-decoration: none;
                }
                .sidebar-nav-item:hover {
                    background: rgba(0,0,0,0.12);
                    color: #fff;
                }
                .sidebar-nav-item.active {
                    background: rgba(255,255,255,0.2);
                    border-left-color: #fff;
                    color: #fff;
                }
                .sidebar-nav-dot {
                    width: 5px; height: 5px;
                    border-radius: 50%;
                    background: currentColor;
                    flex-shrink: 0;
                }
                .sidebar-nav-badge-pdf {
                    margin-left: auto;
                    background: rgba(255,255,255,0.2);
                    color: #fff;
                    font-size: 9px; font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                    letter-spacing: .5px;
                }

                /* ── Footer ── */
                .sidebar-footer {
                    padding: 14px 20px;
                    border-top: 1px solid rgba(255,255,255,0.15);
                    flex-shrink: 0;
                }
                .sidebar-logout {
                    display: flex; align-items: center; gap: 8px;
                    color: rgba(255,255,255,0.7);
                    font-size: 12px; cursor: pointer;
                    background: none; border: none;
                    width: 100%;
                    font-family: 'DM Sans', sans-serif;
                    transition: color .15s;
                }
                .sidebar-logout:hover { color: #fff; }

                /* ── Mobile ── */
                @media (max-width: 768px) {
                    .sidebar-overlay { display: block !important; }

                    .admin-sidebar {
                        width: 240px;
                    }
                }
            `}</style>
        </>
    );
}