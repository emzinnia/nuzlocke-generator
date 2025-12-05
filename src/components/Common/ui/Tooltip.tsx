import React, { useState } from "react";

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
}

const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = "top",
}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    className={`absolute z-50 px-3 py-2 text-sm bg-gray-800 dark:bg-gray-700 text-white rounded-md shadow-lg whitespace-nowrap ${positionClasses[position]}`}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

