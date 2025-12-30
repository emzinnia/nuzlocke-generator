export interface NuzlockeRuleset {
    name: string;
    description: string;
    rules: string[];
}

export const nuzlockeRulesets: NuzlockeRuleset[] = [
    {
        name: "Classic Nuzlocke",
        description: "The baseline three rules most runs start from.",
        rules: [
            "Each Pokémon that faints is considered dead and must be released or permanently boxed",
            "You can only catch the first Pokémon you encounter in each distinct area",
            "All Pokémon must be nicknamed to strengthen emotional bonds",
        ],
    },
    {
        name: "Hardcore Nuzlocke",
        description: "Higher difficulty with level caps, set mode, and no mid-battle items.",
        rules: [
            "Classic Nuzlocke rules apply",
            "Use Set battle style (no free switch after knocking out an opponent)",
            "No bag items may be used in battle (held items are allowed)",
            "Do not exceed the next major boss or Gym Leader’s ace level at any time",
            "No over-leveling via wild battle grinding specifically to pass level caps",
            "Optional: Disable Exp Share if available to keep levels controlled",
        ],
    },
    {
        name: "Randomizer-Friendly",
        description: "Adds common clauses suited for randomized encounters.",
        rules: [
            "Classic Nuzlocke rules apply",
            "Species/Dupes Clause: reroll if the encounter line is already owned",
            "Shiny Clause: Shiny encounters are always catchable and usable",
            "Static/Gift Clause: treat static or gift Pokémon as separate unique encounters",
            "Early Wipe Clause: the run does not start until you receive Poké Balls",
            "Optional: Limit legendaries or mythicals if they appear early",
            "Optional: Ban trapping moves/abilities that can cause unavoidable wipes",
        ],
    },
    {
        name: "Custom / House Rules",
        description: "A flexible template for tailored runs; tweak or remove any rules you like.",
        rules: [
            "Start from Classic Nuzlocke rules",
            "Choose which clauses to include: Dupes, Shiny, Gift/Static, or none",
            "Decide on level caps (by Gym ace) and whether to allow Exp Share",
            "Set healing/item limits in and out of battle, or ban them entirely",
            "Define daycare/breeding allowances and whether trades are permitted",
            "Document any additional themed restrictions specific to your run",
        ],
    },
    {
        name: "Soul Link",
        description: "A cooperative two-player run where each route’s encounters become linked partners.",
        rules: [
            "Classic Nuzlocke rules apply for both players",
            "Two players play simultaneously in the same game (or paired versions in the same generation)",
            "Each route’s first encounters are linked; if one player fails to catch theirs, the other must box or release their encounter too",
            "If one linked Pokémon faints, its partner on the other player’s team is also considered dead and must be boxed or released",
            "If one linked Pokémon is placed in the PC, its partner must be placed in the PC as well",
            "Optional: No Pokémon across both teams may share the same primary type",
        ],
    },
    {
        name: "Wedlocke",
        description: "Pokémon are paired into couples; in battle you can only switch within the active couple.",
        rules: [
            "Classic Nuzlocke rules apply",
            "Pokémon are assigned into couples based on gender (genderless Pokémon are typically not allowed)",
            "If you have an unpaired Pokémon in your party, only encounters of the opposite gender 'count' until you catch a partner",
            "Once one member of a couple enters battle, you may only switch between that Pokémon and its partner for the duration of the battle",
            "If a Pokémon is knocked out, its partner must 'avenge it' or die trying (no switching to other Pokémon)",
            "If one partner survives while the other faints, the survivor becomes unpaired and must be re-paired from the box when possible",
        ],
    },
    {
        name: "Wonderlocke",
        description: "Every caught Pokémon is immediately Wonder Traded away for a random replacement.",
        rules: [
            "Classic Nuzlocke rules apply",
            "Each Pokémon you catch must be Wonder Traded away as soon as possible",
            "You must use the received Wonder Trade Pokémon as your encounter for that area",
            "If you receive a Pokémon you already have, you may Wonder Trade it again until you receive a unique new Pokémon",
            "Requires a game with Wonder Trade and internet access (or a comparable trade-randomizer setup)",
        ],
    },
    {
        name: "Egglocke",
        description: "Caught Pokémon are replaced by mystery eggs, adding randomness and community involvement.",
        rules: [
            "Classic Nuzlocke rules apply",
            "Each time you catch an encounter, replace it with a mystery egg (from friends/viewers or a generator) as soon as possible",
            "Once the egg hatches, the hatched Pokémon becomes your encounter and the originally caught Pokémon can no longer be used",
            "Level the hatched Pokémon to match the level of the replaced encounter (commonly via Rare Candies) before continuing",
        ],
    },
    {
        name: "Generationlocke",
        description: "A multi-game marathon where champions carry forward into the next generation as your starters.",
        rules: [
            "Play through multiple games in order using standard Nuzlocke rules for each game",
            "When you finish a game, transfer/breed baby versions of your surviving Hall of Fame team into the next game as your starter team",
            "Only the survivors carry forward; deaths in any game permanently remove that line from future legs",
            "Optional: Award small bonuses to long-running survivors (e.g., a chosen nature or an extra egg move)",
        ],
    },
    {
        name: "Uniquelocke",
        description: "Type-uniqueness rule: no two party Pokémon may share any type at the same time.",
        rules: [
            "Classic Nuzlocke rules apply",
            "No two Pokémon in your active party may share a type (including dual-types)",
            "You may catch a Pokémon even if it shares a type, but it must be boxed and never used alongside a Pokémon sharing any of its types",
        ],
    },
    {
        name: "Monolocke",
        description: "A monotype run: only Pokémon of a chosen type are allowed (often called a Gym Leader challenge).",
        rules: [
            "Classic Nuzlocke rules apply",
            "Choose one type; only Pokémon that have that type are allowed to be caught and used",
            "Dual-typing is allowed as long as the Pokémon has the chosen type",
            "If a Pokémon evolves into the chosen type, its direct pre-evolutions may be used (alternate evolutions do not count)",
            "If your starter line does not gain the chosen type, box it once you have an eligible Pokémon trained to at least level 5",
        ],
    },
    {
        name: "Tribelocke",
        description: "Route encounters form 'tribes' you must keep together in and out of battle.",
        rules: [
            "Classic Nuzlocke rules apply",
            "When entering a new area, roll 1–6; you must attempt to catch that many Pokémon on the route to form a 'tribe'",
            "All members of a tribe must be either all in your party or all in the box; tribes may not split up",
            "In battle, you may only switch between members of the same tribe (until the battle ends or that tribe is fully knocked out)",
            "If an encounter faints or flees while building a tribe, it counts as lost and reduces that tribe’s maximum size",
            "The Duplicates Clause is typically not used so early routes can still form full tribes",
            "If you only have one Pokémon in your active tribe, you may not switch in battle",
        ],
    },
    {
        name: "Apocalocke",
        description: "An apocalypse-themed run where only certain types 'survive' based on the chosen disaster.",
        rules: [
            "Classic Nuzlocke rules apply",
            "Choose (or randomize) an apocalyptic disaster that defines which Pokémon types are allowed",
            "Only Pokémon of the surviving types may be used",
            "Optional: Allow dual-types as long as the Pokémon has at least one allowed type (or require both types be allowed for extra difficulty)",
            "Optional: Add random 'traits' to caught Pokémon (e.g., no switching, no items used on them, no evolution) for extra flavor",
            "Optional: Limit or ban Pokémon Center use to simulate harsher conditions",
        ],
    },
];

