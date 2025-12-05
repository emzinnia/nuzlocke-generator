import React from "react";

export const Keyboard: React.FC<{ shortcut: string }> = ({ shortcut }) => {
    return (
        <kbd className="px-1.5 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono">
            {shortcut}
        </kbd>
    );
};