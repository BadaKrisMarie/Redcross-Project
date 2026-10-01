import React from 'react';
import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import CTASection from '@/Components/Public/CTASection';
import FadeIn from '@/Components/Public/FadeIn';
import { BANK_ACCOUNTS, DONATION_POLICIES } from '@/data/servicesData';
import { Landmark, Smartphone, Gift, QrCode } from 'lucide-react';

export default function Donate() {
    return (
        <PublicLayout title="Donate & Support - Philippine Red Cross">
            <PageHero
                title="Donate to Save Lives"
                subtitle="Support Disaster Relief, Blood Services & Community Assistance"
                description="Your financial support empowers the Philippine Red Cross Muntinlupa City Branch to rapidly deploy relief goods, operate emergency ambulances, and deliver primary health care to vulnerable communities."
                breadcrumbs={[
                    { label: 'Services', href: '/about' },
                    { label: 'Donate & Support' },
                ]}
            />

            {/* Direct Bank Transfer Section */}
            <SectionContainer bg="white">
                <FadeIn>
                    <SectionHeading
                        title="Official Chapter Bank Accounts"
                        subtitle="Deposit or transfer directly to accredited Philippine Red Cross Muntinlupa bank accounts. Official receipts are issued for all contributions."
                    />
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {BANK_ACCOUNTS.map((acc, i) => (
                        <FadeIn key={acc.bank} delay={0.06 * i}>
                            <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 sm:p-7 flex flex-col justify-between hover:border-red-300 transition-colors duration-200 h-full">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                                            <Landmark className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-base">
                                            {acc.bank}
                                        </h3>
                                    </div>

                                    <div className="space-y-3 text-xs sm:text-sm">
                                        <div>
                                            <span className="text-gray-500 block text-[11px] font-medium">Account Name:</span>
                                            <span className="font-semibold text-gray-900">{acc.accountName}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-[11px] font-medium">Account Number:</span>
                                            <span className="font-black text-red-700 font-mono text-base tracking-wider">{acc.accountNumber}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-[11px] font-medium">Branch:</span>
                                            <span className="text-gray-700">{acc.branch}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </SectionContainer>

            {/* GCash / Digital Wallet & In-Kind Guidelines */}
            <SectionContainer bg="gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* E-Wallet GCash Box */}
                    <div className="lg:col-span-5">
                        <FadeIn delay={0.05}>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 space-y-4 h-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">GCash / Maya</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Scan the official Philippine Red Cross Muntinlupa QR code on-site at the chapter office or via banking apps supporting QR Ph.
                                </p>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-gray-500">Chapter Hotline for Confirmation:</div>
                                        <div className="font-bold text-gray-900 text-sm">(02) 8641-5364</div>
                                    </div>
                                    <QrCode className="w-8 h-8 text-gray-400" />
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* In-Kind Donation Policies */}
                    <div className="lg:col-span-7">
                        <FadeIn delay={0.1}>
                            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 space-y-4 h-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                        <Gift className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">In-Kind Donations & Policy</h3>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {DONATION_POLICIES.map((policy) => (
                                        <div key={policy.title} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="font-bold text-gray-900 text-sm mb-1">{policy.title}</div>
                                            <div className="text-xs text-gray-600 leading-relaxed">{policy.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </SectionContainer>

            <CTASection
                title="Every Peso Makes a Difference"
                description="Become a regular donor or registered volunteer to ensure our chapter is always ready to respond to emergencies in Muntinlupa City."
            />
        </PublicLayout>
    );
}
