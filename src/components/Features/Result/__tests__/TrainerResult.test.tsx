import { describe, expect, it } from "vitest";

import { isCustomCheckpointImage } from "../TrainerResult";

describe(isCustomCheckpointImage.name, () => {
    it("identifies uploaded and remote checkpoint images", () => {
        expect(isCustomCheckpointImage("https://example.com/badge.png")).toBe(
            true,
        );
        expect(isCustomCheckpointImage("data:image/png;base64,badge")).toBe(
            true,
        );
        expect(isCustomCheckpointImage("boulder-badge")).toBe(false);
    });
});
