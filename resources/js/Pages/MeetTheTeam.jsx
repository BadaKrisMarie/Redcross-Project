import React, { useState, useEffect } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import Accordion from '@/Components/Public/Accordion';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import {
    LEADERSHIP_MEMBERS,
    GORDON_ACCORDION_SECTIONS,
    BOARD_EXECUTIVES,
    BOARD_GOVERNORS,
    EXECUTIVE_STAFF,
} from '@/data/teamData';
import { TEAM_SIDEBAR_LINKS } from '@/data/navigationData';
import { User, Shield, Briefcase, Award } from 'lucide-react';

export default function MeetTheTeam() {
    const [activeTab, setActiveTab] = useState('chairman');

    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash && (LEADERSHIP_MEMBERS[hash] || hash === 'governors' || hash === 'executive')) {
            setActiveTab(hash);
        }
    }, []);

    const handleTabChange = (key) => {
        setActiveTab(key);
        window.history.replaceState(null, '', `#${key}`);
    };

    const currentMember = LEADERSHIP_MEMBERS[activeTab];

    return (
        <PublicLayout title="Leadership & Team - Philippine Red Cross">
            <PageHero
                title="Leadership & Dedicated Team"
                subtitle="Philippine Red Cross - Rizal Chapter Muntinlupa"
                description="Meet the visionary leaders, Board of Governors, and executive staff steering our humanitarian mission forward."
                breadcrumbs={[
                    { label: 'About Us', href: '/about' },
                    { label: 'Meet the Team' },
                ]}
            />

            <SectionContainer bg="white">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Sidebar Navigation */}
                    <aside className="w-full lg:w-72 bg-gray-50 rounded-2xl border border-gray-200 p-6 shrink-0 lg:sticky lg:top-24">
                        <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-600" />
                            <span>Leadership Roster</span>
                        </h3>
                        <nav className="space-y-1.5">
                            {TEAM_SIDEBAR_LINKS.map((link) => {
                                const isActive = activeTab === link.key;
                                return (
                                    <button
                                        key={link.key}
                                        type="button"
                                        onClick={() => handleTabChange(link.key)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 flex items-center justify-between ${
                                            isActive
                                                ? 'bg-red-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-200/60 hover:text-red-600'
                                        }`}
                                    >
                                        <span>{link.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content Pane */}
                    <main className="flex-1 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 lg:p-10">
                        <FadeIn key={activeTab}>
                            {/* Tab: Board of Governors */}
                            {activeTab === 'governors' ? (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                            Board of Governors
                                        </h2>
                                        <p className="text-xs font-bold text-red-600 mt-1">
                                            Governance & Policy Leadership
                                        </p>
                                    </div>

                                    {/* Executive Officers */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 mb-4">
                                            Officers of the Board
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {BOARD_EXECUTIVES.map((exec) => (
                                                <div
                                                    key={exec.name}
                                                    className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3.5"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-black text-sm flex items-center justify-center shrink-0">
                                                        {exec.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">
                                                            {exec.name}
                                                        </div>
                                                        <div className="text-xs text-red-600 font-medium">
                                                            {exec.position}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Members */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 mb-4">
                                            Board Governors
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {BOARD_GOVERNORS.map((gov) => (
                                                <div
                                                    key={gov}
                                                    className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-sm font-semibold text-gray-800"
                                                >
                                                    {gov}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'executive' ? (
                                /* Tab: Executive Staff */
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                            Executive Management Staff
                                        </h2>
                                        <p className="text-xs font-bold text-red-600 mt-1">
                                            National & Chapter Administration
                                        </p>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {EXECUTIVE_STAFF.map((staff) => (
                                            <div
                                                key={staff.name}
                                                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                            >
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm sm:text-base">
                                                        {staff.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {staff.office}
                                                    </div>
                                                </div>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 w-fit">
                                                    {staff.position}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : currentMember ? (
                                /* Tab: Chairman or Secretary General */
                                <div className="space-y-8">
                                    <div className="border-b border-gray-100 pb-6">
                                        <span className="text-xs font-bold text-red-600 block mb-1">
                                            {currentMember.title}
                                        </span>
                                        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
                                            {currentMember.name}
                                        </h2>
                                    </div>

                                    <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
                                        {currentMember.bio.map((paragraph, idx) => (
                                            <p key={idx}>{paragraph}</p>
                                        ))}
                                    </div>

                                    {activeTab === 'chairman' && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                                Key Milestones & Humanitarian Impact
                                            </h3>
                                            <Accordion items={GORDON_ACCORDION_SECTIONS} />
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </FadeIn>
                    </main>
                </div>
            </SectionContainer>

            <CTASection />
        </PublicLayout>
    );
}
