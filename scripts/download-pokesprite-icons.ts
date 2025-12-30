/**
 * Download PokéSprite box icons (Gen 8 sheet) into `src/assets/icons/pokemon`.
 *
 * Sources:
 * - Listing page: https://msikma.github.io/pokesprite/overview/dex-gen8.html
 * - Image URLs resolved from that page (raw.githubusercontent links).
 *
 * Usage examples:
 *   npx tsx scripts/download-pokesprite-icons.ts
 *   npx tsx scripts/download-pokesprite-icons.ts --dry-run
 *   npx tsx scripts/download-pokesprite-icons.ts --variant shiny --concurrency 12
 *
 * Notes:
 * - Existing files are never overwritten.
 * - Filenames are normalized to the repo's conventions (e.g., `-gmax` -> `-gigantamax`).
 * - Female icons are stored under `regular/female` or `shiny/female` when present.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    listOfPokemon,
    listOfPokemonLowercased,
} from "../src/utils/data/listOfPokemon";
import { Forme } from "../src/utils/Forme";
import { significantGenderDifferenceList } from "../src/utils/handleSignificantGenderDifferences";

type Variant = "regular" | "shiny";
type GenderFolder = "standard" | "female";

type SpriteEntry = {
    sourceUrl: string;
    variant: Variant;
    gender: GenderFolder;
    slug: string;
    speciesSlug: string | null;
};

type ParsedSprites = {
    entries: SpriteEntry[];
    unknownSlugs: Set<string>;
};

type DownloadResult =
    | { status: "downloaded"; entry: SpriteEntry; targetPath: string; bytes: number }
    | { status: "skipped_exists"; entry: SpriteEntry; targetPath: string }
    | { status: "dry_run"; entry: SpriteEntry; targetPath: string };

const TARGET_PAGE = "https://msikma.github.io/pokesprite/overview/dex-gen8.html";
const ICON_REGEX =
    /pokemon-gen8\/(regular|shiny)\/(female\/)?([a-z0-9-]+)\.png/gi;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const defaultOutDir = path.resolve(repoRoot, "src/assets/icons/pokemon");

const speciesSlugs = new Set(
    listOfPokemon.map((name) => normalizeSpeciesSlug(name)),
);
const formeSuffixes = Array.from(
    new Set(
        Object.values(Forme)
            .map((value) => `-${String(value).toLowerCase()}`)
            .filter((suffix) => suffix !== "-normal"),
    ),
).sort((a, b) => b.length - a.length);
const genderedSpecies = new Set(
    significantGenderDifferenceList.map((name) => normalizeSpeciesSlug(name)),
);

function parseArgs(argv: string[]) {
    const args = {
        outDir: defaultOutDir,
        concurrency: 8,
        dryRun: false,
        variant: "both" as "both" | Variant,
    };

    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const next = argv[i + 1];
        const takeNext = () => {
            if (!next) throw new Error(`Flag ${a} requires a value`);
            i++;
            return next;
        };

        if (a === "--out") args.outDir = path.resolve(repoRoot, takeNext());
        else if (a === "--concurrency") args.concurrency = Number(takeNext());
        else if (a === "--dry-run") args.dryRun = true;
        else if (a === "--variant") {
            const v = takeNext();
            if (v !== "regular" && v !== "shiny" && v !== "both") {
                throw new Error(`--variant must be regular, shiny, or both (got ${v})`);
            }
            args.variant = v as any;
        } else if (a === "--help" || a === "-h") {
            // eslint-disable-next-line no-console
            console.log(`Download PokéSprite box icons (Gen 8)

Flags:
  --out <path>          Output base directory (default: src/assets/icons/pokemon)
  --concurrency <num>   Parallel downloads (default: 8)
  --variant <value>     regular | shiny | both (default: both)
  --dry-run             Show planned writes, do not download or write files
`);
            process.exit(0);
        } else if (a?.startsWith("--")) {
            throw new Error(`Unknown flag: ${a}`);
        }
    }

    if (!Number.isFinite(args.concurrency) || args.concurrency < 1) {
        throw new Error("--concurrency must be >= 1");
    }

    return args;
}

const slugReplacements: Array<[RegExp, string]> = [
    [/-gmax\b/g, "-gigantamax"],
    [/-low-key\b/g, "-lowkey"],
];

const explicitSlugMap: Record<string, string> = {
    "zygarde-10": "zygarde-10-percent",
    "necrozma-dawn": "necrozma-dawn-wings",
    "necrozma-dusk": "necrozma-dusk-mane",
    "oricorio-pau": "oricorio-pa-u",
    "minior-blue": "minior-core-blue",
    "minior-blue-gen7": "minior-core-blue",
    "minior-green": "minior-core-green",
    "minior-green-gen7": "minior-core-green",
    "minior-indigo": "minior-core-indigo",
    "minior-indigo-gen7": "minior-core-indigo",
    "minior-orange": "minior-core-orange",
    "minior-orange-gen7": "minior-core-orange",
    "minior-red": "minior-core-red",
    "minior-red-gen7": "minior-core-red",
    "minior-violet": "minior-core-violet",
    "minior-violet-gen7": "minior-core-violet",
    "minior-yellow": "minior-core-yellow",
    "minior-yellow-gen7": "minior-core-yellow",
};

function normalizeSpeciesSlug(species: string) {
    if (species == null) return "unknown";
    if (species === "Nidoran♀") return "nidoran-f";
    if (species === "Nidoran♂") return "nidoran-m";
    if (species === "Mr. Mime") return "mr-mime";
    if (species === "Mr. Rime") return "mr-rime";
    if (species.startsWith("Farfetch")) return "farfetchd";
    if (species.startsWith("Sirfetch")) return "sirfetchd";
    if (species === "Mime Jr.") return "mime-jr";
    if (species === "Flabébé") return "flabebe";
    if (species === "Type: Null") return "type-null";
    if (listOfPokemonLowercased.indexOf(species.toLowerCase()) < 0) {
        return "unknown";
    }
    return species.toLowerCase().replace(/\s/, "-");
}

function normalizeSpriteSlug(rawSlug: string) {
    let slug = rawSlug.toLowerCase();
    for (const [pattern, replacement] of slugReplacements) {
        slug = slug.replace(pattern, replacement);
    }
    if (explicitSlugMap[slug]) {
        slug = explicitSlugMap[slug];
    }
    return slug;
}

function inferSpeciesSlug(slug: string) {
    if (speciesSlugs.has(slug)) return slug;
    for (const suffix of formeSuffixes) {
        if (slug.endsWith(suffix)) {
            const base = slug.slice(0, -suffix.length);
            if (speciesSlugs.has(base)) return base;
        }
    }
    return null;
}

async function fetchSpriteList(): Promise<ParsedSprites> {
    const res = await fetch(TARGET_PAGE);
    if (!res.ok) {
        throw new Error(
            `Failed to fetch listing page (${res.status} ${res.statusText})`,
        );
    }
    const html = await res.text();

    const found = new Map<string, SpriteEntry>();
    const unknownSlugs = new Set<string>();

    for (const match of html.matchAll(ICON_REGEX)) {
        const variant = match[1] as Variant;
        const isFemale = Boolean(match[2]);
        const rawSlug = match[3];
        const slug = normalizeSpriteSlug(rawSlug);
        const speciesSlug = inferSpeciesSlug(slug);

        if (!speciesSlug) unknownSlugs.add(slug);
        const key = `${variant}:${isFemale ? "female" : "standard"}:${slug}`;
        if (found.has(key)) continue;

        found.set(key, {
            sourceUrl: `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/${variant}/${isFemale ? "female/" : ""}${rawSlug}.png`,
            variant,
            gender: isFemale ? "female" : "standard",
            slug,
            speciesSlug,
        });
    }

    const entries = Array.from(found.values()).sort((a, b) => {
        if (a.slug === b.slug) {
            if (a.variant === b.variant) return a.gender.localeCompare(b.gender);
            return a.variant.localeCompare(b.variant);
        }
        return a.slug.localeCompare(b.slug);
    });

    return { entries, unknownSlugs };
}

async function fileExists(targetPath: string) {
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
}

function fetchWithTimeout(url: string, timeoutMs: number) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, {
        signal: controller.signal,
        headers: {
            "User-Agent": "nuzlocke-generator (pokesprite fetcher)",
            Accept: "image/png,image/*;q=0.8,*/*;q=0.5",
        },
    }).finally(() => clearTimeout(timer));
}

async function downloadSprite(
    entry: SpriteEntry,
    outDir: string,
    dryRun: boolean,
): Promise<DownloadResult> {
    const variantDir = path.join(
        outDir,
        entry.variant,
        entry.gender === "female" ? "female" : "",
    );
    const targetPath = path.join(variantDir, `${entry.slug}.png`);

    if (await fileExists(targetPath)) {
        return { status: "skipped_exists", entry, targetPath };
    }
    if (dryRun) {
        return { status: "dry_run", entry, targetPath };
    }

    const res = await fetchWithTimeout(entry.sourceUrl, 20_000);
    if (!res.ok) {
        throw new Error(
            `[${entry.slug}] HTTP ${res.status} for ${entry.sourceUrl}`,
        );
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.mkdir(variantDir, { recursive: true });
    await fs.writeFile(targetPath, buf);

    return { status: "downloaded", entry, targetPath, bytes: buf.length };
}

async function runPool<T, R>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<R>,
) {
    let index = 0;
    const results: R[] = [];

    async function runOne() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const current = index;
            index += 1;
            if (current >= items.length) return;
            results[current] = await worker(items[current]);
        }
    }

    const workers = Array.from(
        { length: Math.min(concurrency, items.length) },
        () => runOne(),
    );
    await Promise.all(workers);
    return results;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const { entries, unknownSlugs } = await fetchSpriteList();

    const filtered = entries.filter(
        (entry) => args.variant === "both" || entry.variant === args.variant,
    );

    const genderNote = Array.from(
        new Set(
            filtered
                .filter((entry) => entry.gender === "female")
                .map((entry) => entry.slug),
        ),
    );

    // eslint-disable-next-line no-console
    console.log(
        `Fetched ${filtered.length} sprite references from dex-gen8.html (${args.variant}) -> ${path.relative(
            repoRoot,
            args.outDir,
        ) || "."} (concurrency=${args.concurrency}${
            args.dryRun ? ", dry-run" : ""
        })`,
    );
    if (genderNote.length) {
        // eslint-disable-next-line no-console
        console.log(
            `Female variants detected for: ${genderNote.join(", ")}` +
                (genderNote.some((slug) => !genderedSpecies.has(slug))
                    ? " (some not in significantGenderDifferenceList)"
                    : ""),
        );
    }
    if (unknownSlugs.size) {
        // eslint-disable-next-line no-console
        console.warn(
            `Note: ${unknownSlugs.size} slugs were not matched to the known species list: ${Array.from(
                unknownSlugs,
            ).join(", ")}`,
        );
    }

    const results = await runPool(filtered, args.concurrency, (entry) =>
        downloadSprite(entry, args.outDir, args.dryRun),
    );

    const summary = results.reduce(
        (acc, r) => {
            acc.total += 1;
            if (r.status === "downloaded") acc.downloaded += 1;
            else if (r.status === "skipped_exists") acc.skipped += 1;
            else if (r.status === "dry_run") acc.dryRun += 1;
            return acc;
        },
        { total: 0, downloaded: 0, skipped: 0, dryRun: 0 },
    );

    // eslint-disable-next-line no-console
    console.log(
        `Done. downloaded=${summary.downloaded} skipped_exists=${summary.skipped} dry_run=${summary.dryRun} total=${summary.total}`,
    );
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});


