import { checkpoints } from "../checkpoints";
import { addCustomCheckpoint, deleteCheckpoint, editCheckpoint } from "actions";

describe("checkpoints", () => {
    const genState = () => [{ name: "TestBadge", image: "badge" }];

    it("works with add", () => {
        const state1 = genState();
        const subject = checkpoints(
            state1,
            addCustomCheckpoint({ name: "TestBadge2", image: "neat" }),
        );
        expect(subject.length).toBe(2);
    });

    it("works with delete", () => {
        const state2 = genState();
        const subject = checkpoints(state2, deleteCheckpoint("TestBadge"));
        expect(subject.length).toBe(0);
    });

    it("deletes one checkpoint by index when names are duplicated", () => {
        const subject = checkpoints(
            [
                { name: "Boulder Badge", image: "boulder-badge" },
                { name: "Boulder Badge", image: "unknown" },
            ],
            deleteCheckpoint("Boulder Badge", 1),
        );

        expect(subject).toEqual([
            { name: "Boulder Badge", image: "boulder-badge" },
        ]);
    });

    it("works with edit", () => {
        const state3 = genState();
        const subject = checkpoints(
            state3,
            editCheckpoint({ image: "test" }, "TestBadge"),
        );
        expect(subject[0].image).toBe("test");
    });

    it("edits the checkpoint at the provided index when names are duplicated", () => {
        const subject = checkpoints(
            [
                { name: "Boulder Badge", image: "boulder-badge" },
                { name: "Boulder Badge", image: "unknown" },
            ],
            editCheckpoint({ name: "Boulder Badge 2" }, "Boulder Badge", 1),
        );

        expect(subject).toEqual([
            { name: "Boulder Badge", image: "boulder-badge" },
            { name: "Boulder Badge 2", image: "unknown" },
        ]);
    });
});
