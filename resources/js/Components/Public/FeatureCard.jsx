import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

/**
 * @param {Object} props
 * @param {React.ElementType} [props.icon] - Lucide icon component
 * @param {string} props.title - Card title
 * @param {string} props.description - Card body text
 * @param {string} [props.href] - Optional link URL
 * @param {string} [props.linkText] - Link label
 * @param {string} [props.className] - Extra class names
 */
export default function FeatureCard({
    icon: Icon,
    title,
    description,
    href,
    linkText = 'Learn More',
    className = '',
}) {
    const cardContent = (
        <div
            className={`h-full bg-white rounded-2xl border border-gray-200/90 shadow-none hover:border-red-400 transition-colors duration-200 p-6 sm:p-7 flex flex-col justify-between group ${className}`}
        >
            <div>
                {/* Header with Icon */}
                {Icon && (
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-200">
                        <Icon className="w-6 h-6" />
                    </div>
                )}

                {/* Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors font-montserrat">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-manrope">
                    {description}
                </p>
            </div>

            {/* Optional Action Link */}
            {href && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-red-600 group-hover:text-red-700 gap-1 font-manrope">
                    <span>{linkText}</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}
