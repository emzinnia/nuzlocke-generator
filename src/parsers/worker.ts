import {
    detectGen5Layout,
    parseGen1Save,
    parseGen2Save,
    parseGen3Save,
    parseGen4Save,
    parseGen5Save,
} from ".";
import { BoxMappings } from "./utils/boxMappings";
import { Buffer } from "buffer";
import type { GameSaveFormat } from "utils/gameSaveFormat";
import type { Game as GameName } from "utils";
import type { Game as GameModel } from "models";
import type { Gen5Game } from "./gen5";

interface MessageData {
    data: {
        save?: Buffer | Uint8Array;
        selectedGame?: GameSaveFormat;
        boxMappings: BoxMappings;
        fileName?: string;
    };
}

type NonAutoGameSaveFormat = Exclude<GameSaveFormat, "Auto">;
type Gen3SaveFormat = "RS" | "FRLG" | "Emerald";

type ParsedMonForInference = {
    species?: string;
    status?: string;
    extraData?: {
        originGame?: string;
    };
};

type SaveParseResult = {
    pokemon: ParsedMonForInference[];
    isYellow?: boolean;
    game?: GameName;
    [key: string]: unknown;
};

type ParseContext = {
    buf: Buffer;
    gen1Gen2Buf: Buffer;
    selectedGame?: GameSaveFormat;
    boxMappings: BoxMappings;
    fileName?: string;
    gen3SaveFormatHint?: Gen3SaveFormat;
    gen4SaveFormatHint?: Gen4Variant;
    gen5SaveFormatHint?: Gen5Game;
};

type ParserHandler = {
    isFormat: (gameChoice: NonAutoGameSaveFormat) => boolean;
    parse: (
        context: ParseContext,
        gameChoice: NonAutoGameSaveFormat,
    ) => Promise<SaveParseResult>;
    detectGame: (
        context: ParseContext,
        gameChoice: NonAutoGameSaveFormat,
        result: SaveParseResult,
    ) => GameModel | undefined;
};

self.onmessageerror = (err) => {
    console.error("save worker message error", err);
};

const SAVE_SIZE_GEN1_GEN2 = 0x8000; // 32 KiB
const SAVE_SIZE_GEN3 = 0x20000; // 128 KiB
const SAVE_SIZE_GEN3_TRIMMED = 0x1c000; // 114,688 bytes (2 * 0xE000)
const SAVE_SIZE_GEN4 = 0x80000; // 512 KiB typical DS save
const SAVE_SIZE_GEN5_BW = 0x24000; // 144 KiB Gen 5 main save
const SAVE_SIZE_GEN5_B2W2 = 0x26000; // 152 KiB Gen 5 main save
const SAVE_SIZE_GEN5_RAW = 0x80000; // 512 KiB Gen 5 raw save
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
    return s.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9]/g, "");
};

const getHintTokens = (s: string) =>
    s.toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);

const hasHintToken = (tokens: string[], ...values: string[]) =>
    tokens.some((token) => values.includes(token));

const asSaveParseResult = (result: unknown) => result as SaveParseResult;

const isExplicitGameChoice = (
    selectedGame?: GameSaveFormat,
): selectedGame is NonAutoGameSaveFormat =>
    Boolean(selectedGame && selectedGame !== "Auto");

const isAutoSelected = (context: ParseContext) =>
    !isExplicitGameChoice(context.selectedGame);

const isGen3SizedSave = (buf: Buffer) =>
    buf.length === SAVE_SIZE_GEN3 || buf.length === SAVE_SIZE_GEN3_TRIMMED;

const isGen1Gen2SizedSave = (buf: Buffer) =>
    buf.length >= SAVE_SIZE_GEN1_GEN2 &&
    buf.length <= SAVE_SIZE_GEN1_GEN2_MAX_WITH_PADDING;

const isGen1SaveFormat = (
    gameChoice: NonAutoGameSaveFormat,
): gameChoice is "RBY" => gameChoice === "RBY";

const isGen2SaveFormat = (
    gameChoice: NonAutoGameSaveFormat,
): gameChoice is "GS" | "Crystal" =>
    gameChoice === "GS" || gameChoice === "Crystal";

const isGen3SaveFormat = (
    gameChoice: NonAutoGameSaveFormat,
): gameChoice is Gen3SaveFormat =>
    gameChoice === "RS" || gameChoice === "FRLG" || gameChoice === "Emerald";

const isGen4SaveFormat = (
    gameChoice: NonAutoGameSaveFormat,
): gameChoice is Gen4Variant =>
    gameChoice === "DP" || gameChoice === "Platinum" || gameChoice === "HGSS";

const isGen5SaveFormat = (
    gameChoice: NonAutoGameSaveFormat,
): gameChoice is Gen5Game => gameChoice === "BW" || gameChoice === "B2W2";

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

const detectGen3SaveFormatFromString = (text: string): Gen3SaveFormat | undefined => {
    const name = detectGen3GameNameFromString(text);
    if (!name) return undefined;
    if (name === "FireRed" || name === "LeafGreen") return "FRLG";
    if (name === "Emerald") return "Emerald";
    if (name === "Ruby" || name === "Sapphire") return "RS";
    return undefined;
};

type Gen4Variant = "DP" | "Platinum" | "HGSS";

const detectGen4SaveFormatFromString = (text: string): Gen4Variant | undefined => {
    const s = normalizeForTokenSearch(text);
    const tokens = getHintTokens(text);

    // HeartGold / SoulSilver
    if (s.includes("HEARTGOLD") || hasHintToken(tokens, "HG", "HGSS")) {
        return "HGSS";
    }
    if (s.includes("SOULSILVER") || hasHintToken(tokens, "SS")) return "HGSS";

    // Platinum
    if (s.includes("PLATINUM") || hasHintToken(tokens, "PT")) return "Platinum";

    // Diamond / Pearl
    if (hasHintToken(tokens, "DP")) return "DP";
    if (s.includes("DIAMOND")) return "DP";
    if (s.includes("PEARL")) return "DP";

    return undefined;
};

const detectGen4GameNameFromString = (text: string): GameName | undefined => {
    const s = normalizeForTokenSearch(text);
    const tokens = getHintTokens(text);

    if (s.includes("HEARTGOLD") || hasHintToken(tokens, "HG", "HGSS")) {
        return "HeartGold";
    }
    if (s.includes("SOULSILVER") || hasHintToken(tokens, "SS")) return "SoulSilver";
    if (s.includes("PLATINUM") || hasHintToken(tokens, "PT")) return "Platinum";
    if (s.includes("DIAMOND")) return "Diamond";
    if (s.includes("PEARL")) return "Pearl";

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
 *   - HGSS:     General 0xF628,   Storage 0x12310 at 0xF700
 *
 * Each block has footer counters at size - 0x14. D/P/Pt checksums exclude
 * 0x14 bytes, while HGSS checksums exclude 0x10 bytes, matching PKHeX.Core.
 *
 * Footer fields at size - 0x14 include:
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
const GEN4_KNOWN_GENERAL_SIZES = [0x0c100, 0x0cf2c, 0x0f628];
const GEN4_KNOWN_STORAGE_SIZES = [0x121e0, 0x121e4, 0x12310];

const getGen4ChecksumFooterSize = (blockSize: number) =>
    blockSize === 0x0f628 || blockSize === 0x12310 ? 0x10 : 0x14;

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
            const dataEnd = blockStart + size - getGen4ChecksumFooterSize(size);
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
const detectGen4SaveFormat = (buf: Buffer, fileName?: string): Gen4Variant => {
    const detected = detectGen4VariantFromBuffer(buf);
    if (detected) return detected;

    // Fall back to filename hints if the block layout is not recognizable.
    if (fileName) {
        const hint = detectGen4SaveFormatFromString(fileName);
        if (hint) return hint;
    }

    // Default to DP as fallback
    return "DP";
};

const gen4GameMatchesSaveFormat = (
    gameName: GameName,
    saveFormat: GameSaveFormat,
) => {
    if (saveFormat === "DP") return gameName === "Diamond" || gameName === "Pearl";
    if (saveFormat === "HGSS") return gameName === "HeartGold" || gameName === "SoulSilver";
    return saveFormat === gameName;
};

const detectGen5SaveFormatFromString = (text: string): Gen5Game | undefined => {
    const s = normalizeForTokenSearch(text);
    const tokens = getHintTokens(text);

    if (
        s.includes("BLACK2") ||
        s.includes("WHITE2") ||
        s.includes("BLACKTWO") ||
        s.includes("WHITETWO") ||
        hasHintToken(tokens, "B2", "W2", "BW2", "B2W2")
    ) {
        return "B2W2";
    }

    if (
        s.includes("BLACK") ||
        s.includes("WHITE") ||
        hasHintToken(tokens, "BW")
    ) {
        return "BW";
    }

    return undefined;
};

const detectGen5GameNameFromString = (text: string): GameName | undefined => {
    const s = normalizeForTokenSearch(text);
    const tokens = getHintTokens(text);

    if (s.includes("BLACK2") || s.includes("BLACKTWO") || hasHintToken(tokens, "B2")) {
        return "Black 2";
    }
    if (s.includes("WHITE2") || s.includes("WHITETWO") || hasHintToken(tokens, "W2")) {
        return "White 2";
    }
    if (s.includes("BLACK")) return "Black";
    if (s.includes("WHITE")) return "White";

    return undefined;
};

const detectGen5SaveFormat = (
    buf: Buffer,
    fileName?: string,
): Gen5Game | undefined => {
    if (
        buf.length !== SAVE_SIZE_GEN5_RAW &&
        buf.length !== SAVE_SIZE_GEN5_BW &&
        buf.length !== SAVE_SIZE_GEN5_B2W2
    ) {
        return undefined;
    }

    const detected = detectGen5Layout(buf);
    if (detected) return detected;

    return fileName ? detectGen5SaveFormatFromString(fileName) : undefined;
};

const gen5GameMatchesSaveFormat = (
    gameName: GameName,
    saveFormat: GameSaveFormat,
) => {
    if (saveFormat === "BW") return gameName === "Black" || gameName === "White";
    if (saveFormat === "B2W2") {
        return gameName === "Black 2" || gameName === "White 2";
    }
    return false;
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

const detectGen1Gen2GameChoice = (buf: Buffer): "RBY" | "Crystal" | "GS" => {
    if (isLikelyGen1Save(buf)) return "RBY";
    return detectGen2IsCrystal(buf) ? "Crystal" : "GS";
};

const createParseContext = ({
    save,
    selectedGame,
    boxMappings,
    fileName,
}: MessageData["data"]): ParseContext => {
    if (!save) {
        throw new Error("No save file detected.");
    }

    const buf = toBuffer(save);
    const gen1Gen2Buf = normalizeGen1Gen2Buffer(buf);
    const gen3SaveFormatHint =
        isGen3SizedSave(buf)
            ? (fileName ? detectGen3SaveFormatFromString(fileName) : undefined)
            : undefined;
    const gen5SaveFormatHint = detectGen5SaveFormat(buf, fileName);
    const gen4SaveFormatHint =
        buf.length >= SAVE_SIZE_GEN4 && !gen5SaveFormatHint
            ? detectGen4SaveFormat(buf, fileName)
            : undefined;

    return {
        buf,
        gen1Gen2Buf,
        selectedGame,
        boxMappings,
        fileName,
        gen3SaveFormatHint,
        gen4SaveFormatHint,
        gen5SaveFormatHint,
    };
};

const detectAutoGameChoice = (context: ParseContext): NonAutoGameSaveFormat => {
    if (context.gen5SaveFormatHint) return context.gen5SaveFormatHint;
    if (context.buf.length >= SAVE_SIZE_GEN4) {
        return context.gen4SaveFormatHint ?? "DP";
    }
    if (isGen3SizedSave(context.buf)) {
        return context.gen3SaveFormatHint ?? "Emerald";
    }
    if (isGen1Gen2SizedSave(context.buf)) {
        return detectGen1Gen2GameChoice(context.gen1Gen2Buf);
    }

    // Fallback: try Gen 3 if it's "large-ish", else assume Gen 2.
    return context.buf.length > SAVE_SIZE_GEN1_GEN2 ? "Emerald" : "GS";
};

const selectGameChoice = (context: ParseContext): NonAutoGameSaveFormat =>
    isExplicitGameChoice(context.selectedGame)
        ? context.selectedGame
        : detectAutoGameChoice(context);

const parseGen1Choice = async (context: ParseContext) =>
    asSaveParseResult(
        await parseGen1Save(context.gen1Gen2Buf, {
            boxMappings: context.boxMappings,
        }),
    );

const parseGen2Choice = async (
    context: ParseContext,
    gameChoice: NonAutoGameSaveFormat,
) =>
    asSaveParseResult(
        await parseGen2Save(context.gen1Gen2Buf, {
            isCrystal: gameChoice === "Crystal",
            boxMappings: context.boxMappings,
        }),
    );

const isUnexpectedGen3SizeError = (err: unknown) => {
    const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
    return msg.includes("Unexpected Gen 3 save size");
};

const parsePaddedGen1Gen2Fallback = async (context: ParseContext) => {
    const fallbackChoice = detectGen1Gen2GameChoice(context.gen1Gen2Buf);
    return fallbackChoice === "RBY"
        ? parseGen1Choice(context)
        : parseGen2Choice(context, fallbackChoice);
};

const parseAutoGen3Choice = async (context: ParseContext) => {
    try {
        if (context.gen3SaveFormatHint) {
            return asSaveParseResult(
                await parseGen3Save(context.buf, {
                    boxMappings: context.boxMappings,
                    selectedGame: context.gen3SaveFormatHint,
                }),
            );
        }

        return asSaveParseResult(
            await parseGen3WithBestVariant(context.buf, context.boxMappings),
        );
    } catch (err) {
        // Some Gen1/2 saves come with tiny padding (e.g. 0x802c) which can trick Auto into Gen3.
        // If Gen3 rejects the size, fall back to Gen1/2 parsing on the normalized 32KiB buffer.
        if (isUnexpectedGen3SizeError(err)) {
            return parsePaddedGen1Gen2Fallback(context);
        }
        throw err;
    }
};

const parseGen3Choice = async (
    context: ParseContext,
    gameChoice: NonAutoGameSaveFormat,
) => {
    if (isAutoSelected(context)) {
        return parseAutoGen3Choice(context);
    }

    return asSaveParseResult(
        await parseGen3Save(context.buf, {
            boxMappings: context.boxMappings,
            selectedGame: gameChoice,
        }),
    );
};

const parseGen4Choice = async (context: ParseContext) => {
    const preferredGen4 =
        isExplicitGameChoice(context.selectedGame) &&
        isGen4SaveFormat(context.selectedGame)
            ? context.selectedGame
            : undefined;

    return asSaveParseResult(
        await parseGen4Save(context.buf, {
            boxMappings: context.boxMappings,
            selectedGame: preferredGen4,
        }),
    );
};

const parseGen5Choice = async (context: ParseContext) => {
    const preferredGen5 =
        isExplicitGameChoice(context.selectedGame) &&
        isGen5SaveFormat(context.selectedGame)
            ? context.selectedGame
            : context.gen5SaveFormatHint;

    return asSaveParseResult(
        await parseGen5Save(context.buf, {
            boxMappings: context.boxMappings,
            selectedGame: preferredGen5,
        }),
    );
};

const detectGen1Game = (
    context: ParseContext,
    gameChoice: NonAutoGameSaveFormat,
    result: SaveParseResult,
) => makeGame(result.isYellow ? "Yellow" : "Red");

const detectGen2Game = (
    context: ParseContext,
    gameChoice: NonAutoGameSaveFormat,
) => makeGame(gameChoice === "Crystal" ? "Crystal" : "Gold");

const detectGen3Game = (
    context: ParseContext,
    gameChoice: NonAutoGameSaveFormat,
    result: SaveParseResult,
) => {
    const hinted = context.fileName
        ? detectGen3GameNameFromString(context.fileName)
        : undefined;
    if (hinted) return makeGame(hinted);

    // Infer exact title (Ruby vs Sapphire, FireRed vs LeafGreen, etc.) from origin-game majority.
    const inferred = inferGen3GameFromPokemon(result.pokemon);
    if (inferred) return makeGame(inferred);
    if (gameChoice === "FRLG") return makeGame("FireRed");
    if (gameChoice === "Emerald") return makeGame("Emerald");
    return makeGame("Ruby");
};

const detectGen4Game = (
    context: ParseContext,
    gameChoice: NonAutoGameSaveFormat,
) => {
    const gen4Hint = context.fileName
        ? detectGen4GameNameFromString(context.fileName)
        : undefined;
    if (gen4Hint && gen4GameMatchesSaveFormat(gen4Hint, gameChoice)) {
        return makeGame(gen4Hint);
    }
    if (gameChoice === "HGSS") return makeGame("HeartGold");
    if (gameChoice === "Platinum") return makeGame("Platinum");
    return makeGame("Diamond");
};

const detectGen5Game = (
    context: ParseContext,
    gameChoice: NonAutoGameSaveFormat,
    result: SaveParseResult,
) => {
    const gen5Hint = context.fileName
        ? detectGen5GameNameFromString(context.fileName)
        : undefined;
    if (result.game) return makeGame(result.game);
    if (gen5Hint && gen5GameMatchesSaveFormat(gen5Hint, gameChoice)) {
        return makeGame(gen5Hint);
    }
    return gameChoice === "B2W2" ? makeGame("Black 2") : makeGame("Black");
};

// Future Gen 6-9 support should add one handler per generation here instead of
// adding more branching to the worker message handler.
const parserHandlers: ParserHandler[] = [
    {
        isFormat: isGen1SaveFormat,
        parse: parseGen1Choice,
        detectGame: detectGen1Game,
    },
    {
        isFormat: isGen2SaveFormat,
        parse: parseGen2Choice,
        detectGame: detectGen2Game,
    },
    {
        isFormat: isGen3SaveFormat,
        parse: parseGen3Choice,
        detectGame: detectGen3Game,
    },
    {
        isFormat: isGen4SaveFormat,
        parse: parseGen4Choice,
        detectGame: detectGen4Game,
    },
    {
        isFormat: isGen5SaveFormat,
        parse: parseGen5Choice,
        detectGame: detectGen5Game,
    },
];

const getParserHandler = (gameChoice: NonAutoGameSaveFormat) => {
    const handler = parserHandlers.find((candidate) => candidate.isFormat(gameChoice));
    if (!handler) throw new Error(`Unsupported game type: ${gameChoice}`);
    return handler;
};

self.onmessage = async ({ data }: MessageData) => {
    const context = createParseContext(data);
    const gameChoice = selectGameChoice(context);
    const handler = getParserHandler(gameChoice);
    const result = await handler.parse(context, gameChoice);
    const pokemon = result.pokemon.filter((poke) => poke.species);
    const detectedGame = handler.detectGame(context, gameChoice, {
        ...result,
        pokemon,
    });

    self.postMessage({
        ...result,
        pokemon,
        detectedGame,
        detectedSaveFormat: gameChoice,
    });
};
