import { customTypes } from "../customTypes";
import {
    addCustomCheckpoint,
    deleteCheckpoint,
    editCheckpoint,
    createCustomType,
    editCustomType,
    deleteCustomType,
} from "actions";

describe("customTypes", () => {
    const genState = () => [{ id: "1", type: "Cosmic", color: "purple" }];

    it("works with add", () => {
        const state1 = genState();
        const subject = customTypes(
            state1,
            createCustomType({ type: "Light", color: "white" }),
        );
        expect(subject.length).toBe(2);
    });

    it("works with edit", () => {
        const state2 = genState();
        const subject = customTypes(
            state2,
            editCustomType("1", { color: "black" }),
        );
        expect(subject[0].color).toBe("black");
    });

    it("works with delete", () => {
        const state = genState();
        const subject = customTypes(state, deleteCustomType("1"));
        expect(subject.length).toBe(0);
    });
});
