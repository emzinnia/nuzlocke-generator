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
];

