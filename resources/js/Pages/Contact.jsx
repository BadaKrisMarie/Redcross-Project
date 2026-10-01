import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import FadeIn from '@/Components/Public/FadeIn';
import {
    Phone,
    Mail,
    MapPin,
    ShieldAlert,
    Droplet,
    Clock,
    ExternalLink,
    Globe,
    Share2,
} from 'lucide-react';

/* ──────────────────────────── DATA DEFINITIONS ──────────────────────────── */

const EMERGENCY_HOTLINES = [
    {
        label: 'PRC Nationwide Hotline',
        number: '143',
        sub: '24/7 Emergency & Rescue',
        icon: ShieldAlert,
        href: 'tel:143',
    },
    {
        label: 'Muntinlupa Chapter Dispatch',
        number: '(02) 8641-5364',
        sub: '24/7 Ambulance & Operations',
        icon: Phone,
        href: 'tel:0286415364',
    },
    {
        label: 'Disaster Duty Officer',
        number: '+63 917 177 6143',
        sub: 'Field Rescue & Disaster Relief',
        icon: ShieldAlert,
        href: 'tel:+639171776143',
    },
    {
        label: 'Blood Bank & Donor Desk',
        number: '+63 917 833 4929',
        sub: 'Blood Requests & Drive Schedules',
        icon: Droplet,
        href: 'tel:+639178334929',
    },
];

const OFFICIAL_LINKS = [
    {
        name: 'Official Website',
        handle: 'redcross.org.ph',
        url: 'https://www.redcross.org.ph',
        icon: Globe,
    },
    {
        name: 'PRC Muntinlupa Facebook',
        handle: '@RedCrossMuntinlupa',
        url: 'https://www.facebook.com/RedCrossMuntinlupa/',
        icon: Share2,
    },
    {
        name: 'National Facebook',
        handle: '@phredcross',
        url: 'https://www.facebook.com/phredcross/',
        icon: Share2,
    },
    {
        name: 'Twitter / X',
        handle: '@philredcross',
        url: 'https://twitter.com/philredcross',
        icon: Share2,
    },
];

/* ──────────────────────────── COMPONENT ──────────────────────────── */

export default function Contact() {
    return (
        <PublicLayout title="Contact Us - Philippine Red Cross Muntinlupa">
            {/* ──────────────── 1. HERO SECTION ──────────────── */}
            <section className="relative min-h-[45vh] sm:min-h-[50vh] flex flex-col items-center justify-center overflow-hidden pt-28 sm:pt-36 pb-10 sm:pb-14">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/muntinlupa-map.jpg"
                        alt="Muntinlupa City Map"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-slate-900/10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/90" />
                </div>

                {/* Center Hero Card */}
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full text-center">
                    <div className="relative mx-auto max-w-2xl bg-white/95 backdrop-blur-md rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] pt-0 px-6 sm:px-12 pb-8 sm:pb-10 overflow-hidden">
                        {/* Notch */}
                        <div className="w-32 sm:w-40 h-5 bg-gray-100 rounded-b-2xl mx-auto flex items-center justify-center gap-2 mb-8 sm:mb-9">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <span className="w-10 h-1.5 rounded-full bg-gray-300" />
                        </div>

                        <FadeIn delay={0.06}>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-2.5 font-manrope">
                                <span className="text-gray-900 block">Contact Us</span>
                            </h1>
                        </FadeIn>

                        <FadeIn delay={0.1}>
                            <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed font-montserrat">
                                Philippine Red Cross Rizal Chapter – Muntinlupa City Branch
                            </p>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* ──────────────── 2. MAIN ORGANIZED CONTENT ──────────────── */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10 sm:space-y-14">
                {/* ── ROW 1: CORE CONTACT DETAILS (3 CARDS) ── */}
                <FadeIn>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Full Address */}
                        <div className="bg-gray-50/80 rounded-2xl p-6 sm:p-7 shadow-none hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                            <div>
                                <div className="w-11 h-11 rounded-xl bg-white text-red-600 flex items-center justify-center mb-4 shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2 font-manrope">
                                    Full Address
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-700 font-montserrat leading-relaxed">
                                    Red Cross Center, Centennial Lane, Filinvest Corporate City, Alabang, Muntinlupa City, Metro Manila, Philippines
                                </p>
                                <p className="text-xs text-gray-500 font-montserrat mt-2">
                                    Postal Code: <span className="font-semibold text-gray-800">1780</span>
                                </p>
                            </div>
                            <div className="mt-5">
                                <a
                                    href="https://maps.app.goo.gl/5617viaNwvSqUz5g7"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 font-montserrat"
                                >
                                    <span>Open in Google Maps</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* Contact # */}
                        <div className="bg-gray-50/80 rounded-2xl p-6 sm:p-7 shadow-none hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                            <div>
                                <div className="w-11 h-11 rounded-xl bg-white text-red-600 flex items-center justify-center mb-4 shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2 font-manrope">
                                    Contact Numbers
                                </h3>
                                <div className="space-y-1.5 text-xs sm:text-sm font-montserrat">
                                    <div>
                                        <span className="text-gray-400 block text-[11px]">Landline:</span>
                                        <a href="tel:0286415364" className="font-bold text-gray-900 hover:text-red-600 font-mono">
                                            (02) 8641-5364
                                        </a>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-[11px]">Mobile:</span>
                                        <a href="tel:+639178348272" className="font-bold text-gray-900 hover:text-red-600 font-mono">
                                            +63 917 834 8272
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 text-[11px] text-gray-500 font-montserrat flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>Mon – Fri: 8:00 AM – 5:00 PM</span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="bg-gray-50/80 rounded-2xl p-6 sm:p-7 shadow-none hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                            <div>
                                <div className="w-11 h-11 rounded-xl bg-white text-red-600 flex items-center justify-center mb-4 shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2 font-manrope">
                                    Email
                                </h3>
                                <p className="text-xs text-gray-400 mb-1 font-montserrat">Direct inquiries & support:</p>
                                <a
                                    href="mailto:muntinlupa@redcross.org.ph"
                                    className="font-bold text-red-600 hover:text-red-700 text-xs sm:text-sm break-all font-montserrat"
                                >
                                    muntinlupa@redcross.org.ph
                                </a>
                            </div>
                            <div className="mt-5 text-[11px] text-gray-400 font-montserrat">
                                Response within 24 hours
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* ── ROW 2: EMERGENCY HOTLINES (CLEAN NO BADGES) ── */}
                <FadeIn delay={0.05}>
                    <div>
                        <div className="mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 font-manrope">
                                Emergency Hotlines
                            </h2>
                            <p className="text-xs text-gray-500 font-montserrat">
                                24/7 priority emergency response lines
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {EMERGENCY_HOTLINES.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group block"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block font-montserrat">
                                                {item.label}
                                            </span>
                                            <span className="text-xl font-bold text-gray-900 group-hover:text-red-600 font-manrope transition-colors block mt-0.5">
                                                {item.number}
                                            </span>
                                            <span className="text-[11px] text-gray-400 block mt-1 font-montserrat">
                                                {item.sub}
                                            </span>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </FadeIn>

                {/* ── ROW 3: MAP & DONATION QR CODE (SPLIT VIEW) ── */}
                <FadeIn delay={0.1}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Map Column */}
                        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 font-manrope">
                                        Map
                                    </h2>
                                    <p className="text-xs text-gray-500 font-montserrat">
                                        Centennial Lane, Filinvest Corporate City, Alabang
                                    </p>
                                </div>
                                <a
                                    href="https://maps.app.goo.gl/5617viaNwvSqUz5g7"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold text-red-600 hover:text-red-700 font-montserrat inline-flex items-center gap-1"
                                >
                                    <span>Get Directions</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            {/* Embedded Map */}
                            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-gray-100">
                                <iframe
                                    title="Philippine Red Cross Muntinlupa Location Map"
                                    src="https://maps.google.com/maps?q=Red+Cross+Center+Centennial+Lane+Filinvest+Corporate+City+Alabang+Muntinlupa+1780&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>

                        {/* QR Code Donation Column */}
                        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col items-center text-center">
                            <div className="w-full text-left mb-4">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 font-manrope">
                                    Donate via QR Code
                                </h2>
                                <p className="text-xs text-gray-500 font-montserrat">
                                    For volunteers who wish to donate
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl shadow-none max-w-[240px] w-full mb-4">
                                <img
                                    src="/images/donation-qr.jpg"
                                    alt="Philippine Red Cross Muntinlupa Donation QR Code"
                                    className="w-full h-auto rounded-xl object-contain"
                                    onError={(e) => {
                                        e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PhilippineRedCrossMuntinlupaDonation';
                                    }}
                                />
                            </div>

                            <div className="w-full text-center space-y-1 text-xs font-montserrat">
                                <div className="font-semibold text-gray-800">
                                    Scan with GCash • Maya • QR Ph
                                </div>
                                <div className="text-gray-500 text-[11px]">
                                    Account Name: <span className="font-semibold text-gray-700">Philippine Red Cross</span>
                                </div>
                                <div className="text-gray-400 text-[11px] pt-2">
                                    All contributions directly fund emergency relief and community blood services.
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* ── ROW 4: OFFICIAL LINKS ── */}
                <FadeIn delay={0.15}>
                    <div>
                        <div className="mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 font-manrope">
                                Official Links
                            </h2>
                            <p className="text-xs text-gray-500 font-montserrat">
                                Links to official Philippine Red Cross website and verified social media pages
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {OFFICIAL_LINKS.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group block"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-gray-900 group-hover:text-red-600 font-manrope block transition-colors">
                                                    {link.name}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-montserrat block">
                                                    {link.handle}
                                                </span>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-600 transition-colors" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </FadeIn>
            </main>
        </PublicLayout>
    );
}
