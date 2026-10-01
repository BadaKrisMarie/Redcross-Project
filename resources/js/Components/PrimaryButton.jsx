import React from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-xl border border-transparent bg-red-600 px-5 py-3 text-sm font-bold text-white transition duration-150 ease-in-out hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 ${
                    disabled && 'opacity-30 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
