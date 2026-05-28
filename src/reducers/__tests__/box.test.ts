import { editBox, reorderBoxes } from "actions";
import { Boxes } from "models";

import { box } from "../box";

describe("box", () => {
    const boxes = (): Boxes => [
        { id: 0, name: "Team", position: 0 },
        { id: 1, name: "Boxed", position: 1 },
        { id: 2, name: "Dead", position: 2 },
        { id: 3, name: "Champs", position: 3 },
    ];

    it("preserves array order when editing a box", () => {
        const subject = box(boxes(), editBox(1, { collapsed: true }));

        expect(subject.map(({ name }) => name)).toEqual([
            "Team",
            "Boxed",
            "Dead",
            "Champs",
        ]);
        expect(subject[1]).toMatchObject({ name: "Boxed", collapsed: true });
    });

    it("moves a dragged box to the target box position", () => {
        const subject = box(boxes(), reorderBoxes(1, 3));

        expect(subject.map(({ name }) => name)).toEqual([
            "Team",
            "Dead",
            "Champs",
            "Boxed",
        ]);
        expect(subject.map(({ position }) => position)).toEqual([0, 1, 2, 3]);
    });

    it("returns the same state for an invalid reorder", () => {
        const state = boxes();

        expect(box(state, reorderBoxes(99, 3))).toBe(state);
        expect(box(state, reorderBoxes(1, 1))).toBe(state);
    });
});
