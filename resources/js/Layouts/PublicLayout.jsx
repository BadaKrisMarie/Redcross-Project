import React from 'react';
import { Head } from '@inertiajs/react';
import SiteNavbar from '@/Components/SiteNavbar';
import SiteFooter from '@/Components/SiteFooter';

/**
 * PublicLayout — unified wrapper for all public-facing pages.
 *
 * Usage:
 *   export default function MyPage() {
 *     return (
 *       <PublicLayout title="Page Title - Philippine Red Cross">
 *         {/* page content only — no navbar, footer, or font wrappers needed *\/}
 *       </PublicLayout>
 *     );
 *   }
 *
 * Props:
 *   title     {string} — <title> for the browser tab / SEO
 *   children  {node}   — page body content
 *   className {string} — optional extra classes on the <main> element
 */
export default function PublicLayout({ title, children, className = '' }) {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900 selection:bg-red-600 selection:text-white">
            <Head title={title ?? 'Philippine Red Cross – Muntinlupa City Branch'} />

            {/* Shared Navbar (includes built-in height spacer) */}
            <SiteNavbar />

            {/* Page content */}
            <main className={`flex-1 ${className}`}>
                {children}
            </main>

            {/* Shared Footer */}
            <SiteFooter />
        </div>
    );
}
