import { useState, useEffect, createContext, useContext, useCallback } from "react";
import * as React from "react";

const STORAGE_KEY = "dark-mode";

interface DarkModeContextType {
    isDark: boolean;
    toggle: () => void;
    setIsDark: (value: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | null>(null);

function getInitialDarkMode(): boolean {
    // Check localStorage first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
        return saved === "true";
    }
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(getInitialDarkMode);

    // Apply dark class to document
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem(STORAGE_KEY, String(isDark));
    }, [isDark]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            // Only auto-switch if user hasn't explicitly set a preference
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === null) {
                setIsDark(e.matches);
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggle = useCallback(() => setIsDark((prev) => !prev), []);

    const value = React.useMemo(() => ({ isDark, toggle, setIsDark }), [isDark, toggle]);

    return (
        <DarkModeContext.Provider value={value}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode(): DarkModeContextType {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error("useDarkMode must be used within a DarkModeProvider");
    }
    return context;
}
