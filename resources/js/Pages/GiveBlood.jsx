import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import Accordion from '@/Components/Public/Accordion';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { BLOOD_SERVICE_INFO } from '@/data/servicesData';
import { BRANCH_CONTACT_INFO } from '@/data/navigationData';
import { Droplet, Heart, HelpCircle, MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';

const BLOOD_FAQS = [
    {
        q: 'How often can a person donate blood?',
        a: 'A healthy individual may safely donate whole blood every three months (up to 4 times a year). The body begins replenishing lost fluid within 24 hours.',
    },
    {
        q: 'Will donating blood make me weak or sick?',
        a: 'No. Donating one standard unit (450ml) will not cause any ill effects or weakness in healthy individuals. The bone marrow is stimulated to generate fresh, healthy red blood cells.',
    },
    {
        q: 'Can a person with a tattoo or body piercing donate blood?',
        a: 'Yes, provided that the tattooing or piercing procedure was done at least 12 months prior to donation, and sterile procedures were observed.',
    },
    {
        q: 'How long does the entire blood donation process take?',
        a: 'The entire process from registration, vitals check, and health screening up to rest and recovery takes only 25–30 minutes. The actual blood collection takes only 8–10 minutes.',
    },
    {
        q: 'Is there any risk of contracting an infection or disease?',
        a: 'None whatsoever. The Philippine Red Cross strictly uses sterile, single-use, disposable needles and collection bags that are safely incinerated after use.',
    },
];

export default function GiveBlood() {
    return (
        <PublicLayout title="Give Blood Today - Philippine Red Cross">
            <PageHero
                title="Give Blood, Share Life"
                subtitle="Philippine Red Cross - Muntinlupa City Blood Service"
                description="Your voluntary blood donation is a vital lifeline for accident victims, surgical patients, cancer fighters, and mothers in critical childbirth across Muntinlupa."
                breadcrumbs={[
                    { label: 'Services', href: '/about' },
                    { label: 'National Blood Service', href: '/national-blood-service' },
                    { label: 'Give Blood' },
                ]}
            />

            {/* Donation Flow Steps */}
            <SectionContainer bg="white">
                <FadeIn>
                    <SectionHeading
                        title="Simple 5-Step Blood Donation Journey"
                        subtitle="Our certified phlebotomists and medical staff ensure a comfortable and rewarding experience."
                    />
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {BLOOD_SERVICE_INFO.donationSteps.map((step, i) => (
                        <FadeIn key={step.step} delay={0.04 * i}>
                            <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:border-red-300 transition-colors duration-200 group h-full">
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

            {/* FAQs Accordion & Chapter Location */}
            <SectionContainer bg="gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* FAQ Column */}
                    <div className="lg:col-span-7 space-y-6">
                        <FadeIn>
                            <SectionHeading
                                title="Common Questions on Blood Donation"
                                subtitle="Learn about safety, eligibility, and what to do before and after donating."
                            />
                            <Accordion items={BLOOD_FAQS} defaultOpenIndex={0} />
                        </FadeIn>
                    </div>

                    {/* Muntinlupa Blood Facility Card */}
                    <div className="lg:col-span-5">
                        <FadeIn delay={0.08}>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 space-y-5 h-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Muntinlupa Blood Center</h3>
                                    </div>
                                </div>

                                <div className="space-y-3.5 text-xs sm:text-sm">
                                    <div className="flex items-start gap-2.5 text-gray-700">
                                        <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                        <span>{BRANCH_CONTACT_INFO.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-gray-700">
                                        <Phone className="w-4 h-4 text-red-600 shrink-0" />
                                        <span>{BRANCH_CONTACT_INFO.phone} / {BRANCH_CONTACT_INFO.mobile}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-gray-700">
                                        <Mail className="w-4 h-4 text-red-600 shrink-0" />
                                        <span>{BRANCH_CONTACT_INFO.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-gray-700">
                                        <Clock className="w-4 h-4 text-red-600 shrink-0" />
                                        <span>{BRANCH_CONTACT_INFO.operatingHours}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    <a
                                        href={BRANCH_CONTACT_INFO.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                                    >
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Open Google Maps Directions</span>
                                    </a>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </SectionContainer>

            <CTASection
                title="Be a Hero, Save a Life"
                description="Sign up for our regular voluntary blood donor roster or visit our Muntinlupa branch."
                primaryBtnText="Register as Blood Donor"
                primaryBtnHref="/register"
                secondaryBtnText="Explore Blood Services"
                secondaryBtnHref="/national-blood-service"
            />
        </PublicLayout>
    );
}
