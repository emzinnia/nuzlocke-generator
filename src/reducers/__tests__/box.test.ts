import { addBox, deleteBox, editBox, replaceState } from "actions";
import { box, withUniqueBoxIds } from "../box";
import { deserializePersistedState, serializePersistedState } from "store/persistence";
import { createDefaultState } from "store";

describe("box reducer", () => {
    it("keeps an older custom box when a later box is added after an earlier one is deleted", () => {
        const withRoute = box(
            undefined,
            addBox({
                name: "Route 1",
                background: "route-1",
                inheritFrom: "Boxed",
            }),
        );
        const withSafari = box(
            withRoute,
            addBox({
                name: "Safari",
                background: "grass-meadow",
                inheritFrom: "Boxed",
            }),
        );
        const route = withSafari.find((entry) => entry.name === "Route 1");
        const withoutRoute = box(withSafari, deleteBox(route!.id));
        const withGraveyard = box(
            withoutRoute,
            addBox({
                name: "Graveyard",
                background: "stars",
                inheritFrom: "Dead",
            }),
        );
        const graveyard = withGraveyard.find((entry) => entry.name === "Graveyard");
        const safari = withGraveyard.find((entry) => entry.name === "Safari");

        expect(graveyard).toBeDefined();
        expect(safari).toBeDefined();
        expect(graveyard?.id).not.toBe(safari?.id);
        expect(graveyard?.position).not.toBe(safari?.position);

        const afterDeletingGraveyard = box(
            withGraveyard,
            deleteBox(graveyard!.id),
        );
        expect(afterDeletingGraveyard.map((entry) => entry.name)).toEqual([
            "Team",
            "Boxed",
            "Dead",
            "Champs",
            "Safari",
        ]);

        const collapsed = box(
            withGraveyard,
            editBox(graveyard!.id, { collapsed: true }),
        );
        expect(collapsed.map((entry) => entry.name)).toContain("Safari");
        expect(collapsed.find((entry) => entry.name === "Graveyard")?.collapsed).toBe(
            true,
        );
    });

    it("repairs a saved collision so deleting the new box leaves Champs in place", () => {
        const collided = [
            { id: 0, position: 0, name: "Team" },
            { id: 1, position: 1, name: "Boxed" },
            { id: 3, position: 3, name: "Champs" },
            { id: 3, position: 3, name: "Graveyard" },
        ];
        const repaired = withUniqueBoxIds(collided);
        const graveyard = repaired.find((entry) => entry.name === "Graveyard");

        expect(repaired.find((entry) => entry.name === "Champs")?.id).toBe(3);
        expect(graveyard?.id).not.toBe(3);
        expect(graveyard?.position).not.toBe(3);

        const afterDelete = box(repaired, deleteBox(graveyard!.id));
        expect(afterDelete.map((entry) => entry.name)).toEqual([
            "Team",
            "Boxed",
            "Champs",
        ]);

        const collapsed = box(repaired, editBox(graveyard!.id, { collapsed: true }));
        expect(collapsed.map((entry) => entry.name).sort()).toEqual([
            "Boxed",
            "Champs",
            "Graveyard",
            "Team",
        ]);
    });

    it("assigns new ids when a replaced save already contains duplicates", () => {
        const replaced = box(
            undefined,
            replaceState({
                box: [
                    { id: 0, position: 0, name: "Team" },
                    { id: 0, position: 0, name: "Champs" },
                ],
            }),
        );

        expect(replaced.map((entry) => entry.id)).toEqual([0, 1]);
        expect(replaced.map((entry) => entry.name)).toEqual(["Team", "Champs"]);
    });

    it("repairs duplicate box ids while rehydrating a persisted save", () => {
        const state = createDefaultState();
        state.box = [
            { id: 0, position: 0, name: "Team" },
            { id: 3, position: 3, name: "Champs" },
            { id: 3, position: 3, name: "Graveyard" },
        ];
        const loaded = deserializePersistedState(serializePersistedState(state));
        const ids = loaded?.box?.map((entry) => entry.id) ?? [];

        expect(new Set(ids).size).toBe(3);
        expect(loaded?.box?.find((entry) => entry.name === "Champs")?.id).toBe(3);
        expect(loaded?.box?.find((entry) => entry.name === "Graveyard")?.id).not.toBe(
            3,
        );
    });
});
