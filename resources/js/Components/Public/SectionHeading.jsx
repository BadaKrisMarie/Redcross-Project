import React from 'react';

/**
 * @param {Object} props
 * @param {string} props.title - Primary H2 heading text
 * @param {string} [props.subtitle] - Descriptive subtitle
 * @param {'left' | 'center'} [props.align='left'] - Text alignment
 * @param {boolean} [props.dark=false] - For dark backgrounds
 */
export default function SectionHeading({
    title,
    subtitle,
    align = 'left',
    dark = false,
}) {
    const isCenter = align === 'center';

    return (
        <div className={`mb-8 lg:mb-10 ${isCenter ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl'}`}>
            <h2
                className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-sans ${
                    dark ? 'text-white' : 'text-gray-900'
                }`}
            >
                {title}
            </h2>

            {subtitle && (
                <p
                    className={`mt-2 text-sm sm:text-base leading-relaxed ${
                        dark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}
