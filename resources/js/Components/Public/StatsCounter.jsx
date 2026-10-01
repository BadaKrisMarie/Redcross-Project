import React from 'react';

/**
 * @param {Object} props
 * @param {Array<{num: string, label: string, desc?: string}>} props.stats
 * @param {'light' | 'dark'} [props.variant='light']
 */
export default function StatsCounter({ stats, variant = 'light' }) {
    const isDark = variant === 'dark';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map(({ num, label, desc }, idx) => (
                <div
                    key={idx}
                    className={`rounded-2xl p-6 sm:p-7 border transition-colors duration-200 ${
                        isDark
                            ? 'bg-gray-900/80 border-gray-800 text-white'
                            : 'bg-white border-gray-200 hover:border-red-300'
                    }`}
                >
                    <div className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight mb-2">
                        {num}
                    </div>
                    <div
                        className={`text-base font-bold mb-1 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                        {label}
                    </div>
                    {desc && (
                        <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            {desc}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
