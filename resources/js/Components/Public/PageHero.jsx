import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.title - Primary H1 page title
 * @param {string} [props.subtitle] - Secondary title or branch label
 * @param {string} [props.description] - Short introductory description
 * @param {Array<{label: string, href?: string}>} [props.breadcrumbs] - Breadcrumb trails
 * @param {Array<{num: string, label: string}>} [props.stats] - Optional right-column stat cards
 * @param {string} [props.bgImage] - Background hero image URL
 */
export default function PageHero({
    title,
    subtitle,
    description,
    breadcrumbs,
    stats,
    bgImage = '/images/training-hero.jpg',
}) {
    return (
        <section className="relative min-h-[340px] sm:min-h-[380px] flex items-center bg-gray-950 overflow-hidden font-sans">
            {/* Background Image with Dark & Red Gradient Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
                style={{ backgroundImage: `url('${bgImage}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-950/95 via-gray-950/90 to-gray-950/95" />
            <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

            {/* Content Container */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full z-10">
                {/* Breadcrumbs - White Color */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mb-6 tracking-normal">
                        <Link href="/" className="text-white hover:text-white/80 transition-colors">
                            Home
                        </Link>
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={crumb.label}>
                                <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                                {crumb.href && idx < breadcrumbs.length - 1 ? (
                                    <Link href={crumb.href} className="text-white hover:text-white/80 transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-white font-bold">{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left Column: Heading & Description */}
                    <div className={stats && stats.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                            {title}
                            {subtitle && (
                                <span className="block text-xl sm:text-2xl font-medium text-red-200/70 mt-1">
                                    {subtitle}
                                </span>
                            )}
                        </h1>
                        {description && (
                            <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Right Column: Optional Stats Pill Cards (No Shadow) */}
                    {stats && stats.length > 0 && (
                        <div className="lg:col-span-4 flex flex-col gap-3">
                            {stats.map(({ num, label }) => (
                                <div
                                    key={label}
                                    className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-5 py-3.5 flex items-center gap-4"
                                >
                                    <span className="text-2xl lg:text-3xl font-black text-white shrink-0 tracking-tight">
                                        {num}
                                    </span>
                                    <span className="text-xs sm:text-sm font-medium text-gray-200 leading-snug">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
