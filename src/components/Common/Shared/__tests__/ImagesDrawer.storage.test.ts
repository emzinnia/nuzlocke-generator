import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    db,
    getImageByName,
    getImages,
    getImagesPage,
    searchImagesByNamePrefix,
} from "../ImagesDrawer";

describe("ImagesDrawer storage helpers", () => {
    beforeEach(async () => {
        await db.images.clear();
    });

    afterEach(async () => {
        await db.images.clear();
    });

    it("returns uploaded images newest-first with offset pagination", async () => {
        await db.images.bulkAdd([
            { name: "first.png", image: "data:image/png;base64,one" },
            { name: "second.png", image: "data:image/png;base64,two" },
            { name: "third.png", image: "data:image/png;base64,three" },
        ]);

        const firstPage = await getImagesPage(0, 2);
        const secondPage = await getImagesPage(2, 2);

        expect(firstPage.map((image) => image.name)).toEqual([
            "third.png",
            "second.png",
        ]);
        expect(secondPage.map((image) => image.name)).toEqual(["first.png"]);
    });

    it("looks up exact image names and returns all images for legacy callers", async () => {
        await db.images.bulkAdd([
            { name: "trainer-card.png", image: "data:image/png;base64,trainer" },
            { name: "badge-case.png", image: "data:image/png;base64,badge" },
        ]);

        await expect(getImageByName("trainer-card.png")).resolves.toMatchObject({
            name: "trainer-card.png",
            image: "data:image/png;base64,trainer",
        });
        await expect(getImageByName("missing.png")).resolves.toBeUndefined();
        await expect(getImages()).resolves.toHaveLength(2);
    });

    it("searches image names by case-insensitive prefix", async () => {
        await db.images.bulkAdd([
            { name: "Alpha Team.png", image: "data:image/png;base64,alpha" },
            { name: "alpha backup.png", image: "data:image/png;base64,backup" },
            { name: "Beta Team.png", image: "data:image/png;base64,beta" },
        ]);

        const results = await searchImagesByNamePrefix("ALP", 10);

        expect(results.map((image) => image.name)).toEqual([
            "Alpha Team.png",
            "alpha backup.png",
        ]);
    });
});
