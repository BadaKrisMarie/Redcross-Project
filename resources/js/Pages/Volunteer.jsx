import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import Accordion from '@/Components/Public/Accordion';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { VOLUNTEER_FAQS, VOLUNTEER_PILLARS } from '@/data/volunteerData';
import { Users, Heart, Award, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Volunteer() {
    return (
        <PublicLayout title="Volunteer Programs - Philippine Red Cross">
            <PageHero
                title="Volunteer With the Philippine Red Cross"
                subtitle="Make a Real Difference in Muntinlupa City"
                description="Volunteers are the lifeblood of the Red Cross. Join our dedicated community of first responders, blood advocates, youth leaders, and disaster relief heroes."
                breadcrumbs={[
                    { label: 'Services', href: '/about' },
                    { label: 'Volunteer Programs' },
                ]}
            />

            {/* Volunteer Service Pillars */}
            <SectionContainer bg="white">
                <FadeIn>
                    <SectionHeading
                        title="Where You Can Serve"
                        subtitle="Explore specialized volunteer departments matched to your skills, profession, or passion for humanitarian aid."
                    />
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {VOLUNTEER_PILLARS.map((pillar, i) => (
                        <FadeIn key={pillar.title} delay={0.06 * i}>
                            <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 sm:p-8 flex flex-col justify-between hover:border-red-300 transition-colors duration-200 group h-full">
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {pillar.desc}
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </SectionContainer>

            {/* Volunteer FAQs Accordion */}
            <SectionContainer bg="gray-50">
                <div className="max-w-4xl mx-auto space-y-6">
                    <FadeIn>
                        <SectionHeading
                            title="Frequently Asked Questions"
                            subtitle="Everything you need to know about qualifications, requirements, orientation, and service hours."
                        />
                        <Accordion items={VOLUNTEER_FAQS} defaultOpenIndex={0} />
                    </FadeIn>
                </div>
            </SectionContainer>

            {/* CTA Section */}
            <CTASection
                title="Ready to Start Your Humanitarian Journey?"
                description="Sign up online in less than 2 minutes. Our Volunteer Service Office will contact you regarding upcoming orientations."
                primaryBtnText="Register as a Volunteer"
                primaryBtnHref="/register"
                secondaryBtnText="Contact Chapter Office"
                secondaryBtnHref="/contact"
            />
        </PublicLayout>
    );
}
