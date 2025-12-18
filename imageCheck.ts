/**
 * In order to run this script, use Node 16 and convert it to js with `tsc`
 */
import * as fs from "fs";
import * as chalk from "chalk";

import { listOfPokemon } from "./src/utils/listOfPokemon";

const targetFile = `./images.md`;
const buildFile: string[] = [];
const alphabet: string[] = [];
let exists = 0;

const normalize = (str: string) => str.toLowerCase().replace(/\s/g, "-");
const toPercentage = (num, den) => `${((num / den) * 100).toFixed(0)}%`;

function missingByGeneration(list) {
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
            if (fs.existsSync(`src/img/${normalize(pokemon)}.jpg`)) {
                generationTotal += 1;
            } else {
                generationMissing.push(pokemon);
            }
        }
        return `${(chalk as any).blue(`[Gen ${idx + 1}]`)}: ${(
            chalk as any
        ).yellow(
            `${generationTotal}/${total}`,
        )} ${(chalk as any).red(toPercentage(generationTotal, total))}, missing: ${
            generationMissing.length === 0
                ? "none"
                : generationMissing.join(", ")
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
    if (fs.existsSync(`src/img/${normalize(pokemon)}.jpg`)) {
        buildFile.push(`- [x] ${pokemon}`);
        exists++;
    } else {
        buildFile.push(`- [ ] ${pokemon}`);
    }
}

fs.writeFile(targetFile, buildFile.join("\n"), (err) => {
    if (err) throw new Error("Failed to write file.");
    console.log(
        `Wrote ${targetFile} file with ${exists}/${listOfPokemon.length} ${(
            chalk as any
        ).green(toPercentage(exists, listOfPokemon.length))} entries.`,
    );
});

missingByGeneration(listOfPokemon);
