import { test, expect } from "@playwright/test";
import path from "node:path";

type SaveFixture = {
    fileName: string;
    detectedGame: string;
    party: string[];
    firstBoxed?: string[];
    itemImages?: { partyIndex: number; fileName: string }[];
    partyStats?: Array<{
        partyIndex: number;
        values: string[];
    }>;
};

const saves: SaveFixture[] = [
    {
        fileName: "diamond.sav",
        detectedGame: "Diamond",
        party: ["Gengar", "Lapras", "Dragonite", "Rayquaza", "Bibarel", "Darkrai"],
        firstBoxed: ["ROCK", "ROCKY", "EYELESS", "JON", "FOOL", "DUCKY"],
        partyStats: [
            {
                partyIndex: 0,
                values: ["269", "139", "165", "317", "305", "194"],
            },
        ],
    },
    {
        fileName: "heartgold.sav",
        detectedGame: "HeartGold",
        party: [
            "Typhlosion",
            "Dragonite",
            "Gyarados",
            "Scizor",
            "Lucario",
            "Sceptile",
        ],
        firstBoxed: ["Moltres", "Articuno", "Zapdos"],
        itemImages: [{ partyIndex: 2, fileName: "exp-share.png" }],
    },
];

test.describe.configure({ mode: "serial" });

for (const save of saves) {
    test(`imports ${save.fileName} through the save upload UI`, async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const fileChooserPromise = page.waitForEvent("filechooser");
        await page.getByTestId("import-save-file-button").click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(
            path.join(process.cwd(), "src", "parsers", save.fileName),
        );

        const teamSlots = page.locator(".team-container .pokemon-container");
        await expect(teamSlots).toHaveCount(save.party.length, { timeout: 20_000 });

        for (const [index, species] of save.party.entries()) {
            const slot = teamSlots.nth(index);
            await expect(slot.locator(".pokemon-name")).toHaveText(species, {
                timeout: 20_000,
            });
            await expect(slot.locator(".pokemon-name")).not.toHaveText("???");
        }

        if (save.firstBoxed) {
            const boxedNames = page.getByTestId("boxed-pokemon-name");
            await expect(boxedNames.first()).toBeVisible({ timeout: 20_000 });

            for (const [index, name] of save.firstBoxed.entries()) {
                await expect(boxedNames.nth(index)).toContainText(name);
            }
        }

        for (const itemImage of save.itemImages ?? []) {
            await expect(
                teamSlots.nth(itemImage.partyIndex).locator(".pokemon-item img"),
            ).toHaveAttribute("src", new RegExp(`hold-item/${itemImage.fileName}$`));
        }

        for (const partyStats of save.partyStats ?? []) {
            const extraData = teamSlots
                .nth(partyStats.partyIndex)
                .locator(".pokemon-extra-data");
            await expect(extraData).toBeVisible();

            for (const value of partyStats.values) {
                await expect(extraData).toContainText(value);
            }
        }

        await expect(page.locator("select").first()).toHaveValue(save.detectedGame);
    });
}
