import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { parseGen3Save } from "../gen3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "node:path";
import { Buffer } from "buffer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type PerfStats = {
    runs: number;
    totalMs: number;
    meanMs: number;
    minMs: number;
    maxMs: number;
    p50Ms: number;
    p90Ms: number;
    p95Ms: number;
};

const percentile = (sorted: number[], p: number) => {
    if (sorted.length === 0) return 0;
    const idx = Math.max(
        0,
        Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1),
    );
    return sorted[idx]!;
};

const computeStats = (durationsMs: number[]): PerfStats => {
    const sorted = [...durationsMs].sort((a, b) => a - b);
    const totalMs = durationsMs.reduce((a, b) => a + b, 0);
    const meanMs = durationsMs.length ? totalMs / durationsMs.length : 0;
    const minMs = sorted[0] ?? 0;
    const maxMs = sorted[sorted.length - 1] ?? 0;
    return {
        runs: durationsMs.length,
        totalMs,
        meanMs,
        minMs,
        maxMs,
        p50Ms: percentile(sorted, 50),
        p90Ms: percentile(sorted, 90),
        p95Ms: percentile(sorted, 95),
    };
};

describe("Gen 3 Save Parser (performance)", () => {
    let saveData: Buffer;
    let logSpy: ReturnType<typeof vi.spyOn> | undefined;

    beforeAll(() => {
        // The parser can emit a LOT of debug logs (depending on env flags).
        // For performance measurements (and readable CI output), silence console.log.
        logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        // Use the same real-world fixture as the functional tests for representative perf.
        const savePath = join(__dirname, "../emerald.sav");
        saveData = Buffer.from(readFileSync(savePath));
    });

    afterAll(() => {
        logSpy?.mockRestore();
    });

    it(
        "parses an Emerald save within a reasonable time budget",
        { timeout: 60_000 },
        async () => {
            // Keep this test informative + low-flake across machines/CI:
            // - warmup to reduce JIT/cold-start noise
            // - fewer runs in CI
            const warmupRuns = 2;
            const measuredRuns = process.env.CI ? 5 : 10;

            for (let i = 0; i < warmupRuns; i++) {
                const result = await parseGen3Save(saveData, {
                    boxMappings: [],
                    selectedGame: "Emerald",
                });
                // sanity so we know parsing still "worked"
                expect(result?.trainer?.name).toBeTruthy();
                expect(result?.pokemon?.length).toBeGreaterThan(0);
            }

            const durationsMs: number[] = [];
            for (let i = 0; i < measuredRuns; i++) {
                const t0 = performance.now();
                const result = await parseGen3Save(saveData, {
                    boxMappings: [],
                    selectedGame: "Emerald",
                });
                const t1 = performance.now();
                durationsMs.push(t1 - t0);

                // Keep a lightweight correctness check in the measured loop too.
                expect(result?.pokemon?.length).toBeGreaterThan(0);
            }

            const stats = computeStats(durationsMs);
            // Emit a single summary line (bypassing console.log which we suppress above).
            process.stdout.write(
                [
                    "[gen3.perf]",
                    `runs=${stats.runs}`,
                    `mean=${stats.meanMs.toFixed(2)}ms`,
                    `p50=${stats.p50Ms.toFixed(2)}ms`,
                    `p90=${stats.p90Ms.toFixed(2)}ms`,
                    `p95=${stats.p95Ms.toFixed(2)}ms`,
                    `min=${stats.minMs.toFixed(2)}ms`,
                    `max=${stats.maxMs.toFixed(2)}ms`,
                    `total=${stats.totalMs.toFixed(2)}ms`,
                ].join(" ") + "\n",
            );

            // Very conservative guardrail to catch extreme regressions without being noisy.
            // If you want this tighter, we can calibrate based on your typical dev/CI timings.
            expect(stats.p95Ms).toBeLessThan(process.env.CI ? 4000 : 2500);
        },
    );
});


