import { Buffer } from "buffer";
import { Pokemon } from "models";
import { matchSpeciesToTypes } from "utils/formatters/matchSpeciesToTypes";
import { Forme } from "utils/Forme";
import { Types } from "utils/Types";
import { Game as GameName } from "utils";
import { Species } from "utils/data/listOfPokemon";
import { MOVES_ARRAY } from "./utils";
import { ParserOptions } from "./utils/parserOptions";
import { GEN4_ITEM_MAP, GEN4_LOCATION_MAP, GEN4_SPECIES_MAP } from "./utils/gen4";

type Gen4Game = "DP" | "Platinum" | "HGSS";

type Layout = {
    name: Gen4Game;
    generalStart: number;
    generalSize: number;
    storageStart: number;
    storageSize: number;
    pairStride: number;
    storageKind: "dppt" | "hgss";
    checksumFooterSize: number;
    trainerNameOffset: number;
    trainerIdOffset: number;
    moneyOffset: number;
    timeOffset: number;
    badgesOffset: number;
    partyCountOffset: number;
    partyOffset: number;
};

type ValidatedBlock = {
    ok: boolean;
    checksumValid: boolean;
    storedSize: number;
    saveCount: number;
    linkValue: number;
    checksumStored: number;
    checksumComputed: number;
    buffer: Buffer;
};

type ActiveBlocks = {
    layout: Layout;
    general: ValidatedBlock;
    storage: ValidatedBlock;
};

type PokemonContext = {
    game: Gen4Game;
    status: string;
    position: number;
    isParty: boolean;
    boxIndex?: number;
    slotIndex?: number;
    pidTracker: Map<string, number>;
};

const FOOTER_SIZE = 0x14;
const FOOTER_CHECKSUM_SIZE_SINNOH = 0x14;
const FOOTER_CHECKSUM_SIZE_HGSS = 0x10;
const PARTY_POKEMON_SIZE = 236;
const PC_POKEMON_SIZE = 136;
const BOX_COUNT = 18;
const BOX_CAPACITY = 30;
const STORAGE_HEADER_DPPT = 0x04;
const BOX_STRIDE_HGSS = 0x1000;

const DP_HGSS_GENERAL_OFFSETS = {
    trainerNameOffset: 0x64,
    trainerIdOffset: 0x74,
    moneyOffset: 0x78,
    timeOffset: 0x86,
    badgesOffset: 0x7e,
    partyCountOffset: 0x94,
    partyOffset: 0x98,
};

const PLATINUM_GENERAL_OFFSETS = {
    trainerNameOffset: 0x68,
    trainerIdOffset: 0x78,
    moneyOffset: 0x7c,
    timeOffset: 0x8a,
    badgesOffset: 0x82,
    partyCountOffset: 0x9c,
    partyOffset: 0xa0,
};

const GEN4_LAYOUTS: Layout[] = [
    {
        name: "DP",
        generalStart: 0x00000,
        generalSize: 0x0c100,
        storageStart: 0x0c100,
        storageSize: 0x121e0,
        pairStride: 0x40000,
        storageKind: "dppt",
        checksumFooterSize: FOOTER_CHECKSUM_SIZE_SINNOH,
        ...DP_HGSS_GENERAL_OFFSETS,
    },
    {
        name: "Platinum",
        generalStart: 0x00000,
        generalSize: 0x0cf2c,
        storageStart: 0x0cf2c,
        storageSize: 0x121e4,
        pairStride: 0x40000,
        storageKind: "dppt",
        checksumFooterSize: FOOTER_CHECKSUM_SIZE_SINNOH,
        ...PLATINUM_GENERAL_OFFSETS,
    },
    {
        name: "HGSS",
        generalStart: 0x00000,
        generalSize: 0x0f628,
        storageStart: 0x0f700,
        storageSize: 0x12310,
        pairStride: 0x40000,
        storageKind: "hgss",
        checksumFooterSize: FOOTER_CHECKSUM_SIZE_HGSS,
        ...DP_HGSS_GENERAL_OFFSETS,
    },
];

const compareFooterCounters = (a: number, b: number) => {
    if (a === 0xffffffff && b !== 0xfffffffe) return -1;
    if (b === 0xffffffff && a !== 0xfffffffe) return 1;
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
};

const compareBlocks = (a: ValidatedBlock, b: ValidatedBlock) => {
    const major = compareFooterCounters(a.linkValue, b.linkValue);
    if (major !== 0) return major;

    const minor = compareFooterCounters(a.saveCount, b.saveCount);
    return minor;
};

// 24-entry shuffle table (Bulbapedia) for Gen 4 PKM block order.
const BLOCK_PERMUTATIONS = [
    "ABCD",
    "ABDC",
    "ACBD",
    "ACDB",
    "ADBC",
    "ADCB",
    "BACD",
    "BADC",
    "BCAD",
    "BCDA",
    "BDAC",
    "BDCA",
    "CABD",
    "CADB",
    "CBAD",
    "CBDA",
    "CDAB",
    "CDBA",
    "DABC",
    "DACB",
    "DBAC",
    "DBCA",
    "DCAB",
    "DCBA",
];

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
    13: "Dusk Ball",
    14: "Heal Ball",
    15: "Quick Ball",
    16: "Cherish Ball",
};

const GEN4_NATURES = [
    "Hardy",
    "Lonely",
    "Brave",
    "Adamant",
    "Naughty",
    "Bold",
    "Docile",
    "Relaxed",
    "Impish",
    "Lax",
    "Timid",
    "Hasty",
    "Serious",
    "Jolly",
    "Naive",
    "Modest",
    "Mild",
    "Quiet",
    "Bashful",
    "Rash",
    "Calm",
    "Gentle",
    "Sassy",
    "Careful",
    "Quirky",
] as const;

const GEN4_ABILITY_MAP = [
    undefined,
    "Stench",
    "Drizzle",
    "Speed Boost",
    "Battle Armor",
    "Sturdy",
    "Damp",
    "Limber",
    "Sand Veil",
    "Static",
    "Volt Absorb",
    "Water Absorb",
    "Oblivious",
    "Cloud Nine",
    "Compound Eyes",
    "Insomnia",
    "Color Change",
    "Immunity",
    "Flash Fire",
    "Shield Dust",
    "Own Tempo",
    "Suction Cups",
    "Intimidate",
    "Shadow Tag",
    "Rough Skin",
    "Wonder Guard",
    "Levitate",
    "Effect Spore",
    "Synchronize",
    "Clear Body",
    "Natural Cure",
    "Lightning Rod",
    "Serene Grace",
    "Swift Swim",
    "Chlorophyll",
    "Illuminate",
    "Trace",
    "Huge Power",
    "Poison Point",
    "Inner Focus",
    "Magma Armor",
    "Water Veil",
    "Magnet Pull",
    "Soundproof",
    "Rain Dish",
    "Sand Stream",
    "Pressure",
    "Thick Fat",
    "Early Bird",
    "Flame Body",
    "Run Away",
    "Keen Eye",
    "Hyper Cutter",
    "Pickup",
    "Truant",
    "Hustle",
    "Cute Charm",
    "Plus",
    "Minus",
    "Forecast",
    "Sticky Hold",
    "Shed Skin",
    "Guts",
    "Marvel Scale",
    "Liquid Ooze",
    "Overgrow",
    "Blaze",
    "Torrent",
    "Swarm",
    "Rock Head",
    "Drought",
    "Arena Trap",
    "Vital Spirit",
    "White Smoke",
    "Pure Power",
    "Shell Armor",
    "Air Lock",
    "Tangled Feet",
    "Motor Drive",
    "Rivalry",
    "Steadfast",
    "Snow Cloak",
    "Gluttony",
    "Anger Point",
    "Unburden",
    "Heatproof",
    "Simple",
    "Dry Skin",
    "Download",
    "Iron Fist",
    "Poison Heal",
    "Adaptability",
    "Skill Link",
    "Hydration",
    "Solar Power",
    "Quick Feet",
    "Normalize",
    "Sniper",
    "Magic Guard",
    "No Guard",
    "Stall",
    "Technician",
    "Leaf Guard",
    "Klutz",
    "Mold Breaker",
    "Super Luck",
    "Aftermath",
    "Anticipation",
    "Forewarn",
    "Unaware",
    "Tinted Lens",
    "Filter",
    "Slow Start",
    "Scrappy",
    "Storm Drain",
    "Ice Body",
    "Solid Rock",
    "Snow Warning",
    "Honey Gather",
    "Frisk",
    "Reckless",
    "Multitype",
    "Flower Gift",
    "Bad Dreams",
] as const;

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

const getSpeciesName = (id: number): Species | undefined => {
    const hexKey = `0x${id.toString(16).toUpperCase().padStart(3, "0")}`;
    const species = GEN4_SPECIES_MAP[hexKey];
    if (species === "Pokémon Egg" || species === "Manaphy Egg") {
        return undefined; // Eggs handled separately
    }
    return species as Species | undefined;
};

const getGen4AbilityName = (abilityId: number) => {
    if (!abilityId) return undefined;
    return GEN4_ABILITY_MAP[abilityId] ?? `Ability #${abilityId}`;
};

const getGen4Nature = (pid: number) => GEN4_NATURES[pid % GEN4_NATURES.length];

const getGen4Gender = (genderValue: number) => {
    if (genderValue === 0) return "m";
    if (genderValue === 1) return "f";
    if (genderValue === 2) return "genderless";
    return undefined;
};

const getGen4LocationName = (locationId: number) => {
    if (locationId === 0xffff) return undefined;
    return GEN4_LOCATION_MAP[locationId] ?? `Location #${locationId}`;
};

const getOriginGameName = (gameId: number): GameName | undefined => {
    if (gameId === 1) return "Sapphire";
    if (gameId === 2) return "Ruby";
    if (gameId === 3) return "Emerald";
    if (gameId === 4) return "FireRed";
    if (gameId === 5) return "LeafGreen";
    if (gameId === 7) return "HeartGold";
    if (gameId === 8) return "SoulSilver";
    if (gameId === 10) return "Diamond";
    if (gameId === 11) return "Pearl";
    if (gameId === 12) return "Platinum";
    return undefined;
};

const getGen4Forme = (species: Species | undefined, formId: number): Forme | undefined => {
    if (!species) return undefined;
    if (species === "Unown") return UNOWN_FORMES[formId] ?? undefined;
    if (species === "Deoxys") {
        return [undefined, Forme.Attack, Forme.Defense, Forme.Speed][formId];
    }
    if (species === "Burmy" || species === "Wormadam") {
        return [Forme.Plant, Forme.Sandy, Forme.Trash][formId];
    }
    if (species === "Shellos" || species === "Gastrodon") {
        return [Forme["West Sea"], Forme["East Sea"]][formId];
    }
    if (species === "Rotom") {
        return [undefined, Forme.Heat, Forme.Wash, Forme.Frost, Forme.Fan, Forme.Mow][formId];
    }
    if (species === "Giratina") {
        return [undefined, Forme.Origin][formId];
    }
    if (species === "Shaymin") {
        return [undefined, Forme.Sky][formId];
    }
    return undefined;
};

const crc16Ccitt = (buffer: Buffer) => {
    let crc = 0xffff;
    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer[i] << 8;
        for (let b = 0; b < 8; b++) {
            const carry = crc & 0x8000;
            crc = (crc << 1) & 0xffff;
            if (carry) crc ^= 0x1021;
        }
    }
    return crc & 0xffff;
};

const sumPk4Checksum = (buffer: Buffer) => {
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 2) {
        sum = (sum + buffer.readUInt16LE(i)) & 0xffff;
    }
    return sum & 0xffff;
};

const decryptPk4Payload = (encrypted: Buffer, checksum: number) => {
    const out = Buffer.alloc(encrypted.length);
    let seed = checksum >>> 0;
    for (let i = 0; i < encrypted.length; i += 2) {
        seed = (Math.imul(seed, 0x41c64e6d) + 0x6073) >>> 0;
        const key = (seed >>> 16) & 0xffff;
        const value = encrypted.readUInt16LE(i) ^ key;
        out.writeUInt16LE(value & 0xffff, i);
    }
    return out;
};

const unshufflePk4Blocks = (decrypted: Buffer, personality: number) => {
    const order = BLOCK_PERMUTATIONS[((personality & 0x3e000) >> 0xd) % 24];
    const blocks = [0, 1, 2, 3].map((i) =>
        decrypted.slice(i * 32, (i + 1) * 32),
    );
    const byLetter: Record<"A" | "B" | "C" | "D", Buffer> = {
        A: Buffer.alloc(32),
        B: Buffer.alloc(32),
        C: Buffer.alloc(32),
        D: Buffer.alloc(32),
    };
    for (let i = 0; i < 4; i++) {
        const letter = order[i] as "A" | "B" | "C" | "D";
        byLetter[letter] = blocks[i];
    }
    return byLetter;
};

const parseIvs = (value: number) => ({
    hp: value & 0x1f,
    attack: (value >>> 5) & 0x1f,
    defense: (value >>> 10) & 0x1f,
    speed: (value >>> 15) & 0x1f,
    specialAttack: (value >>> 20) & 0x1f,
    specialDefense: (value >>> 25) & 0x1f,
    isEgg: Boolean((value >>> 30) & 0x1),
    isNicknamed: Boolean((value >>> 31) & 0x1),
});

const shinyCheck = (pid: number, otId: number) => {
    const tid = otId & 0xffff;
    const sid = (otId >> 16) & 0xffff;
    const value =
        (tid ^ sid ^ (pid & 0xffff) ^ ((pid >> 16) & 0xffff)) & 0xffff;
    return value < 8;
};

const GEN4_INT_CHAR_TABLE = [
    "", "　", "ぁ", "あ", "ぃ", "い", "ぅ", "う", "ぇ", "え", "ぉ", "お", "か", "が", "き", "ぎ",
    "く", "ぐ", "け", "げ", "こ", "ご", "さ", "ざ", "し", "じ", "す", "ず", "せ", "ぜ", "そ", "ぞ",
    "た", "だ", "ち", "ぢ", "っ", "つ", "づ", "て", "で", "と", "ど", "な", "に", "ぬ", "ね", "の",
    "は", "ば", "ぱ", "ひ", "び", "ぴ", "ふ", "ぶ", "ぷ", "へ", "べ", "ぺ", "ほ", "ぼ", "ぽ", "ま",
    "み", "む", "め", "も", "ゃ", "や", "ゅ", "ゆ", "ょ", "よ", "ら", "り", "る", "れ", "ろ", "わ",
    "を", "ん", "ァ", "ア", "ィ", "イ", "ゥ", "ウ", "ェ", "エ", "ォ", "オ", "カ", "ガ", "キ", "ギ",
    "ク", "グ", "ケ", "ゲ", "コ", "ゴ", "サ", "ザ", "シ", "ジ", "ス", "ズ", "セ", "ゼ", "ソ", "ゾ",
    "タ", "ダ", "チ", "ヂ", "ッ", "ツ", "ヅ", "テ", "デ", "ト", "ド", "ナ", "ニ", "ヌ", "ネ", "ノ",
    "ハ", "バ", "パ", "ヒ", "ビ", "ピ", "フ", "ブ", "プ", "ヘ", "ベ", "ペ", "ホ", "ボ", "ポ", "マ",
    "ミ", "ム", "メ", "モ", "ャ", "ヤ", "ュ", "ユ", "ョ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ",
    "ヲ", "ン", "０", "１", "２", "３", "４", "５", "６", "７", "８", "９", "Ａ", "Ｂ", "Ｃ", "Ｄ",
    "Ｅ", "Ｆ", "Ｇ", "Ｈ", "Ｉ", "Ｊ", "Ｋ", "Ｌ", "Ｍ", "Ｎ", "Ｏ", "Ｐ", "Ｑ", "Ｒ", "Ｓ", "Ｔ",
    "Ｕ", "Ｖ", "Ｗ", "Ｘ", "Ｙ", "Ｚ", "ａ", "ｂ", "ｃ", "ｄ", "ｅ", "ｆ", "ｇ", "ｈ", "ｉ", "ｊ",
    "ｋ", "ｌ", "ｍ", "ｎ", "ｏ", "ｐ", "ｑ", "ｒ", "ｓ", "ｔ", "ｕ", "ｖ", "ｗ", "ｘ", "ｙ", "ｚ",
    "", "！", "？", "、", "。", "…", "・", "／", "「", "」", "『", "』", "（", "）", "♂", "♀",
    "＋", "ー", "×", "÷", "＝", "～", "：", "；", "．", "，", "♠", "♣", "♥", "♦", "★", "◎",
    "○", "□", "△", "◇", "＠", "♪", "％", "☀", "☁", "☂", "☃", "①", "②", "③", "④", "⑤",
    "⑥", "⑦", "円", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "←", "↑", "↓", "→", "►",
    "＆", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E",
    "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U",
    "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
    "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "À",
    "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï", "Ð",
    "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "⑧", "Ø", "Ù", "Ú", "Û", "Ü", "Ý", "Þ", "ß", "à",
    "á", "â", "ã", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ð",
    "ñ", "ò", "ó", "ô", "õ", "ö", "⑨", "ø", "ù", "ú", "û", "ü", "ý", "þ", "ÿ", "Œ",
    "œ", "Ş", "ş", "ª", "º", "⑩", "⑪", "⑫", "$", "¡", "¿", "!", "?", ",", ".", "⑬",
    "･", "/", "‘", "'", "“", "”", "„", "«", "»", "(", ")", "♂", "♀", "+", "-", "*",
    "#", "=", "&", "~", ":", ";", "⑯", "⑰", "⑱", "⑲", "⑳", "⑴", "⑵", "⑶", "⑷", "⑸",
    "@", "⑹", "%", "⑺", "⑻", "⑼", "⑽", "⑾", "⑿", "⒀", "⒁", "⒂", "⒃", "⒄", " ", "⒅",
    "⒆", "⒇", "⒈", "⒉", "⒊", "⒋", "⒌", "⒍", "°", "_", "＿", "⒎", "⒏",
] as const;

const GEN4_KOREAN_START = 0x0400;
const GEN4_KOREAN_HANGUL_COUNT = 2350;
const GEN4_KOREAN_JAMO_START = 0x0d30;
const GEN4_KOREAN_JAMO_TABLE = [
    "", "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ",
    "ㅋ", "ㅌ", "ㅍ", "ㅎ", "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅛ", "ㅜ", "ㅠ",
    "ㅡ", "ㅣ",
] as const;
const GEN4_KOREAN_EXTRA: Record<number, string> = {
    0x0d61: "뢔",
    0x0d62: "쌰",
    0x0d63: "쎼",
    0x0d64: "쓔",
    0x0d65: "쬬",
};
const eucKrDecoder =
    typeof TextDecoder !== "undefined" ? new TextDecoder("euc-kr") : undefined;

const decodeGen4KoreanChar = (code: number) => {
    const koreanOffset = code - GEN4_KOREAN_START;
    if (
        eucKrDecoder &&
        koreanOffset >= 1 &&
        koreanOffset <= GEN4_KOREAN_HANGUL_COUNT
    ) {
        const tableOffset = koreanOffset - 1;
        const lead = 0xb0 + Math.floor(tableOffset / 94);
        const trail = 0xa1 + (tableOffset % 94);
        return eucKrDecoder.decode(Uint8Array.from([lead, trail]));
    }

    if (
        code >= GEN4_KOREAN_JAMO_START &&
        code < GEN4_KOREAN_JAMO_START + GEN4_KOREAN_JAMO_TABLE.length
    ) {
        return GEN4_KOREAN_JAMO_TABLE[code - GEN4_KOREAN_JAMO_START] || null;
    }

    return GEN4_KOREAN_EXTRA[code] || null;
};

const decodeGen4Char = (code: number): string | null => {
    if (code === 0xffff) return null;
    if (code < GEN4_INT_CHAR_TABLE.length) {
        return GEN4_INT_CHAR_TABLE[code] || null;
    }
    if (code >= GEN4_KOREAN_START && code <= 0x0d65) {
        return decodeGen4KoreanChar(code);
    }
    return null;
};

const decodeGen4String = (buffer: Buffer, maxChars: number) => {
    const chars: string[] = [];
    for (let i = 0; i < maxChars && i * 2 < buffer.length; i++) {
        const code = buffer.readUInt16LE(i * 2);
        const ch = decodeGen4Char(code);
        if (ch === null) break;
        chars.push(ch);
    }
    return chars.join("").trim();
};

const parsePartyStats = (buffer: Buffer) => {
    if (buffer.length < 0x14) return undefined;
    const level = buffer.readUInt8(0x04);
    const currentHp = buffer.readUInt16LE(0x06);
    const maxHp = buffer.readUInt16LE(0x08);
    const attack = buffer.readUInt16LE(0x0a);
    const defense = buffer.readUInt16LE(0x0c);
    const speed = buffer.readUInt16LE(0x0e);
    const specialAttack = buffer.readUInt16LE(0x10);
    const specialDefense = buffer.readUInt16LE(0x12);
    return {
        level,
        stats: {
            currentHp,
            maxHp,
            attack,
            defense,
            speed,
            specialAttack,
            specialDefense,
        },
    };
};

const decodePokemon = (buffer: Buffer, context: PokemonContext): Pokemon | null => {
    if (buffer.length < PC_POKEMON_SIZE) return null;
    const pid = buffer.readUInt32LE(0x00);
    if (pid === 0) return null;

    // Checksum is at offset 0x06, used as decryption seed
    const checksumStored = buffer.readUInt16LE(0x06);
    const encrypted = buffer.slice(0x08, 0x08 + 0x80);

    // Decrypt using stored checksum
    const decrypted = decryptPk4Payload(encrypted, checksumStored);
    if (sumPk4Checksum(decrypted) !== checksumStored) return null;

    const blocks = unshufflePk4Blocks(decrypted, pid);
    const speciesId = blocks.A.readUInt16LE(0x00);

    // Skip Pokemon with invalid species (corrupted data)
    if (speciesId === 0 || speciesId > 493) {
        return null;
    }

    const growth = blocks.A;
    const attacks = blocks.B;
    const evsBlock = blocks.C;
    const misc = blocks.D;

    if (!speciesId) return null;
    const speciesName = getSpeciesName(speciesId);
    const itemId = growth.readUInt16LE(0x02);
    const otId = growth.readUInt32LE(0x04); // TID/SID combined
    const exp = growth.readUInt32LE(0x08);
    const friendship = growth.readUInt8(0x0c);
    const abilityId = growth.readUInt8(0x0d);
    const markings = growth.readUInt8(0x0e);
    const language = growth.readUInt8(0x0f);

    const moveIds = [
        attacks.readUInt16LE(0x00),
        attacks.readUInt16LE(0x02),
        attacks.readUInt16LE(0x04),
        attacks.readUInt16LE(0x06),
    ];
    const movePP = [
        attacks.readUInt8(0x08),
        attacks.readUInt8(0x09),
        attacks.readUInt8(0x0a),
        attacks.readUInt8(0x0b),
    ];
    const ppBonuses = [
        attacks.readUInt8(0x0c),
        attacks.readUInt8(0x0d),
        attacks.readUInt8(0x0e),
        attacks.readUInt8(0x0f),
    ];

    const evs = {
        hp: growth.readUInt8(0x10),
        attack: growth.readUInt8(0x11),
        defense: growth.readUInt8(0x12),
        speed: growth.readUInt8(0x13),
        specialAttack: growth.readUInt8(0x14),
        specialDefense: growth.readUInt8(0x15),
    };

    const contest = {
        cool: growth.readUInt8(0x16),
        beauty: growth.readUInt8(0x17),
        cute: growth.readUInt8(0x18),
        smart: growth.readUInt8(0x19),
        tough: growth.readUInt8(0x1a),
        sheen: growth.readUInt8(0x1b),
    };

    const nickname = decodeGen4String(evsBlock.slice(0x00, 0x16), 11);
    const originGame = evsBlock.readUInt8(0x17);
    const ribbons = growth.readUInt32LE(0x1c);
    const ivData = attacks.readUInt32LE(0x10);
    const formGenderData = attacks.readUInt8(0x18);
    const eggLocationExtended = attacks.readUInt16LE(0x1c);
    const platinumMetLocation = attacks.readUInt16LE(0x1e);
    const dpMetLocation = misc.readUInt16LE(0x18);
    const pokerus = misc.readUInt8(0x1a);
    const dpBallId = misc.readUInt8(0x1b);
    const metLevelGender = misc.readUInt8(0x1c);
    const hgssBallId = misc.readUInt8(0x1e);

    const ivs = parseIvs(ivData);
    const fatefulEncounter = (formGenderData & 0x01) === 1;
    const genderValue = (formGenderData >>> 1) & 0x03;
    const formId = formGenderData >>> 3;
    const metLevel = metLevelGender & 0x7f;
    const otGender = (metLevelGender >>> 7) & 0x1 ? "F" : "M";
    const metLocation =
        context.game === "DP"
            ? dpMetLocation
            : platinumMetLocation || dpMetLocation;
    const ballId = context.game === "HGSS" ? hgssBallId : dpBallId;

    const statsSection =
        context.isParty && buffer.length >= PARTY_POKEMON_SIZE
            ? parsePartyStats(
                  decryptPk4Payload(buffer.slice(PC_POKEMON_SIZE), pid),
              )
            : undefined;

    const level = statsSection?.level || undefined;

    const moves = moveIds.map((id) => MOVES_ARRAY?.[id]).filter(Boolean);
    const pokeball = BALL_MAP[ballId] || `Ball #${ballId}`;
    const ability = getGen4AbilityName(abilityId);
    const types = speciesName
        ? (Array.from(new Set(matchSpeciesToTypes(speciesName))) as [Types, Types])
        : undefined;
    const shiny = shinyCheck(pid, otId);
    const gender = getGen4Gender(genderValue);
    const nature = getGen4Nature(pid);
    const forme = getGen4Forme(speciesName, formId);
    const gameOfOrigin = getOriginGameName(originGame);

    const basePid = pid.toString(16);
    const currentCount = context.pidTracker.get(basePid) || 0;
    context.pidTracker.set(basePid, currentCount + 1);
    const id = currentCount > 0 ? `${basePid}-${currentCount}` : basePid;
    const species = speciesName || `Species ${speciesId}`;
    const displayNickname = ivs.isNicknamed && nickname ? nickname : species;

    const pokemon: Pokemon = {
        species,
        nickname: displayNickname,
        status: context.status,
        id,
        level,
        moves,
        shiny,
        forme,
        gender,
        nature,
        gameOfOrigin,
        item: itemId
            ? GEN4_ITEM_MAP[itemId] ?? `Item #${itemId}`
            : undefined,
        met: getGen4LocationName(metLocation),
        metLevel: metLevel || undefined,
        position: context.position,
        egg: ivs.isEgg,
        pokeball,
        ability,
        types,
        extraData: {
            language,
            friendship,
            abilityId,
            markings,
            fatefulEncounter,
            ppBonuses,
            movePP,
            evs,
            contest,
            genderValue,
            formId,
            pokerus,
            originGame,
            originGameName: gameOfOrigin,
            eggLocationExtended,
            metLocation,
            otGender,
            ribbons,
            ivs,
            exp,
            checksumStored,
            box: context.boxIndex !== undefined ? context.boxIndex + 1 : undefined,
            slot: context.slotIndex,
            stats: statsSection?.stats,
        },
    };

    return pokemon;
};

const validateBlock = (
    buffer: Buffer,
    expectedSize: number,
    checksumFooterSize: number,
): ValidatedBlock => {
    if (buffer.length < FOOTER_SIZE)
        return {
            ok: false,
            checksumValid: false,
            storedSize: 0,
            buffer,
            saveCount: 0,
            linkValue: 0,
            checksumStored: 0,
            checksumComputed: 0,
        };
    const footerStart = buffer.length - FOOTER_SIZE;
    const linkValue = buffer.readUInt32LE(footerStart + 0x00);
    const saveCount = buffer.readUInt32LE(footerStart + 0x04);
    const storedSize = buffer.readUInt32LE(footerStart + 0x08);
    const checksumStored = buffer.readUInt16LE(footerStart + 0x12);
    const checksumComputed = crc16Ccitt(
        buffer.slice(0, buffer.length - checksumFooterSize),
    );
    const checksumValid = checksumStored === checksumComputed;
    const structuralValid =
        storedSize === expectedSize &&
        saveCount !== 0xffffffff &&
        linkValue !== 0xffffffff;
    return {
        ok: structuralValid,
        checksumValid,
        storedSize,
        buffer,
        saveCount,
        linkValue,
        checksumStored,
        checksumComputed,
    };
};

const selectLayoutAndBlocks = (file: Buffer, preferred?: Gen4Game): ActiveBlocks => {
    const preferredLayouts = preferred
        ? GEN4_LAYOUTS.filter((l) => l.name === preferred)
        : [];
    const layouts = preferredLayouts.length ? preferredLayouts : GEN4_LAYOUTS;

    let best: ActiveBlocks | undefined;

    for (const layout of layouts) {
        const pairs = [0, layout.pairStride];
        const validated: {
            base: number;
            general: ValidatedBlock;
            storage: ValidatedBlock;
        }[] = [];

        for (const base of pairs) {
            const generalStart = base + layout.generalStart;
            const storageStart = base + layout.storageStart;
            if (
                generalStart + layout.generalSize > file.length ||
                storageStart + layout.storageSize > file.length
            ) {
                continue;
            }
            const generalBuf = file.slice(
                generalStart,
                generalStart + layout.generalSize,
            );
            const storageBuf = file.slice(
                storageStart,
                storageStart + layout.storageSize,
            );
            const general = validateBlock(
                generalBuf,
                layout.generalSize,
                layout.checksumFooterSize,
            );
            const storage = validateBlock(
                storageBuf,
                layout.storageSize,
                layout.checksumFooterSize,
            );
            validated.push({ base, general, storage });
        }

        const validGenerals = validated.filter((v) => v.general.ok);
        if (!validGenerals.length) continue;
        const selectedGeneral = validGenerals.reduce((a, b) =>
            compareBlocks(a.general, b.general) < 0 ? b : a,
        );

        const candidateStorage = validated
            .filter((v) => v.storage.ok)
            .sort((a, b) => -compareBlocks(a.storage, b.storage));

        const chosenStorage = candidateStorage[0];
        if (!chosenStorage) continue;

        best = {
            layout,
            general: selectedGeneral.general,
            storage: chosenStorage.storage,
        };
        break;
    }

    if (!best) {
        const fallbackLayout =
            layouts.find(
                (l) =>
                    file.length >= l.storageStart + l.storageSize &&
                    file.length >= l.generalStart + l.generalSize,
            ) || layouts[0];
        const general = validateBlock(
            file.slice(
                fallbackLayout.generalStart,
                fallbackLayout.generalStart + fallbackLayout.generalSize,
            ),
            fallbackLayout.generalSize,
            fallbackLayout.checksumFooterSize,
        );
        const storage = validateBlock(
            file.slice(
                fallbackLayout.storageStart,
                fallbackLayout.storageStart + fallbackLayout.storageSize,
            ),
            fallbackLayout.storageSize,
            fallbackLayout.checksumFooterSize,
        );
        best = { layout: fallbackLayout, general, storage };
    }
    return best;
};

const getBoxStatus = (boxIndex: number, options: ParserOptions) => {
    const mapping = options.boxMappings?.find(
        (entry) => entry.key === boxIndex + 1,
    );
    return mapping?.status || "Boxed";
};

const parseParty = (
    general: Buffer,
    layout: Layout,
    options: ParserOptions,
    pidTracker: Map<string, number>,
) => {
    const count = general.readUInt8(layout.partyCountOffset) || 0;
    const party: Pokemon[] = [];
    const capped = Math.min(count, 6);
    for (let i = 0; i < capped; i++) {
        const start = layout.partyOffset + i * PARTY_POKEMON_SIZE;
        const slice = general.slice(start, start + PARTY_POKEMON_SIZE);
        const context: PokemonContext = {
            game: layout.name,
            status: "Team",
            position: i + 1,
            isParty: true,
            boxIndex: undefined,
            slotIndex: i,
            pidTracker,
        };
        const pokemon = decodePokemon(slice, context);
        if (pokemon) party.push(pokemon);
    }
    return party;
};

const parseBoxes = (
    storage: Buffer,
    layout: Layout,
    options: ParserOptions,
    pidTracker: Map<string, number>,
) => {
    const boxed: Pokemon[] = [];
    if (layout.storageKind === "dppt") {
        const boxArea = storage.slice(
            STORAGE_HEADER_DPPT,
            STORAGE_HEADER_DPPT + BOX_COUNT * BOX_CAPACITY * PC_POKEMON_SIZE,
        );
        for (let boxIndex = 0; boxIndex < BOX_COUNT; boxIndex++) {
            for (let slotIndex = 0; slotIndex < BOX_CAPACITY; slotIndex++) {
                const offset =
                    boxIndex * BOX_CAPACITY * PC_POKEMON_SIZE +
                    slotIndex * PC_POKEMON_SIZE;
                const slice = boxArea.slice(offset, offset + PC_POKEMON_SIZE);
                const context: PokemonContext = {
                    game: layout.name,
                    status: getBoxStatus(boxIndex, options),
                    position: boxIndex * BOX_CAPACITY + slotIndex + 1,
                    isParty: false,
                    boxIndex,
                    slotIndex,
                    pidTracker,
                };
                const pokemon = decodePokemon(slice, context);
                if (pokemon) boxed.push(pokemon);
            }
        }
    } else {
        // HGSS: each box is padded to 0x1000 bytes with 0x10 bytes spacing.
        for (let boxIndex = 0; boxIndex < BOX_COUNT; boxIndex++) {
            const boxStart = boxIndex * BOX_STRIDE_HGSS;
            const boxArea = storage.slice(boxStart, boxStart + BOX_STRIDE_HGSS);
            for (let slotIndex = 0; slotIndex < BOX_CAPACITY; slotIndex++) {
                const offset = slotIndex * PC_POKEMON_SIZE;
                const slice = boxArea.slice(offset, offset + PC_POKEMON_SIZE);
                const context: PokemonContext = {
                    game: layout.name,
                    status: getBoxStatus(boxIndex, options),
                    position: boxIndex * BOX_CAPACITY + slotIndex + 1,
                    isParty: false,
                    boxIndex,
                    slotIndex,
                    pidTracker,
                };
                const pokemon = decodePokemon(slice, context);
                if (pokemon) boxed.push(pokemon);
            }
        }
    }
    return boxed;
};

const titleCase = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const normalizeTrainerName = (str: string): string => {
    if (/^[A-Z]+$/.test(str)) return titleCase(str);
    return str;
};

const parseTrainer = (general: Buffer, layout: Layout) => {
    const rawName = decodeGen4String(
        general.slice(layout.trainerNameOffset, layout.trainerNameOffset + 16),
        8,
    );
    const name = normalizeTrainerName(rawName);
    const tid = general.readUInt16LE(layout.trainerIdOffset);
    const money = general.readUInt32LE(layout.moneyOffset);
    const hours = general.readUInt16LE(layout.timeOffset);
    const minutes = general.readUInt8(layout.timeOffset + 2);
    const seconds = general.readUInt8(layout.timeOffset + 3);
    const time = `${hours}:${minutes}:${seconds}`;
    const badgeByte = general.readUInt8(layout.badgesOffset);
    const badgeCount = countBits(badgeByte);
    const badges = Array.from({ length: badgeCount }, (_, i) => `Badge ${i + 1}`);

    return {
        name,
        id: tid.toString().padStart(5, "0"),
        money: money.toString(),
        time,
        badges,
    };
};

const countBits = (n: number): number => {
    let count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;
    }
    return count;
};

export const parseGen4Save = async (
    file: Buffer,
    options: ParserOptions & { selectedGame?: Gen4Game },
) => {
    const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
    const preferred = options.selectedGame;

    const active = selectLayoutAndBlocks(buffer, preferred);
    const pidTracker = new Map<string, number>();

    const trainer = parseTrainer(active.general.buffer, active.layout);
    const party = parseParty(
        active.general.buffer,
        active.layout,
        options,
        pidTracker,
    );
    const boxed = parseBoxes(
        active.storage.buffer,
        active.layout,
        options,
        pidTracker,
    );

    return {
        trainer,
        pokemon: [...party, ...boxed],
        debug: options.debug
            ? {
                  layout: active.layout.name,
                  generalSave: active.general.saveCount,
                  storageSave: active.storage.saveCount,
                  generalChecksum: `0x${active.general.checksumStored.toString(16)}`,
                  storageChecksum: `0x${active.storage.checksumStored.toString(16)}`,
                  generalChecksumValid: active.general.checksumValid,
                  storageChecksumValid: active.storage.checksumValid,
              }
            : undefined,
    };
};
