/**
 * Download official Pokédex images from pokemon.com:
 *   https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/{dex}.png
 *
 * Notes:
 * - The URL uses zero-padding to at least 3 digits for < 1000 (e.g. 001.png).
 * - This script saves as unpadded filenames to match this repo’s convention:
 *   `src/img/sugimori/1.png`, `src/img/sugimori/1025.png`, etc.
 *
 * Usage examples:
 *   node scripts/download-pokedex-full.mjs --from 891 --to 1025
 *   node scripts/download-pokedex-full.mjs --from 1 --to 1025 --concurrency 12
 *   node scripts/download-pokedex-full.mjs --from 891 --to 1025 --out src/img/sugimori --force
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
    const args = {
        from: 891,
        to: 1025,
        out: path.resolve(repoRoot, "src/img/sugimori"),
        concurrency: 8,
        retries: 3,
        timeoutMs: 30_000,
        force: false,
        dryRun: false,
        verbose: false,
    };

    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const next = argv[i + 1];
        const takeNext = () => {
            i++;
            return next;
        };

        if (a === "--from") args.from = Number(takeNext());
        else if (a === "--to") args.to = Number(takeNext());
        else if (a === "--out") args.out = path.resolve(repoRoot, takeNext());
        else if (a === "--concurrency") args.concurrency = Number(takeNext());
        else if (a === "--retries") args.retries = Number(takeNext());
        else if (a === "--timeoutMs") args.timeoutMs = Number(takeNext());
        else if (a === "--force") args.force = true;
        else if (a === "--dry-run") args.dryRun = true;
        else if (a === "--verbose") args.verbose = true;
        else if (a === "--help" || a === "-h") {
            // eslint-disable-next-line no-console
            console.log(`
Download official Pokédex images from pokemon.com

Flags:
  --from <number>        Start dex number (default: 891)
  --to <number>          End dex number inclusive (default: 1025)
  --out <path>           Output directory relative to repo root (default: src/img/sugimori)
  --concurrency <number> Parallel downloads (default: 8)
  --retries <number>     Retries per image on 429/5xx/network (default: 3)
  --timeoutMs <number>   Per-request timeout (default: 30000)
  --force                Overwrite existing files
  --dry-run              Print what would be downloaded, do not write files
  --verbose              More logging
`);
            process.exit(0);
        } else if (a?.startsWith("--")) {
            throw new Error(`Unknown flag: ${a}`);
        }
    }

    if (!Number.isInteger(args.from) || !Number.isInteger(args.to)) {
        throw new Error("--from and --to must be integers");
    }
    if (args.from < 1 || args.to < 1 || args.to < args.from) {
        throw new Error("--from and --to must be >= 1 and --to must be >= --from");
    }
    if (!Number.isFinite(args.concurrency) || args.concurrency < 1) {
        throw new Error("--concurrency must be >= 1");
    }
    if (!Number.isFinite(args.retries) || args.retries < 0) {
        throw new Error("--retries must be >= 0");
    }
    if (!Number.isFinite(args.timeoutMs) || args.timeoutMs < 1_000) {
        throw new Error("--timeoutMs must be >= 1000");
    }

    return args;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function dexToUrlDex(dex) {
    // pokemon.com uses at least 3 digits, but 1000+ stays as-is (e.g. 1025)
    return String(dex).padStart(3, "0");
}

async function exists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function fetchWithTimeout(url, timeoutMs, init) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(t);
    }
}

async function downloadOne({ dex, outDir, force, retries, timeoutMs, verbose, dryRun }) {
    const targetFile = path.join(outDir, `${dex}.png`);
    const urlDex = dexToUrlDex(dex);
    const url = `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${urlDex}.png`;

    if (!force && (await exists(targetFile))) {
        return { dex, status: "skipped_exists", url, targetFile };
    }

    if (dryRun) {
        return { dex, status: "dry_run", url, targetFile };
    }

    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        attempt++;
        try {
            const res = await fetchWithTimeout(
                url,
                timeoutMs,
                {
                    // Some hosts are picky about UA; keep it simple and explicit.
                    headers: {
                        "User-Agent": "nuzlocke-generator (image downloader)",
                        Accept: "image/png,image/*;q=0.8,*/*;q=0.5",
                    },
                    redirect: "follow",
                },
            );

            if (!res.ok) {
                const retryable = res.status === 429 || (res.status >= 500 && res.status <= 599);
                if (retryable && attempt <= retries + 1) {
                    const backoff = Math.min(10_000, 500 * 2 ** (attempt - 1));
                    if (verbose) {
                        // eslint-disable-next-line no-console
                        console.warn(`[${dex}] ${res.status} retrying in ${backoff}ms (${attempt}/${retries + 1})`);
                    }
                    await sleep(backoff);
                    continue;
                }
                throw new Error(`[${dex}] HTTP ${res.status} for ${url}`);
            }

            const contentType = res.headers.get("content-type") ?? "";
            if (!contentType.includes("image")) {
                throw new Error(`[${dex}] Unexpected content-type "${contentType}" for ${url}`);
            }

            const arrayBuffer = await res.arrayBuffer();
            const buf = Buffer.from(arrayBuffer);

            await fs.mkdir(outDir, { recursive: true });
            await fs.writeFile(targetFile, buf);

            return { dex, status: "downloaded", url, targetFile, bytes: buf.length };
        } catch (err) {
            const isAbort = err?.name === "AbortError";
            const canRetry = attempt <= retries + 1;
            if (canRetry) {
                const backoff = Math.min(10_000, 500 * 2 ** (attempt - 1));
                if (verbose) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `[${dex}] ${isAbort ? "timeout" : "error"} retrying in ${backoff}ms (${attempt}/${retries + 1})`,
                    );
                }
                await sleep(backoff);
                continue;
            }
            throw err;
        }
    }
}

async function runPool(items, concurrency, worker) {
    let idx = 0;
    const results = [];

    async function runOne() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const current = idx;
            idx++;
            if (current >= items.length) return;
            results[current] = await worker(items[current]);
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runOne());
    await Promise.all(workers);
    return results;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const { from, to, out, concurrency, retries, timeoutMs, force, dryRun, verbose } = args;

    const dexes = [];
    for (let dex = from; dex <= to; dex++) dexes.push(dex);

    // eslint-disable-next-line no-console
    console.log(
        `Downloading Pokédex images: ${from}..${to} -> ${path.relative(repoRoot, out) || "."} (concurrency=${concurrency})`,
    );
    if (dryRun) {
        // eslint-disable-next-line no-console
        console.log(`(dry run: no files will be written)`);
    }

    const results = await runPool(
        dexes,
        concurrency,
        (dex) => downloadOne({ dex, outDir: out, force, retries, timeoutMs, verbose, dryRun }),
    );

    const summary = results.reduce(
        (acc, r) => {
            acc.total++;
            if (r.status === "downloaded") acc.downloaded++;
            else if (r.status === "skipped_exists") acc.skipped++;
            else if (r.status === "dry_run") acc.dryRun++;
            else acc.other++;
            return acc;
        },
        { total: 0, downloaded: 0, skipped: 0, dryRun: 0, other: 0 },
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


