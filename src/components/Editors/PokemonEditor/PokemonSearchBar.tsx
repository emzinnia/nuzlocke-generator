import * as React from "react";
import { Classes } from "components/ui/shims";
import { Icon } from "components/ui";
import { css } from "emotion";
import { HotkeyIndicator } from "components/Common/Shared";
import { SearchHelpPopover } from "./SearchHelpPopover";
import { searchPokemon, SearchResult } from "utils/search";
import type { Pokemon } from "models";

const styles = {
    container: css`
        display: flex;
        align-items: center;
    `,
    inputWrapper: css`
        position: relative;
        flex: 1;
    `,
    input: css`
        width: 100%;
        padding-right: 2rem;
        background: var(--input-bg);
        border: 1px solid var(--color-border-default);
        border-radius: var(--radius-md);
        transition: border-color var(--duration-fast) var(--ease-in-out),
                    box-shadow var(--duration-fast) var(--ease-in-out);
        
        &:focus {
            border-color: var(--color-primary-500);
            box-shadow: 0 0 0 2px var(--color-primary-100);
        }
        
        .dark &:focus {
            box-shadow: 0 0 0 2px var(--color-primary-900);
        }
    `,
    hotkeyIndicator: css`
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
    `,
    helpPopover: css`
        margin-left: 0.5rem;
        opacity: 0.7;
        transition: opacity var(--duration-fast) var(--ease-in-out);
        
        &:hover {
            opacity: 1;
        }
    `,
    error: css`
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-danger-600);
        font-size: 0.85rem;
        padding: 0.5rem 0.75rem;
        margin: 0.5rem 0;
        background: var(--color-danger-50);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-danger-200);

        .dark & {
            color: var(--color-danger-400);
            background: var(--color-danger-950);
            border-color: var(--color-danger-900);
        }
    `,
    warning: css`
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-warning-700);
        font-size: 0.85rem;
        padding: 0.5rem 0.75rem;
        margin: 0.5rem 0;
        background: var(--color-warning-50);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-warning-200);

        .dark & {
            color: var(--color-warning-400);
            background: var(--color-warning-950);
            border-color: var(--color-warning-900);
        }

        code {
            background: var(--color-warning-100);
            padding: 0.1rem 0.4rem;
            border-radius: var(--radius-sm);
            font-family: var(--font-mono);
            font-size: 0.8rem;
            font-weight: 500;
        }

        .dark & code {
            background: var(--color-warning-900);
        }
    `,
    noResults: css`
        color: var(--color-text-tertiary);
        font-size: 0.9rem;
        padding: 0.75rem;
        text-align: center;
        font-style: italic;
        background: var(--color-bg-secondary);
        border-radius: var(--radius-md);
        margin: 0.5rem 0;
    `,
};

export interface PokemonSearchBarProps {
    /** Current search term value */
    value: string;
    /** Callback when search term changes */
    onChange: (value: string) => void;
    /** Optional custom placeholder */
    placeholder?: string;
    /** Optional custom className for the container */
    className?: string;
    /** Optional custom style for the container */
    style?: React.CSSProperties;
}

/**
 * Search input with hotkey indicator and help popover.
 * This is a controlled component - parent manages the search term state.
 */
export const PokemonSearchBar: React.FC<PokemonSearchBarProps> = ({
    value,
    onChange,
    placeholder = "Search...",
    className,
    style,
}) => {
    return (
        <div className={`${styles.container} ${className ?? ""}`} style={style}>
            <div className={styles.inputWrapper}>
                <input
                    type="search"
                    placeholder={placeholder}
                    className={`${Classes.INPUT} ${styles.input}`}
                    data-testid="pokemon-search"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <HotkeyIndicator
                    hotkey="/"
                    showModifier={false}
                    className={styles.hotkeyIndicator}
                />
            </div>
            <SearchHelpPopover className={styles.helpPopover} />
        </div>
    );
};

export interface SearchFeedbackProps {
    /** Search result containing errors, warnings, and matched IDs */
    searchResult: SearchResult;
    /** Whether a search query is active */
    hasSearchQuery: boolean;
}

/**
 * Displays search errors, warnings, and "no results" messages.
 */
export const SearchFeedback: React.FC<SearchFeedbackProps> = ({
    searchResult,
    hasSearchQuery,
}) => {
    const { errors, warnings, matchedIds } = searchResult;

    return (
        <>
            {errors.length > 0 && (
                <div className={styles.error}>
                    <Icon icon="warning-sign" style={{ marginRight: "0.5rem" }} />
                    {errors[0].message}
                </div>
            )}
            {warnings.length > 0 && warnings[0].suggestion && (
                <div className={styles.warning}>
                    Did you mean <code>{warnings[0].suggestion}</code>?
                </div>
            )}
            {hasSearchQuery && matchedIds.size === 0 && (
                <div className={styles.noResults}>
                    No Pokémon match your search
                </div>
            )}
        </>
    );
};

export interface UseSearchResult {
    /** Current search term */
    searchTerm: string;
    /** Update the search term */
    setSearchTerm: (value: string) => void;
    /** Whether a search query is active (non-empty) */
    hasSearchQuery: boolean;
    /** The search result (matched IDs, errors, warnings) */
    searchResult: SearchResult;
}

/**
 * Hook to manage Pokémon search state.
 * Handles the search term, computes matches, and provides feedback.
 */
export function usePokemonSearch(team: Pokemon[]): UseSearchResult {
    const [searchTerm, setSearchTerm] = React.useState("");
    
    const hasSearchQuery = searchTerm.trim().length > 0;
    const searchResult = React.useMemo(
        () => searchPokemon(team, searchTerm),
        [team, searchTerm]
    );

    return {
        searchTerm,
        setSearchTerm,
        hasSearchQuery,
        searchResult,
    };
}
