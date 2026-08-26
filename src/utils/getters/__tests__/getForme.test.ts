import { describe, expect, it } from "vitest";

import { getForme } from "../getForme";

describe("@src/utils/getters/getForme.ts", () => {
    it("uses Serebii-compatible Shellos and Gastrodon forme suffixes", () => {
        expect(getForme("West Sea")).toBe("");
        expect(getForme("East Sea")).toBe("-e");
    });
});
