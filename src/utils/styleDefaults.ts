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

export interface StatsOptions {
    averageLevel: boolean;
    averageLevelDetailed: boolean;
    mostCommonKillers: boolean;
    mostCommonTypes: boolean;
    shiniesCaught: boolean;
}

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
};
