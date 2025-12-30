const STORAGE_KEY = "pokemonSearchTerm";

/**
 * Get the persisted search term from local storage.
 * Returns empty string if not found or on error.
 */
export const getPersistedSearchTerm = (): string => {
    if (typeof window === "undefined") return "";

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            return stored;
        }
    } catch {
        // Ignore storage access errors
    }

    return "";
};

/**
 * Persist the search term to local storage.
 * If the value is empty, removes the key.
 */
export const setPersistedSearchTerm = (value: string): void => {
    if (typeof window === "undefined") return;

    try {
        if (value.trim() === "") {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, value);
        }
    } catch {
        // Ignore storage write errors
    }
};

/**
 * Clear the persisted search term from local storage.
 */
export const clearPersistedSearchTerm = (): void => {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Ignore storage errors
    }
};

