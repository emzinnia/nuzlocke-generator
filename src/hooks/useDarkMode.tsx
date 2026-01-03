import { useState, useEffect, createContext, useContext, useCallback } from "react";
import * as React from "react";

const STORAGE_KEY = "dark-mode";

function getStoredPreference(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

interface DarkModeContextType {
    isDark: boolean;
    toggle: () => void;
    setIsDark: (value: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | null>(null);

function getInitialDarkMode(): boolean {
    const saved = getStoredPreference();
    if (saved !== null) return saved === "true";
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(getInitialDarkMode);

    // Apply dark class to document
    useEffect(() => {
        if (typeof document === "undefined") return;
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, String(isDark));
        } catch {
            // Ignore storage access errors
        }
    }, [isDark]);

    // Listen for system preference changes
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            // Only auto-switch if user hasn't explicitly set a preference
            if (getStoredPreference() === null) {
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
