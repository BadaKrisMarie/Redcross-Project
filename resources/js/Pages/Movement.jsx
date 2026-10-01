import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { MOVEMENT_PILLARS } from '@/data/historyData';
import { Globe, Users, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export default function Movement() {
    return (
        <PublicLayout title="The Movement - Philippine Red Cross">
            <PageHero
                title="The International Red Cross & Red Crescent Movement"
                subtitle="The World's Largest Humanitarian Network"
                description="Neutral, impartial, and independent — providing protection and assistance to people affected by disasters and conflicts in 191 countries worldwide."
                breadcrumbs={[
                    { label: 'About Us', href: '/about' },
                    { label: 'The Movement' },
                ]}
            />

            {/* The Birth of an Idea */}
            <SectionContainer bg="white">
                <FadeIn>
                    <SectionHeading
                        title="The Birth of an Idea in Solferino"
                        subtitle="How a Swiss businessman's compassion transformed battlefield relief into a worldwide institution."
                    />
                </FadeIn>

                <FadeIn delay={0.06}>
                    <div className="max-w-4xl mx-auto space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
                        <p>
                            The Red Cross idea was born in 1859, when <strong className="text-gray-900 font-bold">Jean Henry Dunant</strong>, a young Swiss businessman, came upon the scene of a bloody battle in Solferino, Italy, between the armies of imperial Austria and the Franco-Sardinian alliance. Some 40,000 men lay dead or dying on the battlefield and the wounded were lacking medical attention.
                        </p>
                        <p>
                            Dunant organized local townspeople to bind the soldiers' wounds and to feed and comfort them. On his return, he called for the creation of national relief societies to assist those wounded in war, and pointed the way to the future Geneva Conventions.
                        </p>
                        <blockquote className="border-l-4 border-red-600 pl-5 py-3 text-gray-900 font-semibold italic bg-red-50/50 rounded-r-xl my-6">
                            "Would there not be some means, during a period of peace and calm, of forming relief societies whose object would be to have the wounded cared for in time of war by enthusiastic, devoted volunteers, fully qualified for the task?"
                        </blockquote>
                        <p>
                            The Red Cross was born in 1863 when five Geneva men, including Dunant, set up the International Committee for Relief to the Wounded, later to become the International Committee of the Red Cross (ICRC). Its emblem was a red cross on a white background: the inverse of the Swiss flag.
                        </p>
                    </div>
                </FadeIn>
            </SectionContainer>

            {/* Three Movement Pillars */}
            <SectionContainer bg="gray-50">
                <FadeIn>
                    <SectionHeading
                        title="The Three Pillars of the Movement"
                        subtitle="Independent components working in seamless cooperation across the globe."
                    />
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {MOVEMENT_PILLARS.map((pillar, i) => (
                        <FadeIn key={pillar.name} delay={0.06 * i}>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 hover:border-red-300 transition-colors duration-200 flex flex-col justify-between group h-full">
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200 font-black text-sm">
                                        {pillar.name}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                        {pillar.fullName}
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

            {/* ICRC in the Philippines */}
            <SectionContainer bg="white">
                <FadeIn>
                    <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl p-8 sm:p-10 border border-gray-800 space-y-4">
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            The ICRC & Philippine Red Cross Partnership
                        </h3>
                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                            The ICRC established a permanent presence in the Philippines in 1982. In close cooperation with the Philippine Red Cross, the ICRC works to assist and protect people affected by armed conflict and other situations of violence, visiting detention facilities, and promoting international humanitarian law.
                        </p>
                        <div className="pt-2">
                            <a
                                href="https://www.icrc.org/ph"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                            >
                                <span>Visit ICRC Philippines Portal</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </FadeIn>
            </SectionContainer>

            <CTASection />
        </PublicLayout>
    );
}
