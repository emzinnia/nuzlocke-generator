import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getIconFormeSuffix } from "../getIconFormeSuffix";

describe(getIconFormeSuffix.name, () => {
    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        ["Therian", "-therian"],
        ["Primal", "-primal"],
        ["Blue", "-blue"],
        ["Eternal Flower", "-eternal"],
        ["Spiky-eared", "-spiky-eared"],
        ["Blue-Striped", "-blue-striped"],
        ["White-Striped", "-white-striped"],
        ["Resolute", "-resolute"],
        ["Burn Drive", "-fire"],
        ["Chill Drive", "-ice"],
        ["Douse Drive", "-water"],
        ["Shock Drive", "-electric"],
        ["Dandy", "-dandy"],
        ["La Reine", "-la-reine"],
        ["Midnight", "-midnight"],
        ["Dusk", "-dusk"],
        ["Rock Star", "-rock-star"],
        ["Ph. D", "-phd"],
        ["Original Cap", "-original-cap"],
    ] as const)("maps %s to %s", (forme, suffix) => {
        expect(getIconFormeSuffix(forme as never)).toBe(suffix);
    });

    it.each(["Plant", "Red", "Red-Striped", "Midday"] as const)(
        "keeps default icon suffix for %s",
        (forme) => {
            expect(getIconFormeSuffix(forme as never)).toBe("");
        },
    );
});
