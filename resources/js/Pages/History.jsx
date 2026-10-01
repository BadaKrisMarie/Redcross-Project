import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import PageHero from '@/Components/Public/PageHero';
import SectionContainer from '@/Components/Public/SectionContainer';
import SectionHeading from '@/Components/Public/SectionHeading';
import CTASection from '@/Components/Public/CTASection';
import ImageModal from '@/Components/Public/ImageModal';
import FadeIn from '@/Components/Public/FadeIn';
import {
    HISTORICAL_MILESTONES,
    SEVEN_PRINCIPLES,
} from '@/data/historyData';
import { OUTREACH_STORIES } from '@/data/aboutData';
import { Calendar, ZoomIn, Clock } from 'lucide-react';

export default function History() {
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <PublicLayout title="History & Heritage - Philippine Red Cross">
            <PageHero
                title="Our History & Legacy of Service"
                subtitle="Philippine Red Cross - Rizal Chapter Muntinlupa"
                description="Tracing our roots from the Battle of Solferino in 1859 to the founding of the Philippine Red Cross in 1947, and our steadfast service in Muntinlupa City."
                breadcrumbs={[
                    { label: 'About Us', href: '/about' },
                    { label: 'Our History' },
                ]}
            />

            {/* National Historical Milestones */}
            <SectionContainer bg="white">
                <FadeIn>
                    <SectionHeading
                        title="Key Milestones of the Philippine Red Cross"
                        subtitle="From wartime battlefield relief to the nation's premier independent humanitarian organization."
                    />
                </FadeIn>

                <div className="space-y-6 max-w-4xl mx-auto">
                    {HISTORICAL_MILESTONES.map((item, i) => (
                        <FadeIn key={item.year} delay={0.05 * i}>
                            <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 hover:border-red-300 transition-colors duration-200">
                                <div className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-lg tracking-wider shrink-0 font-sans">
                                    {item.year}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900 font-sans">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </SectionContainer>

            {/* Historical Outreach & Relief Archive */}
            <SectionContainer bg="gray-50">
                <FadeIn>
                    <SectionHeading
                        title="Historical Archives & Community Relief"
                        subtitle="A retrospective of community missions, relief distributions, and volunteer outreach."
                        align="center"
                    />
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {OUTREACH_STORIES.map((story, i) => (
                        <FadeIn key={story.id} delay={0.05 * i}>
                            <div
                                onClick={() => setSelectedImage({ src: story.image, title: story.title, desc: story.fullDesc })}
                                className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer aspect-4/3"
                            >
                                <img
                                    src={story.image}
                                    alt={story.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-sm text-white">{story.title}</h4>
                                            <span className="text-xs text-gray-300">{story.location}</span>
                                        </div>
                                        <ZoomIn className="w-5 h-5 text-white/80" />
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </SectionContainer>

            {selectedImage && (
                <ImageModal
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    image={selectedImage}
                />
            )}

            <CTASection />
        </PublicLayout>
    );
}
