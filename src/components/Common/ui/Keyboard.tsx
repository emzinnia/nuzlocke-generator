import React from "react";

export const Keyboard: React.FC<{ key: string, label?: string }> = ({ key, label }) => {
    return (
        <kbd
            className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
        >
            {label ?? key}
        </kbd>
    );
};