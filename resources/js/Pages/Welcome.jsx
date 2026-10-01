import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import FadeIn from '@/Components/Public/FadeIn';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Droplet,
    ShieldAlert,
    HeartPulse,
    Users,
    Mail,
    Clock,
    Check,
    Heart,
    Package,
    GraduationCap,
    Timer,
} from 'lucide-react';

/* ──────────────────────────── DATA ──────────────────────────── */

const SERVICE_CARDS = [
    {
        title: 'Emergency Medical Services',
        subtitle: 'On-site care & first aid',
        image: '/images/disaster-1.jpg',
        icon: HeartPulse,
        details:
            'Deploy alongside certified paramedics and first aiders to provide vital emergency care, triage, and on-site medical assistance during accidents, sporting events, and public assemblies in Muntinlupa.',
    },
    {
        title: 'Disaster Response & Rescue',
        subtitle: 'Emergency deployment',
        image: '/images/hero-bg.jpg',
        icon: ShieldAlert,
        details:
            'Serve in emergency response units during typhoons, floods, fires, and earthquakes. Assist with rapid assessments, boat rescues, evacuation center management, and community safety.',
    },
    {
        title: 'Welfare Services',
        subtitle: 'Psychosocial support & family care',
        image: '/images/disaster-2.jpg',
        icon: Users,
        details:
            'Operate welfare desks and Child-Friendly Spaces in evacuation centers. Provide psychological first aid, assist displaced families, and support Restoring Family Links (RFL) tracing operations.',
    },
    {
        title: 'Community Nutrition & Feeding',
        subtitle: 'Hot meals & nutrition relief',
        image: '/images/donation-hero.jpg',
        icon: Heart,
        details:
            'Prepare and serve nutritious hot meals via the Red Cross Hot Meals on Wheels food trucks. Mobilize feeding programs for vulnerable children and displaced residents across local barangays.',
    },
    {
        title: 'Relief Goods Packing & Logistics',
        subtitle: 'Warehouse & distribution',
        image: '/images/training-hero.jpg',
        icon: Package,
        details:
            'Manage disaster logistics at the chapter warehouse. Assemble standard family food packs, sleeping kits, and hygiene packages, and oversee orderly distribution directly to affected families.',
    },
    {
        title: 'Ambulance & Patient Transport',
        subtitle: '24/7 medical transport',
        image: '/images/disaster-3.jpg',
        icon: HeartPulse,
        details:
            'Support the chapter 24/7 ambulance service with patient loading, stretcher management, radio dispatch coordination, and safe transport to partner hospitals across Metro Manila.',
    },
];

const IMPACT_STATS = [
    { value: '1,200+', label: 'Active Volunteers' },
    { value: '24/7', label: 'Emergency Response' },
    { value: '9', label: 'Barangays Protected' },
    { value: '100%', label: 'Tested Safe Blood' },
];

const CORE_PILLARS = [
    {
        icon: Droplet,
        title: 'National Blood Service',
        description: 'Safe, screened, and adequate blood supplies available for hospital patients and critical trauma cases in Muntinlupa.',
        href: '/about',
        linkText: 'Learn About Blood Drives',
    },
    {
        icon: GraduationCap,
        title: 'Safety & First Aid Training',
        description: 'Certified CPR, BLS, workplace first aid, and community disaster safety trainings taught by accredited instructors.',
        href: '/about',
        linkText: 'Explore Training Programs',
    },
    {
        icon: ShieldAlert,
        title: 'Disaster Relief & Operations',
        description: 'Immediate humanitarian rescue, emergency relief supply distribution, and community welfare during disasters.',
        href: '/contact',
        linkText: 'Contact Emergency Desk',
    },
];

/* ──────────────────────────── SERVICE CARD (FLAT & CLEAN) ──────────────────────────── */

function ServiceCard({ card }) {
    const [expanded, setExpanded] = useState(false);
    const Icon = card.icon;

    return (
        <div className="min-w-[270px] sm:min-w-[290px] max-w-[310px] flex-shrink-0 bg-white rounded-2xl border border-gray-200/90 shadow-none overflow-hidden hover:border-red-400 transition-all duration-200 flex flex-col group snap-start">
            {/* Image */}
            <div className="h-44 overflow-hidden bg-gray-100 relative">
                <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                {/* Red Cross icon overlay */}
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-none">
                    <Icon className="w-4 h-4 text-red-600" />
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-red-600 transition-colors font-montserrat line-clamp-1">
                        {card.title}
                    </h3>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2.5 font-montserrat">
                        {card.subtitle}
                    </p>

                    {/* Expandable details */}
                    {expanded && (
                        <p className="text-xs text-gray-600 leading-relaxed mb-3 animate-fadeIn font-montserrat">
                            {card.details}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer self-start font-montserrat"
                >
                    <span>{expanded ? 'Hide details' : 'View details'}</span>
                    {expanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}

/* ──────────────────────────── 4D GLASSMORPHISM DEVICE SHOWCASE ──────────────────────────── */

function DeviceShowcase4D() {
    const cardRef = useRef(null);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setCoords({ x, y });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
    };

    // Calculate dynamic 4D tilt angles based on interaction
    const rotateX = isHovered ? -coords.y * 20 : 5;
    const rotateY = isHovered ? coords.x * 24 : -2;
    const glareX = 50 + coords.x * 100;
    const glareY = 50 + coords.y * 100;

    return (
        <div
            className="mt-10 sm:mt-14 flex justify-center w-full px-2"
            style={{ perspective: '1400px' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={cardRef}
                className="relative max-w-3xl w-full rounded-3xl overflow-hidden transition-all duration-300 ease-out"
                style={{
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${
                        isHovered ? 'scale3d(1.02, 1.02, 1.02)' : 'scale3d(0.98, 0.98, 0.98)'
                    }`,
                    transformStyle: 'preserve-3d',
                    // Pure Glassmorphism: translucent, blurred, zero heavy opaque card
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: isHovered
                        ? '0 35px 80px -15px rgba(0, 0, 0, 0.22), 0 0 35px rgba(220, 38, 38, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.7)'
                        : '0 25px 60px -15px rgba(0, 0, 0, 0.14), 0 0 20px rgba(255, 255, 255, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                }}
            >
                {/* 4D dynamic glass specular glare that tracks cursor movement */}
                <div
                    className="absolute inset-0 pointer-events-none rounded-3xl z-20 transition-opacity duration-300"
                    style={{
                        opacity: isHovered ? 0.6 : 0.2,
                        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 65%)`,
                    }}
                />

                {/* Subtle colorful ambient glow under glass */}
                <div
                    className="absolute -inset-2 pointer-events-none opacity-40 blur-2xl z-0 transition-transform duration-500"
                    style={{
                        background: 'radial-gradient(circle at 50% 100%, rgba(220, 38, 38, 0.25), transparent 70%)',
                        transform: `translate3d(${coords.x * 20}px, ${coords.y * 20}px, 0)`,
                    }}
                />

                {/* Device image floating inside pure glassmorphism pedestal */}
                <div
                    className="relative z-10 p-2 sm:p-4 transition-transform duration-300"
                    style={{
                        transform: `translateZ(25px) translate3d(${coords.x * 10}px, ${coords.y * 10}px, 0)`,
                    }}
                >
                    <img
                        src="/images/devices.png"
                        alt="Red Cross Volunteer Portal on multiple devices"
                        className="w-full h-auto rounded-2xl block drop-shadow-2xl"
                        loading="lazy"
                    />
                </div>

                {/* Floating 4D glass status pill with depth */}
                <div
                    className="absolute top-4 right-4 z-30 hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-800 pointer-events-none"
                    style={{
                        transform: 'translateZ(45px)',
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
                    }}
                >
                </div>
            </div>
        </div>
    );
}

/* ──────────────────────────── MAIN PAGE ──────────────────────────── */

export default function Welcome({ auth }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = 320;
        el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    const portalHref =
        auth?.user?.role === 'admin'
            ? '/admin/dashboard'
            : '/volunteer/dashboard';

    return (
        <PublicLayout title="Philippine Red Cross - Muntinlupa City Branch">
            {/* ──────────────── 1. HERO SECTION (CLEAN & CENTERED MATCHING REFERENCE) ──────────────── */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-24">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/muntinlupa-map.jpg"
                        alt="Muntinlupa City Map"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Soft ambient overlay to ensure it acts as a subtle background */}
                    <div className="absolute inset-0 bg-slate-900/10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/90" />
                </div>

                {/* ────── CENTER HERO CONTAINER ────── */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full text-center">
                    {/* Framed Card with Sleek Notch Design */}
                    <div className="relative mx-auto max-w-3xl bg-white/95 backdrop-blur-md rounded-[28px] sm:rounded-[36px] border border-gray-200/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] pt-0 px-6 sm:px-14 pb-12 sm:pb-16 overflow-hidden">
                        {/* Sleek Notch Design at Top Center */}
                        <div className="w-32 sm:w-44 h-5 sm:h-6 bg-gray-100/90 rounded-b-2xl mx-auto flex items-center justify-center gap-2 border-b border-x border-gray-200/80 mb-10 sm:mb-14 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-red-600/80 animate-pulse" />
                            <span className="w-10 h-1.5 rounded-full bg-gray-300" />
                        </div>

                        {/* Main Header H1 - Exactly matching reference setup */}
                        <FadeIn delay={0.06}>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-semibold tracking-tight leading-[1.12] mb-3.5 max-w-2xl mx-auto font-manrope">
                                <span className="text-gray-900 block">Verified, trusted,</span>
                                <span className="text-gray-400 block">ready to serve</span>
                            </h1>
                        </FadeIn>

                        {/* Subtitle */}
                        <FadeIn delay={0.1}>
                            <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8 font-montserrat font-normal">
                                Dedicated to saving lives, emergency response, and community care across Muntinlupa City.
                            </p>
                        </FadeIn>

                        {/* Primary CTA Button (Red Cross Red Pill) */}
                        <FadeIn delay={0.14}>
                            <div className="flex items-center justify-center">
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
                            </div>
                        </FadeIn>
                    </div>

                    {/* ── Steps to Volunteer (Clean Background Card for Full Visibility) ── */}
                    <FadeIn delay={0.2}>
                        <div className="mt-10 sm:mt-14 max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] py-6 sm:py-7 px-5 sm:px-10">
                            <div className="flex items-center justify-between relative">
                                {/* Connecting line behind steps */}
                                <div className="absolute top-5 left-[15%] right-[15%] h-[2px] bg-gray-200 z-0" />
                                <div className="absolute top-5 left-[15%] right-[65%] h-[2px] bg-red-500 z-0" />

                                {[
                                    { step: '1', label: 'Register', sublabel: 'Create account', done: true },
                                    { step: '2', label: 'Verify', sublabel: 'Wait for Admin Confirmation', done: false },
                                    { step: '3', label: 'Access Your Portal', sublabel: 'Use the portal', done: false },
                                ].map((s, i) => (
                                    <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold font-montserrat transition-all duration-300 ${
                                                s.done
                                                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                                                    : 'bg-white border-2 border-gray-300 text-gray-400'
                                            }`}
                                        >
                                            {s.done ? <Check className="w-5 h-5" /> : s.step}
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs sm:text-sm font-semibold text-gray-900 font-montserrat">{s.label}</div>
                                            <div className="text-[10px] sm:text-xs text-gray-500 font-montserrat font-medium">{s.sublabel}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>

                    {/* ── 4D Glassmorphism Device Showcase ── */}
                    <FadeIn delay={0.3}>
                        <DeviceShowcase4D />
                    </FadeIn>
                </div>
            </section>

            {/* ──────────────── 3. WHAT YOU'LL BE DOING (CAROUSEL) ──────────────── */}
            <section className="py-16 sm:py-24 bg-gray-50/60" id="services">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <FadeIn>
                        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-3.5 font-manrope">
                                What you'll be doing
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-montserrat">
                                As a Red Cross volunteer, you'll be trained and deployed across
                                these core service units in Muntinlupa City.
                            </p>
                        </div>
                    </FadeIn>

                    {/* Carousel Container */}
                    <FadeIn delay={0.1}>
                        <div className="relative">
                            {/* Left Arrow */}
                            {canScrollLeft && (
                                <button
                                    type="button"
                                    onClick={() => scroll('left')}
                                    className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-none flex items-center justify-center hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-5 h-5 text-red-600" />
                                </button>
                            )}

                            {/* Right Arrow */}
                            {canScrollRight && (
                                <button
                                    type="button"
                                    onClick={() => scroll('right')}
                                    className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-none flex items-center justify-center hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-5 h-5 text-red-600" />
                                </button>
                            )}

                            {/* Scrollable Cards */}
                            <div
                                ref={scrollRef}
                                className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory px-1"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {SERVICE_CARDS.map((card) => (
                                    <ServiceCard key={card.title} card={card} />
                                ))}
                            </div>
                        </div>
                    </FadeIn>

                    {/* Bottom CTA */}
                    <FadeIn delay={0.15}>
                        <div className="text-center mt-10 sm:mt-14">
                            <Link
                                href="/about"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold rounded-xl transition-colors duration-150 font-montserrat"
                            >
                                <span>Get to Know Us</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </PublicLayout>
    );
}