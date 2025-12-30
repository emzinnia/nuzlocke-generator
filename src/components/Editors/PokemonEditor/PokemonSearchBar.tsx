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
        margin-left: auto;
        width: 100%;
        padding-left: 2rem;
        padding-right: 1rem;
        display: flex;
        align-items: center;
    `,
    inputWrapper: css`
        position: relative;
        flex: 1;
    `,
    input: css`
        margin: 0.25rem;
        width: 100%;
        padding-right: 2rem;
    `,
    hotkeyIndicator: css`
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
    `,
    helpPopover: css`
        margin-left: 0.5rem;
    `,
    error: css`
        color: #c23030;
        font-size: 0.85rem;
        padding: 0.25rem 0.5rem;
        margin-bottom: 0.5rem;

        .dark & {
            color: #ff6b6b;
        }
    `,
    warning: css`
        color: #bf7326;
        font-size: 0.85rem;
        padding: 0.25rem 0.5rem;
        margin-bottom: 0.5rem;

        .dark & {
            color: #ffc107;
        }

        code {
            background: rgba(92, 112, 128, 0.15);
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
            font-family: "SF Mono", "Consolas", "Monaco", monospace;
            font-size: 0.8rem;
        }

        .dark & code {
            background: rgba(255, 255, 255, 0.1);
            color: #ffc107;
        }
    `,
    noResults: css`
        color: #5c7080;
        font-size: 0.9rem;
        padding: 0.5rem;
        text-align: center;
        font-style: italic;

        .dark & {
            color: #a7b6c2;
        }
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
