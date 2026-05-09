import * as React from "react";

import { Generation } from "utils";

type StatRenderer = (value: unknown, label: string) => React.ReactNode;

export type PokemonExtraDataStatsProps = {
    effectiveGeneration: Generation;
    extraData: unknown;
    renderStat: StatRenderer;
};

type ExtraDataRecord = Record<string, unknown> & {
    stats?: Record<string, unknown>;
};

const isExtraDataRecord = (value: unknown): value is ExtraDataRecord =>
    typeof value === "object" && value !== null;

export const PokemonExtraDataStats = ({
    effectiveGeneration,
    extraData,
    renderStat,
}: PokemonExtraDataStatsProps) => {
    const ed = isExtraDataRecord(extraData) ? extraData : {};

    // Modern save parsers store party battle stats under `extraData.stats`.
    // Older imported data may have the same fields at the root, so keep that fallback.
    const battleStats = isExtraDataRecord(ed.stats) ? ed.stats : ed;

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
                {renderStat(battleStats["currentHp"], "HP")}
                {renderStat(battleStats["attack"], "ATK")}
                {renderStat(battleStats["defense"], "DEF")}
                {renderStat(battleStats["specialAttack"], "SPATK")}
                {renderStat(battleStats["specialDefense"], "SPDEF")}
                {renderStat(battleStats["speed"], "SPE")}
            </>
        );
    }

    // Default to "modern" (split special) stats for any later gens.
    return (
        <>
            {renderStat(battleStats["currentHp"], "HP")}
            {renderStat(battleStats["attack"], "ATK")}
            {renderStat(battleStats["defense"], "DEF")}
            {renderStat(battleStats["specialAttack"], "SPATK")}
            {renderStat(battleStats["specialDefense"], "SPDEF")}
            {renderStat(battleStats["speed"], "SPE")}
        </>
    );
};
