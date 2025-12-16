import * as React from "react";

import { Card, Elevation } from "@blueprintjs/core";
import { Pokemon, Game } from "models";
import { State } from "state";
import { getGameGeneration, typeToColor } from "utils";
import { Generation } from "utils/getters/getGameGeneration";
import { getTypeChartForGeneration, POKEMON_TYPES, buildTeamMatchups } from "utils/typeMatchups";
import { Types } from "utils/Types";

interface TypeMatchupSummaryProps {
    pokemon: Pokemon[];
    game: Game;
    customTypes: State["customTypes"];
    style: State["style"];
    useAbilityMatchups?: boolean;
}

export const TypeMatchupSummary: React.FC<TypeMatchupSummaryProps> = ({
    pokemon,
    game,
    customTypes,
    style,
    useAbilityMatchups = false,
}) => {
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

    // This renders inside a Blueprint dialog, so use Blueprint's readable defaults.
    // (Using style.bgColor here can produce low-contrast text against the dialog background.)
    const textColor = isDark ? "#F5F8FA" : "#182026";

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

    return (
        <Card className="type-matchups-card" elevation={Elevation.ONE}>
            <div className="type-matchups" style={{ color: textColor }}>
                <h3 style={{ color: textColor }}>
                    Team Matchup Summary (Gen {generation})
                    {useAbilityMatchups && (
                        <span style={{ fontSize: "12px", fontWeight: "normal", marginLeft: "8px", opacity: 0.7 }}>
                            + Abilities
                        </span>
                    )}
                </h3>
                {teamPokemon.length > 0 ? (
                    <div className="team-matchups-summary" style={{ marginBottom: "16px" }}>
                        <div className="type-matchups-caption" style={{ marginBottom: "8px" }}>
                            Team coverage against each attacking type:
                        </div>
                        <div className="type-matchups-table-wrapper">
                            <table className="matchup-table team-matchup-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th title="Team members weak to this type">Weak</th>
                                        <th title="Team members that resist this type">Resist</th>
                                        <th title="Team members immune to this type">Immune</th>
                                        <th title="Team members neutral to this type">Neutral</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamMatchups.map((row) => (
                                        <tr key={row.type}>
                                            <td>
                                                <span className="type-chip" style={getTypeChipStyle(row.type)}>
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td
                                                className="matchup-cell"
                                                data-highlight={row.weak > 0 ? "weak" : undefined}
                                                style={{ color: row.weak > 0 ? "#e74c3c" : undefined }}
                                            >
                                                {row.weak}
                                            </td>
                                            <td
                                                className="matchup-cell"
                                                data-highlight={row.resist > 0 ? "resist" : undefined}
                                                style={{ color: row.resist > 0 ? "#2ecc71" : undefined }}
                                            >
                                                {row.resist}
                                            </td>
                                            <td
                                                className="matchup-cell"
                                                data-highlight={row.immune > 0 ? "immune" : undefined}
                                                style={{ color: row.immune > 0 ? "#3498db" : undefined }}
                                            >
                                                {row.immune}
                                            </td>
                                            <td className="matchup-cell">{row.neutral}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="type-matchups-caption" style={{ marginBottom: "16px" }}>
                        No team Pokémon to analyze. Add Pokémon to your team to see matchup coverage.
                    </div>
                )}
                <h4 style={{ color: textColor, marginTop: "16px" }}>
                    Type Effectiveness Chart
                </h4>
                <div className="type-matchups-caption">
                    Each cell is the damage multiplier for the row&apos;s attacking type against the column&apos;s defending type.
                </div>
                <div className="type-matchups-table-wrapper">
                    <table className="matchup-table matchup-matrix">
                        <thead>
                            <tr>
                                <th className="matchup-matrix-corner">Atk \ Def</th>
                                {POKEMON_TYPES.map((defType) => (
                                    <th key={defType}>
                                        <span className="type-chip" style={getTypeChipStyle(defType)}>
                                            {defType}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {POKEMON_TYPES.map((atkType) => (
                                <tr key={atkType}>
                                    <th>
                                        <span className="type-chip" style={getTypeChipStyle(atkType)}>
                                            {atkType}
                                        </span>
                                    </th>
                                    {POKEMON_TYPES.map((defType) => {
                                        const m = chart[defType]?.[atkType] ?? 1;
                                        return (
                                            <td
                                                key={`${atkType}-${defType}`}
                                                className="matchup-matrix-cell"
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
        </Card>
    );
};


