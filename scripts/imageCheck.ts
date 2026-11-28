/**
 * Generates `images.md` (in the repo root) showing which Pokémon have images,
 * and prints a per-generation missing breakdown.
 *
 * Run:
 *   npx tsx scripts/imageCheck.ts
 *
 * Notes:
 * - Paths are resolved relative to the repo root so it works from any CWD.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

import { listOfPokemon } from "../src/utils/data/listOfPokemon";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const targetFile = path.join(repoRoot, "images.md");
const buildFile: string[] = [];
const alphabet: string[] = [];
let existsCount = 0;

const normalize = (str: string) => str.toLowerCase().replace(/\s/g, "-");
const toPercentage = (num: number, den: number) => `${((num / den) * 100).toFixed(0)}%`;

function missingByGeneration(list: readonly string[]) {
    // Slices are half-open [start, end)
    const generationPoints = [
        { start: 0, end: 151 },
        { start: 151, end: 251 },
        { start: 251, end: 386 },
        { start: 386, end: 493 },
        { start: 493, end: 649 },
        { start: 649, end: 721 },
        { start: 721, end: 807 },
        { start: 808, end: 905 },
        { start: 906, end: 1025 },
    ];

    const resultMap = generationPoints.map((point, idx) => {
        const generationList = list.slice(point.start, point.end);
        const total = point.end - point.start;
        let generationTotal = 0;
        const generationMissing: string[] = [];

        for (const pokemon of generationList) {
            const imgPath = path.join(repoRoot, "src/img", `${normalize(pokemon)}.jpg`);
            if (fs.existsSync(imgPath)) {
                generationTotal += 1;
            } else {
                generationMissing.push(pokemon);
            }
        }

        return `${chalk.blue(`[Gen ${idx + 1}]`)}: ${chalk.yellow(
            `${generationTotal}/${total}`,
        )} ${chalk.red(toPercentage(generationTotal, total))}, missing: ${
            generationMissing.length === 0 ? "none" : generationMissing.join(", ")
        }\n`;
    });

    console.log(resultMap.join("\n"));
}

console.log(`Checking for images...`);
const pokemonList = [...listOfPokemon].sort();
for (const pokemon of pokemonList) {
    if (!alphabet.includes(pokemon.charAt(0))) {
        alphabet.push(pokemon.charAt(0));
        buildFile.push(`## ${pokemon.charAt(0)}`);
    }

    const imgPath = path.join(repoRoot, "src/img", `${normalize(pokemon)}.jpg`);
    if (fs.existsSync(imgPath)) {
        buildFile.push(`- [x] ${pokemon}`);
        existsCount++;
    } else {
        buildFile.push(`- [ ] ${pokemon}`);
    }
}

fs.writeFile(targetFile, buildFile.join("\n"), (err) => {
    if (err) throw new Error("Failed to write file.");
    console.log(
        `Wrote ${path.relative(repoRoot, targetFile)} file with ${existsCount}/${listOfPokemon.length} ${chalk.green(
            toPercentage(existsCount, listOfPokemon.length),
        )} entries.`,
    );
});

missingByGeneration(listOfPokemon);


