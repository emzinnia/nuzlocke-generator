/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";

import { Generation } from "utils";

type StatRenderer = (value: unknown, label: string) => React.ReactNode;

export type PokemonExtraDataStatsProps = {
    effectiveGeneration: Generation;
    extraData: unknown;
    renderStat: StatRenderer;
};

export const PokemonExtraDataStats = ({
    effectiveGeneration,
    extraData,
    renderStat,
}: PokemonExtraDataStatsProps) => {
    const ed = (extraData ?? {}) as any;

    // Gen 3 stats live under extraData.stats for party Pokémon (see `src/parsers/gen3.ts`).
    // We fall back to the root `extraData` to avoid breaking older data shapes.
    const gen3Stats = ed?.stats ?? ed;

    if (effectiveGeneration === Generation.Gen1) {
        return (
            <>
                {renderStat(ed["currentHp"], "HP")}
                {renderStat(ed["attack"], "ATK")}
                {renderStat(ed["defense"], "DEF")}
                {renderStat(ed["special"], "SPC")}
                {renderStat(ed["speed"], "SPE")}
            </>
        );
    }

    if (effectiveGeneration === Generation.Gen2) {
        return (
            <>
                {renderStat(ed["currentHp"], "HP")}
                {renderStat(ed["attack"], "ATK")}
                {renderStat(ed["defense"], "DEF")}
                {renderStat(ed["specialAttack"], "SPATK")}
                {renderStat(ed["specialDefense"], "SPDEF")}
                {renderStat(ed["speed"], "SPE")}
            </>
        );
    }

    if (effectiveGeneration === Generation.Gen3) {
        return (
            <>
                {renderStat(gen3Stats["currentHp"], "HP")}
                {renderStat(gen3Stats["attack"], "ATK")}
                {renderStat(gen3Stats["defense"], "DEF")}
                {renderStat(gen3Stats["specialAttack"], "SPATK")}
                {renderStat(gen3Stats["specialDefense"], "SPDEF")}
                {renderStat(gen3Stats["speed"], "SPE")}
            </>
        );
    }

    // Default to "modern" (split special) stats for any later gens.
    return (
        <>
            {renderStat(ed["currentHp"], "HP")}
            {renderStat(ed["attack"], "ATK")}
            {renderStat(ed["defense"], "DEF")}
            {renderStat(ed["specialAttack"], "SPATK")}
            {renderStat(ed["specialDefense"], "SPDEF")}
            {renderStat(ed["speed"], "SPE")}
        </>
    );
};


