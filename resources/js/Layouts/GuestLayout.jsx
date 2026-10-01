import React from 'react';
import SiteNavbar from '@/Components/SiteNavbar';
import SiteFooter from '@/Components/SiteFooter';

export default function GuestLayout({ children, title, subtitle, maxWidth = 'max-w-md' }) {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900 selection:bg-red-600 selection:text-white relative">
            {/* Global Public / Auth Floating Pill Navbar */}
            <SiteNavbar />

            {/* Subtle Dot Pattern Canvas matching site theme */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-40"
                style={{
                    backgroundImage: 'radial-gradient(#d1d5db 1.2px, transparent 1.2px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Main Auth Content Container */}
            <main className="flex-1 flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                {/* Header / Brand Title */}
                <div className={`w-full ${maxWidth} text-center mb-6`}>
                    {title && (
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 font-manrope">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="mt-2 text-sm text-gray-500 font-montserrat">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Form Card (Clean White, Subtle Border, Semi-Bold Fonts) */}
                <div className={`w-full ${maxWidth}`}>
                    <div className="bg-white py-8 px-6 sm:px-10 border border-gray-200/90 rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)]">
                        {children}
                    </div>
                </div>
            </main>

            {/* Shared Footer */}
            <SiteFooter />
        </div>
    );
}
