import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const BLOCK_PERMUTATIONS = [
    "ABCD",
    "ABDC",
    "ACBD",
    "ACDB",
    "ADBC",
    "ADCB",
    "BACD",
    "BADC",
    "BCAD",
    "BCDA",
    "BDAC",
    "BDCA",
    "CABD",
    "CADB",
    "CBAD",
    "CBDA",
    "CDAB",
    "CDBA",
    "DABC",
    "DACB",
    "DBAC",
    "DBCA",
    "DCAB",
    "DCBA",
];

const cryptWords = (buffer: Buffer, seedValue: number) => {
    const out = Buffer.alloc(buffer.length);
    let seed = seedValue >>> 0;
    for (let i = 0; i < buffer.length; i += 2) {
        seed = (Math.imul(seed, 0x41c64e6d) + 0x6073) >>> 0;
        const key = (seed >>> 16) & 0xffff;
        out.writeUInt16LE((buffer.readUInt16LE(i) ^ key) & 0xffff, i);
    }
    return out;
};

const sumPk5Checksum = (buffer: Buffer) => {
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 2) {
        sum = (sum + buffer.readUInt16LE(i)) & 0xffff;
    }
    return sum;
};

const encryptPk5 = (decryptedPk5: Buffer) => {
    const normalized = Buffer.from(decryptedPk5);
    const pid = normalized.readUInt32LE(0x00);
    const checksum = sumPk5Checksum(normalized.subarray(0x08, 0x88));
    normalized.writeUInt16LE(checksum, 0x06);

    const blocks: Record<string, Buffer> = {
        A: normalized.subarray(0x08, 0x28),
        B: normalized.subarray(0x28, 0x48),
        C: normalized.subarray(0x48, 0x68),
        D: normalized.subarray(0x68, 0x88),
    };
    const order = BLOCK_PERMUTATIONS[((pid & 0x3e000) >> 0x0d) % 24];
    const shuffled = Buffer.concat([...order].map((letter) => blocks[letter]));
    const encrypted = Buffer.alloc(normalized.length);

    normalized.copy(encrypted, 0, 0x00, 0x08);
    cryptWords(shuffled, checksum).copy(encrypted, 0x08);
    if (normalized.length > 0x88) {
        cryptWords(normalized.subarray(0x88), pid).copy(encrypted, 0x88);
    }

    return encrypted;
};

const buildBlack2HaxorusSave = () => {
    const savePath = path.join(
        process.cwd(),
        "src",
        "parsers",
        "fixtures",
        "gen5",
        "projectpokemon-base-black-2-boy.sav",
    );
    const pk5Path = path.join(
        process.cwd(),
        "src",
        "parsers",
        "fixtures",
        "gen5",
        "pkhex-haxorus.pk5",
    );
    const save = Buffer.from(readFileSync(savePath).subarray(0, 0x26000));
    const pk5 = encryptPk5(readFileSync(pk5Path));

    save.writeUInt8(1, 0x18e04);
    pk5.copy(save, 0x18e08);
    return save;
};

const readBlack2LivingDexSave = () =>
    readFileSync(path.join(process.cwd(), "src", "parsers", "black2.sav"));

test("shows Gen 5 save formats in advanced import options", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Advanced Import Options" }).click();
    const formatSelect = page.locator(".data-editor-save-file-form select").first();

    await expect(formatSelect.locator('option[value="BW"]')).toHaveCount(1);
    await expect(formatSelect.locator('option[value="B2W2"]')).toHaveCount(1);
});

test("imports a Gen 5 Black 2 save through the save upload UI", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Display Game Origin").check({ force: true });

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByTestId("import-save-file-button").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
        name: "black-2-haxorus.sav",
        mimeType: "application/octet-stream",
        buffer: buildBlack2HaxorusSave(),
    });

    const teamSlots = page.locator(".team-container .pokemon-container");
    await expect(teamSlots).toHaveCount(1, { timeout: 20_000 });
    await expect(teamSlots.first().locator(".pokemon-name")).toHaveText("Haxorus", {
        timeout: 20_000,
    });
    await expect(teamSlots.first().locator(".pokemon-name")).not.toHaveText("???");
    await expect(teamSlots.first().locator(".pokemon-met")).toContainText(
        "Nature Preserve",
    );
    await expect(teamSlots.first().locator(".pokemon-gameoforigin")).toHaveText(
        "White 2",
    );
    await expect(page.locator("select").first()).toHaveValue("Black 2");

    await expect(page.locator(".badge-wrapper img.trainer-checkpoint")).toHaveCount(8);
    await expect(
        page.locator(".badge-wrapper img.trainer-checkpoint.not-obtained"),
    ).toHaveCount(8);
    await expect(
        page.locator('.badge-wrapper img.trainer-checkpoint[data-badge="Basic Badge"]'),
    ).toHaveClass(/not-obtained/);
    await expect(
        page.locator('.badge-wrapper img.trainer-checkpoint[data-badge="Wave Badge"]'),
    ).toHaveClass(/not-obtained/);
});

test("imports Black 2 boxed Pokemon with derived levels", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Display Game Origin").check({ force: true });

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByTestId("import-save-file-button").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
        name: "black2.sav",
        mimeType: "application/octet-stream",
        buffer: readBlack2LivingDexSave(),
    });

    const boxedNames = page.getByTestId("boxed-pokemon-name");
    await expect(boxedNames.first()).toBeVisible({ timeout: 20_000 });

    await expect(boxedNames.nth(0)).toContainText("Bulbasaur");
    await expect(boxedNames.nth(0)).toContainText("lv. 5");
    await expect(boxedNames.nth(0)).toContainText("HeartGold");
    await expect(boxedNames.nth(1)).toContainText("Ivysaur");
    await expect(boxedNames.nth(1)).toContainText("lv. 16");
    await expect(boxedNames.nth(2)).toContainText("Venusaur");
    await expect(boxedNames.nth(2)).toContainText("lv. 32");
    await expect(boxedNames.nth(3)).toContainText("Charmander");
    await expect(boxedNames.nth(3)).toContainText("lv. 5");
    await expect(boxedNames.nth(4)).toContainText("Charmeleon");
    await expect(boxedNames.nth(4)).toContainText("lv. 16");
    await expect(boxedNames.first()).not.toContainText("lv. 255");

    await expect(page.locator(".badge-wrapper img.trainer-checkpoint")).toHaveCount(8);
    await expect(
        page.locator(".badge-wrapper img.trainer-checkpoint.obtained"),
    ).toHaveCount(8);
    await expect(
        page.locator('.badge-wrapper img.trainer-checkpoint[data-badge="Basic Badge"]'),
    ).toHaveClass(/obtained/);
    await expect(
        page.locator('.badge-wrapper img.trainer-checkpoint[data-badge="Wave Badge"]'),
    ).toHaveClass(/obtained/);
});
