import { expect, test } from "@playwright/test";

test("deleting an earlier custom box does not reuse another box id", async ({
    page,
}) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const pokemonEditor = page.locator(".pokemon-editor");
    await pokemonEditor.scrollIntoViewIfNeeded();

    const boxOf = (name: string) =>
        page.locator(`.${name.replace(/\s/g, "-")}-box`);

    const addBox = async (name: string) => {
        const nameInput = page.getByPlaceholder("Box Name");
        if (!(await nameInput.isVisible())) {
            await pokemonEditor.locator('button:has([data-icon="plus"])').click();
        }
        await nameInput.fill(name);
        await page.getByRole("button", { name: "Confirm" }).click();
        await expect(boxOf(name)).toBeVisible();
    };

    const openBoxMenu = async (name: string) => {
        await boxOf(name).getByText(name, { exact: true }).click();
    };

    const deleteBox = async (name: string) => {
        await openBoxMenu(name);
        await page.getByText("Delete Box", { exact: true }).click();
        await page.getByRole("button", { name: "Delete Box" }).click();
        await expect(boxOf(name)).toHaveCount(0);
    };

    await addBox("Route 1");
    await addBox("Safari");
    await page.getByRole("button", { name: "Cancel" }).click();

    await deleteBox("Route 1");
    await expect(boxOf("Safari")).toBeVisible();

    await addBox("Graveyard");
    await page.getByRole("button", { name: "Cancel" }).click();
    await openBoxMenu("Graveyard");
    await page.getByText("Collapse Box", { exact: true }).click();

    await expect(boxOf("Safari")).toBeVisible();
    await expect(boxOf("Graveyard")).toBeVisible();
    await expect(boxOf("Champs")).toBeVisible();
    await page.screenshot({
        path: "e2e/screenshots/custom-box-after-collapse.png",
        fullPage: true,
    });

    await deleteBox("Graveyard");

    for (const name of ["Team", "Boxed", "Dead", "Champs", "Safari"]) {
        await expect(boxOf(name)).toBeVisible();
    }
    await expect(boxOf("Graveyard")).toHaveCount(0);
    await page.screenshot({
        path: "e2e/screenshots/custom-box-after-delete.png",
        fullPage: true,
    });
});
