import { expect, test, type Page } from "@playwright/test";

const box = [
    { id: 0, position: 0, name: "Team" },
    { id: 1, position: 1, name: "Boxed" },
    { id: 2, position: 2, name: "Dead" },
    { id: 3, position: 3, name: "Champs" },
];

const baseStyle = {
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
    movesPosition: "horizontal",
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
    trainerSectionOrientation: "horizonal",
    useSpritesForChampsPokemon: false,
    boxedPokemonPerLine: 6,
    displayGameOriginForBoxedAndDead: false,
    displayBackgroundInsteadOfBadge: false,
    displayExtraData: true,
    useAutoHeight: true,
    usePokemonGBAFont: false,
    displayItemAsText: false,
    displayRulesLocation: "bottom",
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

const serializePersistedState = (state: Record<string, unknown>) => {
    const envelope: Record<string, string> = {};
    for (const [key, value] of Object.entries(state)) {
        envelope[key] = JSON.stringify(value);
    }
    envelope._persist = JSON.stringify({
        version: "1.23.0",
        rehydrated: true,
    });
    return JSON.stringify(envelope);
};

const makePokemon = (
    id: string,
    position: number,
    species: string,
    extra: Record<string, unknown> = {},
) => ({
    id,
    position,
    species,
    nickname: species,
    status: "Team",
    gender: "genderless",
    nature: "None",
    ability: "",
    met: "",
    types: ["Normal", "Normal"],
    egg: false,
    ...extra,
});

const getImageAssetPaths = async (page: Page) =>
    page.locator(".team-container .pokemon-image").evaluateAll((elements) =>
        elements.map((element) => {
            const backgroundImage = getComputedStyle(element).backgroundImage;
            const match = /url\("?(.*?)"?\)/.exec(backgroundImage);
            return match ? new URL(match[1], location.href).pathname : "";
        }),
    );

const getMissingImageAssetPaths = async (page: Page) =>
    page.locator(".team-container .pokemon-image, .trainer-image").evaluateAll(
        async (elements) => {
            const missing: string[] = [];

            for (const element of elements) {
                const source =
                    element instanceof HTMLImageElement
                        ? element.currentSrc || element.src
                        : /url\("?(.*?)"?\)/.exec(
                              getComputedStyle(element).backgroundImage,
                          )?.[1];
                if (!source) {
                    missing.push("<empty>");
                    continue;
                }

                const url = new URL(source, location.href);
                const response = await fetch(url.href);
                if (!response.ok) {
                    missing.push(`${url.pathname} (${response.status})`);
                }
            }

            return missing;
        },
    );

const scenarios = [
    {
        name: "standard image overrides",
        style: { teamImages: "standard" },
        trainer: { badges: [], image: "Sun" },
        pokemon: [
            makePokemon("mr-mime", 0, "Mr. Mime", {
                types: ["Psychic", "Fairy"],
            }),
            makePokemon("toxtricity", 1, "Toxtricity", {
                forme: "Amped",
                types: ["Electric", "Poison"],
            }),
            makePokemon("skitty", 2, "Skitty", {
                types: ["Normal", "Normal"],
            }),
        ],
        expectedPaths: [
            "/img/mr.mime.jpg",
            "/img/toxtricity-amped-up.jpg",
            "/img/skitty.jpg",
        ],
    },
    {
        name: "shuffle Mr. Mime",
        style: { teamImages: "shuffle" },
        trainer: { badges: [] },
        pokemon: [
            makePokemon("mr-mime", 0, "Mr. Mime", {
                types: ["Psychic", "Fairy"],
            }),
        ],
        expectedPaths: ["/img/shuffle/mr-mime.png"],
    },
    {
        name: "Sugimori form assets",
        style: { teamImages: "sugimori" },
        trainer: { badges: [] },
        pokemon: [
            makePokemon("hitmontop", 0, "Hitmontop", {
                types: ["Fighting", "Fighting"],
            }),
            makePokemon("darumaka", 1, "Darumaka", {
                forme: "Galarian",
                types: ["Ice", "Ice"],
            }),
        ],
        expectedPaths: ["/img/sugimori/237.png", "/img/sugimori/554-galar.jpg"],
    },
];

for (const scenario of scenarios) {
    test(`downloads result with ${scenario.name}`, async ({ page }) => {
        await page.addInitScript((persistedState) => {
            window.localStorage.setItem("persist:root", persistedState);
        }, serializePersistedState({
            box,
            checkpoints: [],
            confirmation: true,
            customAreas: [],
            customMoveMap: [],
            customTypes: [],
            excludedAreas: [],
            game: { name: "Sword", customName: "Image export regression" },
            pokemon: scenario.pokemon,
            rules: [],
            selectedId: "",
            stats: [{ id: "a-1", key: "", value: "" }],
            style: { ...baseStyle, ...scenario.style },
            trainer: scenario.trainer,
        }));

        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const teamSlots = page.locator(".team-container .pokemon-container");
        await expect(teamSlots).toHaveCount(scenario.pokemon.length);

        await expect.poll(() => getImageAssetPaths(page)).toEqual(
            scenario.expectedPaths,
        );
        await expect.poll(() => getMissingImageAssetPaths(page)).toEqual([]);

        const downloadPromise = page.waitForEvent("download");
        await page.getByTestId("download-image-button").click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toMatch(/^nuzlocke-.*\.png$/);
        expect(await download.failure()).toBeNull();
    });
}
