import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * @param {Object} props
 * @param {Array<{title?: string, q?: string, content?: string | string[], a?: string}>} props.items
 * @param {number} [props.defaultOpenIndex=-1]
 * @param {string} [props.className='']
 */
export default function Accordion({ items, defaultOpenIndex = -1, className = '' }) {
    const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

    const toggle = (idx) => {
        setOpenIndex((prev) => (prev === idx ? -1 : idx));
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {items.map((item, idx) => {
                const isOpen = openIndex === idx;
                const headerText = item.title || item.q;
                const bodyContent = item.content || item.a;

                return (
                    <div
                        key={idx}
                        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                            isOpen
                                ? 'bg-white border-red-200'
                                : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100/70'
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => toggle(idx)}
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-gray-900 focus:outline-none"
                        >
                            <span className="text-sm sm:text-base leading-snug">{headerText}</span>
                            <span
                                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 ${
                                    isOpen
                                        ? 'bg-red-600 text-white rotate-180'
                                        : 'bg-gray-200 text-gray-600'
                                }`}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </span>
                        </button>

                        {isOpen && (
                            <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100">
                                {Array.isArray(bodyContent) ? (
                                    bodyContent.map((paragraph, pIdx) => (
                                        <p key={pIdx} className="mb-3 last:mb-0">
                                            {paragraph}
                                        </p>
                                    ))
                                ) : (
                                    <p>{bodyContent}</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
