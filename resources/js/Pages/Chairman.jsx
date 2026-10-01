import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import Accordion from '@/Components/Public/Accordion';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { LEADERSHIP_MEMBERS, GORDON_ACCORDION_SECTIONS } from '@/data/teamData';
import { TEAM_SIDEBAR_LINKS, SERVICE_SIDEBAR_LINKS } from '@/data/navigationData';
import { Shield } from 'lucide-react';

export default function Chairman() {
    const chairman = LEADERSHIP_MEMBERS.chairman;

    return (
        <PublicLayout title="The Chairman - Philippine Red Cross">
            <PageHero
                title="The Chairman & CEO"
                subtitle="Philippine Red Cross - Rizal Chapter Muntinlupa"
                description="Learn more about the life, career, and humanitarian leadership of Chairman Richard J. Gordon."
                breadcrumbs={[
                    { label: 'About Us', href: '/about' },
                    { label: 'Meet the Team', href: '/about/team' },
                    { label: 'The Chairman' },
                ]}
            />

            <SectionContainer bg="white">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Sidebar */}
                    <aside className="w-full lg:w-72 bg-gray-50 rounded-2xl border border-gray-200 p-6 shrink-0 lg:sticky lg:top-24 space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-600" />
                                <span>The Team</span>
                            </h3>
                            <nav className="space-y-1">
                                {TEAM_SIDEBAR_LINKS.map((link) => (
                                    <Link
                                        key={link.key}
                                        href={link.href}
                                        className={`flex items-center text-sm py-2 px-3 rounded-lg font-semibold transition-colors ${
                                            link.key === 'chairman'
                                                ? 'bg-red-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-200/60 hover:text-red-600'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-xs font-bold text-gray-500 mb-3">
                                Chapter Services
                            </h3>
                            <nav className="space-y-1">
                                {SERVICE_SIDEBAR_LINKS.slice(0, 5).map((link) => (
                                    <Link
                                        key={link.key}
                                        href={link.href}
                                        className="block text-xs font-semibold text-gray-600 hover:text-red-600 py-1.5 px-3 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 lg:p-10 space-y-8">
                        <FadeIn>
                            <div className="border-b border-gray-100 pb-6">
                                <span className="text-xs font-bold text-red-600 block mb-1">
                                    {chairman.title}
                                </span>
                                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                                    {chairman.name}
                                </h1>
                            </div>

                            <div className="space-y-5 text-base sm:text-lg text-gray-700 leading-relaxed font-sans mt-6">
                                {chairman.bio.map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Humanitarian Achievements & Impact
                                </h3>
                                <Accordion items={GORDON_ACCORDION_SECTIONS} />
                            </div>
                        </FadeIn>
                    </main>
                </div>
            </SectionContainer>

            <CTASection />
        </PublicLayout>
    );
}