import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import FadeIn from '@/Components/Public/FadeIn';
import {
    ShieldAlert,
    Droplet,
    GraduationCap,
    CalendarCheck,
    Bell,
    ClipboardCheck,
    Laptop,
    Layers,
    HeartHandshake,
    Award,
    Target,
    Compass,
} from 'lucide-react';

/* ──────────────────────────── DATA DEFINITIONS ──────────────────────────── */

const BRANCH_PILLARS = [
    {
        title: 'Emergency Relief & Disaster Response',
        subtitle: '24/7 rapid deployment',
        image: '/images/hero-bg.jpg',
        icon: ShieldAlert,
        description:
            'Deploying rescue teams, emergency hot meals, family food packs, and welfare support to disaster-affected communities across Muntinlupa.',
    },
    {
        title: 'National Blood Services & Health',
        subtitle: 'Safe blood & medical care',
        image: '/images/donation-hero.jpg',
        icon: Droplet,
        description:
            'Conducting mobile blood drives, ensuring 100% screened safe blood supplies, and delivering community health checkups and hygiene assistance.',
    },
    {
        title: 'Safety Training & Youth Leadership',
        subtitle: 'Empowering communities',
        image: '/images/training-hero.jpg',
        icon: GraduationCap,
        description:
            'Equipping citizens with certified First Aid, CPR, and Disaster Preparedness skills, while mobilizing Red Cross 143 volunteers in schools and barangays.',
    },
];

const SYSTEM_PILLARS = [
    {
        icon: CalendarCheck,
        title: 'Activities & Schedules',
        description:
            'Approved volunteers can browse upcoming deployment activities, reserve duty shifts, and confirm attendance schedules with real-time slot tracking.',
    },
    {
        icon: Bell,
        title: 'Official Announcements',
        description:
            'Receive official branch notices, emergency callouts, typhoon bulletins, and training advisories instantly through a unified announcement feed.',
    },
    {
        icon: ClipboardCheck,
        title: 'Volunteer Records & Hours',
        description:
            'Keep an accurate, verifiable track of rendered volunteer hours, completed training courses, specializations, and service certifications.',
    },
    {
        icon: Laptop,
        title: 'Volunteer Services',
        description:
            'Access branch communication channels, document submissions, profile updates, and direct coordination with volunteer coordinators.',
    },
];

const PURPOSE_BENEFITS = [
    {
        icon: Layers,
        title: 'Organized Volunteer Management',
        description:
            'Replaces scattered group chats and manual paperwork with an automated, structured hub. Volunteer rosters, shifts, and branch operations are managed with clear transparency.',
    },
    {
        icon: HeartHandshake,
        title: 'Accessible All-in-One Platform',
        description:
            'Provides approved volunteers with an intuitive, mobile-friendly platform to access their schedules, requirements, and deployment information anytime, anywhere.',
    },
    {
        icon: Award,
        title: 'Swift Mobilization & Coordination',
        description:
            'Empowers branch administrators to rapidly mobilize verified, trained personnel based on skills and availability whenever emergencies occur in Muntinlupa.',
    },
];

/* ──────────────────────────── COMPONENT ──────────────────────────── */

export default function About() {
    const { auth } = usePage().props || {};

    const portalHref =
        auth?.user?.role === 'admin'
            ? '/admin/dashboard'
            : '/volunteer/dashboard';

    return (
        <PublicLayout title="About Us - Philippine Red Cross Muntinlupa">
            {/* ──────────────── 1. HERO SECTION ──────────────── */}
            <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/muntinlupa-map.jpg"
                        alt="Muntinlupa City Map"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Soft ambient overlay */}
                    <div className="absolute inset-0 bg-slate-900/10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/90" />
                </div>

                {/* Center Hero Container */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full text-center">
                    {/* Framed Card - Clean without border pixels */}
                    <div className="relative mx-auto max-w-3xl bg-white/95 backdrop-blur-md rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] pt-0 px-6 sm:px-14 pb-12 sm:pb-16 overflow-hidden">
                        {/* Sleek Notch Design at Top Center without harsh borders */}
                        <div className="w-32 sm:w-44 h-5 sm:h-6 bg-gray-100 rounded-b-2xl mx-auto flex items-center justify-center gap-2 mb-10 sm:mb-14">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <span className="w-10 h-1.5 rounded-full bg-gray-300" />
                        </div>

                        {/* Main Header H1 */}
                        <FadeIn delay={0.06}>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-semibold tracking-tight leading-[1.12] mb-3.5 max-w-2xl mx-auto font-manrope">
                                <span className="text-gray-900 block">Dedicated to humanity,</span>
                                <span className="text-gray-400 block">driven by purpose</span>
                            </h1>
                        </FadeIn>

                        {/* Subtitle */}
                        <FadeIn delay={0.1}>
                            <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8 font-montserrat font-normal">
                                Philippine Red Cross Rizal Chapter – Muntinlupa City Branch & the Volunteer Management System.
                            </p>
                        </FadeIn>

                        {/* Action Buttons without border pixels */}
                        <FadeIn delay={0.14}>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {auth?.user ? (
                                    <Link
                                        href={portalHref}
                                        className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-montserrat font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all duration-150"
                                    >
                                        <span>Access Volunteer Portal</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-montserrat font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all duration-150"
                                    >
                                        <span>Join as Volunteer</span>
                                    </Link>
                                )}

                                <a
                                    href="#about-system"
                                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-montserrat font-semibold text-sm sm:text-base transition-all duration-150"
                                >
                                    <span>About the System</span>
                                </a>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* ──────────────── 2. ABOUT US SECTION ──────────────── */}
            <section className="py-16 sm:py-24 bg-white" id="about-us">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn>
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-4 font-manrope">
                                About Us
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-montserrat">
                                The Philippine Red Cross Rizal Chapter – Muntinlupa City Branch serves as a premier humanitarian auxiliary organization committed to protecting human life, alleviating suffering, and upholding human dignity across every community in Muntinlupa City.
                            </p>
                        </div>
                    </FadeIn>

                    {/* 3 Clean Borderless Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {BRANCH_PILLARS.map((pillar, i) => {
                            const Icon = pillar.icon;
                            return (
                                <FadeIn key={pillar.title} delay={0.06 * i}>
                                    <div className="bg-gray-50/70 rounded-2xl overflow-hidden shadow-none hover:shadow-md transition-all duration-200 flex flex-col h-full group">
                                        {/* Image */}
                                        <div className="h-48 overflow-hidden bg-gray-100 relative">
                                            <img
                                                src={pillar.image}
                                                alt={pillar.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <Icon className="w-4 h-4 text-red-600" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block font-montserrat">
                                                    {pillar.subtitle}
                                                </span>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2.5 group-hover:text-red-600 transition-colors font-manrope">
                                                    {pillar.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-montserrat">
                                                    {pillar.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ──────────────── 3. ABOUT THE SYSTEM SECTION ──────────────── */}
            <section className="py-16 sm:py-24 bg-gray-50/60" id="about-system">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn>
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-4 font-manrope">
                                About the System
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-montserrat">
                                The Volunteer Management System (VMS) is a dedicated digital platform designed exclusively for approved volunteers to access volunteer-related information, activities, schedules, announcements, and other essential branch services.
                            </p>
                        </div>
                    </FadeIn>

                    {/* 4 Clean Borderless Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {SYSTEM_PILLARS.map((pillar, i) => {
                            const Icon = pillar.icon;
                            return (
                                <FadeIn key={pillar.title} delay={0.05 * i}>
                                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between h-full group">
                                        <div>
                                            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-base font-semibold text-gray-900 mb-2 font-manrope group-hover:text-red-600 transition-colors">
                                                {pillar.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-montserrat">
                                                {pillar.description}
                                            </p>
                                        </div>
                                    </div>
                                </FadeIn>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ──────────────── 4. OUR PURPOSE SECTION ──────────────── */}
            <section className="py-16 sm:py-24 bg-white" id="our-purpose">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn>
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-4 font-manrope">
                                Our Purpose
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-montserrat">
                                The system was developed to make volunteer management more organized and provide approved volunteers with an accessible platform for their volunteer activities.
                            </p>
                        </div>
                    </FadeIn>

                    {/* 3 Clean Borderless Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {PURPOSE_BENEFITS.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <FadeIn key={item.title} delay={0.06 * i}>
                                    <div className="bg-gray-50/70 rounded-2xl p-7 flex flex-col justify-between shadow-none hover:shadow-md hover:bg-white transition-all duration-200 h-full group">
                                        <div>
                                            <div className="w-12 h-12 rounded-xl bg-white text-red-600 flex items-center justify-center mb-5 group-hover:bg-red-600 group-hover:text-white transition-all duration-200 shadow-sm">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3 font-manrope group-hover:text-red-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-montserrat">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </FadeIn>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ──────────────── 5. MISSION & VISION SECTION ──────────────── */}
            <section className="py-16 sm:py-24 bg-gray-50/60" id="mission-vision">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeIn>
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-4 font-manrope">
                                Mission & Vision
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-montserrat">
                                Guided by the Fundamental Principles of the Red Cross and Red Crescent Movement.
                            </p>
                        </div>
                    </FadeIn>

                    {/* Dual Clean Borderless Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* MISSION CARD */}
                        <FadeIn delay={0.06}>
                            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 font-manrope">
                                            Mission
                                        </h3>
                                    </div>

                                    <p className="text-base sm:text-lg text-gray-800 font-montserrat font-medium leading-relaxed my-4 bg-red-50/40 p-5 rounded-2xl">
                                        "We act with dispatch to ensure we reach the most vulnerable people and communities so that they will be enabled and ennobled."
                                    </p>
                                </div>
                            </div>
                        </FadeIn>

                        {/* VISION CARD */}
                        <FadeIn delay={0.12}>
                            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                            <Compass className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 font-manrope">
                                            Vision
                                        </h3>
                                    </div>

                                    <p className="text-base sm:text-lg text-gray-800 font-montserrat font-medium leading-relaxed my-4 bg-red-50/40 p-5 rounded-2xl">
                                        "A leading humanitarian organization committed to bringing timely, effective, and meaningful assistance to the most vulnerable, guided by the Fundamental Principles of the Red Cross and Red Crescent Movement."
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

        </PublicLayout>
    );
}