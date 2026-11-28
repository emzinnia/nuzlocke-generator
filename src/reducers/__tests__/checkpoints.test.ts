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

    it("works with edit", () => {
        const state3 = genState();
        const subject = checkpoints(
            state3,
            editCheckpoint({ image: "test" }, "TestBadge"),
        );
        expect(subject[0].image).toBe("test");
    });
});
