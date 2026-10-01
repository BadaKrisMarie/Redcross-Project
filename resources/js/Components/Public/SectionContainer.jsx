import React from 'react';

/**
 * @param {Object} props
 * @param {'white' | 'gray-50' | 'red-50' | 'gray-950'} [props.bg='white']
 * @param {string} [props.className='']
 * @param {string} [props.id]
 * @param {React.ReactNode} props.children
 */
export default function SectionContainer({
    bg = 'white',
    className = '',
    id,
    children,
}) {
    const bgClasses = {
        white: 'bg-white text-gray-900',
        'gray-50': 'bg-gray-50 text-gray-900 border-y border-gray-100',
        'red-50': 'bg-red-50/50 text-gray-900 border-y border-red-100/60',
        'gray-950': 'bg-gray-950 text-white',
    }[bg] || 'bg-white text-gray-900';

    return (
        <section id={id} className={`py-12 lg:py-16 font-sans ${bgClasses} ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </section>
    );
}
