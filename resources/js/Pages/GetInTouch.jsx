import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { BRANCH_CONTACT_INFO } from '@/data/navigationData';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export default function GetInTouch() {
    const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
        'Philippine Red Cross Rizal Chapter Muntinlupa City Branch, ' + BRANCH_CONTACT_INFO.address
    )}&output=embed`;

    return (
        <PublicLayout title="Get in Touch - Philippine Red Cross Muntinlupa">
            <PageHero
                title="Chapter Directory & Map"
                subtitle="Philippine Red Cross - Rizal Chapter Muntinlupa"
                description="Find directions to our branch center or reach our emergency dispatch team 24/7."
                breadcrumbs={[
                    { label: 'Contact Us', href: '/contact' },
                    { label: 'Get in Touch' },
                ]}
            />

            <SectionContainer bg="white">
                {/* Embedded Map */}
                <FadeIn>
                    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white mb-10">
                        <iframe
                            title="Philippine Red Cross Muntinlupa City Branch Map"
                            src={mapEmbedSrc}
                            width="100%"
                            height="400"
                            className="border-0 block w-full"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </FadeIn>

                {/* Contact Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Address */}
                    <FadeIn delay={0.04}>
                        <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 flex items-start gap-4 h-full">
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-500">
                                    Branch Address
                                </span>
                                <div className="text-sm font-bold text-gray-900 leading-snug">
                                    {BRANCH_CONTACT_INFO.address}
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Phone & Hotline */}
                    <FadeIn delay={0.08}>
                        <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 flex items-start gap-4 h-full">
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-500">
                                    Chapter Phone & Mobile
                                </span>
                                <div className="text-sm font-black text-gray-900 font-mono">
                                    {BRANCH_CONTACT_INFO.phone}
                                </div>
                                <div className="text-xs text-red-600 font-bold font-mono">
                                    {BRANCH_CONTACT_INFO.mobile}
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Operating Hours */}
                    <FadeIn delay={0.12}>
                        <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 flex items-start gap-4 h-full">
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-500">
                                    Service Availability
                                </span>
                                <div className="text-sm font-semibold text-gray-800">
                                    {BRANCH_CONTACT_INFO.operatingHours}
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </SectionContainer>

            <CTASection />
        </PublicLayout>
    );
}