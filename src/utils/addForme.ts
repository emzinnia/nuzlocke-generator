import { Forme } from "./Forme";

export const addForme = (
    species: string | undefined,
    forme?: keyof typeof Forme,
) => {
    if (forme) {
        if (forme === "Normal") {
            if (species === "Oricorio") {
                return `${species}-baile`;
            }
            return species;
        }
        if (forme === "Alolan") {
            return `alolan-${species}`;
        }
        if (forme === "Paldean") {
            return `paldean-${species}`;
        }
        if (forme === "Paldean-Aqua") {
            return `paldean-aqua-${species}`;
        }
        if (forme === "Paldean-Blaze") {
            return `paldean-blaze-${species}`;
        }
        if (forme === "Galarian") {
            return `galarian-${species}`;
        }
        if (forme === "Hisuian") {
            return `hisuian-${species}`;
        }
        if (forme === "Mega") {
            return `${species}-mega`;
        }
        if (forme === "Mega-X") {
            return `${species}-mega-x`;
        }
        if (forme === "Mega-Y") {
            return `${species}-mega-y`;
        }
        if (forme === "D") {
            return `${species}-d`;
        }
        if (forme === "10%") {
            return `${species}-10`;
        }
        if (forme === "Complete") {
            return `${species}-complete`;
        }
        if (forme === "West Sea") {
            return `${species}-west`;
        }
        if (forme === "East Sea") {
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
            ].includes(forme)
        ) {
            return `${species}-${forme.replace(/\s/g, "-").replace(/\'/g, "-").toLowerCase()}`;
        }
        return species;
    } else {
        return species;
    }
};
