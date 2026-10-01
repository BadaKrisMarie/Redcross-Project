import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { BLOOD_SERVICE_INFO } from '@/data/servicesData';
import { Droplet, CheckCircle2, Heart, AlertCircle, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

export default function NationalBloodService() {
    return (
        <PublicLayout title="National Blood Service - Philippine Red Cross">
            <PageHero
                title="National Blood Service"
                subtitle="Safe, Adequate & Accessible Blood for Every Filipino"
                description="The major provider of safe and quality blood products in the Philippines, operating 24/7 with state-of-the-art screening standards to save lives in Muntinlupa and across the country."
                breadcrumbs={[
                    { label: 'Services', href: '/about' },
                    { label: 'National Blood Service' },
                ]}
            />

            {/* Blood Donation Eligibility */}
            <SectionContainer bg="white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-6 space-y-6">
                        <FadeIn>
                            <SectionHeading
                                title="Who Can Donate Blood?"
                                subtitle="Ensuring safety for both the generous blood donor and the recipient in urgent need."
                            />
                        </FadeIn>
                        <div className="space-y-3">
                            {BLOOD_SERVICE_INFO.eligibility.map((item, idx) => (
                                <FadeIn key={idx} delay={0.04 * idx}>
                                    <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                        <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <span className="text-sm sm:text-base text-gray-700 leading-snug">
                                            {item}
                                        </span>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>

                    {/* Blood Types Compatibility Chart */}
                    <div className="lg:col-span-6">
                        <FadeIn delay={0.1}>
                            <div className="bg-red-50/60 rounded-2xl border border-red-100 p-6 sm:p-8 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                                        <Droplet className="w-5 h-5 fill-current" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Blood Type Matching
                                        </h3>
                                    </div>
                                </div>

                                <div className="divide-y divide-red-100 text-xs sm:text-sm">
                                    {BLOOD_SERVICE_INFO.bloodTypes.map((row) => (
                                        <div
                                            key={row.type}
                                            className="py-2.5 flex items-center justify-between gap-4"
                                        >
                                            <span className="w-10 font-black text-red-700 text-base">
                                                {row.type}
                                            </span>
                                            <div className="flex-1 text-gray-600">
                                                <span className="text-gray-400 block text-[11px]">Can give to:</span>
                                                <span className="font-semibold text-gray-800">{row.canDonateTo}</span>
                                            </div>
                                            <div className="flex-1 text-right text-gray-600">
                                                <span className="text-gray-400 block text-[11px]">Can receive:</span>
                                                <span className="font-semibold text-gray-800">{row.canReceiveFrom}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </SectionContainer>

            {/* Step-by-Step Donation Process */}
            <SectionContainer bg="gray-50">
                <FadeIn>
                    <SectionHeading
                        title="5 Simple Steps to Donating Blood"
                        subtitle="A comfortable, safe, and professional experience guided by certified Red Cross medical specialists."
                        align="center"
                    />
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {BLOOD_SERVICE_INFO.donationSteps.map((step, i) => (
                        <FadeIn key={step.step} delay={0.04 * i}>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 hover:border-red-300 transition-colors duration-200 flex flex-col justify-between group h-full">
                                <div>
                                    <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center mb-4">
                                        {step.step}
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors text-base">
                                        {step.title}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </SectionContainer>

            <CTASection
                title="Give Blood, Save Lives"
                description="One donation can save up to three lives. Visit the Muntinlupa City Branch blood facility today."
                primaryBtnText="Register as a Blood Donor"
                primaryBtnHref="/register"
                secondaryBtnText="Blood Donation FAQs"
                secondaryBtnHref="/give-blood"
            />
        </PublicLayout>
    );
}
