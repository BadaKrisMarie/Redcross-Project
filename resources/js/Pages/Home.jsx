import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import FeatureCard from '@/Components/Public/FeatureCard';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { CHAPTER_STATS } from '@/data/aboutData';
import { Droplet, HeartPulse, GraduationCap, Users, Heart, ArrowRight } from 'lucide-react';

const coreServices = [
    {
        icon: Droplet,
        title: 'National Blood Service',
        description: 'Safe, screened, and adequate blood supply for hospital patients, surgeries, and trauma emergencies 24/7.',
        href: '/national-blood-service',
    },
    {
        icon: HeartPulse,
        title: 'Health & Ambulance Services',
        description: 'Primary care consultations, emergency medical ambulance response, and community WASH operations.',
        href: '/health-services',
    },
    {
        icon: GraduationCap,
        title: 'Safety & First Aid Training',
        description: 'Certified CPR, AED operation, workplace first aid, and water safety training for all sectors.',
        href: '/training',
    },
    {
        icon: Users,
        title: 'Volunteer Programs (RC 143)',
        description: 'Empowering local barangay leaders and youth volunteers to be first responders on the ground.',
        href: '/volunteer',
    },
];

export default function Home({ auth }) {
    return (
        <PublicLayout title="Home - Philippine Red Cross Muntinlupa">
            {/* Hero Banner */}
            <PageHero
                title="Always First, Always Ready, Always There"
                subtitle="Muntinlupa City Branch"
                description="Dedicated to saving lives, providing emergency relief, safe blood supply, and compassionate community care across Muntinlupa City."
                stats={CHAPTER_STATS}
            />

            {/* Core Services Overview */}
            <SectionContainer bg="white">
                <FadeIn>
                    <SectionHeading
                        title="Our Humanitarian Services & Programs"
                        subtitle="Providing comprehensive support to the most vulnerable families and communities."
                    />
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {coreServices.map((service, i) => (
                        <FadeIn key={service.title} delay={0.05 * i}>
                            <FeatureCard
                                icon={service.icon}
                                title={service.title}
                                description={service.description}
                                href={service.href}
                            />
                        </FadeIn>
                    ))}
                </div>
            </SectionContainer>

            {/* Quick Action Highlights */}
            <SectionContainer bg="gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Donate Box */}
                    <FadeIn delay={0.05}>
                        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 flex flex-col justify-between hover:border-red-300 transition-colors h-full">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Support Chapter Operations
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Your donations directly fund disaster food packs, ambulance maintenance, medical missions, and clean water supplies for families across Muntinlupa.
                                </p>
                            </div>
                            <div className="pt-6 mt-4 border-t border-gray-100">
                                <Link
                                    href="/donate"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
                                >
                                    <span>Donate to Chapter</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Blood Donation Box */}
                    <FadeIn delay={0.1}>
                        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 flex flex-col justify-between hover:border-red-300 transition-colors h-full">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Give Blood, Save 3 Lives
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Join our voluntary blood donor registry or visit our blood collection center at the Muntinlupa City Hall Compound. Every donation counts.
                                </p>
                            </div>
                            <div className="pt-6 mt-4 border-t border-gray-100">
                                <Link
                                    href="/give-blood"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
                                >
                                    <span>Learn How to Give Blood</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </SectionContainer>

            <CTASection />
        </PublicLayout>
    );
}
