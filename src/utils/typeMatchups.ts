import { Pokemon } from "models";
import { Generation } from "./getters/getGameGeneration";
import { Types } from "./Types";
import { getAbilityMultiplier } from "./data/abilitySpecificMatchups";

type DamageCode = 0 | 1 | 2 | 3;
type DamageCodes = Partial<Record<string, DamageCode>>;
type DamageChartCodes = Record<string, DamageCodes>;
type EffectivenessChart = Record<string, Record<string, number>>;

const DAMAGE_CODE_TO_MULTIPLIER: Record<DamageCode, number> = {
    0: 1, // neutral
    1: 2, // super effective
    2: 0.5, // resisted
    3: 0, // immune
};

export const POKEMON_TYPES: Types[] = [
    Types.Normal,
    Types.Fire,
    Types.Water,
    Types.Electric,
    Types.Grass,
    Types.Ice,
    Types.Fighting,
    Types.Poison,
    Types.Ground,
    Types.Flying,
    Types.Psychic,
    Types.Bug,
    Types.Rock,
    Types.Ghost,
    Types.Dragon,
    Types.Dark,
    Types.Steel,
    Types.Fairy,
];

const KNOWN_TYPES = new Set(POKEMON_TYPES.map(String));

const BASE_CHART_CODES: DamageChartCodes = {
    Bug: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fairy: 0,
        Fighting: 2,
        Fire: 1,
        Flying: 1,
        Ghost: 0,
        Grass: 2,
        Ground: 2,
        Ice: 0,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 1,
        Steel: 0,
        Water: 0,
    },
    Dark: {
        Bug: 1,
        Dark: 2,
        Dragon: 0,
        Electric: 0,
        Fairy: 1,
        Fighting: 1,
        Fire: 0,
        Flying: 0,
        Ghost: 2,
        Grass: 0,
        Ground: 0,
        Ice: 0,
        Normal: 0,
        Poison: 0,
        Psychic: 3,
        Rock: 0,
        Steel: 0,
        Water: 0,
    },
    Dragon: {
        Bug: 0,
        Dark: 0,
        Dragon: 1,
        Electric: 2,
        Fairy: 1,
        Fighting: 0,
        Fire: 2,
        Flying: 0,
        Ghost: 0,
        Grass: 2,
        Ground: 0,
        Ice: 1,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 0,
        Steel: 0,
        Water: 2,
    },
    Electric: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 2,
        Fairy: 0,
        Fighting: 0,
        Fire: 0,
        Flying: 2,
        Ghost: 0,
        Grass: 0,
        Ground: 1,
        Ice: 0,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 0,
        Steel: 2,
        Water: 0,
    },
    Fairy: {
        Bug: 2,
        Dark: 2,
        Dragon: 3,
        Electric: 0,
        Fairy: 0,
        Fighting: 2,
        Fire: 0,
        Flying: 0,
        Ghost: 0,
        Grass: 0,
        Ground: 0,
        Ice: 0,
        Normal: 0,
        Poison: 1,
        Psychic: 0,
        Rock: 0,
        Steel: 1,
        Water: 0,
    },
    Fighting: {
        Bug: 2,
        Dark: 2,
        Dragon: 0,
        Electric: 0,
        Fairy: 1,
        Fighting: 0,
        Fire: 0,
        Flying: 1,
        Ghost: 0,
        Grass: 0,
        Ground: 0,
        Ice: 0,
        Normal: 0,
        Poison: 0,
        Psychic: 1,
        Rock: 2,
        Steel: 0,
        Water: 0,
    },
    Fire: {
        Bug: 2,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fairy: 2,
        Fighting: 0,
        Fire: 2,
        Flying: 0,
        Ghost: 0,
        Grass: 2,
        Ground: 1,
        Ice: 2,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 1,
        Steel: 2,
        Water: 1,
    },
    Flying: {
        Bug: 2,
        Dark: 0,
        Dragon: 0,
        Electric: 1,
        Fairy: 0,
        Fighting: 2,
        Fire: 0,
        Flying: 0,
        Ghost: 0,
        Grass: 2,
        Ground: 3,
        Ice: 1,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 1,
        Steel: 0,
        Water: 0,
    },
    Ghost: {
        Bug: 2,
        Dark: 1,
        Dragon: 0,
        Electric: 0,
        Fairy: 0,
        Fighting: 3,
        Fire: 0,
        Flying: 0,
        Ghost: 1,
        Grass: 0,
        Ground: 0,
        Ice: 0,
        Normal: 3,
        Poison: 2,
        Psychic: 0,
        Rock: 0,
        Steel: 0,
        Water: 0,
    },
    Grass: {
        Bug: 1,
        Dark: 0,
        Dragon: 0,
        Electric: 2,
        Fairy: 0,
        Fighting: 0,
        Fire: 1,
        Flying: 1,
        Ghost: 0,
        Grass: 2,
        Ground: 2,
        Ice: 1,
        Normal: 0,
        Poison: 1,
        Psychic: 0,
        Rock: 0,
        Steel: 0,
        Water: 2,
    },
    Ground: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 3,
        Fairy: 0,
        Fighting: 0,
        Fire: 0,
        Flying: 0,
        Ghost: 0,
        Grass: 1,
        Ground: 0,
        Ice: 1,
        Normal: 0,
        Poison: 2,
        Psychic: 0,
        Rock: 2,
        Steel: 0,
        Water: 1,
    },
    Ice: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fairy: 0,
        Fighting: 1,
        Fire: 1,
        Flying: 0,
        Ghost: 0,
        Grass: 0,
        Ground: 0,
        Ice: 2,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 1,
        Steel: 1,
        Water: 0,
    },
    Normal: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fairy: 0,
        Fighting: 1,
        Fire: 0,
        Flying: 0,
        Ghost: 3,
        Grass: 0,
        Ground: 0,
        Ice: 0,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 0,
        Steel: 0,
        Water: 0,
    },
    Poison: {
        Bug: 2,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fairy: 2,
        Fighting: 2,
        Fire: 0,
        Flying: 0,
        Ghost: 0,
        Grass: 2,
        Ground: 1,
        Ice: 0,
        Normal: 0,
        Poison: 2,
        Psychic: 1,
        Rock: 0,
        Steel: 0,
        Water: 0,
    },
    Psychic: {
        Bug: 1,
        Dark: 1,
        Dragon: 0,
        Electric: 0,
        Fairy: 0,
        Fighting: 2,
        Fire: 0,
        Flying: 0,
        Ghost: 1,
        Grass: 0,
        Ground: 0,
        Ice: 0,
        Normal: 0,
        Poison: 0,
        Psychic: 2,
        Rock: 0,
        Steel: 0,
        Water: 0,
    },
    Rock: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fairy: 0,
        Fighting: 1,
        Fire: 2,
        Flying: 2,
        Ghost: 0,
        Grass: 1,
        Ground: 1,
        Ice: 0,
        Normal: 2,
        Poison: 2,
        Psychic: 0,
        Rock: 0,
        Steel: 1,
        Water: 1,
    },
    Steel: {
        Bug: 2,
        Dark: 0,
        Dragon: 2,
        Electric: 0,
        Fairy: 2,
        Fighting: 1,
        Fire: 1,
        Flying: 2,
        Ghost: 0,
        Grass: 2,
        Ground: 1,
        Ice: 2,
        Normal: 2,
        Poison: 3,
        Psychic: 2,
        Rock: 2,
        Steel: 2,
        Water: 0,
    },
    Water: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 1,
        Fairy: 0,
        Fighting: 0,
        Fire: 2,
        Flying: 0,
        Ghost: 0,
        Grass: 1,
        Ground: 0,
        Ice: 2,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 0,
        Steel: 2,
        Water: 2,
    },
};

const GEN5_OVERRIDES: DamageChartCodes = {
    Steel: {
        Bug: 2,
        Dark: 2,
        Dragon: 2,
        Electric: 0,
        Fighting: 1,
        Fire: 1,
        Flying: 2,
        Ghost: 2,
        Grass: 2,
        Ground: 1,
        Ice: 2,
        Normal: 2,
        Poison: 3,
        Psychic: 2,
        Rock: 2,
        Steel: 2,
        Water: 0,
    },
};

const GEN2_OVERRIDES: DamageChartCodes = {
    Fire: {
        Bug: 2,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fighting: 0,
        Fire: 2,
        Flying: 0,
        Ghost: 0,
        Grass: 2,
        Ground: 1,
        Ice: 2,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 1,
        Steel: 2,
        Water: 1,
    },
    Ice: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fighting: 1,
        Fire: 1,
        Flying: 0,
        Ghost: 0,
        Grass: 0,
        Ground: 0,
        Ice: 2,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 1,
        Steel: 1,
        Water: 0,
    },
    Steel: GEN5_OVERRIDES.Steel,
};

const GEN1_OVERRIDES: DamageChartCodes = {
    Bug: {
        Bug: 0,
        Dragon: 0,
        Electric: 0,
        Fighting: 2,
        Fire: 1,
        Flying: 1,
        Ghost: 0,
        Grass: 2,
        Ground: 2,
        Ice: 0,
        Normal: 0,
        Poison: 1,
        Psychic: 0,
        Rock: 1,
        Water: 0,
    },
    Fire: {
        Bug: 2,
        Dragon: 0,
        Electric: 0,
        Fighting: 0,
        Fire: 2,
        Flying: 0,
        Ghost: 0,
        Grass: 2,
        Ground: 1,
        Ice: 0,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 1,
        Water: 1,
    },
    Ghost: {
        Bug: 2,
        Dragon: 0,
        Electric: 0,
        Fighting: 3,
        Fire: 0,
        Flying: 0,
        Ghost: 1,
        Grass: 0,
        Ground: 0,
        Ice: 0,
        Normal: 3,
        Poison: 2,
        Psychic: 0,
        Rock: 0,
        Water: 0,
    },
    Ice: {
        Bug: 0,
        Dark: 0,
        Dragon: 0,
        Electric: 0,
        Fairy: 0,
        Fighting: 1,
        Fire: 1,
        Flying: 0,
        Ghost: 0,
        Grass: 0,
        Ground: 0,
        Ice: 2,
        Normal: 0,
        Poison: 0,
        Psychic: 0,
        Rock: 1,
        Steel: 1,
        Water: 0,
    },
    Poison: {
        Bug: 1,
        Dragon: 0,
        Electric: 0,
        Fighting: 2,
        Fire: 0,
        Flying: 0,
        Ghost: 0,
        Grass: 2,
        Ground: 1,
        Ice: 0,
        Normal: 0,
        Poison: 2,
        Psychic: 1,
        Rock: 0,
        Water: 0,
    },
    Psychic: {
        Bug: 1,
        Dragon: 0,
        Electric: 0,
        Fighting: 2,
        Fire: 0,
        Flying: 0,
        Ghost: 3,
        Grass: 0,
        Ground: 0,
        Ice: 0,
        Normal: 0,
        Poison: 0,
        Psychic: 2,
        Rock: 0,
        Water: 0,
    },
};

const mergeCharts = (
    base: DamageChartCodes,
    overrides: DamageChartCodes,
): DamageChartCodes => {
    const merged: DamageChartCodes = {};
    Object.entries(base).forEach(([defType, attackMap]) => {
        merged[defType] = { ...attackMap };
    });

    Object.entries(overrides).forEach(([defType, attackOverrides]) => {
        merged[defType] = {
            ...(merged[defType] ?? {}),
            ...attackOverrides,
        };
    });

    return merged;
};

const toEffectivenessChart = (chartCodes: DamageChartCodes): EffectivenessChart => {
    const result: EffectivenessChart = {};
    POKEMON_TYPES.forEach((defType) => {
        const damageTaken = chartCodes[defType] ?? {};
        result[defType] = {};
        POKEMON_TYPES.forEach((atkType) => {
            const code = damageTaken[atkType];
            const mapped =
                code === undefined
                    ? 1
                    : DAMAGE_CODE_TO_MULTIPLIER[code as DamageCode] ?? 1;
            result[defType][atkType] = mapped;
        });
    });
    return result;
};

const filterKnownDamageCodes = (
    chart: DamageChartCodes,
): DamageChartCodes => {
    const filtered: DamageChartCodes = {};
    Object.entries(chart).forEach(([defType, attackMap]) => {
        filtered[defType] = Object.entries(attackMap)
            .filter(([atkType]) => KNOWN_TYPES.has(atkType))
            .reduce<DamageCodes>((acc, [atkType, code]) => {
                acc[atkType] = code as DamageCode;
                return acc;
            }, {});
    });
    return filtered;
};

const chartByGeneration: Record<Generation, EffectivenessChart> = {
    [Generation.Gen9]: toEffectivenessChart(filterKnownDamageCodes(BASE_CHART_CODES)),
    [Generation.Gen8]: toEffectivenessChart(filterKnownDamageCodes(BASE_CHART_CODES)),
    [Generation.Gen7]: toEffectivenessChart(filterKnownDamageCodes(BASE_CHART_CODES)),
    [Generation.Gen6]: toEffectivenessChart(filterKnownDamageCodes(BASE_CHART_CODES)),
    [Generation.Gen5]: toEffectivenessChart(
        filterKnownDamageCodes(mergeCharts(BASE_CHART_CODES, GEN5_OVERRIDES)),
    ),
    [Generation.Gen4]: toEffectivenessChart(
        filterKnownDamageCodes(mergeCharts(BASE_CHART_CODES, GEN5_OVERRIDES)),
    ),
    [Generation.Gen3]: toEffectivenessChart(
        filterKnownDamageCodes(mergeCharts(BASE_CHART_CODES, GEN5_OVERRIDES)),
    ),
    [Generation.Gen2]: toEffectivenessChart(
        filterKnownDamageCodes(mergeCharts(BASE_CHART_CODES, GEN2_OVERRIDES)),
    ),
    [Generation.Gen1]: toEffectivenessChart(
        filterKnownDamageCodes(mergeCharts(BASE_CHART_CODES, GEN1_OVERRIDES)),
    ),
};

export const getTypeChartForGeneration = (
    generation: Generation,
): EffectivenessChart =>
    chartByGeneration[generation] ?? chartByGeneration[Generation.Gen9];

export interface MatchupSummaryRow {
    type: Types;
    weak: number;
    resist: number;
    immune: number;
    neutral: number;
}

export interface BuildTeamMatchupsOptions {
    useAbilityMatchups?: boolean;
}

export const buildTeamMatchups = (
    pokemon: Pokemon[] = [],
    generation: Generation,
    options: BuildTeamMatchupsOptions = {},
): MatchupSummaryRow[] => {
    const { useAbilityMatchups = false } = options;
    const chart = getTypeChartForGeneration(generation);

    return POKEMON_TYPES.map((attackType) => {
        let weak = 0;
        let resist = 0;
        let immune = 0;
        let neutral = 0;

        pokemon.forEach((poke) => {
            const types = Array.from(
                new Set((poke?.types ?? []).filter(Boolean)),
            ) as Types[];

            if (!types.length) {
                return;
            }

            // Calculate base type multiplier
            let multiplier = types.reduce((acc, defType) => {
                return acc * (chart[defType]?.[attackType] ?? 1);
            }, 1);

            // Apply ability effect if enabled
            if (useAbilityMatchups && poke.ability) {
                const abilityMult = getAbilityMultiplier(attackType, poke.ability);
                multiplier *= abilityMult;
            }

            if (multiplier === 0) {
                immune++;
            } else if (multiplier > 1) {
                weak++;
            } else if (multiplier < 1) {
                resist++;
            } else {
                neutral++;
            }
        });

        return { type: attackType, weak, resist, immune, neutral };
    });
};


