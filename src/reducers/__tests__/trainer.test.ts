import { deleteCheckpoint, editCheckpoint, editTrainer } from "actions";
import { trainer } from "../trainer";

describe("trainer", () => {
    it("edits trainer fields", () => {
        expect(trainer({ badges: [], name: "Ash" }, editTrainer({ name: "Red" }))).toEqual({
            badges: [],
            name: "Red",
        });
    });

    it("renames obtained badges when a checkpoint is renamed", () => {
        const state = {
            badges: [
                { name: "Boulder Badge", image: "boulder" },
                { name: "Cascade Badge", image: "cascade" },
            ],
        };

        expect(
            trainer(state, editCheckpoint({ name: "Rock Badge" }, "Boulder Badge")),
        ).toEqual({
            badges: [
                { name: "Rock Badge", image: "boulder" },
                { name: "Cascade Badge", image: "cascade" },
            ],
        });
    });

    it("updates obtained badge images when a checkpoint image changes", () => {
        const state = {
            badges: [{ name: "Boulder Badge", image: "boulder" }],
        };

        expect(
            trainer(
                state,
                editCheckpoint({ image: "custom-boulder.png" }, "Boulder Badge"),
            ),
        ).toEqual({
            badges: [{ name: "Boulder Badge", image: "custom-boulder.png" }],
        });
    });

    it("removes obtained badges when a checkpoint is deleted", () => {
        const state = {
            badges: [
                { name: "Boulder Badge", image: "boulder" },
                { name: "Cascade Badge", image: "cascade" },
            ],
        };

        expect(trainer(state, deleteCheckpoint("Boulder Badge"))).toEqual({
            badges: [{ name: "Cascade Badge", image: "cascade" }],
        });
    });
});
