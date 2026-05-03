export type RadiusType = "round" | "square";
export type OrientationType = "vertical" | "horizontal";
export type TeamImagesType =
    | "standard"
    | "sugimori"
    | "dream world"
    | "shuffle"
    | "tcg";
export type IconRenderingType = "pixelated" | "auto";
export type RulesLocation = "inside trainer section" | "bottom" | "top";
export type ItemStyle = "outer glow" | "round" | "square" | "text";

export type TeamLayoutType = "1x6" | "2x3" | "3x2" | "6x1" | "1x3" | "3x1";

export interface TeamLayoutConfig {
    id: TeamLayoutType;
    rows: number;
    cols: number;
    label: string;
}

export const teamLayoutOptions: TeamLayoutConfig[] = [
    { id: "1x6", rows: 1, cols: 6, label: "1 × 6" },
    { id: "2x3", rows: 2, cols: 3, label: "2 × 3" },
    { id: "3x2", rows: 3, cols: 2, label: "3 × 2" },
    { id: "6x1", rows: 6, cols: 1, label: "6 × 1" },
    { id: "1x3", rows: 1, cols: 3, label: "1 × 3" },
    { id: "3x1", rows: 3, cols: 1, label: "3 × 1" },
];

export interface StatsOptions {
    averageLevel: boolean;
    averageLevelDetailed: boolean;
    mostCommonKillers: boolean;
    mostCommonTypes: boolean;
    shiniesCaught: boolean;
}

export interface ResultV2Theme {
    trainerBackgroundColor: string;
    trainerTextColor: string;
    trainerNameColor: string;
    trainerTitleColor: string;
    trainerStatLabelColor: string;
    trainerStatValueColor: string;
    trainerBadgeBackgroundColor: string;
    trainerBadgeTextColor: string;
    trainerNotesColor: string;
    teamPokemonBackgroundColor: string;
    teamPokemonTextColor: string;
    teamPokemonTextSecondaryColor: string;
    teamPokemonTextMutedColor: string;
    teamPokemonAccentColor: string;
    teamPokemonNatureColor: string;
    teamPokemonAbilityColor: string;
    teamPokemonMoveBackgroundColor: string;
    teamPokemonMoveTextColor: string;
    teamPokemonShinyColor: string;
    teamPokemonMvpBackgroundColor: string;
    teamPokemonMvpTextColor: string;
}

export const resultV2ThemeDefaults: ResultV2Theme = {
    trainerBackgroundColor: "rgba(0, 0, 0, 0.6)",
    trainerTextColor: "#e2e8f0",
    trainerNameColor: "#ffffff",
    trainerTitleColor: "rgba(255, 255, 255, 0.7)",
    trainerStatLabelColor: "rgba(255, 255, 255, 0.5)",
    trainerStatValueColor: "rgba(255, 255, 255, 0.9)",
    trainerBadgeBackgroundColor: "rgba(99, 102, 241, 0.9)",
    trainerBadgeTextColor: "#ffffff",
    trainerNotesColor: "rgba(255, 255, 255, 0.7)",
    teamPokemonBackgroundColor: "rgba(0, 0, 0, 0.5)",
    teamPokemonTextColor: "#f1f5f9",
    teamPokemonTextSecondaryColor: "rgba(255, 255, 255, 0.7)",
    teamPokemonTextMutedColor: "rgba(255, 255, 255, 0.5)",
    teamPokemonAccentColor: "#818cf8",
    teamPokemonNatureColor: "#fdba74",
    teamPokemonAbilityColor: "#6ee7b7",
    teamPokemonMoveBackgroundColor: "rgba(0, 0, 0, 0.4)",
    teamPokemonMoveTextColor: "rgba(255, 255, 255, 0.85)",
    teamPokemonShinyColor: "#fcd34d",
    teamPokemonMvpBackgroundColor: "#fef3c7",
    teamPokemonMvpTextColor: "#92400e",
};

export interface ThemePalette {
    id: string;
    name: string;
    category: "game" | "custom";
    colors: ResultV2Theme;
    preview: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

export const themePalettes: ThemePalette[] = [
    {
        id: "default-dark",
        name: "Default Dark",
        category: "custom",
        colors: resultV2ThemeDefaults,
        preview: { primary: "#1a1a2e", secondary: "#16213e", accent: "#818cf8" },
    },
    {
        id: "red-firered",
        name: "Red / FireRed",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(185, 28, 28, 0.85)",
            trainerBadgeBackgroundColor: "#dc2626",
            teamPokemonBackgroundColor: "rgba(127, 29, 29, 0.7)",
            teamPokemonAccentColor: "#f87171",
            teamPokemonNatureColor: "#fbbf24",
            teamPokemonAbilityColor: "#fb923c",
        },
        preview: { primary: "#b91c1c", secondary: "#7f1d1d", accent: "#f87171" },
    },
    {
        id: "blue-leafgreen",
        name: "Blue / LeafGreen",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(21, 128, 61, 0.85)",
            trainerBadgeBackgroundColor: "#16a34a",
            teamPokemonBackgroundColor: "rgba(20, 83, 45, 0.7)",
            teamPokemonAccentColor: "#4ade80",
            teamPokemonNatureColor: "#a3e635",
            teamPokemonAbilityColor: "#34d399",
        },
        preview: { primary: "#15803d", secondary: "#14532d", accent: "#4ade80" },
    },
    {
        id: "yellow",
        name: "Yellow",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(161, 98, 7, 0.85)",
            trainerBadgeBackgroundColor: "#ca8a04",
            trainerTextColor: "#fef3c7",
            teamPokemonBackgroundColor: "rgba(113, 63, 18, 0.7)",
            teamPokemonAccentColor: "#facc15",
            teamPokemonNatureColor: "#fde047",
            teamPokemonAbilityColor: "#a3e635",
        },
        preview: { primary: "#a16207", secondary: "#713f12", accent: "#facc15" },
    },
    {
        id: "gold-heartgold",
        name: "Gold / HeartGold",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(180, 83, 9, 0.85)",
            trainerBadgeBackgroundColor: "#d97706",
            teamPokemonBackgroundColor: "rgba(120, 53, 15, 0.7)",
            teamPokemonAccentColor: "#fbbf24",
            teamPokemonNatureColor: "#fcd34d",
            teamPokemonAbilityColor: "#fb923c",
        },
        preview: { primary: "#b45309", secondary: "#78350f", accent: "#fbbf24" },
    },
    {
        id: "silver-soulsilver",
        name: "Silver / SoulSilver",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(71, 85, 105, 0.85)",
            trainerBadgeBackgroundColor: "#64748b",
            teamPokemonBackgroundColor: "rgba(51, 65, 85, 0.7)",
            teamPokemonAccentColor: "#94a3b8",
            teamPokemonNatureColor: "#cbd5e1",
            teamPokemonAbilityColor: "#a5b4fc",
        },
        preview: { primary: "#475569", secondary: "#334155", accent: "#94a3b8" },
    },
    {
        id: "crystal",
        name: "Crystal",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(6, 182, 212, 0.75)",
            trainerBadgeBackgroundColor: "#0891b2",
            teamPokemonBackgroundColor: "rgba(21, 94, 117, 0.7)",
            teamPokemonAccentColor: "#22d3ee",
            teamPokemonNatureColor: "#67e8f9",
            teamPokemonAbilityColor: "#5eead4",
        },
        preview: { primary: "#06b6d4", secondary: "#155e75", accent: "#22d3ee" },
    },
    {
        id: "ruby-omegaruby",
        name: "Ruby / Omega Ruby",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(190, 18, 60, 0.85)",
            trainerBadgeBackgroundColor: "#e11d48",
            teamPokemonBackgroundColor: "rgba(136, 19, 55, 0.7)",
            teamPokemonAccentColor: "#fb7185",
            teamPokemonNatureColor: "#fda4af",
            teamPokemonAbilityColor: "#f472b6",
        },
        preview: { primary: "#be123c", secondary: "#881337", accent: "#fb7185" },
    },
    {
        id: "sapphire-alphasapphire",
        name: "Sapphire / Alpha Sapphire",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(29, 78, 216, 0.85)",
            trainerBadgeBackgroundColor: "#2563eb",
            teamPokemonBackgroundColor: "rgba(30, 58, 138, 0.7)",
            teamPokemonAccentColor: "#60a5fa",
            teamPokemonNatureColor: "#93c5fd",
            teamPokemonAbilityColor: "#818cf8",
        },
        preview: { primary: "#1d4ed8", secondary: "#1e3a8a", accent: "#60a5fa" },
    },
    {
        id: "emerald",
        name: "Emerald",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(4, 120, 87, 0.85)",
            trainerBadgeBackgroundColor: "#059669",
            teamPokemonBackgroundColor: "rgba(6, 78, 59, 0.7)",
            teamPokemonAccentColor: "#34d399",
            teamPokemonNatureColor: "#6ee7b7",
            teamPokemonAbilityColor: "#2dd4bf",
        },
        preview: { primary: "#047857", secondary: "#064e3b", accent: "#34d399" },
    },
    {
        id: "diamond",
        name: "Diamond / Brilliant Diamond",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(79, 70, 229, 0.85)",
            trainerBadgeBackgroundColor: "#6366f1",
            teamPokemonBackgroundColor: "rgba(67, 56, 202, 0.7)",
            teamPokemonAccentColor: "#a5b4fc",
            teamPokemonNatureColor: "#c7d2fe",
            teamPokemonAbilityColor: "#c4b5fd",
        },
        preview: { primary: "#4f46e5", secondary: "#4338ca", accent: "#a5b4fc" },
    },
    {
        id: "pearl",
        name: "Pearl / Shining Pearl",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(219, 39, 119, 0.85)",
            trainerBadgeBackgroundColor: "#ec4899",
            teamPokemonBackgroundColor: "rgba(157, 23, 77, 0.7)",
            teamPokemonAccentColor: "#f472b6",
            teamPokemonNatureColor: "#fbcfe8",
            teamPokemonAbilityColor: "#e879f9",
        },
        preview: { primary: "#db2777", secondary: "#9d174d", accent: "#f472b6" },
    },
    {
        id: "platinum",
        name: "Platinum",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(82, 82, 91, 0.85)",
            trainerBadgeBackgroundColor: "#71717a",
            teamPokemonBackgroundColor: "rgba(63, 63, 70, 0.7)",
            teamPokemonAccentColor: "#a1a1aa",
            teamPokemonNatureColor: "#d4d4d8",
            teamPokemonAbilityColor: "#a5b4fc",
        },
        preview: { primary: "#52525b", secondary: "#3f3f46", accent: "#a1a1aa" },
    },
    {
        id: "black",
        name: "Black / Black 2",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(23, 23, 23, 0.9)",
            trainerBadgeBackgroundColor: "#404040",
            teamPokemonBackgroundColor: "rgba(10, 10, 10, 0.8)",
            teamPokemonAccentColor: "#737373",
            teamPokemonNatureColor: "#a3a3a3",
            teamPokemonAbilityColor: "#60a5fa",
        },
        preview: { primary: "#171717", secondary: "#0a0a0a", accent: "#737373" },
    },
    {
        id: "white",
        name: "White / White 2",
        category: "game",
        colors: {
            trainerBackgroundColor: "rgba(250, 250, 250, 0.9)",
            trainerTextColor: "#262626",
            trainerNameColor: "#171717",
            trainerTitleColor: "rgba(0, 0, 0, 0.6)",
            trainerStatLabelColor: "rgba(0, 0, 0, 0.5)",
            trainerStatValueColor: "rgba(0, 0, 0, 0.8)",
            trainerBadgeBackgroundColor: "#3b82f6",
            trainerBadgeTextColor: "#ffffff",
            trainerNotesColor: "rgba(0, 0, 0, 0.6)",
            teamPokemonBackgroundColor: "rgba(245, 245, 245, 0.9)",
            teamPokemonTextColor: "#1f2937",
            teamPokemonTextSecondaryColor: "rgba(0, 0, 0, 0.6)",
            teamPokemonTextMutedColor: "rgba(0, 0, 0, 0.4)",
            teamPokemonAccentColor: "#3b82f6",
            teamPokemonNatureColor: "#ea580c",
            teamPokemonAbilityColor: "#059669",
            teamPokemonMoveBackgroundColor: "rgba(0, 0, 0, 0.08)",
            teamPokemonMoveTextColor: "rgba(0, 0, 0, 0.7)",
            teamPokemonShinyColor: "#eab308",
            teamPokemonMvpBackgroundColor: "#fef3c7",
            teamPokemonMvpTextColor: "#92400e",
        },
        preview: { primary: "#fafafa", secondary: "#f5f5f5", accent: "#3b82f6" },
    },
    {
        id: "x",
        name: "X",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(37, 99, 235, 0.85)",
            trainerBadgeBackgroundColor: "#3b82f6",
            teamPokemonBackgroundColor: "rgba(29, 78, 216, 0.7)",
            teamPokemonAccentColor: "#60a5fa",
            teamPokemonNatureColor: "#93c5fd",
            teamPokemonAbilityColor: "#38bdf8",
        },
        preview: { primary: "#2563eb", secondary: "#1d4ed8", accent: "#60a5fa" },
    },
    {
        id: "y",
        name: "Y",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(220, 38, 38, 0.85)",
            trainerBadgeBackgroundColor: "#ef4444",
            teamPokemonBackgroundColor: "rgba(185, 28, 28, 0.7)",
            teamPokemonAccentColor: "#f87171",
            teamPokemonNatureColor: "#fca5a5",
            teamPokemonAbilityColor: "#fb923c",
        },
        preview: { primary: "#dc2626", secondary: "#b91c1c", accent: "#f87171" },
    },
    {
        id: "sun-ultrasun",
        name: "Sun / Ultra Sun",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(234, 88, 12, 0.85)",
            trainerBadgeBackgroundColor: "#f97316",
            teamPokemonBackgroundColor: "rgba(194, 65, 12, 0.7)",
            teamPokemonAccentColor: "#fb923c",
            teamPokemonNatureColor: "#fdba74",
            teamPokemonAbilityColor: "#facc15",
        },
        preview: { primary: "#ea580c", secondary: "#c2410c", accent: "#fb923c" },
    },
    {
        id: "moon-ultramoon",
        name: "Moon / Ultra Moon",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(109, 40, 217, 0.85)",
            trainerBadgeBackgroundColor: "#7c3aed",
            teamPokemonBackgroundColor: "rgba(91, 33, 182, 0.7)",
            teamPokemonAccentColor: "#a78bfa",
            teamPokemonNatureColor: "#c4b5fd",
            teamPokemonAbilityColor: "#e879f9",
        },
        preview: { primary: "#6d28d9", secondary: "#5b21b6", accent: "#a78bfa" },
    },
    {
        id: "sword",
        name: "Sword",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(8, 145, 178, 0.85)",
            trainerBadgeBackgroundColor: "#06b6d4",
            teamPokemonBackgroundColor: "rgba(14, 116, 144, 0.7)",
            teamPokemonAccentColor: "#22d3ee",
            teamPokemonNatureColor: "#67e8f9",
            teamPokemonAbilityColor: "#38bdf8",
        },
        preview: { primary: "#0891b2", secondary: "#0e7490", accent: "#22d3ee" },
    },
    {
        id: "shield",
        name: "Shield",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(192, 38, 211, 0.85)",
            trainerBadgeBackgroundColor: "#d946ef",
            teamPokemonBackgroundColor: "rgba(162, 28, 175, 0.7)",
            teamPokemonAccentColor: "#e879f9",
            teamPokemonNatureColor: "#f0abfc",
            teamPokemonAbilityColor: "#f472b6",
        },
        preview: { primary: "#c026d3", secondary: "#a21caf", accent: "#e879f9" },
    },
    {
        id: "scarlet",
        name: "Scarlet",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(239, 68, 68, 0.85)",
            trainerBadgeBackgroundColor: "#f43f5e",
            teamPokemonBackgroundColor: "rgba(220, 38, 38, 0.7)",
            teamPokemonAccentColor: "#fb7185",
            teamPokemonNatureColor: "#fda4af",
            teamPokemonAbilityColor: "#f97316",
        },
        preview: { primary: "#ef4444", secondary: "#dc2626", accent: "#fb7185" },
    },
    {
        id: "violet",
        name: "Violet",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(139, 92, 246, 0.85)",
            trainerBadgeBackgroundColor: "#a855f7",
            teamPokemonBackgroundColor: "rgba(124, 58, 237, 0.7)",
            teamPokemonAccentColor: "#c084fc",
            teamPokemonNatureColor: "#d8b4fe",
            teamPokemonAbilityColor: "#e879f9",
        },
        preview: { primary: "#8b5cf6", secondary: "#7c3aed", accent: "#c084fc" },
    },
    {
        id: "legends-arceus",
        name: "Legends: Arceus",
        category: "game",
        colors: {
            ...resultV2ThemeDefaults,
            trainerBackgroundColor: "rgba(120, 53, 15, 0.85)",
            trainerBadgeBackgroundColor: "#92400e",
            teamPokemonBackgroundColor: "rgba(69, 26, 3, 0.7)",
            teamPokemonAccentColor: "#d97706",
            teamPokemonNatureColor: "#fbbf24",
            teamPokemonAbilityColor: "#84cc16",
        },
        preview: { primary: "#78350f", secondary: "#451a03", accent: "#d97706" },
    },
];

export interface Styles {
    accentColor: string;
    backgroundImage: string;
    bgColor: string;
    customCSS: string;
    displayBadges: boolean;
    displayRules: boolean;
    editorDarkMode: boolean;
    font: string;
    usePokemonGBAFont: boolean;
    iconsNextToTeamPokemon: boolean;
    iconRendering: IconRenderingType;
    imageStyle: RadiusType;
    itemStyle: ItemStyle;
    pokeballStyle: ItemStyle;
    grayScaleDeadPokemon: boolean;
    minimalBoxedLayout: boolean;
    minimalTeamLayout: boolean;
    minimalDeadLayout: boolean;
    minimalChampsLayout: boolean;
    movesPosition: OrientationType;
    oldMetLocationFormat: boolean;
    resultHeight: string | number;
    resultWidth: string | number;
    trainerHeight: string | number;
    trainerWidth: string | number;
    trainerAuto: boolean;
    scaleSprites: boolean;
    showPokemonMoves: boolean;
    spritesMode: boolean;
    teamImages: TeamImagesType;
    teamPokemonBorder: boolean;
    template: string;
    tileBackground: boolean;
    topHeaderColor: string;
    trainerSectionOrientation: OrientationType;
    useSpritesForChampsPokemon: boolean;
    boxedPokemonPerLine: number;
    displayGameOriginForBoxedAndDead: boolean;
    displayBackgroundInsteadOfBadge: boolean;
    displayExtraData: boolean;
    useAutoHeight: boolean;
    displayItemAsText: boolean;
    displayRulesLocation: RulesLocation;
    displayStats: boolean;
    statsOptions: StatsOptions;
    linkedPokemonText: string;
    customTeamHTML: string;
    zoomLevel: number;
    useAbilityMatchups: boolean;
    resultV2Theme: ResultV2Theme;
    teamLayout: TeamLayoutType;
}

export const styleDefaults: Styles = {
    accentColor: "#111111",
    backgroundImage: "",
    bgColor: "#383840",
    customCSS: "",
    displayBadges: true,
    displayRules: false,
    editorDarkMode: false,
    font: "Open Sans",
    iconsNextToTeamPokemon: false,
    imageStyle: "round",
    itemStyle: "outer glow",
    pokeballStyle: "outer glow",
    iconRendering: "auto",
    grayScaleDeadPokemon: false,
    minimalBoxedLayout: false,
    minimalTeamLayout: false,
    minimalDeadLayout: false,
    minimalChampsLayout: true,
    movesPosition: "horizontal" as OrientationType,
    oldMetLocationFormat: false,
    resultHeight: "900",
    resultWidth: "1200",
    scaleSprites: false,
    showPokemonMoves: true,
    spritesMode: false,
    teamImages: "standard",
    teamPokemonBorder: true,
    template: "Default Dark",
    tileBackground: false,
    topHeaderColor: "#333333",
    trainerSectionOrientation: "horizonal" as OrientationType,
    useSpritesForChampsPokemon: false,
    boxedPokemonPerLine: 6,
    displayGameOriginForBoxedAndDead: false,
    displayBackgroundInsteadOfBadge: false,
    displayExtraData: true,
    useAutoHeight: true,
    usePokemonGBAFont: false,
    displayItemAsText: false,
    displayRulesLocation: "bottom" as RulesLocation,
    trainerWidth: "20%",
    trainerHeight: "100%",
    trainerAuto: true,
    displayStats: false,
    linkedPokemonText: "Linked To",
    statsOptions: {
        averageLevel: false,
        averageLevelDetailed: false,
        mostCommonKillers: false,
        mostCommonTypes: false,
        shiniesCaught: false,
    },
    customTeamHTML: "",
    zoomLevel: 1,
    useAbilityMatchups: false,
    resultV2Theme: resultV2ThemeDefaults,
    teamLayout: "2x3" as TeamLayoutType,
};
