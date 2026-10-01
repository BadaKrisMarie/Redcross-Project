import React from 'react';
import { Link } from '@inertiajs/react';
import { Heart, ArrowRight } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} [props.title='Save Lives. Join the Red Cross.']
 * @param {string} [props.description]
 * @param {string} [props.primaryBtnText='Join Us as a Volunteer']
 * @param {string} [props.primaryBtnHref='/register']
 * @param {string} [props.secondaryBtnText='Donate to Chapter']
 * @param {string} [props.secondaryBtnHref='/donate']
 */
export default function CTASection({
    title = 'Save Lives. Join the Red Cross.',
    description = 'We take pride in urging all Filipinos and Muntinlupa residents to take part in the heroism of the Philippine Red Cross by becoming a full-fledged member, volunteer, or donor.',
    primaryBtnText = 'Join Us as a Volunteer',
    primaryBtnHref = '/register',
    secondaryBtnText = 'Donate to Chapter',
    secondaryBtnHref = '/donate',
}) {
    return (
        <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white py-14 sm:py-16 overflow-hidden font-sans">
            {/* Background geometric accents */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[40px] border-white/10 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border-[30px] border-white/5 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-5 leading-tight">
                    {title}
                </h2>

                {description && (
                    <p className="text-sm sm:text-base text-red-100 max-w-2xl mx-auto leading-relaxed mb-8">
                        {description}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {primaryBtnHref && (
                        <Link
                            href={primaryBtnHref}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-red-700 hover:bg-red-50 text-sm font-bold tracking-wide transition-all duration-150"
                        >
                            <span>{primaryBtnText}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}

                    {secondaryBtnHref && (
                        <Link
                            href={secondaryBtnHref}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-red-800/60 hover:bg-red-800/90 text-white text-sm font-bold tracking-wide border border-white/25 backdrop-blur-sm transition-all duration-150"
                        >
                            <span>{secondaryBtnText}</span>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
