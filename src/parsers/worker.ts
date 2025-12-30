import { parseGen1Save, parseGen2Save, parseGen3Save, parseGen4Save } from ".";
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
        fileName?: string;
    };
}

self.onmessageerror = (err) => {
    console.error("save worker message error", err);
};

const SAVE_SIZE_GEN1_GEN2 = 0x8000; // 32 KiB
const SAVE_SIZE_GEN3 = 0x20000; // 128 KiB
const SAVE_SIZE_GEN3_TRIMMED = 0x1c000; // 114,688 bytes (2 * 0xE000)
const SAVE_SIZE_GEN4 = 0x80000; // 512 KiB typical DS save
// Some emulators append small headers/footers; treat "slightly > 32KiB" as Gen1/2.
const SAVE_SIZE_GEN1_GEN2_MAX_WITH_PADDING = 0x9000;

const toBuffer = (save: Buffer | Uint8Array) =>
    Buffer.isBuffer(save) ? save : Buffer.from(save);

const makeGame = (name: GameName): GameModel => ({ name, customName: "" });

const normalizeGen1Gen2Buffer = (buf: Buffer) =>
    buf.length >= SAVE_SIZE_GEN1_GEN2 ? buf.subarray(0, SAVE_SIZE_GEN1_GEN2) : buf;

const normalizeForTokenSearch = (s: string) => {
    // "Case and spacing insensitive": remove whitespace and uppercase.
    // For filenames we also strip punctuation to make matching more forgiving.
    return s.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z]/g, "");
};

const detectGen3GameNameFromString = (text: string): GameName | undefined => {
    const s = normalizeForTokenSearch(text);

    // Prefer longer/more-specific tokens first, then short abbreviations.
    if (s.includes("EMER")) return "Emerald";

    if (s.includes("FIRERED") || s.includes("FR")) return "FireRed";
    if (s.includes("LEAFGREEN") || s.includes("LG")) return "LeafGreen";

    if (s.includes("RUBY") || s.includes("RB")) return "Ruby";
    if (s.includes("SAPPHIRE") || s.includes("SP")) return "Sapphire";

    return undefined;
};

const detectGen3SaveFormatFromString = (text: string): GameSaveFormat | undefined => {
    const name = detectGen3GameNameFromString(text);
    if (!name) return undefined;
    if (name === "FireRed" || name === "LeafGreen") return "FRLG";
    if (name === "Emerald") return "Emerald";
    if (name === "Ruby" || name === "Sapphire") return "RS";
    return undefined;
};

type Gen4Variant = "DP" | "Platinum" | "HGSS";

const detectGen4GameNameFromString = (text: string): Gen4Variant | undefined => {
    const s = normalizeForTokenSearch(text);

    // HeartGold / SoulSilver
    if (s.includes("HEARTGOLD") || s.includes("HG")) return "HGSS";
    if (s.includes("SOULSILVER") || s.includes("SS")) return "HGSS";
    if (s.includes("HGSS")) return "HGSS";

    // Platinum
    if (s.includes("PLATINUM") || s.includes("PT")) return "Platinum";

    // Diamond / Pearl
    if (s.includes("DIAMOND")) return "DP";
    if (s.includes("PEARL")) return "DP";

    return undefined;
};

/**
 * Gen 4 save file detection heuristics.
 *
 * Gen 4 .sav files are 512 KiB (0x80000) with two block pairs:
 *   - Pair #1: starts at 0x00000
 *   - Pair #2: starts at 0x40000
 *
 * Each pair has a General (small) block and a Storage (big) block.
 * The blocks have different sizes per game variant:
 *   - D/P:      General ~0xC100,  Storage ~0x121E0
 *   - Platinum: General ~0xCF2C,  Storage ~0x121E4
 *   - HGSS:     General ~0xF628,  Storage ~0x12310
 *
 * Each block ends with a 20-byte footer containing:
 *   - Offset +0x08: Block size (u32 little-endian)
 *   - Offset +0x12: CRC-16-CCITT checksum
 *
 * Detection approach:
 * 1. Check file size is 512KB
 * 2. Locate blocks by looking for valid block sizes at expected footer offsets
 * 3. Match the block sizes to known game patterns
 * 4. Verify checksums (when possible - some regions/versions may differ)
 */

// Block size ranges for each Gen 4 game variant
// These ranges account for regional/version differences
const GEN4_SIZE_RANGES = {
    DP: {
        generalMin: 0x0c000,
        generalMax: 0x0c200,
        storageMin: 0x12000,
        storageMax: 0x12300,
    },
    Platinum: {
        generalMin: 0x0cf00,
        generalMax: 0x0d000,
        storageMin: 0x12100,
        storageMax: 0x12300,
    },
    HGSS: {
        generalMin: 0x0f500,
        generalMax: 0x0f800,
        storageMin: 0x12200,
        storageMax: 0x12400,
    },
} as const;

// Known Gen 4 block sizes (from various save files and documentation)
const GEN4_KNOWN_GENERAL_SIZES = [0x0c100, 0x0cf2c, 0x0f628, 0x0f700];
const GEN4_KNOWN_STORAGE_SIZES = [0x121e0, 0x121e4, 0x12310, 0x12311];

/**
 * CRC-16-CCITT with 0xFFFF initial value (used by Gen 4 saves for D/P/Pt)
 */
const crc16CcittGen4 = (data: Buffer): number => {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i] << 8;
        for (let b = 0; b < 8; b++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
            crc &= 0xffff;
        }
    }
    return crc;
};

/**
 * Find a Gen 4 block at the given start offset.
 * Scans known block sizes to find a footer with matching block size field.
 * Optionally validates CRC.
 */
const findGen4Block = (
    buf: Buffer,
    blockStart: number,
    candidates: number[],
    requireCrcValidation: boolean,
): { found: boolean; blockSize: number; crcValid: boolean } => {
    for (const size of candidates) {
        const footerOffset = blockStart + size - 0x14;
        if (footerOffset < blockStart || footerOffset + 0x14 > buf.length) continue;

        // Check if block size in footer matches expected size
        const storedBlockSize = buf.readUInt32LE(footerOffset + 0x08);
        if (storedBlockSize !== size) continue;

        // Check if footer looks valid (has reasonable values)
        // Save count should be reasonable (not 0xFFFFFFFF)
        const saveCount = buf.readUInt32LE(footerOffset + 0x04);
        if (saveCount === 0xffffffff) continue;

        if (requireCrcValidation) {
            const dataEnd = footerOffset;
            const blockData = buf.subarray(blockStart, dataEnd);
            const stored = buf.readUInt16LE(footerOffset + 0x12);
            const computed = crc16CcittGen4(blockData);
            if (stored !== computed) continue;
            return { found: true, blockSize: size, crcValid: true };
        }

        return { found: true, blockSize: size, crcValid: false };
    }

    return { found: false, blockSize: 0, crcValid: false };
};

/**
 * Match a block size to a game variant
 */
const matchBlockSizeToVariant = (
    generalSize: number,
    storageSize: number,
): Gen4Variant | undefined => {
    for (const [variant, ranges] of Object.entries(GEN4_SIZE_RANGES)) {
        if (
            generalSize >= ranges.generalMin &&
            generalSize <= ranges.generalMax &&
            storageSize >= ranges.storageMin &&
            storageSize <= ranges.storageMax
        ) {
            return variant as Gen4Variant;
        }
    }
    return undefined;
};

/**
 * Attempt to detect Gen 4 game variant from save file structure.
 *
 * First pass: Try CRC-validated detection (most reliable for D/P/Pt)
 * Second pass: Fall back to size-based detection (for HGSS and unusual saves)
 *
 * Returns the detected variant or undefined if no match.
 */
const detectGen4VariantFromBuffer = (buf: Buffer): Gen4Variant | undefined => {
    if (buf.length < SAVE_SIZE_GEN4) return undefined;

    const PAIR_OFFSETS = [0x00000, 0x40000];

    // First pass: Try with CRC validation (works reliably for D/P/Pt)
    for (const pairBase of PAIR_OFFSETS) {
        const generalStart = pairBase;
        const generalResult = findGen4Block(buf, generalStart, GEN4_KNOWN_GENERAL_SIZES, true);
        if (!generalResult.found) continue;

        // Try storage at adjacent position first
        const storageStart = pairBase + generalResult.blockSize;
        let storageResult = findGen4Block(buf, storageStart, GEN4_KNOWN_STORAGE_SIZES, true);

        // For HGSS, storage may start at fixed offset 0xF700
        if (!storageResult.found && generalResult.blockSize >= 0x0f500) {
            const hgssStorageStart = pairBase + 0x0f700;
            storageResult = findGen4Block(buf, hgssStorageStart, GEN4_KNOWN_STORAGE_SIZES, true);
        }
        if (!storageResult.found) continue;

        const variant = matchBlockSizeToVariant(generalResult.blockSize, storageResult.blockSize);
        if (variant) return variant;
    }

    // Second pass: Try without CRC validation (for HGSS which may use different checksum)
    for (const pairBase of PAIR_OFFSETS) {
        const generalStart = pairBase;
        const generalResult = findGen4Block(buf, generalStart, GEN4_KNOWN_GENERAL_SIZES, false);
        if (!generalResult.found) continue;

        // Try storage at adjacent position first
        const storageStart = pairBase + generalResult.blockSize;
        let storageResult = findGen4Block(buf, storageStart, GEN4_KNOWN_STORAGE_SIZES, false);

        // For HGSS, storage may start at fixed offset 0xF700
        if (!storageResult.found && generalResult.blockSize >= 0x0f500) {
            const hgssStorageStart = pairBase + 0x0f700;
            storageResult = findGen4Block(buf, hgssStorageStart, GEN4_KNOWN_STORAGE_SIZES, false);
        }
        if (!storageResult.found) continue;

        const variant = matchBlockSizeToVariant(generalResult.blockSize, storageResult.blockSize);
        if (variant) return variant;
    }

    return undefined;
};

/**
 * Detect the Gen 4 save format (DP, Platinum, or HGSS) from buffer and/or filename.
 * Falls back to "DP" if no specific variant can be determined.
 */
const detectGen4SaveFormat = (buf: Buffer, fileName?: string): GameSaveFormat => {
    // First try filename hints
    if (fileName) {
        const hint = detectGen4GameNameFromString(fileName);
        if (hint) return hint;
    }

    // Then try structural detection
    const detected = detectGen4VariantFromBuffer(buf);
    if (detected) return detected;

    // Default to DP as fallback
    return "DP";
};

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
    data: { save, selectedGame, boxMappings, fileName },
}: MessageData) => {
    let result;

    if (!save) {
        throw new Error("No save file detected.");
    }

    const buf = toBuffer(save);
    const gen1Gen2Buf = normalizeGen1Gen2Buffer(buf);
    const gen3SaveFormatHint =
        buf.length === SAVE_SIZE_GEN3 || buf.length === SAVE_SIZE_GEN3_TRIMMED
            ? (fileName ? detectGen3SaveFormatFromString(fileName) : undefined)
            : undefined;

    // Auto-detect Gen 4 variant based on file structure and filename
    const gen4SaveFormatHint =
        buf.length >= SAVE_SIZE_GEN4
            ? detectGen4SaveFormat(buf, fileName)
            : undefined;

    const gameChoice: GameSaveFormat =
        selectedGame && selectedGame !== "Auto"
            ? selectedGame
            : buf.length >= SAVE_SIZE_GEN4
              ? gen4SaveFormatHint ?? "DP"
              : buf.length === SAVE_SIZE_GEN3 || buf.length === SAVE_SIZE_GEN3_TRIMMED
                ? gen3SaveFormatHint ?? "Emerald"
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
                // If the save itself contains a strong hint, trust it.
                if (gen3SaveFormatHint) {
                    result = await parseGen3Save(buf, {
                        boxMappings,
                        selectedGame: gen3SaveFormatHint,
                    });
                } else {
                    result = await parseGen3WithBestVariant(buf, boxMappings);
                }
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
    } else if (gameChoice === "DP" || gameChoice === "Platinum" || gameChoice === "HGSS") {
        const preferredGen4 =
            selectedGame === "DP" ||
            selectedGame === "Platinum" ||
            selectedGame === "HGSS"
                ? selectedGame
                : undefined;
        result = await parseGen4Save(buf, {
            boxMappings,
            selectedGame: preferredGen4,
        });
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
    } else if (gameChoice === "DP" || gameChoice === "Platinum" || gameChoice === "HGSS") {
        // Gen 4: use filename hints or default based on detected format
        const gen4Hint = fileName ? detectGen4GameNameFromString(fileName) : undefined;
        if (gen4Hint === "HGSS") {
            detectedGame = makeGame("HeartGold");
        } else if (gen4Hint === "Platinum") {
            detectedGame = makeGame("Platinum");
        } else if (gen4Hint === "DP") {
            detectedGame = makeGame("Diamond");
        } else if (gameChoice === "HGSS") {
            detectedGame = makeGame("HeartGold");
        } else if (gameChoice === "Platinum") {
            detectedGame = makeGame("Platinum");
        } else {
            detectedGame = makeGame("Diamond");
        }
    } else {
        const hinted = fileName ? detectGen3GameNameFromString(fileName) : undefined;
        if (hinted) {
            detectedGame = makeGame(hinted);
        } else {
        // Gen 3: infer exact title (Ruby vs Sapphire, FireRed vs LeafGreen, etc.) from origin-game majority.
            const inferred = inferGen3GameFromPokemon(result.pokemon);
            if (inferred) detectedGame = makeGame(inferred);
            else if (gameChoice === "FRLG") detectedGame = makeGame("FireRed");
            else if (gameChoice === "Emerald") detectedGame = makeGame("Emerald");
            else detectedGame = makeGame("Ruby");
        }
    }

    self.postMessage({
        ...result,
        detectedGame,
        detectedSaveFormat: gameChoice,
    });
};
