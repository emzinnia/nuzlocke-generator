import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary';
};

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', disabled, ...props }) => {
    const baseClasses = 'p-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = variant === 'primary'
        ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'
        : 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <button
            className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
