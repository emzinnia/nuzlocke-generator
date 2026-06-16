import { addForme, speciesToNumber, getForme } from "utils";
import {
    capitalize,
    Game,
    Forme,
    Species,
    significantGenderDifferenceList,
    wrapImageInCORS,
    normalizeSpeciesName,
} from "utils";
import { getIconFormeSuffix } from "./getIconFormeSuffix";
import { Editor, Pokemon } from "models";
import { State } from "state";
import { GenderElementProps } from "components";
import { getImages } from "components/Common/Shared/ImagesDrawer";

const handleTcgTransforms = (species?: string, gender?: GenderElementProps) => {
    if (gender === "Female") {
        if (species && significantGenderDifferenceList.includes(species))
            return `${species}-f`;
    }
    return species;
};

const getGameName = (name: Game) => {
    if (name === "Red" || name === "Blue") return "rb";
    if (
        name === "Ruby" ||
        name === "Sapphire" ||
        name === "FireRed" ||
        name === "LeafGreen" ||
        name === "Emerald"
    ) {
        return "emerald";
    }
    if (name === "Diamond" || name === "Pearl" || name === "Platinum")
        return "dp";
    if (name === "HeartGold" || name === "SoulSilver") return "hgss";
    if (
        name === "Black" ||
        name === "White" ||
        name === "White 2" ||
        name === "Black 2"
    )
        return "blackwhite";
    if (
        name === "X" ||
        name === "Y" ||
        name === "OmegaRuby" ||
        name === "AlphaSapphire"
    )
        return "xy";
    if (
        name === "Sun" ||
        name === "Moon" ||
        name === "Ultra Sun" ||
        name === "Ultra Moon" ||
        name === "Colosseum" ||
        name === "XD Gale of Darkness" ||
        name === "None"
    )
        return "sunmoon";
    if (
        name === "Green" ||
        name === "Gold" ||
        name === "Silver" ||
        name === "Yellow" ||
        name === "Crystal"
    ) {
        return name.toLowerCase();
    }
    if (
        name === "Sword" ||
        name === "Shield" ||
        name === "Brilliant Diamond" ||
        name === "Shining Pearl"
    ) {
        return "swordshield";
    }
    if (name === "Legends: Z-A") {
        return "legendsz-a";
    }
    return "sm";
};

const getGameNameSerebii = (name: Game) => {
    switch (name) {
        case "Black":
        case "Black 2":
        case "White":
        case "White 2":
            return "BW";
        case "Gold":
            return "Gold";
        case "Silver":
            return "Silver";
        case "Crystal":
            return "Crystal";
        case "Ruby":
        case "Sapphire":
            return "RuSa";
        case "FireRed":
        case "LeafGreen":
            return "FRLG";
        case "Emerald":
            return "Em";
        case "Diamond":
        case "Pearl":
        case "Platinum":
            return "DP";
        case "HeartGold":
        case "SoulSilver":
            return "HGSS";
        case "X":
        case "Y":
            return "XY";
        case "Sword":
        case "Shield":
        case "Brilliant Diamond":
        case "Shining Pearl":
            return "swordshield";
        case "Legends: Z-A":
            return "legendsz-a";
        default:
            return "SM";
    }
};

export interface GetPokemonImage {
    customImage?: string;
    forme?: Pokemon["forme"] | keyof typeof Forme;
    species?: string;
    name?: Game;
    style?: State["style"];
    shiny?: boolean;
    editor?: Editor;
    gender?: GenderElementProps;
    egg?: Pokemon["egg"];
}

const legacyFormeAliases: Record<string, keyof typeof Forme> = {
    alola: "Alolan",
    alolan: "Alolan",
    galar: "Galarian",
    galarian: "Galarian",
    amped: "AmpedUp",
    "amped-up": "AmpedUp",
    ampedup: "AmpedUp",
    lowkey: "Lowkey",
    "low-key": "Lowkey",
};

const normalizeFormeKey = (
    forme?: Pokemon["forme"] | keyof typeof Forme,
): keyof typeof Forme | undefined => {
    if (!forme) return undefined;
    if (forme in Forme) return forme as keyof typeof Forme;

    const formeText = forme.toString();
    const match = (
        Object.entries(Forme) as Array<[keyof typeof Forme, string]>
    ).find(([, value]) => value === formeText);
    if (match) return match[0];

    return legacyFormeAliases[formeText.toLowerCase()] ?? undefined;
};

const getLocalImageOverrideKey = (
    species?: string,
    forme?: Pokemon["forme"] | keyof typeof Forme,
) => `${species ?? ""}|${normalizeFormeKey(forme) ?? ""}`;

const standardImageOverrides: Record<string, string> = {
    "Mime Jr.|": "img/mimejr.jpg",
    "Mr. Mime|": "img/mr.mime.jpg",
    "Mr. Mime|Galarian": "img/galarian-mr.mime.jpg",
    "Mr. Rime|": "img/mr.rime.jpg",
    "Toxtricity|AmpedUp": "img/toxtricity-amped-up.jpg",
    "Toxtricity|Lowkey": "img/toxtricity-lowkey.jpg",
};

const sugimoriImageOverrides: Record<string, string> = {
    "Darumaka|Galarian": "img/sugimori/554-galar.jpg",
    "Toxtricity|Lowkey": "img/sugimori/849-low-key.png",
};

const shuffleSpeciesOverrides: Record<string, string> = {
    "Mime Jr.": "mime-jr",
    "Mr. Mime": "mr-mime",
    "Mr. Rime": "mr-rime",
};

export async function getPokemonImage({
    customImage,
    forme,
    species,
    name,
    style,
    shiny,
    editor,
    gender,
    egg,
}: GetPokemonImage): Promise<string> {
    const regularNumber = speciesToNumber((species as Species) || "Ditto");
    const leadingZerosNumber = (
        speciesToNumber((species as Species) || "Ditto") || 0
    )
        .toString()
        .padStart(3, "0");

    if (customImage) {
        const images = await getImages();
        const selectedImage = images.find(
            (img) => img.name === customImage,
        )?.image;
        if (selectedImage) {
            return `url(${selectedImage})`;
        }
        if (customImage.startsWith("http")) {
            return await wrapImageInCORS(customImage);
        }
        return `url(${customImage})`;
    }

    if (editor?.temtemMode) {
        return `url(img/temtem/${species?.trim()}.png)`;
    }

    if (egg) {
        return "url(img/egg.jpg)";
    }

    if (
        style?.spritesMode &&
        (name === "Black" ||
            name === "Emerald" ||
            name === "Ruby" ||
            name === "Sapphire" ||
            name === "White" ||
            name === "Black 2" ||
            name === "White 2" ||
            name === "X" ||
            name === "Y" ||
            name === "OmegaRuby" ||
            name === "AlphaSapphire" ||
            name === "Sun" ||
            name === "Moon" ||
            name === "Ultra Sun" ||
            name === "Ultra Moon" ||
            name === "Let's Go Eevee" ||
            name === "Let's Go Pikachu" ||
            name === "Colosseum" ||
            name === "XD Gale of Darkness")
    ) {
        if (!shiny) {
            const url = `https://www.serebii.net/${getGameName(
                name,
            )}/pokemon/${leadingZerosNumber}${getForme(forme)}.png`;

            return await wrapImageInCORS(url);
        } else {
            const url = `https://www.serebii.net/Shiny/${capitalize(
                getGameNameSerebii(name as Game),
            )}/${leadingZerosNumber}.png`;

            return await wrapImageInCORS(url);
        }
    }

    if (style?.spritesMode && (name === "Scarlet" || name === "Violet")) {
        if (!shiny) {
            const url = `https://serebii.net/scarletviolet/pokemon/new/${leadingZerosNumber}.png`;

            return await wrapImageInCORS(url);
        } else {
            const url = `https://serebii.net/Shiny/SV/new/${leadingZerosNumber}.png`;

            return await wrapImageInCORS(url);
        }
    }

    if (style?.spritesMode && (name === "Diamond" || name === "Pearl" || name === "Platinum" || name === "HeartGold" || name === "SoulSilver")) {
        if (!shiny) {
            const url = `https://www.serebii.net/pokearth/sprites/dp/${leadingZerosNumber}.png`;

            return await wrapImageInCORS(url);
        } else {
            const url = `https://www.serebii.net/Shiny/DP/${leadingZerosNumber}.png`;

            return await wrapImageInCORS(url);
        }
    }

    if (style?.spritesMode && (name === "LeafGreen" || name === "FireRed")) {
        if (!shiny) {
            const url = `https://img.pokemondb.net/sprites/firered-leafgreen/normal/${normalizeSpeciesName(
                species as Species,
            )}.png`;

            return await wrapImageInCORS(url);
        } else {
            const url = `https://img.pokemondb.net/sprites/firered-leafgreen/shiny/${normalizeSpeciesName(
                species as Species,
            )}.png`;

            return await wrapImageInCORS(url);
        }
    }

    if (style?.spritesMode && (name === "Sword" || name === "Shield")) {
        if (!shiny) {
            const url = `https://www.serebii.net/${getGameName(
                name,
            )}/pokemon/${leadingZerosNumber}${getForme(forme)}.png`;

            return await wrapImageInCORS(url);
        }
        const url = `https://www.serebii.net/Shiny/SWSH/${leadingZerosNumber}.png`;
        return await wrapImageInCORS(url);
    }

    if (style?.spritesMode) {
        const url = shiny
            ? `https://www.serebii.net/Shiny/${getGameNameSerebii(
                  name as Game,
              )}/${leadingZerosNumber}.png`
            : `https://www.serebii.net/${getGameName(name as Game)}/pokemon/${leadingZerosNumber}.png`;

        return await wrapImageInCORS(url);
    }

    if (style?.teamImages === "sugimori") {
        const override = sugimoriImageOverrides[
            getLocalImageOverrideKey(species, forme)
        ];
        if (override) return `url(${override})`;

        if (
            [521, 592, 593, 668, 678].includes(regularNumber || 0) &&
            (gender === "f" || gender === "Female")
        ) {
            return `url(img/sugimori/female/${regularNumber}${getIconFormeSuffix(
                forme as keyof typeof Forme,
            )}.png)`;
        }
        return `url(img/sugimori/${regularNumber}${getIconFormeSuffix(
            forme as keyof typeof Forme,
        )}.png)`;
    }

    if (style?.teamImages === "dream world") {
        return `url(img/dw/${regularNumber || 1}.svg)`;
    }

    if (style?.teamImages === "shuffle") {
        const shuffleSpecies =
            shuffleSpeciesOverrides[species ?? ""] ?? species ?? "Ditto";

        return `url(img/shuffle/${shuffleSpecies
            .trim()
            .replace(/\'/g, "")
            .replace(/\s/g, "-")
            .replace(/\./g, "-")
            .toLocaleLowerCase()}${getIconFormeSuffix(forme as keyof typeof Forme)}.png)`;
    }

    if (style?.teamImages === "tcg") {
        return `url(img/tcg/${(
            handleTcgTransforms(
                addForme(
                    (species || "").replace(/\s/g, "").replace(/'/g, ""),
                    forme as keyof typeof Forme,
                ),
                gender,
            ) || "missingno"
        ).toLowerCase()}.jpg)`;
    }
    // TEMPORARY STOPGAPS & Edge Cases & Special favors
    if (species === "Dugtrio" && forme === "Alolan" && shiny) {
        return "url(img/alolan-dugtrio-shiny.jpg)";
    }
    if (species === "Gyarados" && shiny) {
        return "url(img/gyarados-shiny.jpg)";
    }
    if (species === "Indeedee" && gender === "Male") {
        return "url(img/indeedee-m.jpg)";
    }
    if (species === "Basculegion" && gender === "Female") {
        return "url(img/basculegion-f.jpg)";
    }

    const standardOverride = standardImageOverrides[
        getLocalImageOverrideKey(species, forme)
    ];
    if (standardOverride) return `url(${standardOverride})`;

    return `url(img/${(
        addForme(
            (species || "")
                .trim()
                .replace(/\s/g, "-")
                .replace(/'/g, "")
                .replace(/:/g, "-"),
            forme as keyof typeof Forme,
        ) || "missingno"
    ).toLowerCase()}.jpg)`;
}

export const stripURLCSS = (str) =>
    str.replace(/url\(/g, "").replace(/\)/g, "");
