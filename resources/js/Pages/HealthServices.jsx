import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import FeatureCard from '@/Components/Public/FeatureCard';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { HEALTH_SERVICES_PROGRAMS } from '@/data/servicesData';
import { HeartPulse, Ambulance, Droplet, ShieldAlert, Phone } from 'lucide-react';

const iconMap = {
    HeartPulse,
    Ambulance,
    Droplet,
    ShieldAlert,
};

export default function HealthServices() {
    return (
        <PublicLayout title="Health Services - Philippine Red Cross">
            <PageHero
                title="Health Services"
                subtitle="Compassionate Primary Health Care & Emergency Response"
                description="Delivering life-saving primary care consultations, 24/7 emergency ambulance response, clean water and sanitation (WASH), and rapid epidemic disease surveillance across Muntinlupa City."
                breadcrumbs={[
                    { label: 'Services', href: '/about' },
                    { label: 'Health Services' },
                ]}
            />

            {/* Core Programs */}
            <SectionContainer bg="white">
                <FadeIn>
                    <SectionHeading
                        title="Key Health & Emergency Interventions"
                        subtitle="Comprehensive humanitarian health support ensuring medical care and epidemic protection for every community member."
                    />
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {HEALTH_SERVICES_PROGRAMS.map((program, i) => {
                        const IconComponent = iconMap[program.iconName] || HeartPulse;
                        return (
                            <FadeIn key={program.title} delay={0.06 * i}>
                                <FeatureCard
                                    icon={IconComponent}
                                    title={program.title}
                                    description={program.desc}
                                    href="/contact"
                                    linkText="Inquire for Assistance"
                                />
                            </FadeIn>
                        );
                    })}
                </div>
            </SectionContainer>

            {/* 24/7 Emergency Dispatch Banner */}
            <SectionContainer bg="gray-50">
                <FadeIn>
                    <div className="bg-gray-900 text-white rounded-2xl p-8 sm:p-10 border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-3 max-w-xl">
                            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Need Immediate Medical or Ambulance Assistance?
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Our Emergency Medical Services (EMS) unit operates round-the-clock to respond to vehicular accidents, medical crises, and patient transfers in Muntinlupa.
                            </p>
                        </div>

                        <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <a
                                href="tel:0286415364"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Call (02) 8641-5364</span>
                            </a>
                            <Link
                                href="/get-in-touch"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition-colors"
                            >
                                <span>View Directory</span>
                            </Link>
                        </div>
                    </div>
                </FadeIn>
            </SectionContainer>

            <CTASection
                title="Support Community Health Initiatives"
                description="Your donations and volunteer service help us equip ambulances, provide free medical consultations, and deliver clean water to families in need."
            />
        </PublicLayout>
    );
}
