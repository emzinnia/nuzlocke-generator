import { Types } from "../Types";

/**
 * Describes how an ability affects type matchups.
 * - immunities: Types the Pokémon becomes immune to (0x damage)
 * - resistances: Types the Pokémon resists (0.5x damage)
 * - weaknesses: Types the Pokémon becomes weak to, with custom multiplier
 */
export interface AbilityEffect {
    immunities?: Types[];
    resistances?: Types[];
    weaknesses?: { type: Types; multiplier: number }[];
}

/**
 * Maps abilities to their type matchup effects.
 * Only includes abilities that directly affect type damage calculations.
 * 
 * Excluded abilities:
 * - Wonder Guard (too complex - requires knowing all attacking types)
 * - Bulletproof/Soundproof (move-based, not type-based)
 * - Status condition immunities (Immunity, Limber, etc.)
 */
export const abilitySpecificMatchups: Record<string, AbilityEffect> = {
    // Pure immunities
    "Levitate": { immunities: [Types.Ground] },
    "Volt Absorb": { immunities: [Types.Electric] },
    "Water Absorb": { immunities: [Types.Water] },
    "Flash Fire": { immunities: [Types.Fire] },
    "Sap Sipper": { immunities: [Types.Grass] },
    "Storm Drain": { immunities: [Types.Water] },
    "Lightning Rod": { immunities: [Types.Electric] },
    "Motor Drive": { immunities: [Types.Electric] },
    "Earth Eater": { immunities: [Types.Ground] },
    "Well-Baked Body": { immunities: [Types.Fire] },

    // Mixed effects (immunity + weakness)
    "Dry Skin": {
        immunities: [Types.Water],
        weaknesses: [{ type: Types.Fire, multiplier: 1.25 }],
    },

    // Pure resistances (0.5x damage)
    "Thick Fat": { resistances: [Types.Fire, Types.Ice] },
    "Heatproof": { resistances: [Types.Fire] },
    "Water Bubble": { resistances: [Types.Fire] },
    "Purifying Salt": { resistances: [Types.Ghost] },

    // Pure weaknesses
    "Fluffy": { weaknesses: [{ type: Types.Fire, multiplier: 2 }] },
};

/**
 * Gets the ability effect for a given ability name.
 * Returns undefined if the ability doesn't affect type matchups.
 */
export const getAbilityEffect = (ability: string | undefined): AbilityEffect | undefined => {
    if (!ability) return undefined;
    return abilitySpecificMatchups[ability];
};

/**
 * Calculates the damage multiplier for a given attacking type against a Pokémon with a specific ability.
 * Returns 1 if the ability doesn't affect the matchup.
 */
export const getAbilityMultiplier = (
    attackingType: Types,
    ability: string | undefined,
): number => {
    const effect = getAbilityEffect(ability);
    if (!effect) return 1;

    // Check for immunity first (takes priority)
    if (effect.immunities?.includes(attackingType)) {
        return 0;
    }

    // Check for resistance
    if (effect.resistances?.includes(attackingType)) {
        return 0.5;
    }

    // Check for weakness
    const weakness = effect.weaknesses?.find((w) => w.type === attackingType);
    if (weakness) {
        return weakness.multiplier;
    }

    return 1;
};

