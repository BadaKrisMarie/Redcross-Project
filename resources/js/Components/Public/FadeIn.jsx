import React, { useState, useEffect, useRef } from 'react';

/**
 * Reusable FadeIn scroll-reveal component.
 * Performs a pure opacity fade-in transition when entering the viewport.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {number} [props.delay=0] - Transition delay in seconds
 * @param {number} [props.duration=700] - Transition duration in ms
 * @param {string} [props.className=''] - Additional CSS classes
 */
export default function FadeIn({
    children,
    delay = 0,
    duration = 700,
    className = '',
}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.08 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-opacity ease-out ${
                visible ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}s`,
            }}
        >
            {children}
        </div>
    );
}
