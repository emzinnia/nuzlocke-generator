import * as React from "react";

import { Card, Elevation, Tabs, Tab, Checkbox } from "@blueprintjs/core";
import { Pokemon, Game } from "models";
import { State } from "state";
import { getGameGeneration, typeToColor, getContrastColor } from "utils";
import { Generation } from "utils/getters/getGameGeneration";
import { getTypeChartForGeneration, POKEMON_TYPES, buildTeamMatchups } from "utils/typeMatchups";
import * as styles from "./TypeMatchupDialog.styles";

interface TypeMatchupSummaryProps {
    pokemon: Pokemon[];
    game: Game;
    customTypes: State["customTypes"];
    style: State["style"];
    /** IDs of pokemon temporarily removed from team (local state) */
    removedFromTeam?: Set<string>;
    /** IDs of pokemon temporarily added to team (local state) */
    addedToTeam?: Set<string>;
}

export const TypeMatchupSummary: React.FC<TypeMatchupSummaryProps> = ({
    pokemon,
    game,
    customTypes,
    style,
    removedFromTeam,
    addedToTeam,
}) => {
    const [useAbilityMatchups, setUseAbilityMatchups] = React.useState(false);
    const generation: Generation = React.useMemo(
        () => getGameGeneration(game.name),
        [game.name],
    );

    const chart = React.useMemo(() => getTypeChartForGeneration(generation), [generation]);

    // Original team (without any local swaps)
    const originalTeamPokemon = React.useMemo(
        () => pokemon?.filter((p) => p?.status === "Team" && !p?.hidden) ?? [],
        [pokemon],
    );

    // Build team-specific matchups (accounting for local swap state)
    const teamPokemon = React.useMemo(
        () => pokemon?.filter((p) => {
            const isOnTeam = p?.status === "Team" && !p?.hidden;
            const wasRemoved = removedFromTeam?.has(p.id);
            const wasAdded = addedToTeam?.has(p.id);
            return (isOnTeam && !wasRemoved) || wasAdded;
        }) ?? [],
        [pokemon, removedFromTeam, addedToTeam],
    );

    const hasSwaps = (removedFromTeam?.size ?? 0) > 0 || (addedToTeam?.size ?? 0) > 0;

    // Original matchups (for comparison)
    const originalMatchups = React.useMemo(
        () => buildTeamMatchups(originalTeamPokemon, generation, { useAbilityMatchups }),
        [originalTeamPokemon, generation, useAbilityMatchups],
    );

    // Build a lookup map for original matchups by type
    const originalMatchupsMap = React.useMemo(
        () => new Map(originalMatchups.map((m) => [m.type, m])),
        [originalMatchups],
    );

    const teamMatchups = React.useMemo(
        () => buildTeamMatchups(teamPokemon, generation, { useAbilityMatchups }),
        [teamPokemon, generation, useAbilityMatchups],
    );

    const handleAbilityToggle = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setUseAbilityMatchups(e.target.checked);
        },
        [],
    );

    // This renders inside a Blueprint dialog, so use Blueprint's readable defaults.
    // (Using style.bgColor here can produce low-contrast text against the dialog background.)
    const textColor = style?.editorDarkMode ? "#F5F8FA" : "#182026";

    const abilityToggle = (
        <div className={styles.typeMatchupsOptions}>
            <Checkbox
                checked={useAbilityMatchups}
                onChange={handleAbilityToggle}
                label="Include Ability Effects"
                style={{ marginBottom: 0 }}
            />
            <span className={styles.typeMatchupsOptionsHint} style={{ color: textColor }}>
                (e.g., Levitate, Flash Fire, Thick Fat)
            </span>
        </div>
    );

    // Heatmap: opacity scales with count (max at teamSize)
    const teamSize = teamPokemon.length || 1;
    const getHeatmapStyle = (count: number, baseColor: string) => {
        if (count === 0) return undefined;
        // Scale opacity from 0.2 (min) to 0.9 (max) based on count relative to team size
        const opacity = 0.2 + (count / teamSize) * 0.7;
        const useWhiteText = opacity > 0.4;
        return {
            backgroundColor: baseColor.replace(')', `, ${opacity})`).replace('rgb', 'rgba'),
            color: useWhiteText ? "#fff" : undefined,
            fontWeight: 700 as const,
        };
    };

    const renderMultiplier = (m: number) => {
        if (m === 0) return "0×";
        if (m === 0.5) return "½×";
        if (m === 2) return "2×";
        return "1×";
    };

    // Render delta indicator for matchup changes
    const renderDelta = (current: number, original: number) => {
        const delta = current - original;
        if (delta === 0) return null;
        const color = delta > 0 ? "#e74c3c" : "#27ae60"; // red for increase (bad for weak), green for decrease
        return (
            <span style={{ fontSize: "0.7em", marginLeft: "0.25rem", color, fontWeight: 700 }}>
                {delta > 0 ? `+${delta}` : delta}
            </span>
        );
    };

    // For resist/immune, increasing is good (green), decreasing is bad (red)
    const renderDeltaInverse = (current: number, original: number) => {
        const delta = current - original;
        if (delta === 0) return null;
        const color = delta > 0 ? "#27ae60" : "#e74c3c"; // green for increase (good), red for decrease
        return (
            <span style={{ fontSize: "0.7em", marginLeft: "0.25rem", color, fontWeight: 700 }}>
                {delta > 0 ? `+${delta}` : delta}
            </span>
        );
    };

    const summaryPanel = (
        <div className={styles.sectionSpacing}>
            {abilityToggle}
            {teamPokemon.length > 0 ? (
                <>
                    <div className={styles.typeMatchupsCaption} style={{ marginBottom: "0.5rem" }}>
                        Team Coverage
                    </div>
                    <div className={styles.typeMatchupsTableWrapper}>
                        <table
                            className={`${styles.matchupTable} ${styles.teamMatchupTable}`}
                            style={{ width: "100%" }}
                        >
                            <thead>
                                <tr>
                                    <th style={{ width: "4rem" }}>Type</th>
                                    <th title="Team members weak to this type">Weak</th>
                                    <th title="Team members that resist this type">Resist</th>
                                    <th title="Team members immune to this type">Immune</th>
                                    <th title="Team members neutral to this type">Neutral</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMatchups.map((row) => {
                                    const cellBg = typeToColor(row.type, customTypes) ?? style?.accentColor ?? "#394b59";
                                    const cellText = getContrastColor(cellBg);
                                    const original = originalMatchupsMap.get(row.type);

                                    return (
                                        <tr key={row.type}>
                                            <td
                                                className={styles.typeCell}
                                                style={{ backgroundColor: cellBg, color: cellText }}
                                            >
                                                {row.type}
                                            </td>
                                            <td
                                                className={styles.matchupCell}
                                                style={getHeatmapStyle(row.weak, "rgb(231, 76, 60)")}
                                            >
                                                {row.weak}
                                                {hasSwaps && renderDelta(row.weak, original?.weak ?? 0)}
                                            </td>
                                            <td
                                                className={styles.matchupCell}
                                                style={getHeatmapStyle(row.resist, "rgb(39, 174, 96)")}
                                            >
                                                {row.resist}
                                                {hasSwaps && renderDeltaInverse(row.resist, original?.resist ?? 0)}
                                            </td>
                                            <td
                                                className={styles.matchupCell}
                                                style={getHeatmapStyle(row.immune, "rgb(155, 89, 182)")}
                                            >
                                                {row.immune}
                                                {hasSwaps && renderDeltaInverse(row.immune, original?.immune ?? 0)}
                                            </td>
                                            <td
                                                className={styles.matchupCell}
                                                style={getHeatmapStyle(row.neutral, "rgb(127, 140, 141)")}
                                            >
                                                {row.neutral}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className={styles.typeMatchupsCaption}>
                    No team Pokémon to analyze. Add Pokémon to your team to see matchup coverage.
                </div>
            )}
        </div>
    );

    const chartPanel = (
        <div className={styles.sectionSpacing}>
            <div className={styles.typeMatchupsCaption} style={{ marginBottom: "0.5rem" }}>
                Each cell is the damage multiplier for the row&apos;s attacking type against the column&apos;s defending type.
            </div>
            <div className={styles.typeMatchupsTableWrapper}>
                <table className={`${styles.matchupTable} ${styles.matchupMatrix}`}>
                    <thead>
                        <tr>
                            <th className={styles.matchupMatrixCorner}>Atk \ Def</th>
                            {POKEMON_TYPES.map((defType) => {
                                const cellBg = typeToColor(defType, customTypes) ?? style?.accentColor ?? "#394b59";
                                const cellText = getContrastColor(cellBg);
                                return (
                                    <th
                                        key={defType}
                                        className={`${styles.typeHeaderCell} ${styles.typeCell}`}
                                        style={{ backgroundColor: cellBg, color: cellText }}
                                    >
                                        {defType}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {POKEMON_TYPES.map((atkType) => {
                            const rowCellBg = typeToColor(atkType, customTypes) ?? style?.accentColor ?? "#394b59";
                            const rowCellText = getContrastColor(rowCellBg);
                            return (
                            <tr key={atkType}>
                                <th
                                    className={`${styles.typeHeaderCell} ${styles.typeCell}`}
                                    style={{ backgroundColor: rowCellBg, color: rowCellText }}
                                >
                                    {atkType}
                                </th>
                                {POKEMON_TYPES.map((defType) => {
                                    const m = chart[defType]?.[atkType] ?? 1;
                                    return (
                                        <td
                                            key={`${atkType}-${defType}`}
                                            className={styles.matchupMatrixCell}
                                            data-mult={m}
                                            title={`${atkType} → ${defType}: ${m}×`}
                                        >
                                            {renderMultiplier(m)}
                                        </td>
                                    );
                                })}
                            </tr>
                        );})}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <Card className={styles.typeMatchupsCard} elevation={Elevation.ONE}>
            <div className={styles.typeMatchups} style={{ color: textColor }}>
                <h3 style={{ color: textColor, marginBottom: "0.75rem" }}>
                    Type Matchups (Gen {generation})
                </h3>
                <Tabs id="type-matchups-tabs" defaultSelectedTabId="summary">
                    <Tab
                        id="summary"
                        title="Team Summary"
                        panel={summaryPanel}
                    />
                    <Tab
                        id="chart"
                        title="Type Chart"
                        panel={chartPanel}
                    />
                </Tabs>
            </div>
        </Card>
    );
};


