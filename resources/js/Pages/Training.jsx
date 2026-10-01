import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { TRAINING_COURSES } from '@/data/servicesData';
import { GraduationCap, Clock, Award, Shield, ArrowRight } from 'lucide-react';

export default function Training() {
    return (
        <PublicLayout title="Safety & First Aid Training - Philippine Red Cross">
            <PageHero
                title="Safety & First Aid Training"
                subtitle="DOLE-Accredited Life-Saving Certifications"
                description="Empowering individuals, schools, emergency responders, and corporate workplaces with hands-on CPR, AED operation, water safety, and disaster preparedness skills."
                breadcrumbs={[
                    { label: 'Services', href: '/about' },
                    { label: 'Training Services' },
                ]}
            />

            {/* Certified Training Courses Grid */}
            <SectionContainer bg="white">
                <FadeIn>
                    <SectionHeading
                        title="Certified Training Programs"
                        subtitle="Hands-on certifications taught by Red Cross licensed instructors in accordance with national safety standards."
                    />
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {TRAINING_COURSES.map((course, i) => (
                        <FadeIn key={course.id} delay={0.06 * i}>
                            <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 sm:p-8 flex flex-col justify-between hover:border-red-300 transition-colors duration-200 group h-full">
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                                            <Clock className="w-3.5 h-3.5" />
                                            {course.duration}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                        {course.description}
                                    </p>

                                    <div className="space-y-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                                        <div>
                                            <strong className="text-gray-900">Target Audience:</strong> {course.audience}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>{course.certification}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 mt-4 border-t border-gray-200 flex items-center justify-between">
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        <span>Inquire & Schedule</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </SectionContainer>

            {/* Corporate & Workplace Training Banner */}
            <SectionContainer bg="gray-50">
                <FadeIn>
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                Custom Corporate Safety & First Aid Training
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Equip your employees and designated safety officers with certified first-aider status to comply with Republic Act No. 11058 (Occupational Safety and Health Standards). Training can be conducted on-site at your facility or at our Muntinlupa training center.
                            </p>
                        </div>

                        <div className="shrink-0 w-full lg:w-auto">
                            <Link
                                href="/contact"
                                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
                            >
                                <span>Request Corporate Quotation</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </FadeIn>
            </SectionContainer>

            <CTASection
                title="Equip Yourself to Save a Life"
                description="Join over 10,000 individuals trained yearly in emergency first aid, CPR, and disaster response."
                primaryBtnText="Register as Volunteer"
                primaryBtnHref="/register"
                secondaryBtnText="Contact Training Office"
                secondaryBtnHref="/contact"
            />
        </PublicLayout>
    );
}
