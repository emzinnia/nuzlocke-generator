import * as React from "react";

import { Card, Elevation, Tabs, Tab, Checkbox } from "@blueprintjs/core";
import { Pokemon, Game } from "models";
import { State } from "state";
import { getGameGeneration, typeToColor, getContrastColor } from "utils";
import { Generation } from "utils/getters/getGameGeneration";
import { getTypeChartForGeneration, POKEMON_TYPES, buildTeamMatchups } from "utils/typeMatchups";
import { Types } from "utils/Types";
import * as styles from "./TypeMatchupDialog.styles";

interface TypeMatchupSummaryProps {
    pokemon: Pokemon[];
    game: Game;
    customTypes: State["customTypes"];
    style: State["style"];
}

export const TypeMatchupSummary: React.FC<TypeMatchupSummaryProps> = ({
    pokemon,
    game,
    customTypes,
    style,
}) => {
    const [useAbilityMatchups, setUseAbilityMatchups] = React.useState(false);
    const isDark = !!style?.editorDarkMode;
    const generation: Generation = React.useMemo(
        () => getGameGeneration(game.name),
        [game.name],
    );

    const chart = React.useMemo(() => getTypeChartForGeneration(generation), [generation]);

    // Build team-specific matchups
    const teamPokemon = React.useMemo(
        () => pokemon?.filter((p) => p?.status === "Team" && !p?.hidden) ?? [],
        [pokemon],
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
    const textColor = isDark ? "#F5F8FA" : "#182026";

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

    const getTypeChipStyle = (type: Types) => {
        const bg = typeToColor(type, customTypes) ?? style?.accentColor ?? "#394b59";
        // Keep chip text readable regardless of type color by using a subtle outline + relying on bright base text.
        // (Blueprint dark mode already uses a bright text default.)
        const fg = isDark ? "#F5F8FA" : "#fff";
        return { backgroundColor: bg, color: fg };
    };

    const renderMultiplier = (m: number) => {
        if (m === 0) return "0×";
        if (m === 0.5) return "½×";
        if (m === 2) return "2×";
        return "1×";
    };

    const summaryPanel = (
        <div className={styles.sectionSpacing}>
            {abilityToggle}
            {teamPokemon.length > 0 ? (
                <>
                    <div className={styles.typeMatchupsCaption} style={{ marginBottom: "8px" }}>
                        Team coverage against each attacking type:
                        {useAbilityMatchups && (
                            <span style={{ fontWeight: "normal", opacity: 0.7 }}>
                                (includes ability effects)
                            </span>
                        )}
                    </div>
                    <div className={styles.typeMatchupsTableWrapper}>
                        <table
                            className={`${styles.matchupTable} ${styles.teamMatchupTable}`}
                            style={{ width: "100%" }}
                        >
                            <thead>
                                <tr>
                                    <th style={{ width: "64px" }}>Type</th>
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
                                                data-highlight={row.weak > 0 ? "weak" : undefined}
                                                style={row.weak > 0 ? {
                                                    backgroundColor: "#e74c3c",
                                                    color: "#fff",
                                                    fontWeight: 700,
                                                } : undefined}
                                            >
                                                {row.weak}
                                            </td>
                                            <td
                                                className={styles.matchupCell}
                                                data-highlight={row.resist > 0 ? "resist" : undefined}
                                                style={row.resist > 0 ? {
                                                    backgroundColor: "#27ae60",
                                                    color: "#fff",
                                                    fontWeight: 700,
                                                } : undefined}
                                            >
                                                {row.resist}
                                            </td>
                                            <td
                                                className={styles.matchupCell}
                                                data-highlight={row.immune > 0 ? "immune" : undefined}
                                                style={row.immune > 0 ? {
                                                    backgroundColor: "#9b59b6",
                                                    color: "#fff",
                                                    fontWeight: 700,
                                                } : undefined}
                                            >
                                                {row.immune}
                                            </td>
                                            <td
                                                className={styles.matchupCell}
                                                style={row.neutral > 0 ? {
                                                    backgroundColor: "#7f8c8d",
                                                    color: "#fff",
                                                    fontWeight: 700,
                                                } : undefined}
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
            <div className={styles.typeMatchupsCaption} style={{ marginBottom: "8px" }}>
                Each cell is the damage multiplier for the row&apos;s attacking type against the column&apos;s defending type.
            </div>
            <div className={styles.typeMatchupsTableWrapper}>
                <table className={`${styles.matchupTable} ${styles.matchupMatrix}`}>
                    <thead>
                        <tr>
                            <th className={styles.matchupMatrixCorner}>Atk \ Def</th>
                            {POKEMON_TYPES.map((defType) => (
                                // Use the same chip styling in both tabs for uniform appearance.
                                // TODO: if chip styling changes, update both summary and chart here.
                                <th
                                    key={defType}
                                    className={styles.typeHeaderCell}
                                >
                                    {(() => {
                                        const chipStyle = getTypeChipStyle(defType);
                                        const chipTextColor = getContrastColor(chipStyle.backgroundColor);
                                        return (
                                            <span
                                                className={styles.typeChip}
                                                style={{ ...chipStyle, color: chipTextColor }}
                                            >
                                                {defType}
                                            </span>
                                        );
                                    })()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {POKEMON_TYPES.map((atkType) => (
                            <tr key={atkType}>
                                <th className={styles.typeHeaderCell}>
                                    {(() => {
                                        const chipStyle = getTypeChipStyle(atkType);
                                        const chipTextColor = getContrastColor(chipStyle.backgroundColor);
                                        return (
                                            <span
                                                className={styles.typeChip}
                                                style={{ ...chipStyle, color: chipTextColor }}
                                            >
                                                {atkType}
                                            </span>
                                        );
                                    })()}
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <Card className={styles.typeMatchupsCard} elevation={Elevation.ONE}>
            <div className={styles.typeMatchups} style={{ color: textColor }}>
                <h3 style={{ color: textColor, marginBottom: "12px" }}>
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


