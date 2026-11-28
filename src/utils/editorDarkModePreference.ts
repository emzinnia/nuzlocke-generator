const STORAGE_KEY = "editorDarkMode";

const prefersDarkScheme = (): boolean => {
    if (typeof window === "undefined") return false;
    if (typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const readLegacyPersistedPreference = (): boolean | undefined => {
    if (typeof window === "undefined") return undefined;
    try {
        const raw = window.localStorage.getItem("persist:root");
        if (!raw) return undefined;
        const parsed = JSON.parse(raw);
        const styleString = parsed?.style;
        if (typeof styleString === "string") {
            const parsedStyle = JSON.parse(styleString);
            if (typeof parsedStyle?.editorDarkMode === "boolean") {
                return parsedStyle.editorDarkMode;
            }
        }
    } catch {
        // Ignore malformed legacy data
    }
    return undefined;
};

export const getEditorDarkModePreference = (): boolean => {
    if (typeof window === "undefined") return false;

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (typeof parsed === "boolean") {
                return parsed;
            }
        }
    } catch {
        // Ignore storage access errors
    }

    const legacyPreference = readLegacyPersistedPreference();
    if (typeof legacyPreference === "boolean") {
        return legacyPreference;
    }

    return prefersDarkScheme();
};

export const setEditorDarkModePreference = (value: boolean) => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // Ignore storage write errors
    }
};

