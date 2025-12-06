import React from "react";

export interface CollapsibleProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
    title,
    defaultOpen = false,
    children,
    className,
}) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className={`p-2 rounded-sm h-full bg-card text-card-foreground ${className || ''}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-left cursor-pointer ${!isOpen ? 'pb-0' : 'pb-3'}`}
            >
                <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">
                    {title}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="">
                    {children}
                </div>
            )}
        </div>
    );
};

