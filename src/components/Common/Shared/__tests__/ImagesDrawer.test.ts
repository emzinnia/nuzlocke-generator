import { beforeEach, describe, expect, it } from "vitest";
import { db, getUniqueImageName } from "../ImagesDrawer";

describe("ImagesDrawer storage helpers", () => {
    beforeEach(async () => {
        await db.images.clear();
    });

    it("keeps uploaded image names unique while preserving extensions", async () => {
        await db.images.add({
            name: "device-image.png",
            image: "data:image/png;base64,abc",
        });

        await expect(getUniqueImageName("device-image.png")).resolves.toBe(
            "device-image (2).png",
        );
    });
});
