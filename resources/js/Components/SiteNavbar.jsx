import React, { useState, useEffect, useRef } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import {
    Menu,
    X,
    ChevronDown,
    Heart,
    LogIn,
    ExternalLink,
    ArrowRight,
    Users,
    Shield,
    Phone,
    MapPin,
    Calendar,
    FileText,
} from 'lucide-react';

export default function SiteNavbar() {
    const { url = '' } = usePage();
    const { auth } = usePage().props || {};
    const [openNav, setOpenNav] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSubmenu, setMobileSubmenu] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef(null);

    const isHome = url === '/' || url === '';
    const isAbout = url.startsWith('/about');
    const isVolunteer = url.startsWith('/volunteer-info') || url.startsWith('/volunteer');
    const isContact = url.startsWith('/contact');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setOpenNav(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const volunteerLinks = [
        { label: 'Become a Volunteer', href: '/volunteer-info/become' },
        { label: 'Red Cross 143 Program', href: '/volunteer-info/become#red-cross-143' },
        { label: 'Volunteer FAQs', href: '/volunteer-info/become#faqs' },
        { label: 'Register Account', href: '/register' },
    ];


    const portalHref =
        auth?.user?.role === 'admin'
            ? '/admin/dashboard'
            : '/volunteer/dashboard';

    return (
        <>
            {/* FLOATING PILL NAVBAR */}
            <header
                ref={navRef}
                className="fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none font-sans"
            >
                <div
                    className="max-w-6xl mx-auto bg-white rounded-full border-0 shadow-none px-4 sm:px-7 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto transition-all duration-200"
                >
                    {/* LEFT BRANDING: RED CROSS EMBLEM + RIZAL CHAPTER / Muntinlupa City Branch */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none shrink-0"
                    >
                        <img
                            src="/images/redcross-logo.png"
                            alt="Philippine Red Cross Logo"
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div
                            style={{ display: 'none' }}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white items-center justify-center font-semibold text-lg font-montserrat"
                        >
                            +
                        </div>
                        <div className="text-left flex flex-col justify-center leading-tight">
                            <span className="text-xs sm:text-sm font-semibold tracking-tight uppercase text-[#8B1E1E] font-montserrat">
                                RIZAL CHAPTER
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium tracking-normal font-montserrat">
                                Muntinlupa City Branch
                            </span>
                        </div>
                    </Link>

                    {/* CENTER NAVIGATION LINKS (Home, About Us, Volunteer, Contact Us) */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        {/* HOME LINK */}
                        <Link
                            href="/"
                            className={`relative py-1 text-sm font-semibold transition-colors ${
                                isHome
                                    ? 'text-[#8B1E1E] font-semibold'
                                    : 'text-gray-700 hover:text-[#8B1E1E]'
                            }`}
                        >
                            <span>Home</span>
                            {isHome && (
                                <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#8B1E1E] rounded-full" />
                            )}
                        </Link>

                        {/* ABOUT US LINK */}
                        <Link
                            href="/about"
                            className={`relative py-1 text-sm font-semibold transition-colors ${
                                isAbout
                                    ? 'text-[#8B1E1E] font-semibold'
                                    : 'text-gray-700 hover:text-[#8B1E1E]'
                            }`}
                        >
                            <span>About Us</span>
                            {isAbout && (
                                <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#8B1E1E] rounded-full" />
                            )}
                        </Link>

                        {/* VOLUNTEER (with clean white dropdown) */}
                        <div
                            className="relative py-1"
                            onMouseEnter={() => setOpenNav('volunteer')}
                            onMouseLeave={() => setOpenNav(null)}
                        >
                            <Link
                                href="/volunteer-info/become"
                                className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors cursor-pointer ${
                                    isVolunteer
                                        ? 'text-[#8B1E1E] font-semibold'
                                        : 'text-gray-700 hover:text-[#8B1E1E]'
                                }`}
                            >
                                <span>Volunteer</span>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${
                                        openNav === 'volunteer' ? 'rotate-180 text-red-700' : ''
                                    }`}
                                />
                            </Link>

                            {openNav === 'volunteer' && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                                    <div className="w-52 bg-white rounded-xl border border-gray-100 shadow-none p-2 space-y-0.5 text-left animate-fadeIn">
                                        {volunteerLinks.map((item) => (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                onClick={() => setOpenNav(null)}
                                                className="block px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CONTACT US LINK */}
                        <Link
                            href="/contact"
                            className={`relative py-1 text-sm font-semibold transition-colors ${
                                isContact
                                    ? 'text-[#8B1E1E] font-semibold'
                                    : 'text-gray-700 hover:text-[#8B1E1E]'
                            }`}
                        >
                            <span>Contact Us</span>
                            {isContact && (
                                <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#8B1E1E] rounded-full" />
                            )}
                        </Link>
                    </nav>

                    {/* RIGHT ACTIONS: Log In + Sign Up (pill button) */}
                    <div className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
                        {auth?.user ? (
                            <Link
                                href={portalHref}
                                className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full transition-colors duration-150"
                            >
                                <span>Portal</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#8B1E1E] transition-colors px-2 py-1"
                                >
                                    Log In
                                </Link>

                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center justify-center px-5 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full transition-colors duration-150"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* MOBILE TOGGLE & QUICK ACTION */}
                    <div className="flex md:hidden items-center gap-2">
                        {auth?.user ? (
                            <Link
                                href={portalHref}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-full"
                            >
                                Portal
                            </Link>
                        ) : (
                            <Link
                                href={route('register')}
                                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-full"
                            >
                                Sign Up
                            </Link>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="p-1.5 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none transition"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* MOBILE MENU ACCORDION DRAWER */}
                {mobileMenuOpen && (
                    <div className="md:hidden max-w-6xl mx-auto mt-2 bg-white rounded-2xl border border-gray-100 shadow-none p-4 pointer-events-auto space-y-3 animate-fadeIn text-left">
                        <div className="space-y-1 divide-y divide-gray-100">
                            {/* Home */}
                            <div className="py-2">
                                <Link
                                    href="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block text-sm font-semibold ${
                                        isHome ? 'text-[#8B1E1E]' : 'text-gray-800'
                                    }`}
                                >
                                    Home
                                </Link>
                            </div>

                            {/* About Us */}
                            <div className="py-2">
                                <Link
                                    href="/about"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block text-sm font-semibold ${
                                        isAbout ? 'text-[#8B1E1E]' : 'text-gray-800'
                                    }`}
                                >
                                    About Us
                                </Link>
                            </div>

                            {/* Volunteer */}
                            <div className="py-2">
                                <div className="flex items-center justify-between">
                                    <Link
                                        href="/volunteer-info/become"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-sm font-semibold text-gray-800"
                                    >
                                        Volunteer
                                    </Link>
                                    <button
                                        onClick={() =>
                                            setMobileSubmenu((prev) =>
                                                prev === 'volunteer' ? null : 'volunteer'
                                            )
                                        }
                                        className="p-1 text-gray-400"
                                    >
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${
                                                mobileSubmenu === 'volunteer' ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                </div>
                                {mobileSubmenu === 'volunteer' && (
                                    <div className="pl-3 pt-2 space-y-1.5">
                                        {volunteerLinks.map((item) => (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block text-xs font-medium text-gray-600 hover:text-red-700"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Contact Us */}
                            <div className="py-2">
                                <Link
                                    href="/contact"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block text-sm font-semibold ${
                                        isContact ? 'text-[#8B1E1E]' : 'text-gray-800'
                                    }`}
                                >
                                    Contact Us
                                </Link>
                            </div>

                            {/* Donate */}
                            <div className="py-2">
                                <Link
                                    href="/donate"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-red-600"
                                >
                                    <Heart className="w-4 h-4 fill-red-600 text-red-600" />
                                    <span>Donate to Muntinlupa Branch</span>
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Auth Buttons */}
                        <div className="pt-2 flex flex-col gap-2">
                            {auth?.user ? (
                                <Link
                                    href={portalHref}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-none"
                                >
                                    Go to Portal
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-none"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-none"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* SPACER FOR NON-HOME PAGES SO CONTENT NEVER GETS COVERED */}
            {!isHome && <div className="h-20 sm:h-24" />}
        </>
    );
}