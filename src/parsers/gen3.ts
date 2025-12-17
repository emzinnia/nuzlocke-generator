import { Buffer } from "buffer";
import { Pokemon } from "models";
import { matchSpeciesToTypes } from "utils/formatters/matchSpeciesToTypes";
import { Forme } from "utils/Forme";
import { Types } from "utils/Types";
import { listOfPokemon } from "utils/data/listOfPokemon";
import type { Species } from "utils/data/listOfPokemon";
import type { GameSaveFormat } from "utils/gameSaveFormat";
import { MOVES_ARRAY } from "./utils";
import { ParserOptions } from "./utils/parserOptions";
import { parseGen3Time } from "./utils/parseGen3Time";
import {
    GEN3_SPECIES_MAP,
    ABILITY_MAP,
    GEN_3_LOCATIONS,
    GEN_3_HELD_ITEM_MAP,
} from "./utils/gen3";

const DEBUG = import.meta.env.VITE_DEBUG_PARSER === "true";

const log = (category: string, message: string, data?: unknown) => {
    if (!DEBUG) return;
    const timestamp = new Date().toISOString();
    console.log(
        `[Gen3Parser:${category}] ${timestamp} - ${message}`,
        data || "",
    );
};

interface SaveSection {
    id: number;
    data: Buffer;
    checksum: number;
    signature: number;
    saveIndex: number;
    order: number;
}

interface PokemonContext {
    status: string;
    position: number;
    isParty: boolean;
    level?: number;
    boxIndex?: number;
    slotIndex?: number;
    pidTracker: Map<string, number>;
}

const SECTION_SIZE = 0x1000;
const SECTION_DATA_SIZE = 0x0ff4;
const SECTION_COUNT = 14;
const BLOCK_SIZE = SECTION_SIZE * SECTION_COUNT;
const SAVE_SIZE = 0x20000;
const SECTION_SIGNATURE = 0x08012025;
const PARTY_POKEMON_SIZE = 100;
const BOX_POKEMON_SIZE = 80;
const TEAM_CAPACITY = 6;
const BOX_CAPACITY = 30;
const BOX_COUNT = 14;
const STORAGE_HEADER_SIZE = 4;
const MAX_SUPPORTED_SPECIES = 411; // Includes old Unown forms (387-411)

const PC_SECTION_IDS = [5, 6, 7, 8, 9, 10, 11, 12, 13];

const SECTION_SAVE_SIZES: Record<number, number> = {
    0: 3884,
    1: 3968,
    2: 3968,
    3: 3968,
    4: 3848,
    5: 3968,
    6: 3968,
    7: 3968,
    8: 3968,
    9: 3968,
    10: 3968,
    11: 3968,
    12: 3968,
    13: 2000,
};

const COMMON_OFFSETS = {
    PLAYER_NAME: [0x0000, 0x0007],
    PLAYER_ID: [0x000a, 0x000e],
    TIME_PLAYED: [0x000e, 0x0013],
};

const RS_OFFSETS = {
    ...COMMON_OFFSETS,
    TEAM_SIZE: 0x0234,
    TEAM_POKEMON_LIST: 0x0238,
    MONEY: [0x0490, 0x0494],
};

const EMERALD_OFFSETS = {
    ...COMMON_OFFSETS,
    TEAM_SIZE: 0x0234,
    TEAM_POKEMON_LIST: 0x0238,
    MONEY: [0x0490, 0x0494],
};

const FRLG_OFFSETS = {
    ...COMMON_OFFSETS,
    TEAM_SIZE: 0x0034,
    TEAM_POKEMON_LIST: 0x0038,
    MONEY: [0x0490, 0x0494],
};

const ORIGIN_GAME_MAP: Record<number, string> = {
    0: "Ruby",
    1: "Sapphire",
    2: "Emerald",
    3: "FireRed",
    4: "LeafGreen",
    5: "Colosseum/XD",
};

const BALL_MAP: Record<number, string> = {
    0: "None",
    1: "Master Ball",
    2: "Ultra Ball",
    3: "Great Ball",
    4: "Poké Ball",
    5: "Safari Ball",
    6: "Net Ball",
    7: "Dive Ball",
    8: "Nest Ball",
    9: "Repeat Ball",
    10: "Timer Ball",
    11: "Luxury Ball",
    12: "Premier Ball",
};

const SUBSTRUCTURE_ORDERS = [
    "GAEM",
    "GAME",
    "GEAM",
    "GEMA",
    "GMAE",
    "GMEA",
    "AGEM",
    "AGME",
    "AEGM",
    "AEMG",
    "AMGE",
    "AMEG",
    "EGAM",
    "EGMA",
    "EAGM",
    "EAMG",
    "EMGA",
    "EMAG",
    "MGAE",
    "MGEA",
    "MAGE",
    "MAEG",
    "MEGA",
    "MEAG",
];

const UNOWN_FORMES: Forme[] = [
    Forme.A,
    Forme.B,
    Forme.C,
    Forme.D,
    Forme.E,
    Forme.F,
    Forme.G,
    Forme.H,
    Forme.I,
    Forme.J,
    Forme.K,
    Forme.L,
    Forme.M,
    Forme.N,
    Forme.O,
    Forme.P,
    Forme.Q,
    Forme.R,
    Forme.S,
    Forme.T,
    Forme.U,
    Forme.V,
    Forme.W,
    Forme.X,
    Forme.Y,
    Forme.Z,
    Forme["!"],
    Forme["?"],
];

const SPECIES_MAP: Record<number, Species> = {};
for (let i = 0; i < listOfPokemon.length; i++) {
    SPECIES_MAP[i + 1] = listOfPokemon[i];
}

// O(1) species -> National Dex number (1-indexed), avoiding per-Pokémon linear scans.
const DEX_NUMBER_BY_SPECIES = new Map<Species, number>(
    listOfPokemon.map((s, i) => [s, i + 1] as const),
);

// Memoized species -> unique type list (mono-types collapse to a single entry).
const TYPES_BY_SPECIES = new Map<Species, Types[]>();
const getTypesForSpecies = (species: Species): Types[] => {
    const cached = TYPES_BY_SPECIES.get(species);
    if (cached) return cached;
    const tuple = matchSpeciesToTypes(species);
    const unique = Array.from(new Set(tuple)) as Types[];
    TYPES_BY_SPECIES.set(species, unique);
    return unique;
};

const decodeCharacter = (code: number): string => {
    // When decoding Gen 3 strings, which charset applies depends on the language.
    // For Japanese Pokémon, many byte values map to Hiragana/Katakana instead of Latin.
    // This mapping is based on the pokeemerald disassembly `charmap.txt` and aligns with
    // the "Gen 3 charset" description in `src/parsers/gen3.md`.
    //
    // Source: https://raw.githubusercontent.com/pret/pokeemerald/master/charmap.txt
    return decodeCharacterWithLanguage(code);
};

const HIRAGANA_TABLE: string[] = [
    "あ",
    "い",
    "う",
    "え",
    "お",
    "か",
    "き",
    "く",
    "け",
    "こ",
    "さ",
    "し",
    "す",
    "せ",
    "そ",
    "た",
    "ち",
    "つ",
    "て",
    "と",
    "な",
    "に",
    "ぬ",
    "ね",
    "の",
    "は",
    "ひ",
    "ふ",
    "へ",
    "ほ",
    "ま",
    "み",
    "む",
    "め",
    "も",
    "や",
    "ゆ",
    "よ",
    "ら",
    "り",
    "る",
    "れ",
    "ろ",
    "わ",
    "を",
    "ん",
    "ぁ",
    "ぃ",
    "ぅ",
    "ぇ",
    "ぉ",
    "ゃ",
    "ゅ",
    "ょ",
    "が",
    "ぎ",
    "ぐ",
    "げ",
    "ご",
    "ざ",
    "じ",
    "ず",
    "ぜ",
    "ぞ",
    "だ",
    "ぢ",
    "づ",
    "で",
    "ど",
    "ば",
    "び",
    "ぶ",
    "べ",
    "ぼ",
    "ぱ",
    "ぴ",
    "ぷ",
    "ぺ",
    "ぽ",
    "っ",
];

const KATAKANA_TABLE: string[] = [
    "ア",
    "イ",
    "ウ",
    "エ",
    "オ",
    "カ",
    "キ",
    "ク",
    "ケ",
    "コ",
    "サ",
    "シ",
    "ス",
    "セ",
    "ソ",
    "タ",
    "チ",
    "ツ",
    "テ",
    "ト",
    "ナ",
    "ニ",
    "ヌ",
    "ネ",
    "ノ",
    "ハ",
    "ヒ",
    "フ",
    "ヘ",
    "ホ",
    "マ",
    "ミ",
    "ム",
    "メ",
    "モ",
    "ヤ",
    "ユ",
    "ヨ",
    "ラ",
    "リ",
    "ル",
    "レ",
    "ロ",
    "ワ",
    "ヲ",
    "ン",
    "ァ",
    "ィ",
    "ゥ",
    "ェ",
    "ォ",
    "ャ",
    "ュ",
    "ョ",
    "ガ",
    "ギ",
    "グ",
    "ゲ",
    "ゴ",
    "ザ",
    "ジ",
    "ズ",
    "ゼ",
    "ゾ",
    "ダ",
    "ヂ",
    "ヅ",
    "デ",
    "ド",
    "バ",
    "ビ",
    "ブ",
    "ベ",
    "ボ",
    "パ",
    "ピ",
    "プ",
    "ペ",
    "ポ",
    "ッ",
];

const decodeJapaneseCharacter = (code: number): string => {
    if (code >= 0x01 && code <= 0x50) return HIRAGANA_TABLE[code - 0x01] ?? "";
    if (code >= 0x51 && code <= 0xa0)
        return KATAKANA_TABLE[code - 0x51] ?? "";
    switch (code) {
        case 0x00:
            return " ";
        case 0xe0:
            return "'";
        case 0xe1:
            return "-";
        case 0xe2:
            return "!";
        case 0xe3:
            return "?";
        case 0xe6:
            return ".";
        case 0xe8:
            return "…";
        case 0xab:
            return "♂";
        case 0xac:
            return "♀";
        default:
            return "";
    }
};

const decodeCharacterWithLanguage = (
    code: number,
    language?: number,
): string => {
    // Gen 3 language codes: 1 = Japanese; other values use the Latin table.
    if (language === 1) return decodeJapaneseCharacter(code);

    if (code >= 0xbb && code <= 0xd4) {
        return String.fromCharCode(65 + (code - 0xbb));
    }
    if (code >= 0xd5 && code <= 0xee) {
        return String.fromCharCode(97 + (code - 0xd5));
    }
    if (code >= 0xa1 && code <= 0xaa) {
        return String.fromCharCode(48 + (code - 0xa1));
    }
    switch (code) {
        case 0x00:
            return " ";
        case 0xe0:
            return "'";
        case 0xe1:
            return "-";
        case 0xe2:
            return "!";
        case 0xe3:
            return "?";
        case 0xe6:
            return ".";
        case 0xe8:
            return "…";
        case 0xab:
            return "♂";
        case 0xac:
            return "♀";
        default:
            return "";
    }
};

const decodeGameText = (buffer: Buffer, language?: number): string => {
    let result = "";
    for (const code of buffer) {
        // Gen 3 fixed-size strings: terminator 0xFF, often padded with 0x00
        if (code === 0xff) break;
        if (code === 0x00) continue;
        result += decodeCharacterWithLanguage(code, language);
    }
    return result.trim();
};

const getOffsets = (game?: GameSaveFormat) => {
    switch (game) {
        case "FRLG":
            return FRLG_OFFSETS;
        case "Emerald":
            return EMERALD_OFFSETS;
        case "RS":
        default:
            return RS_OFFSETS;
    }
};

const computeChecksum = (buffer: Buffer, size: number) => {
    let sum = 0;
    const limit = Math.min(size, buffer.length);
    for (let i = 0; i < limit; i += 4) {
        // All checksum sizes we use are multiples of 4 (per Bulbapedia), so read u32 words.
        sum = (sum + buffer.readUInt32LE(i)) >>> 0;
    }
    return ((sum & 0xffff) + (sum >>> 16)) & 0xffff;
};

const isSectionValid = (section: SaveSection) => {
    if (section.signature !== SECTION_SIGNATURE) {
        if (DEBUG) {
            log("signature", `Section ${section.id} failed signature`, {
                expected: `0x${SECTION_SIGNATURE.toString(16)}`,
                actual: `0x${section.signature.toString(16)}`,
                saveIndex: section.saveIndex,
            });
        }
        return false;
    }
    const size = SECTION_SAVE_SIZES[section.id];
    if (!size) return false;
    const computed = computeChecksum(section.data, size);
    const isValid = computed === section.checksum;
    if (!isValid) {
        if (DEBUG) {
            log("checksum", `Section ${section.id} failed checksum`, {
                expected: `0x${section.checksum.toString(16)}`,
                computed: `0x${computed.toString(16)}`,
                saveIndex: section.saveIndex,
            });
        }
    }
    return isValid;
};

const readSection = (file: Buffer, sectionIndex: number): SaveSection => {
    const offset = sectionIndex * SECTION_SIZE;
    const dataStart = offset;
    const dataEnd = offset + SECTION_DATA_SIZE;
    const footerStart = offset + SECTION_DATA_SIZE;
    const footer = file.slice(footerStart, footerStart + 12);

    const id = footer.readUInt16LE(0);
    const checksum = footer.readUInt16LE(2);
    const signature = footer.readUInt32LE(4);
    const saveIndex = footer.readUInt32LE(8);

    if (DEBUG) {
        log(
            "readSection",
            `Section ${sectionIndex}: ID=${id}, checksum=0x${checksum.toString(16)}, signature=0x${signature.toString(
                16,
            )}, saveIndex=${saveIndex}`,
            {
                offset: `0x${offset.toString(16)}`,
                dataSize: SECTION_DATA_SIZE,
            },
        );
    }

    return {
        id,
        checksum,
        signature,
        saveIndex,
        order: sectionIndex,
        data: file.slice(dataStart, dataEnd),
    };
};

const readBlock = (file: Buffer, blockOffset: number): SaveSection[] => {
    const start = blockOffset;
    const blockBuffer = file.slice(start, start + BLOCK_SIZE);
    const sections: SaveSection[] = [];

    if (DEBUG) {
        log(
            "readBlock",
            `Reading block at offset 0x${start.toString(16)}, size=${BLOCK_SIZE}`,
        );
    }

    for (let i = 0; i < SECTION_COUNT; i++) {
        sections.push(readSection(blockBuffer, i));
    }

    return sections;
};

const validateAndIndexBlock = (sections: SaveSection[]) => {
    // Per gen3.md (Bulbapedia): a valid block has 14 unique section IDs (0..13),
    // all signatures match 0x08012025, all checksums match, and all sections share a saveIndex.
    const byId = new Map<number, SaveSection>();
    let expectedSaveIndex: number | undefined;

    for (const s of sections) {
        if (!(s.id in SECTION_SAVE_SIZES)) return { ok: false as const };
        if (byId.has(s.id)) return { ok: false as const };
        if (!isSectionValid(s)) return { ok: false as const };
        if (expectedSaveIndex === undefined) expectedSaveIndex = s.saveIndex;
        if (s.saveIndex !== expectedSaveIndex) return { ok: false as const };
        byId.set(s.id, s);
    }

    if (byId.size !== SECTION_COUNT) return { ok: false as const };
    return { ok: true as const, saveIndex: expectedSaveIndex!, byId };
};

type ActiveBlock = {
    label: "A" | "B";
    saveIndex: number;
    byId: Map<number, SaveSection>;
};

const selectActiveBlock = (buffer: Buffer): ActiveBlock => {
    const a = validateAndIndexBlock(readBlock(buffer, 0x000000));
    const b = validateAndIndexBlock(readBlock(buffer, 0x00e000));

    if (a.ok && b.ok) {
        return a.saveIndex >= b.saveIndex
            ? { label: "A", saveIndex: a.saveIndex, byId: a.byId }
            : { label: "B", saveIndex: b.saveIndex, byId: b.byId };
    }
    if (a.ok) return { label: "A", saveIndex: a.saveIndex, byId: a.byId };
    if (b.ok) return { label: "B", saveIndex: b.saveIndex, byId: b.byId };

    throw new Error(
        "Both save blocks failed validation (signature/checksum/index).",
    );
};

const sumPokemonSubstructsChecksum = (decrypted48: Buffer) => {
    // Sum 16-bit little-endian words across 48 bytes; truncate to 16 bits.
    let sum = 0;
    for (let i = 0; i < 48; i += 2) {
        sum = (sum + decrypted48.readUInt16LE(i)) & 0xffff;
    }
    return sum;
};

const getSpeciesName = (
    speciesId: number,
    nickname?: string,
): Species | undefined => {
    // Convert Gen 3 internal species ID to our canonical Species string.
    // Note: `GEN3_SPECIES_MAP` used to return a National Dex number; it now returns a Species string.
    const speciesFromMap = GEN3_SPECIES_MAP[speciesId];
    if (speciesFromMap) return speciesFromMap;
    if (nickname) {
        const match = listOfPokemon.find(
            (name) => name.toLowerCase() === nickname.toLowerCase(),
        );
        return match;
    }
    return undefined;
};

const formatMoney = (bytes: Buffer) => bytes.readUInt32LE(0);

const getGameFromOrigin = (value: number) =>
    ORIGIN_GAME_MAP[value] || undefined;

const getBoxStatus = (boxIndex: number, options: ParserOptions) => {
    const mapping = options.boxMappings?.find(
        (entry) => entry.key === boxIndex + 1,
    );
    return mapping?.status || "Boxed";
};

const xorBufferWithKey = (buffer: Buffer, key: number) => {
    const decrypted = Buffer.from(buffer);
    for (let i = 0; i < decrypted.length; i += 4) {
        const value = decrypted.readUInt32LE(i) ^ key;
        decrypted.writeUInt32LE(value >>> 0, i);
    }
    return decrypted;
};
const splitSubstructures = (orderKey: string, buffer: Buffer) => {
    const chunks: Record<"G" | "A" | "E" | "M", Buffer> = {
        G: Buffer.alloc(12),
        A: Buffer.alloc(12),
        E: Buffer.alloc(12),
        M: Buffer.alloc(12),
    };

    for (let i = 0; i < 4; i++) {
        const label = orderKey[i] as "G" | "A" | "E" | "M";
        const slice = buffer.slice(i * 12, (i + 1) * 12);
        chunks[label] = Buffer.from(slice);
    }

    return chunks;
};

const shinyCheck = (personality: number, otId: number) => {
    const tid = otId & 0xffff;
    const sid = (otId >> 16) & 0xffff;
    const value =
        (tid ^ sid ^ (personality & 0xffff) ^ ((personality >> 16) & 0xffff)) &
        0xffff;
    return value < 8;
};

const getNationalDexNumber = (species: Species): number | undefined => {
    return DEX_NUMBER_BY_SPECIES.get(species);
};

const parseIvs = (value: number) => ({
    hp: value & 0x1f,
    attack: (value >> 5) & 0x1f,
    defense: (value >> 10) & 0x1f,
    speed: (value >> 15) & 0x1f,
    specialAttack: (value >> 20) & 0x1f,
    specialDefense: (value >> 25) & 0x1f,
    isEgg: Boolean((value >> 30) & 0x1),
    abilitySlot: (value >> 31) & 0x1,
});

const determineUnownForme = (personality: number): Forme => {
    const value =
        ((personality & 0x3000000) >> 18) |
        ((personality & 0x30000) >> 12) |
        ((personality & 0x300) >> 6) |
        (personality & 0x3);
    return UNOWN_FORMES[value % UNOWN_FORMES.length];
};

const decodePokemon = (
    buffer: Buffer,
    context: PokemonContext,
): Pokemon | null => {
    const personality = buffer.readUInt32LE(0);
    if (personality === 0) return null;

    const otId = buffer.readUInt32LE(4);
    const language = buffer.readUInt8(0x12);
    const nickname = decodeGameText(buffer.slice(0x08, 0x08 + 10), language);
    const markings = buffer.readUInt8(0x1b);
    const checksum = buffer.readUInt16LE(0x1c);
    const encryptedData = buffer.slice(0x20, 0x20 + 48);
    const key = (personality ^ otId) >>> 0;
    const decrypted = xorBufferWithKey(encryptedData, key);
    const checksumComputed = sumPokemonSubstructsChecksum(decrypted);
    const isChecksumValid = checksumComputed === checksum;
    const orderKey =
        SUBSTRUCTURE_ORDERS[personality % SUBSTRUCTURE_ORDERS.length];
    const sub = splitSubstructures(orderKey, decrypted);

    if (DEBUG) {
        log(
            "decodePokemon",
            `Decoding Pokemon at ${context.status} position ${context.position}`,
            {
                personality: `0x${personality.toString(16)}`,
                otId: `0x${otId.toString(16)}`,
                encryptionKey: `0x${key.toString(16)}`,
                substructureOrder: orderKey,
                nickname,
                checksumStored: `0x${checksum.toString(16)}`,
                checksumComputed: `0x${checksumComputed.toString(16)}`,
                isChecksumValid,
            },
        );
    }

    // If the decrypted data checksum doesn't match, this record is effectively invalid ("Bad Egg" guard).
    if (!isChecksumValid) return null;

    const speciesId = sub.G.readUInt16LE(0);
    // Validate species ID - filter out corrupted data from empty slots
    if (!speciesId || speciesId > MAX_SUPPORTED_SPECIES) return null;

    const itemId = sub.G.readUInt16LE(2);
    const exp = sub.G.readUInt32LE(4);
    const ppBonuses = sub.G.readUInt8(8);
    const friendship = sub.G.readUInt8(9);

    const moveIds = [
        sub.A.readUInt16LE(0),
        sub.A.readUInt16LE(2),
        sub.A.readUInt16LE(4),
        sub.A.readUInt16LE(6),
    ];
    const movePP = [
        sub.A.readUInt8(8),
        sub.A.readUInt8(9),
        sub.A.readUInt8(10),
        sub.A.readUInt8(11),
    ];

    if (DEBUG) {
        log("decodePokemon", `Species data extracted`, {
            internalSpeciesId: speciesId,
            speciesFromMap: GEN3_SPECIES_MAP[speciesId],
            itemId,
            exp,
            friendship,
            moveIds,
        });
    }

    const evs = {
        hp: sub.E.readUInt8(0),
        attack: sub.E.readUInt8(1),
        defense: sub.E.readUInt8(2),
        speed: sub.E.readUInt8(3),
        specialAttack: sub.E.readUInt8(4),
        specialDefense: sub.E.readUInt8(5),
    };

    const contest = {
        cool: sub.E.readUInt8(6),
        beauty: sub.E.readUInt8(7),
        cute: sub.E.readUInt8(8),
        smart: sub.E.readUInt8(9),
        tough: sub.E.readUInt8(10),
        sheen: sub.E.readUInt8(11),
    };

    const pokerus = sub.M.readUInt8(0);
    const metLocation = sub.M.readUInt8(1);
    const originInfo = sub.M.readUInt16LE(2);
    const ivData = sub.M.readUInt32LE(4);
    const ribbons = sub.M.readUInt32LE(8);

    const ivs = parseIvs(ivData);
    const metLevelRaw = originInfo & 0x7f;
    const originGame = (originInfo >> 7) & 0xf;
    const ballId = (originInfo >> 11) & 0xf;
    const otGender = (originInfo >> 15) & 0x1 ? "F" : "M";

    // Gen 3 stores "met level" in the origin-info bitfield.
    // For hatched Pokémon, many saves store metLevel as 0; the game treats hatched Pokémon as met at level 5.
    // We normalize this for boxed Pokémon so level/metLevel are usable (see gen3 tests).
    const metLevel =
        !context.isParty && !ivs.isEgg && metLevelRaw === 0 ? 5 : metLevelRaw;

    // For party Pokémon, use the stored level. For boxed Pokémon, use metLevel as a fallback.
    const level = context.isParty ? context.level : metLevel || undefined;
    const speciesName = getSpeciesName(speciesId, nickname);
    const moves = moveIds.map((id) => MOVES_ARRAY?.[id]).filter(Boolean);
    const pokeball = BALL_MAP[ballId] || `Ball #${ballId}`;

    // Get ability from ABILITY_MAP (keyed by National Dex number).
    const dexNo = speciesName ? getNationalDexNumber(speciesName) : undefined;
    const abilities = dexNo ? ABILITY_MAP[dexNo] ?? [] : [];
    const abilityIndex = ivs.abilitySlot === 1 ? 1 : 0;
    const ability = abilities[abilityIndex] || abilities[0] || undefined;

    const shiny = shinyCheck(personality, otId);
    const forme =
        speciesName === "Unown" ? determineUnownForme(personality) : undefined;

    if (DEBUG) {
        log(
            "decodePokemon",
            `Decoded: ${speciesName || `Species #${speciesId}`} Lv.${level || "?"}`,
            {
                species: speciesName,
                level,
                moves,
                shiny,
                forme,
                ability,
                ivs,
                evs,
            },
        );
    }

    const stats = context.isParty
        ? {
              currentHp: buffer.readUInt16LE(0x56),
              maxHp: buffer.readUInt16LE(0x58),
              attack: buffer.readUInt16LE(0x5a),
              defense: buffer.readUInt16LE(0x5c),
              speed: buffer.readUInt16LE(0x5e),
              specialAttack: buffer.readUInt16LE(0x60),
              specialDefense: buffer.readUInt16LE(0x62),
          }
        : undefined;

    const types = speciesName
        ? (getTypesForSpecies(speciesName) as [Types, Types])
        : undefined;

    // Look up location name from GEN_3_LOCATIONS map
    const met =
        metLocation && metLocation !== 0xff
            ? GEN_3_LOCATIONS[metLocation]
            : undefined;

    // Generate unique ID based on PID, with deduplication if needed
    const basePid = personality.toString(16);
    const currentCount = context.pidTracker.get(basePid) || 0;
    context.pidTracker.set(basePid, currentCount + 1);
    const id = currentCount > 0 ? `${basePid}-${currentCount}` : basePid;

    const pokemon: Pokemon = {
        species: speciesName || `Species ${speciesId}`,
        nickname: nickname || undefined,
        status: context.status,
        id,
        level,
        moves,
        shiny,
        forme,
        item: itemId
            ? (GEN_3_HELD_ITEM_MAP[itemId] ?? `Item #${itemId}`)
            : undefined,
        met,
        metLevel: metLevel || undefined,
        position: context.position,
        egg: ivs.isEgg,
        pokeball,
        ability,
        types,
        extraData: {
            language,
            markings,
            checksum,
            checksumComputed,
            movePP,
            ppBonuses,
            friendship,
            exp,
            evs,
            contest,
            pokerus,
            ivs,
            ribbons,
            otGender,
            originGame: getGameFromOrigin(originGame),
            box:
                context.boxIndex !== undefined
                    ? context.boxIndex + 1
                    : undefined,
            slot: context.slotIndex,
            stats,
        },
    };

    return pokemon;
};

const parseParty = (
    section: Buffer,
    offsets: ReturnType<typeof getOffsets>,
    pidTracker: Map<string, number>,
): Pokemon[] => {
    // RSE stores party size in a u32 where the low byte is the count; FRLG stores a u8.
    // Reading a u8 works for both, but keep the doc rule explicit for clarity.
    const size = section.readUInt8(offsets.TEAM_SIZE) || 0;
    const count = Math.min(size, TEAM_CAPACITY);
    const start = offsets.TEAM_POKEMON_LIST;
    const party: Pokemon[] = [];

    if (DEBUG) {
        log(
            "parseParty",
            `Parsing party: team size=${size}, capped at ${count}`,
            {
                teamSizeOffset: `0x${offsets.TEAM_SIZE.toString(16)}`,
                pokemonListOffset: `0x${start.toString(16)}`,
            },
        );
    }

    for (let i = 0; i < count; i++) {
        const slice = section.slice(
            start + i * PARTY_POKEMON_SIZE,
            start + (i + 1) * PARTY_POKEMON_SIZE,
        );
        const context: PokemonContext = {
            status: "Team",
            position: i + 1,
            isParty: true,
            level: slice.readUInt8(0x54),
            slotIndex: i,
            pidTracker,
        };
        const pokemon = decodePokemon(slice, context);
        if (pokemon) {
            party.push(pokemon);
        }
    }

    if (DEBUG) {
        log("parseParty", `Found ${party.length} Pokemon in party`);
    }

    return party;
};

const parseBoxes = (
    sectionMap: Map<number, SaveSection>,
    options: ParserOptions,
    pidTracker: Map<string, number>,
): Pokemon[] => {
    const buffers: Buffer[] = [];
    PC_SECTION_IDS.forEach((id) => {
        const section = sectionMap.get(id);
        if (section) {
            // Only use valid save data, not the full section buffer (which includes padding)
            const validSize = SECTION_SAVE_SIZES[id] || section.data.length;
            buffers.push(section.data.slice(0, validSize));
        }
    });

    if (DEBUG) {
        log("parseBoxes", `Found ${buffers.length} PC storage sections`, {
            expectedSections: PC_SECTION_IDS.length,
            sectionIds: PC_SECTION_IDS,
        });
    }

    if (!buffers.length) {
        if (DEBUG) {
            log(
                "parseBoxes",
                "No PC storage sections found, returning empty array",
            );
        }
        return [];
    }

    const storage = Buffer.concat(buffers).slice(STORAGE_HEADER_SIZE);
    const pokemonBytes = BOX_COUNT * BOX_CAPACITY * BOX_POKEMON_SIZE;
    const pokemonArea = storage.slice(0, pokemonBytes);
    const boxed: Pokemon[] = [];

    if (DEBUG) {
        log(
            "parseBoxes",
            `Parsing ${BOX_COUNT} boxes with ${BOX_CAPACITY} slots each`,
            {
                totalSlots: BOX_COUNT * BOX_CAPACITY,
                pokemonAreaSize: pokemonBytes,
            },
        );
    }

    for (let boxIndex = 0; boxIndex < BOX_COUNT; boxIndex++) {
        let boxCount = 0;
        for (let slot = 0; slot < BOX_CAPACITY; slot++) {
            const offset =
                boxIndex * BOX_CAPACITY * BOX_POKEMON_SIZE +
                slot * BOX_POKEMON_SIZE;
            const slice = pokemonArea.slice(offset, offset + BOX_POKEMON_SIZE);
            const context: PokemonContext = {
                status: getBoxStatus(boxIndex, options),
                position: (slot + 1) * (boxIndex + 1),
                isParty: false,
                boxIndex,
                slotIndex: slot,
                pidTracker,
            };
            const pokemon = decodePokemon(slice, context);
            if (pokemon) {
                boxed.push(pokemon);
                boxCount++;
            }
        }
        if (boxCount > 0) {
            if (DEBUG) {
                log(
                    "parseBoxes",
                    `Box ${boxIndex + 1}: found ${boxCount} Pokemon`,
                );
            }
        }
    }

    if (DEBUG) {
        log("parseBoxes", `Total boxed Pokemon: ${boxed.length}`);
    }

    return boxed;
};

const parseTrainer = (
    section: Buffer,
    offsets: ReturnType<typeof getOffsets>,
    options: ParserOptions,
) => {
    const name = decodeGameText(
        section.slice(offsets.PLAYER_NAME[0], offsets.PLAYER_NAME[1]),
    );
    // Gen 3 stores Trainer ID (TID) + Secret ID (SID) together as a u32.
    // The app/test suite expects the visible in-game Trainer ID (low 16 bits).
    const trainerIdCombined = section.readUInt32LE(offsets.PLAYER_ID[0]);
    const trainerId = trainerIdCombined & 0xffff;
    const time = parseGen3Time(
        section.slice(offsets.TIME_PLAYED[0], offsets.TIME_PLAYED[1]),
    );
    const moneyBytes = section.slice(offsets.MONEY[0], offsets.MONEY[1]);
    const money = formatMoney(moneyBytes);

    if (DEBUG) {
        log("parseTrainer", `Trainer: ${name} (ID: ${trainerId})`, {
            time,
            money,
            game: options.selectedGame,
        });
    }

    return {
        name,
        id: `${trainerId}`,
        time,
        money,
        badges: [],
        game: options.selectedGame,
    };
};

export const parseGen3Save = async (file: Buffer, options: ParserOptions) => {
    const startTime = DEBUG ? performance.now() : 0;

    // Ensure file is a Buffer (might be Uint8Array in worker context)
    const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);

    if (DEBUG) {
        log("parseGen3Save", "=== Starting Gen 3 save file parsing ===", {
            fileSize: buffer.length,
            expectedSize: SAVE_SIZE,
            selectedGame: options.selectedGame,
        });
    }

    if (buffer.length !== SAVE_SIZE && buffer.length !== BLOCK_SIZE * 2) {
        throw new Error(
            `Unexpected Gen 3 save size: got 0x${buffer.length.toString(
                16,
            )} bytes, expected 0x${SAVE_SIZE.toString(
                16,
            )} (typical) or 0x${(BLOCK_SIZE * 2).toString(16)} (trimmed).`,
        );
    }

    const active = selectActiveBlock(buffer);
    if (DEBUG) {
        log("parseGen3Save", "Selected active save block", {
            activeBlock: active.label,
            saveIndex: active.saveIndex,
        });
    }
    const sectionMap = active.byId;
    const offsets = getOffsets(options.selectedGame as GameSaveFormat);

    if (DEBUG) {
        log("parseGen3Save", "Offsets determined", {
            game: options.selectedGame,
            teamSize: `0x${offsets.TEAM_SIZE.toString(16)}`,
            teamList: `0x${offsets.TEAM_POKEMON_LIST.toString(16)}`,
        });
    }

    const trainerSection = sectionMap.get(0);
    const teamSection = sectionMap.get(1);

    if (!trainerSection || !teamSection) {
        if (DEBUG) {
            log("parseGen3Save", "ERROR: Missing critical sections", {
                hasTrainerSection: !!trainerSection,
                hasTeamSection: !!teamSection,
            });
        }
        throw new Error("Unable to locate trainer or party data in save file.");
    }

    // Create a PID tracker to ensure unique IDs across all Pokemon
    const pidTracker = new Map<string, number>();

    const trainer = parseTrainer(trainerSection.data, offsets, options);
    const party = parseParty(teamSection.data, offsets, pidTracker);
    const boxed = parseBoxes(sectionMap, options, pidTracker);

    const parseTimeMs = DEBUG ? performance.now() - startTime : undefined;
    if (DEBUG) {
        log("parseGen3Save", "=== Parsing complete ===", {
            parseTimeMs: parseTimeMs!.toFixed(2),
            trainerName: trainer.name,
            partyCount: party.length,
            boxedCount: boxed.length,
            totalPokemon: party.length + boxed.length,
        });
    }

    const result = {
        trainer,
        pokemon: [...party, ...boxed],
        debug: DEBUG
            ? {
                  fileSize: buffer.length,
                  game: options.selectedGame,
                  selectedBlock: active.label,
                  saveIndex: active.saveIndex,
                  sectionCount: sectionMap.size,
                  parseTimeMs: parseTimeMs!,
                  counts: {
                      party: party.length,
                      boxed: boxed.length,
                      total: party.length + boxed.length,
                  },
              }
            : undefined,
    };

    return result;
};
