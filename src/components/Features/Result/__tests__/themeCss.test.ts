import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("result theme CSS", () => {
    it("keeps Generations dead boxes aligned with other box containers", () => {
        const css = readFileSync(
            join(__dirname, "../themes.css"),
            "utf8",
        );

        expect(css).toMatch(
            /\.generations \.boxed-container,\s*\.generations \.team-container,\s*\.generations \.dead-container,\s*\.generations \.champs-container\s*{\s*margin: 0\.5rem !important;/,
        );
    });
});
