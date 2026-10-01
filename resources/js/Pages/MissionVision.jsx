import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { CORE_VALUES } from '@/data/aboutData';
import { Target, Eye, Heart, ArrowRight } from 'lucide-react';

export default function MissionVision() {
    return (
        <PublicLayout title="Mission & Vision - Philippine Red Cross">
            <PageHero
                title="Our Mission & Vision"
                subtitle="Philippine Red Cross · Rizal Chapter Muntinlupa"
                description="Guided by fundamental humanitarian principles to protect life, promote human dignity, and alleviate suffering during crises and peacetime."
                breadcrumbs={[
                    { label: 'About Us', href: '/about' },
                    { label: 'Mission & Vision' },
                ]}
            />

            {/* Mission & Vision Primary Cards */}
            <SectionContainer bg="white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Mission Card */}
                    <FadeIn delay={0.05}>
                        <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-8 sm:p-10 flex flex-col justify-between h-full">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
                                    <Target className="w-7 h-7" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                                    Our Mission
                                </h2>
                                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                                    The Philippine Red Cross will provide extremely compassionate, reliable, and timely humanitarian assistance to the most vulnerable individuals and families in times of disasters, emergencies, and peace.
                                </p>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Vision Card */}
                    <FadeIn delay={0.1}>
                        <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-8 sm:p-10 flex flex-col justify-between h-full">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
                                    <Eye className="w-7 h-7" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                                    Our Vision
                                </h2>
                                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                                    The Philippine Red Cross is the premier humanitarian organization in the country, committed to provide quality life-saving services that protect life and dignity especially of indigent Filipinos in vulnerable situations.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </SectionContainer>

            {/* Core Values Section */}
            <SectionContainer bg="gray-50">
                <FadeIn>
                    <SectionHeading
                        title="Our Core Values"
                        subtitle="The fundamental foundation shaping every relief operation and medical intervention."
                    />
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CORE_VALUES.map((val, i) => (
                        <FadeIn key={val.title} delay={0.04 * i}>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:border-red-300 transition-colors group h-full">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                        {val.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                        {val.desc}
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </SectionContainer>

            <CTASection />
        </PublicLayout>
    );
}
