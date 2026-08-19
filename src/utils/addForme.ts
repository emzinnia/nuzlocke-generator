import { Forme, normalizeFormeKey } from "./Forme";

export const addForme = (
    species: string | undefined,
    forme?: keyof typeof Forme | Forme | string,
) => {
    const normalizedForme = normalizeFormeKey(forme) ?? forme;

    if (normalizedForme) {
        if (normalizedForme === "Normal") {
            if (species === "Oricorio") {
                return `${species}-baile`;
            }
            return species;
        }
        if (normalizedForme === "Alolan") {
            return `alolan-${species}`;
        }
        if (normalizedForme === "Paldean") {
            return `paldean-${species}`;
        }
        if (normalizedForme === "Paldean-Aqua") {
            return `palden-aqua-${species}`;
        }
        if (normalizedForme === "Paldean-Blaze") {
            return `paldean-blaze-${species}`;
        }
        if (normalizedForme === "Galarian") {
            return `galarian-${species}`;
        }
        if (normalizedForme === "Hisuian") {
            return `hisuian-${species}`;
        }
        if (normalizedForme === "Mega") {
            return `${species}-mega`;
        }
        if (normalizedForme === "Mega-X") {
            return `${species}-mega-x`;
        }
        if (normalizedForme === "Mega-Y") {
            return `${species}-mega-y`;
        }
        if (normalizedForme === "D") {
            return `${species}-d`;
        }
        if (normalizedForme === "10%") {
            return `${species}-10`;
        }
        if (normalizedForme === "Complete") {
            return `${species}-complete`;
        }
        if (normalizedForme === "West Sea") {
            return `${species}-west`;
        }
        if (normalizedForme === "East Sea") {
            return `${species}-east`;
        }
        // Forms that don't require special formatting
        if (
            [
                "Heat",
                "Frost",
                "Fan",
                "Heat",
                "Mow",

                "Summer",
                "Spring",
                "Autumn",
                "Winter",

                "Sensu",
                "Baile",
                "Pom-Pom",
                "Pa'u",

                "Dawn Wings",
                "Dusk Mane",
                "Ultra",

                "Origin",
                "Sky",

                "Attack",
                "Defense",
                "Speed",

                "Midday",
                "Dusk",
                "Midnight",

                "Amped",
                "Lowkey",
                "Gigantamax",

                "Black",
                "White",

                "School",
                "Pirouette",

                "Therian",

                "Wellspring",
                "Heartflame",
                "Cornerstone",
            ].includes(normalizedForme)
        ) {
            return `${species}-${normalizedForme.replace(/\s/g, "-").replace(/\'/g, "-").toLowerCase()}`;
        }
        return species;
    } else {
        return species;
    }
};
