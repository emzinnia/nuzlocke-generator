import { addBox, deleteBox, editBox } from "actions";
import { box } from "../box";

const defaultState = box(undefined, { type: "@@INIT" } as never);

describe("box", () => {
    it("assigns unique ids and positions after a custom box is deleted", () => {
        const withFirst = box(
            defaultState,
            addBox({
                name: "Custom A",
                background: "grass-meadow",
                inheritFrom: "Boxed",
            }),
        );
        const withSecond = box(
            withFirst,
            addBox({
                name: "Custom B",
                background: "grass-meadow",
                inheritFrom: "Boxed",
            }),
        );
        const firstCustom = withSecond.find((entry) => entry.name === "Custom A");
        const secondCustom = withSecond.find((entry) => entry.name === "Custom B");
        expect(firstCustom).toBeDefined();
        expect(secondCustom).toBeDefined();

        const afterDelete = box(withSecond, deleteBox(firstCustom!.id));
        const withThird = box(
            afterDelete,
            addBox({
                name: "Custom C",
                background: "grass-meadow",
                inheritFrom: "Boxed",
            }),
        );

        const remainingCustom = withThird.filter((entry) =>
            ["Custom B", "Custom C"].includes(entry.name),
        );
        const ids = remainingCustom.map((entry) => entry.id);
        const positions = remainingCustom.map((entry) => entry.position);

        expect(new Set(ids).size).toBe(ids.length);
        expect(new Set(positions).size).toBe(positions.length);

        const customB = withThird.find((entry) => entry.name === "Custom B")!;
        const customC = withThird.find((entry) => entry.name === "Custom C")!;
        const afterEdit = box(
            withThird,
            editBox(customC.id, { collapsed: true }),
        );

        expect(
            afterEdit.find((entry) => entry.name === "Custom B")?.collapsed,
        ).toBeUndefined();
        expect(
            afterEdit.find((entry) => entry.name === "Custom C")?.collapsed,
        ).toBe(true);
        expect(customB.id).not.toBe(customC.id);
    });
});
