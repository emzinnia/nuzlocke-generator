import { Species, listOfPokemon } from "utils/data/listOfPokemon";

// Gen 4 species mapping by internal index number (matches National Dex order).
// Source: https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_index_number_in_Generation_IV
// Notes:
// - Gen 4 index numbers are aligned with National Dex 001-493.
// - Slots 0x1F5-0x1FB (501-507) were added in Platinum and are empty in
//   Diamond/Pearl; we explicitly reserve them as `undefined`.
export const GEN4_SPECIES_MAP: { [hexIndex: number]: Species | undefined } =
    (() => {
        const map: { [hexIndex: number]: Species | undefined } = {};

        // Populate 0x001-0x1ED (1-493).
        for (let i = 0; i < 493 && i < listOfPokemon.length; i++) {
            const index = i + 1; // Bulbapedia uses 1-based indexing.
            map[index] = listOfPokemon[i] as Species;
        }

        map[0x1EE] = "Egg" as Species;
        // Manaphy Egg
        map[0x1EF] = "Egg" as Species;
        // Attack
        map[0x1F0] = "Deoxys" as Species;
        // Defense
        map[0x1F1] = "Deoxys" as Species;
        // Speed
        map[0x1F2] = "Deoxys" as Species;
        // Sand
        map[0x1F3] = "Wormadam" as Species;
        // Trash
        map[0x1F4] = "Wormadam" as Species;
        // Origin
        map[0x1F5] = "Giratina" as Species;
        // Sky
        map[0x1F6] = "Shaymin" as Species;
        // Heat
        map[0x1F7] = "Rotom" as Species;
        // Wash
        map[0x1F8] = "Rotom" as Species;
        // Frost
        map[0x1F9] = "Rotom" as Species;
        // Fan
        map[0x1FA] = "Rotom" as Species;
        // Mow
        map[0x1FB] = "Rotom" as Species;

        return map;
    })();

