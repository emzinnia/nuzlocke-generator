import { describe, expect, it } from "vitest";
import { customCSSGuide } from "../customCSSGuide";

describe("customCSSGuide", () => {
    it("documents a recipe for long Pokemon notes and moves", () => {
        expect(customCSSGuide).toContain("Showing long notes above moves");
        expect(customCSSGuide).toContain(".pokemon-notes");
        expect(customCSSGuide).toContain(".pokemon-moves");
        expect(customCSSGuide).toContain(".pokemon-image-wrapper");
    });
});
