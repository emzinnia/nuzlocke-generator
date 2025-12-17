import { parseGen1Save, parseGen2Save, parseGen3Save } from ".";
import { BoxMappings } from "./utils/boxMappings";
import { Buffer } from "buffer";
import type { GameSaveFormat } from "utils/gameSaveFormat";
import type { Game as GameName } from "utils";
import type { Game as GameModel } from "models";

interface MessageData {
    data: {
        save?: Buffer | Uint8Array;
        selectedGame?: GameSaveFormat;
        boxMappings: BoxMappings;
    };
}

self.onmessageerror = (err) => {
    console.error("save worker message error", err);
};

const SAVE_SIZE_GEN1_GEN2 = 0x8000; // 32 KiB
const SAVE_SIZE_GEN3 = 0x20000; // 128 KiB
const SAVE_SIZE_GEN3_TRIMMED = 0x1c000; // 114,688 bytes (2 * 0xE000)
// Some emulators append small headers/footers; treat "slightly > 32KiB" as Gen1/2.
const SAVE_SIZE_GEN1_GEN2_MAX_WITH_PADDING = 0x9000;

const toBuffer = (save: Buffer | Uint8Array) =>
    Buffer.isBuffer(save) ? save : Buffer.from(save);

const makeGame = (name: GameName): GameModel => ({ name, customName: "" });

const normalizeGen1Gen2Buffer = (buf: Buffer) =>
    buf.length >= SAVE_SIZE_GEN1_GEN2 ? buf.subarray(0, SAVE_SIZE_GEN1_GEN2) : buf;

// Matches the checksum logic used in `src/parsers/gen1.ts`.
const isLikelyGen1Save = (buf: Buffer) => {
    if (buf.length < SAVE_SIZE_GEN1_GEN2) return false;
    const CHECKSUM_OFFSET = 0x3523;
    let checksumN = 255;
    for (let i = 0x2598; i < CHECKSUM_OFFSET; ++i) {
        checksumN -= buf[i];
    }
    checksumN &= 0xff;
    return buf[CHECKSUM_OFFSET] === checksumN;
};

const detectGen2IsCrystal = (buf: Buffer) => {
    // Score both party layouts; pick the one that yields a plausible party count and non-empty species.
    const scorePartyLayout = (partyBuf: Buffer) => {
        const entriesUsed = partyBuf[0x00] ?? 255;
        const plausible = entriesUsed >= 0 && entriesUsed <= 6 ? 2 : -2;

        // species list begins at 0x01; it ends at 0x01 + entries + 1 (terminator)
        // We'll just count non-0xff bytes in the first 7 entries as a weak signal.
        let nonEmpty = 0;
        for (let i = 0; i < 7; i++) {
            const v = partyBuf[0x01 + i];
            if (v !== undefined && v !== 0x00 && v !== 0xff) nonEmpty++;
        }
        return plausible + nonEmpty;
    };

    const GS_TEAM = [0x288a, 0x288a + 428] as const;
    const CR_TEAM = [0x2865, 0x2865 + 428] as const;

    const gsScore = scorePartyLayout(buf.slice(GS_TEAM[0], GS_TEAM[1]));
    const crScore = scorePartyLayout(buf.slice(CR_TEAM[0], CR_TEAM[1]));

    return crScore > gsScore;
};

type ParsedMonForInference = {
    status?: string;
    extraData?: {
        originGame?: string;
    };
};

const inferGen3GameFromPokemon = (
    pokemon: ParsedMonForInference[],
): GameName | undefined => {
    const allowed = new Set<GameName>([
        "Ruby",
        "Sapphire",
        "Emerald",
        "FireRed",
        "LeafGreen",
    ]);
    const counts = new Map<GameName, number>();

    for (const p of pokemon) {
        const origin = p?.extraData?.originGame;
        if (!origin) continue;
        if (!allowed.has(origin as GameName)) continue;
        const key = origin as GameName;
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    let best: GameName | undefined;
    let bestCount = 0;
    for (const [k, v] of counts.entries()) {
        if (v > bestCount) {
            best = k;
            bestCount = v;
        }
    }
    return best;
};

const parseGen3WithBestVariant = async (
    buf: Buffer,
    boxMappings: BoxMappings,
) => {
    // Parse as both variants and pick the one that yields the most "Team" mons.
    const asEmerald = await parseGen3Save(buf, {
        boxMappings,
        selectedGame: "Emerald",
    });
    const emeraldTeamCount = (asEmerald.pokemon || []).filter(
        (p: ParsedMonForInference) => p?.status === "Team",
    ).length;

    const asFrlg = await parseGen3Save(buf, {
        boxMappings,
        selectedGame: "FRLG",
    });
    const frlgTeamCount = (asFrlg.pokemon || []).filter(
        (p: ParsedMonForInference) => p?.status === "Team",
    ).length;

    return frlgTeamCount > emeraldTeamCount ? asFrlg : asEmerald;
};

self.onmessage = async ({
    data: { save, selectedGame, boxMappings },
}: MessageData) => {
    let result;

    if (!save) {
        throw new Error("No save file detected.");
    }

    const buf = toBuffer(save);
    const gen1Gen2Buf = normalizeGen1Gen2Buffer(buf);
    const gameChoice: GameSaveFormat =
        selectedGame && selectedGame !== "Auto"
            ? selectedGame
            : buf.length === SAVE_SIZE_GEN3 || buf.length === SAVE_SIZE_GEN3_TRIMMED
              ? "Emerald"
              : buf.length >= SAVE_SIZE_GEN1_GEN2 &&
                  buf.length <= SAVE_SIZE_GEN1_GEN2_MAX_WITH_PADDING
                ? isLikelyGen1Save(gen1Gen2Buf)
                    ? "RBY"
                    : detectGen2IsCrystal(gen1Gen2Buf)
                      ? "Crystal"
                      : "GS"
                : // fallback: try gen3 if it's "large-ish", else assume gen2
                  buf.length > SAVE_SIZE_GEN1_GEN2
                  ? "Emerald"
                  : "GS";

    if (gameChoice === "RBY") {
        result = await parseGen1Save(gen1Gen2Buf, { boxMappings });
    } else if (gameChoice === "GS") {
        result = await parseGen2Save(gen1Gen2Buf, { isCrystal: false, boxMappings });
    } else if (gameChoice === "Crystal") {
        result = await parseGen2Save(gen1Gen2Buf, { isCrystal: true, boxMappings });
    } else if (gameChoice === "RS" || gameChoice === "FRLG" || gameChoice === "Emerald") {
        // If the user picked "Auto", we still need the correct gen3 variant (FRLG vs RSE) for party offsets.
        if (!selectedGame || selectedGame === "Auto") {
            try {
                result = await parseGen3WithBestVariant(buf, boxMappings);
            } catch (err) {
                // Some Gen1/2 saves come with tiny padding (e.g. 0x802c) which can trick Auto into Gen3.
                // If Gen3 rejects the size, fall back to Gen1/2 parsing on the normalized 32KiB buffer.
                const msg =
                    err instanceof Error ? err.message : typeof err === "string" ? err : "";
                if (typeof msg === "string" && msg.includes("Unexpected Gen 3 save size")) {
                    const fallbackChoice = isLikelyGen1Save(gen1Gen2Buf)
                        ? ("RBY" as const)
                        : detectGen2IsCrystal(gen1Gen2Buf)
                          ? ("Crystal" as const)
                          : ("GS" as const);
                    result =
                        fallbackChoice === "RBY"
                            ? await parseGen1Save(gen1Gen2Buf, { boxMappings })
                            : await parseGen2Save(gen1Gen2Buf, {
                                  isCrystal: fallbackChoice === "Crystal",
                                  boxMappings,
                              });
                } else {
                    throw err;
                }
            }
        } else {
            result = await parseGen3Save(buf, { boxMappings, selectedGame: gameChoice });
        }
    } else {
        throw new Error(`Unsupported game type: ${gameChoice}`);
    }

    // strip out invalid species
    result.pokemon = result.pokemon.filter((poke) => poke.species);

    let detectedGame: GameModel | undefined;
    if (gameChoice === "RBY") {
        detectedGame = makeGame(result.isYellow ? "Yellow" : "Red");
    } else if (gameChoice === "Crystal") {
        detectedGame = makeGame("Crystal");
    } else if (gameChoice === "GS") {
        detectedGame = makeGame("Gold");
    } else {
        // Gen 3: infer exact title (Ruby vs Sapphire, FireRed vs LeafGreen, etc.) from origin-game majority.
        const inferred = inferGen3GameFromPokemon(result.pokemon);
        if (inferred) detectedGame = makeGame(inferred);
        else if (gameChoice === "FRLG") detectedGame = makeGame("FireRed");
        else if (gameChoice === "Emerald") detectedGame = makeGame("Emerald");
        else detectedGame = makeGame("Ruby");
    }

    self.postMessage({
        ...result,
        detectedGame,
        detectedSaveFormat: gameChoice,
    });
};
