import { expect, test } from "@playwright/test";
import { statSync } from "node:fs";

const transparentPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR42mP8z8BQDwAFgwJ/lxGH5QAAAABJRU5ErkJggg==",
    "base64",
);

const persistState = (state: Record<string, unknown>) =>
    JSON.stringify({
        ...Object.fromEntries(
            Object.entries(state).map(([key, value]) => [
                key,
                JSON.stringify(value),
            ]),
        ),
        _persist: JSON.stringify({
            version: "1.23.0",
            rehydrated: true,
        }),
    });

test("downloads a result with custom remote portraits, icons, and checkpoints", async ({
    page,
}) => {
    await page.route("https://cors-anywhere-nuzgen.herokuapp.com/**", (route) =>
        route.fulfill({
            status: 200,
            contentType: "image/png",
            body: transparentPng,
        }),
    );

    await page.addInitScript((persistedState) => {
        window.localStorage.setItem("persist:root", persistedState);
    }, persistState({
        box: [
            { id: 0, position: 0, name: "Team" },
            { id: 1, position: 1, name: "Boxed" },
            { id: 2, position: 2, name: "Dead" },
            { id: 3, position: 3, name: "Champs" },
        ],
        checkpoints: [
            {
                name: "Legend Ribbon",
                image: "https://cdn2.bulbagarden.net/upload/d/d4/Legend_Ribbon.png",
            },
        ],
        game: { name: "Crystal", customName: "" },
        pokemon: [
            {
                id: "team-1",
                position: 0,
                species: "Mew",
                nickname: "Andromeda",
                status: "Team",
                gender: "genderless",
                level: "56",
                nature: "None",
                types: ["Psychic", "Psychic"],
                moves: ["Psychic"],
                customImage: "https://i.imgur.com/custom-portrait.png",
                customItemImage: "https://i.imgur.com/custom-item.png",
            },
            {
                id: "box-1",
                position: 1,
                species: "Perrserker",
                nickname: "Vinland",
                status: "Boxed",
                gender: "Female",
                types: ["Steel", "Steel"],
                customIcon: "https://www.serebii.net/pokedex-swsh/icon/863.png",
            },
        ],
        selectedId: "team-1",
        trainer: {
            badges: [{ name: "Legend Ribbon", image: "legend-ribbon" }],
            image: "https://i.imgur.com/custom-trainer.png",
            title: "Custom image regression",
        },
    }));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".trainer-image")).toHaveAttribute(
        "src",
        /^data:image\/png/,
    );
    await expect(page.locator(".trainer-checkpoint")).toHaveAttribute(
        "src",
        /^data:image\/png/,
    );
    await expect(page.locator(".pokemon-item img")).toHaveAttribute(
        "src",
        /^data:image\/png/,
    );
    await expect(page.locator(".boxed-pokemon-icon img")).toHaveAttribute(
        "src",
        /^data:image\/png/,
    );

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("download-image-button").click();
    const download = await downloadPromise;
    const path = await download.path();

    expect(download.suggestedFilename()).toMatch(/^nuzlocke-.*\.png$/);
    expect(path ? statSync(path).size : 0).toBeGreaterThan(0);
});

