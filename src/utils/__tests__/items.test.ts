import { listOfItems } from "utils/data";
import { getHeldItemIconPath } from "utils/formatters";

const teraShardTypes = [
    "Normal",
    "Fire",
    "Water",
    "Electric",
    "Grass",
    "Ice",
    "Fighting",
    "Poison",
    "Ground",
    "Flying",
    "Psychic",
    "Bug",
    "Rock",
    "Ghost",
    "Dragon",
    "Dark",
    "Steel",
    "Fairy",
];

describe("Tera Shard items", () => {
    it("lists every Tera Shard in the held item options", () => {
        for (const type of teraShardTypes) {
            expect(listOfItems).toContain(`${type} Tera Shard`);
        }
    });

    it("uses the existing Tera type icons for Tera Shards", () => {
        for (const type of teraShardTypes) {
            expect(getHeldItemIconPath(`${type} Tera Shard`)).toBe(
                `icons/hold-item/../tera/${type.toLowerCase()}.png`,
            );
        }
    });
});
