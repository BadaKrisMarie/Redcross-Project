import React from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-bold text-gray-700 mb-1.5 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
