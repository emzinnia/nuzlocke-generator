import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary';
};

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', disabled, ...props }) => {
    const baseClasses = 'p-2 text-sm cursor-pointer border border-border  transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = variant === 'primary'
        ? 'bg-primary hover:bg-primary/90 text-white focus:ring-primary'
        : 'bg-secondary hover:bg-secondary/90 text-white focus:ring-secondary';
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
