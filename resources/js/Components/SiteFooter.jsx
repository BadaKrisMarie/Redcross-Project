import React from 'react';
import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

export default function SiteFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Top row: brand + links */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <img
                            src="/images/redcross-logo.png"
                            alt="Philippine Red Cross"
                            className="w-9 h-9 rounded-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="leading-tight">
                            <p className="text-sm font-extrabold text-gray-900">Philippine Red Cross</p>
                            <p className="text-[11px] font-medium text-gray-400">Muntinlupa City Branch</p>
                        </div>
                    </Link>

                    {/* Quick links */}
                    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-gray-500">
                        <Link href="/about" className="hover:text-red-600 transition-colors">About</Link>
                        <Link href="/volunteer-info/become" className="hover:text-red-600 transition-colors">Volunteer</Link>
                        <Link href="/donate" className="hover:text-red-600 transition-colors">Donate</Link>
                        <Link href="/contact" className="hover:text-red-600 transition-colors">Contact</Link>
                        <a
                            href="https://www.facebook.com/RedCrossMuntinlupa/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-red-600 transition-colors inline-flex items-center gap-1"
                        >
                            Facebook
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </nav>
                </div>

                {/* Divider + copyright */}
                <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400 font-medium">
                    <span>© {new Date().getFullYear()} Philippine Red Cross – Muntinlupa City Branch</span>
                    <a
                        href="https://www.redcross.org.ph"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-red-600 transition-colors inline-flex items-center gap-1"
                    >
                        redcross.org.ph
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
