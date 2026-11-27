import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getIconURL } from "../PokemonIcon";
import { Forme } from "utils";

const hisuianSpecies = [
    "Arcanine",
    "Avalugg",
    "Braviary",
    "Decidueye",
    "Electrode",
    "Goodra",
    "Growlithe",
    "Lilligant",
    "Qwilfish",
    "Samurott",
    "Sliggoo",
    "Sneasel",
    "Typhlosion",
    "Voltorb",
    "Zoroark",
    "Zorua",
];

describe(getIconURL.name, () => {
    it("resolves supported Hisuian forms to existing regular box icons", () => {
        for (const species of hisuianSpecies) {
            const iconUrl = getIconURL({
                id: species,
                species,
                forme: "Hisuian" as Forme,
            });

            expect(iconUrl).toBe(
                `icons/pokemon/regular/${species.toLowerCase()}-hisui.png`,
            );
            expect(
                existsSync(path.join(process.cwd(), "src/assets", iconUrl)),
            ).toBe(true);
        }
    });
});
