import { Buffer } from "buffer";
import { Pokemon } from "models";
import { matchSpeciesToTypes } from "utils/formatters/matchSpeciesToTypes";
import { Forme } from "utils/Forme";
import { Types } from "utils/Types";
import { listOfPokemon, Species } from "utils/data/listOfPokemon";
import type { Game as GameName } from "utils/data/listOfGames";
import { getBadges } from "utils/getters/getBadges";
import { MOVES_ARRAY } from "./utils";
import { ParserOptions } from "./utils/parserOptions";
import { GEN4_ITEM_MAP } from "./utils/gen4";
import { getGen5LocationName } from "./utils/gen5";

export type Gen5Game = "BW" | "B2W2";

type BlockInfo = {
    offset: number;
    length: number;
    checksumOffset: number;
    mirrorOffset: number;
    name: string;
};

type Layout = {
    name: Gen5Game;
    mainSize: number;
    checksumInfoLength: number;
    blocks: BlockInfo[];
    trainerBlockIndex: number;
    miscBlockIndex: number;
};

type ActiveSave = {
    layout: Layout;
    baseOffset: number;
    data: Buffer;
    footerChecksumValid: boolean;
    validBlockCount: number;
};

type PokemonContext = {
    game: Gen5Game;
    status: string;
    position: number;
    isParty: boolean;
    boxIndex?: number;
    slotIndex?: number;
    pidTracker: Map<string, number>;
};

const SAVE_SIZE_GEN5_RAW = 0x80000;
const SAVE_SIZE_BW = 0x24000;
const SAVE_SIZE_B2W2 = 0x26000;
const BOX_COUNT = 24;
const BOX_CAPACITY = 30;
const PC_POKEMON_SIZE = 136;
const PARTY_POKEMON_SIZE = 220;
const BOX_BASE_OFFSET = 0x400;
const PARTY_OFFSET = 0x18e00;
const PARTY_COUNT_OFFSET = PARTY_OFFSET + 0x04;
const PARTY_DATA_OFFSET = PARTY_OFFSET + 0x08;

const makeBoxBlocks = (mirrorBase: number): BlockInfo[] => [
    { offset: 0x00000, length: 0x03e0, checksumOffset: 0x003e2, mirrorOffset: mirrorBase, name: "Box Names" },
    ...Array.from({ length: BOX_COUNT }, (_, i) => {
        const offset = 0x00400 + i * 0x1000;
        return {
            offset,
            length: 0x0ff0,
            checksumOffset: offset + 0x0ff2,
            mirrorOffset: mirrorBase + 0x02 + i * 2,
            name: `Box ${i + 1}`,
        };
    }),
];

const BW_BLOCKS: BlockInfo[] = [
    ...makeBoxBlocks(0x23f00),
    { offset: 0x18400, length: 0x09c0, checksumOffset: 0x18dc2, mirrorOffset: 0x23f32, name: "Inventory" },
    { offset: 0x18e00, length: 0x0534, checksumOffset: 0x19336, mirrorOffset: 0x23f34, name: "Party Pokemon" },
    { offset: 0x19400, length: 0x0068, checksumOffset: 0x1946a, mirrorOffset: 0x23f36, name: "Trainer Data" },
    { offset: 0x19500, length: 0x009c, checksumOffset: 0x1959e, mirrorOffset: 0x23f38, name: "Trainer Position" },
    { offset: 0x1c800, length: 0x0a94, checksumOffset: 0x1d296, mirrorOffset: 0x23f44, name: "Mystery Gift" },
    { offset: 0x1d900, length: 0x005c, checksumOffset: 0x1d95e, mirrorOffset: 0x23f4a, name: "Adventure Info" },
    { offset: 0x20a00, length: 0x035c, checksumOffset: 0x20d5e, mirrorOffset: 0x23f62, name: "Battle Box" },
    { offset: 0x20e00, length: 0x01cc, checksumOffset: 0x20fce, mirrorOffset: 0x23f64, name: "Daycare" },
    { offset: 0x21200, length: 0x00ec, checksumOffset: 0x212ee, mirrorOffset: 0x23f68, name: "Misc" },
    { offset: 0x23f00, length: 0x008c, checksumOffset: 0x23f9a, mirrorOffset: 0x23f9a, name: "Checksums" },
];

const B2W2_BLOCKS: BlockInfo[] = [
    ...makeBoxBlocks(0x25f00),
    { offset: 0x18400, length: 0x09ec, checksumOffset: 0x18dee, mirrorOffset: 0x25f32, name: "Inventory" },
    { offset: 0x18e00, length: 0x0534, checksumOffset: 0x19336, mirrorOffset: 0x25f34, name: "Party Pokemon" },
    { offset: 0x19400, length: 0x00b0, checksumOffset: 0x194b2, mirrorOffset: 0x25f36, name: "Trainer Data" },
    { offset: 0x19500, length: 0x00a8, checksumOffset: 0x195aa, mirrorOffset: 0x25f38, name: "Trainer Position" },
    { offset: 0x1c800, length: 0x0a94, checksumOffset: 0x1d296, mirrorOffset: 0x25f44, name: "Mystery Gift" },
    { offset: 0x1d900, length: 0x005c, checksumOffset: 0x1d95e, mirrorOffset: 0x25f4a, name: "Adventure Info" },
    { offset: 0x20900, length: 0x035c, checksumOffset: 0x20c5e, mirrorOffset: 0x25f62, name: "Battle Box" },
    { offset: 0x20d00, length: 0x01d4, checksumOffset: 0x20ed6, mirrorOffset: 0x25f64, name: "Daycare" },
    { offset: 0x21100, length: 0x00f0, checksumOffset: 0x211f2, mirrorOffset: 0x25f68, name: "Misc" },
    { offset: 0x25f00, length: 0x0094, checksumOffset: 0x25fa2, mirrorOffset: 0x25fa2, name: "Checksums" },
];

const GEN5_LAYOUTS: Layout[] = [
    {
        name: "BW",
        mainSize: SAVE_SIZE_BW,
        checksumInfoLength: 0x8c,
        blocks: BW_BLOCKS,
        trainerBlockIndex: 27,
        miscBlockIndex: 33,
    },
    {
        name: "B2W2",
        mainSize: SAVE_SIZE_B2W2,
        checksumInfoLength: 0x94,
        blocks: B2W2_BLOCKS,
        trainerBlockIndex: 27,
        miscBlockIndex: 33,
    },
];

// Index 0 is unused; species ids 1-649 index directly into the Gen 5 personal table.
const GEN5_SPECIES_EXP_GROWTH =
    "0333333333000000333000000000033333344004400333000000000000553333333333335533300000000000005533300000" +
    "0055000000055400000055000005555500000000005555555553333333333000044440550444400333344033334330000030" +
    "4000000304400353000055400455550000540000054555555553333333333000000000333333330055500225551113332240" +
    "4434555005500123225522000444333331112440022001111110344445430003331115455555555555555553333333333330" +
    "0333333311110003300000004220043444000000430555533555500511555300500040003505040055555555555535533333" +
    "3333003330000000044333003330000433333300333333000003333300000000000000334433333300555000000000400003" +
    "33555003335550000003300000055550055555555555555555";

const GEN5_NATURES = [
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

const GEN5_ABILITY_MAP = [
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
    "Pickpocket",
    "Sheer Force",
    "Contrary",
    "Unnerve",
    "Defiant",
    "Defeatist",
    "Cursed Body",
    "Healer",
    "Friend Guard",
    "Weak Armor",
    "Heavy Metal",
    "Light Metal",
    "Multiscale",
    "Toxic Boost",
    "Flare Boost",
    "Harvest",
    "Telepathy",
    "Moody",
    "Overcoat",
    "Poison Touch",
    "Regenerator",
    "Big Pecks",
    "Sand Rush",
    "Wonder Skin",
    "Analytic",
    "Illusion",
    "Imposter",
    "Infiltrator",
    "Mummy",
    "Moxie",
    "Justified",
    "Rattled",
    "Magic Bounce",
    "Sap Sipper",
    "Prankster",
    "Sand Force",
    "Iron Barbs",
    "Zen Mode",
    "Victory Star",
    "Turboblaze",
    "Teravolt",
] as const;

const GEN5_ITEM_OVERRIDES: Record<number, string> = {
    537: "Prism Scale",
    538: "Eviolite",
    539: "Float Stone",
    540: "Rocky Helmet",
    541: "Air Balloon",
    542: "Red Card",
    543: "Ring Target",
    544: "Binding Band",
    545: "Absorb Bulb",
    546: "Cell Battery",
    547: "Eject Button",
    548: "Fire Gem",
    549: "Water Gem",
    550: "Electric Gem",
    551: "Grass Gem",
    552: "Ice Gem",
    553: "Fighting Gem",
    554: "Poison Gem",
    555: "Ground Gem",
    556: "Flying Gem",
    557: "Psychic Gem",
    558: "Bug Gem",
    559: "Rock Gem",
    560: "Ghost Gem",
    561: "Dragon Gem",
    562: "Dark Gem",
    563: "Steel Gem",
    564: "Normal Gem",
    565: "Health Feather",
    566: "Muscle Feather",
    567: "Resist Feather",
    568: "Genius Feather",
    569: "Clever Feather",
    570: "Swift Feather",
    571: "Pretty Feather",
    572: "Cover Fossil",
    573: "Plume Fossil",
    574: "Liberty Pass",
    575: "Pass Orb",
    576: "Dream Ball",
    577: "Poké Toy",
    578: "Prop Case",
    579: "Dragon Skull",
    580: "Balm Mushroom",
    581: "Big Nugget",
    582: "Pearl String",
    583: "Comet Shard",
    584: "Relic Copper",
    585: "Relic Silver",
    586: "Relic Gold",
    587: "Relic Vase",
    588: "Relic Band",
    589: "Relic Statue",
    590: "Relic Crown",
    591: "Casteliacone",
    592: "Dire Hit 2",
    593: "X Speed 2",
    594: "X Sp. Atk 2",
    595: "X Sp. Def 2",
    596: "X Defense 2",
    597: "X Attack 2",
    598: "X Accuracy 2",
    599: "X Speed 3",
    600: "X Sp. Atk 3",
    601: "X Sp. Def 3",
    602: "X Defense 3",
    603: "X Attack 3",
    604: "X Accuracy 3",
    605: "X Speed 6",
    606: "X Sp. Atk 6",
    607: "X Sp. Def 6",
    608: "X Defense 6",
    609: "X Attack 6",
    610: "X Accuracy 6",
    611: "Ability Urge",
    612: "Item Drop",
    613: "Item Urge",
    614: "Reset Urge",
    615: "Dire Hit 3",
    616: "Light Stone",
    617: "Dark Stone",
    618: "TM93",
    619: "TM94",
    620: "TM95",
    621: "Xtransceiver",
    622: "???",
    623: "Gram 1",
    624: "Gram 2",
    625: "Gram 3",
    626: "Xtransceiver",
    627: "Medal Box",
    628: "DNA Splicers",
    629: "DNA Splicers",
    630: "Permit",
    631: "Oval Charm",
    632: "Shiny Charm",
    633: "Plasma Card",
    634: "Grubby Hanky",
    635: "Colress Machine",
    636: "Dropped Item",
    637: "Dropped Item",
    638: "Reveal Glass",
};

const BALL_MAP: Record<number, string> = {
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
    17: "Fast Ball",
    18: "Level Ball",
    19: "Lure Ball",
    20: "Heavy Ball",
    21: "Love Ball",
    22: "Friend Ball",
    23: "Moon Ball",
    24: "Sport Ball",
    25: "Dream Ball",
};

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

const getSpeciesName = (id: number): Species | undefined => {
    if (id <= 0 || id > 649) return undefined;
    return listOfPokemon[id - 1] as Species | undefined;
};

const getGen5ItemName = (itemId: number) =>
    GEN5_ITEM_OVERRIDES[itemId] ?? GEN4_ITEM_MAP[itemId] ?? `Item #${itemId}`;

const getGen5AbilityName = (abilityId: number) => {
    if (!abilityId) return undefined;
    return GEN5_ABILITY_MAP[abilityId] ?? `Ability #${abilityId}`;
};

const getGen5GameName = (gameId: number): GameName | undefined => {
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
    if (gameId === 20) return "White";
    if (gameId === 21) return "Black";
    if (gameId === 22) return "White 2";
    if (gameId === 23) return "Black 2";
    return undefined;
};

const isValidPokemonLevel = (level: number | undefined): level is number =>
    level !== undefined && level >= 1 && level <= 100;

const getGen5GrowthRate = (speciesId: number) => {
    const growthRate = GEN5_SPECIES_EXP_GROWTH.charCodeAt(speciesId) - 48;
    if (growthRate < 0 || growthRate > 5) return undefined;
    return growthRate;
};

const getGen5MinExpForLevel = (level: number, growthRate: number) => {
    if (level <= 1) return 0;
    const cube = level ** 3;

    switch (growthRate) {
        case 0:
            return cube;
        case 1:
            if (level <= 50) return Math.floor((cube * (100 - level)) / 50);
            if (level <= 68) return Math.floor((cube * (150 - level)) / 100);
            if (level <= 98) {
                return Math.floor((cube * Math.floor((1911 - 10 * level) / 3)) / 500);
            }
            return Math.floor((cube * (160 - level)) / 100);
        case 2:
            if (level <= 15) {
                return Math.floor((cube * (Math.floor((level + 1) / 3) + 24)) / 50);
            }
            if (level <= 36) return Math.floor((cube * (level + 14)) / 50);
            return Math.floor((cube * (Math.floor(level / 2) + 32)) / 50);
        case 3:
            return Math.floor((6 * cube) / 5 - 15 * level ** 2 + 100 * level - 140);
        case 4:
            return Math.floor((4 * cube) / 5);
        case 5:
            return Math.floor((5 * cube) / 4);
        default:
            return undefined;
    }
};

const getGen5LevelFromExp = (speciesId: number, exp: number) => {
    const growthRate = getGen5GrowthRate(speciesId);
    if (growthRate === undefined) return undefined;

    for (let level = 2; level <= 100; level++) {
        const requiredExp = getGen5MinExpForLevel(level, growthRate);
        if (requiredExp === undefined) return undefined;
        if (exp < requiredExp) return level - 1;
    }

    return 100;
};

const getGen5Gender = (genderValue: number) => {
    if (genderValue === 0) return "m";
    if (genderValue === 1) return "f";
    if (genderValue === 2) return "genderless";
    return undefined;
};

const getGen5Forme = (species: Species | undefined, formId: number): Forme | undefined => {
    if (!species) return undefined;
    if (species === "Unown") return UNOWN_FORMES[formId] ?? undefined;
    if (species === "Deoxys") return [undefined, Forme.Attack, Forme.Defense, Forme.Speed][formId];
    if (species === "Burmy" || species === "Wormadam") return [Forme.Plant, Forme.Sandy, Forme.Trash][formId];
    if (species === "Shellos" || species === "Gastrodon") return [Forme["West Sea"], Forme["East Sea"]][formId];
    if (species === "Rotom") return [undefined, Forme.Heat, Forme.Wash, Forme.Frost, Forme.Fan, Forme.Mow][formId];
    if (species === "Giratina") return [undefined, Forme.Origin][formId];
    if (species === "Shaymin") return [undefined, Forme.Sky][formId];
    if (species === "Basculin") return [undefined, Forme["East Sea"]][formId];
    if (species === "Deerling" || species === "Sawsbuck") return [Forme.Spring, Forme.Summer, Forme.Autumn, Forme.Winter][formId];
    if (species === "Darmanitan") return [undefined, Forme.Zen][formId];
    if (species === "Tornadus" || species === "Thundurus" || species === "Landorus") return [undefined, Forme.Therian][formId];
    if (species === "Kyurem") return [undefined, Forme.White, Forme.Black][formId];
    if (species === "Keldeo") return formId ? Forme.Resolute : undefined;
    if (species === "Meloetta") return [undefined, Forme.Pirouette][formId];
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

const sumPk5Checksum = (buffer: Buffer) => {
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 2) {
        sum = (sum + buffer.readUInt16LE(i)) & 0xffff;
    }
    return sum & 0xffff;
};

const decryptWords = (encrypted: Buffer, seedValue: number) => {
    const out = Buffer.alloc(encrypted.length);
    let seed = seedValue >>> 0;
    for (let i = 0; i < encrypted.length; i += 2) {
        seed = (Math.imul(seed, 0x41c64e6d) + 0x6073) >>> 0;
        const key = (seed >>> 16) & 0xffff;
        out.writeUInt16LE((encrypted.readUInt16LE(i) ^ key) & 0xffff, i);
    }
    return out;
};

const unshuffleBlocks = (decrypted: Buffer, personality: number) => {
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

const decryptPk5 = (buffer: Buffer) => {
    if (buffer.length < PC_POKEMON_SIZE) return null;
    const pid = buffer.readUInt32LE(0x00);
    if (pid === 0) return null;

    const checksumStored = buffer.readUInt16LE(0x06);
    const encrypted = buffer.slice(0x08, PC_POKEMON_SIZE);
    const decrypted = decryptWords(encrypted, checksumStored);
    const blocks = unshuffleBlocks(decrypted, pid);
    const normalized = Buffer.alloc(buffer.length);

    buffer.copy(normalized, 0, 0, 0x08);
    blocks.A.copy(normalized, 0x08);
    blocks.B.copy(normalized, 0x28);
    blocks.C.copy(normalized, 0x48);
    blocks.D.copy(normalized, 0x68);

    if (sumPk5Checksum(normalized.slice(0x08, PC_POKEMON_SIZE)) !== checksumStored) {
        return null;
    }

    if (buffer.length > PC_POKEMON_SIZE) {
        decryptWords(buffer.slice(PC_POKEMON_SIZE), pid).copy(
            normalized,
            PC_POKEMON_SIZE,
        );
    }

    return normalized;
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
    return ((tid ^ sid ^ (pid & 0xffff) ^ ((pid >> 16) & 0xffff)) & 0xffff) < 8;
};

const decodeGen5String = (buffer: Buffer, maxChars: number) => {
    const chars: string[] = [];
    for (let i = 0; i < maxChars && i * 2 < buffer.length; i++) {
        const code = buffer.readUInt16LE(i * 2);
        if (code === 0x0000 || code === 0xffff) break;
        chars.push(String.fromCharCode(code));
    }
    return chars.join("").trim();
};

const titleCase = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const normalizeTrainerName = (str: string): string => {
    if (/^[A-Z]+$/.test(str)) return titleCase(str);
    return str;
};

const getBlock = (save: Buffer, layout: Layout, index: number) => {
    const block = layout.blocks[index];
    return save.slice(block.offset, block.offset + block.length);
};

const validateChecksumFooter = (save: Buffer, layout: Layout) => {
    if (save.length < layout.mainSize) return false;
    const footerStart = layout.mainSize - 0x100;
    const footerEnd = footerStart + layout.checksumInfoLength + 0x10;
    if (footerEnd > save.length) return false;
    const stored = save.readUInt16LE(footerEnd - 0x02);
    const actual = crc16Ccitt(save.slice(footerStart, footerStart + layout.checksumInfoLength));
    return stored === actual;
};

const hasValidChecksumFooter = (buffer: Buffer, layout: Layout) => {
    const baseOffsets =
        buffer.length === SAVE_SIZE_GEN5_RAW ? [0, layout.mainSize] : [0];
    return baseOffsets.some((baseOffset) => {
        if (baseOffset + layout.mainSize > buffer.length) return false;
        return validateChecksumFooter(
            buffer.slice(baseOffset, baseOffset + layout.mainSize),
            layout,
        );
    });
};

const validateBlock = (save: Buffer, block: BlockInfo) => {
    if (
        block.offset + block.length > save.length ||
        block.checksumOffset + 2 > save.length ||
        block.mirrorOffset + 2 > save.length
    ) {
        return false;
    }

    const checksum = crc16Ccitt(save.slice(block.offset, block.offset + block.length));
    return (
        checksum === save.readUInt16LE(block.checksumOffset) &&
        checksum === save.readUInt16LE(block.mirrorOffset)
    );
};

const scoreSave = (save: Buffer, layout: Layout) => {
    const footerChecksumValid = validateChecksumFooter(save, layout);
    const validBlockCount = layout.blocks.filter((block) =>
        validateBlock(save, block),
    ).length;
    return {
        footerChecksumValid,
        validBlockCount,
        score: (footerChecksumValid ? 1000 : 0) + validBlockCount,
    };
};

export const detectGen5Layout = (
    file: Buffer,
    preferred?: Gen5Game,
): Gen5Game | undefined => {
    const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
    if (preferred) return preferred;
    if (buffer.length === SAVE_SIZE_BW) return "BW";
    if (buffer.length === SAVE_SIZE_B2W2) return "B2W2";
    if (buffer.length !== SAVE_SIZE_GEN5_RAW) return undefined;

    const bw = hasValidChecksumFooter(buffer, GEN5_LAYOUTS[0]);
    const b2w2 = hasValidChecksumFooter(buffer, GEN5_LAYOUTS[1]);
    if (b2w2 && !bw) return "B2W2";
    if (bw && !b2w2) return "BW";
    return undefined;
};

const selectActiveSave = (buffer: Buffer, preferred?: Gen5Game): ActiveSave => {
    const preferredLayout = preferred
        ? GEN5_LAYOUTS.find((layout) => layout.name === preferred)
        : undefined;
    const layoutName = detectGen5Layout(buffer, preferred);
    const layout =
        preferredLayout ?? GEN5_LAYOUTS.find((candidate) => candidate.name === layoutName);

    if (!layout) {
        throw new Error("Unable to detect Gen 5 save format.");
    }

    const baseOffsets =
        buffer.length === SAVE_SIZE_GEN5_RAW ? [0, layout.mainSize] : [0];
    const candidates = baseOffsets
        .filter((baseOffset) => baseOffset + layout.mainSize <= buffer.length)
        .map((baseOffset) => {
            const data = buffer.slice(baseOffset, baseOffset + layout.mainSize);
            const score = scoreSave(data, layout);
            return { layout, baseOffset, data, ...score };
        })
        .sort((a, b) => b.score - a.score);

    const best = candidates[0];
    if (!best || (!best.footerChecksumValid && best.validBlockCount === 0)) {
        throw new Error(`Unable to validate ${layout.name} save data.`);
    }

    return {
        layout,
        baseOffset: best.baseOffset,
        data: best.data,
        footerChecksumValid: best.footerChecksumValid,
        validBlockCount: best.validBlockCount,
    };
};

const getBoxStatus = (boxIndex: number, options: ParserOptions) => {
    const mapping = options.boxMappings?.find(
        (entry) => entry.key === boxIndex + 1,
    );
    return mapping?.status || "Boxed";
};

const parseStats = (buffer: Buffer) => ({
    level: buffer.readUInt8(0x8c),
    stats: {
        currentHp: buffer.readUInt16LE(0x8e),
        maxHp: buffer.readUInt16LE(0x90),
        attack: buffer.readUInt16LE(0x92),
        defense: buffer.readUInt16LE(0x94),
        speed: buffer.readUInt16LE(0x96),
        specialAttack: buffer.readUInt16LE(0x98),
        specialDefense: buffer.readUInt16LE(0x9a),
    },
});

const decodePokemon = (buffer: Buffer, context: PokemonContext): Pokemon | null => {
    const data = decryptPk5(buffer);
    if (!data) return null;

    const pid = data.readUInt32LE(0x00);
    const speciesId = data.readUInt16LE(0x08);
    const speciesName = getSpeciesName(speciesId);
    if (!speciesName) return null;

    const itemId = data.readUInt16LE(0x0a);
    const otId = data.readUInt32LE(0x0c);
    const exp = data.readUInt32LE(0x10);
    const friendship = data.readUInt8(0x14);
    const abilityId = data.readUInt8(0x15);
    const markings = data.readUInt8(0x16);
    const language = data.readUInt8(0x17);

    const evs = {
        hp: data.readUInt8(0x18),
        attack: data.readUInt8(0x19),
        defense: data.readUInt8(0x1a),
        speed: data.readUInt8(0x1b),
        specialAttack: data.readUInt8(0x1c),
        specialDefense: data.readUInt8(0x1d),
    };
    const contest = {
        cool: data.readUInt8(0x1e),
        beauty: data.readUInt8(0x1f),
        cute: data.readUInt8(0x20),
        smart: data.readUInt8(0x21),
        tough: data.readUInt8(0x22),
        sheen: data.readUInt8(0x23),
    };

    const moveIds = [
        data.readUInt16LE(0x28),
        data.readUInt16LE(0x2a),
        data.readUInt16LE(0x2c),
        data.readUInt16LE(0x2e),
    ];
    const movePP = [
        data.readUInt8(0x30),
        data.readUInt8(0x31),
        data.readUInt8(0x32),
        data.readUInt8(0x33),
    ];
    const ppBonuses = [
        data.readUInt8(0x34),
        data.readUInt8(0x35),
        data.readUInt8(0x36),
        data.readUInt8(0x37),
    ];

    const ivData = data.readUInt32LE(0x38);
    const formGenderData = data.readUInt8(0x40);
    const natureId = data.readUInt8(0x41);
    const hiddenAbilityFlags = data.readUInt8(0x42);
    const nickname = decodeGen5String(data.slice(0x48, 0x5e), 11);
    const originGameId = data.readUInt8(0x5f);
    const originalTrainerName = decodeGen5String(data.slice(0x68, 0x78), 8);
    const eggDate = {
        year: data.readUInt8(0x78),
        month: data.readUInt8(0x79),
        day: data.readUInt8(0x7a),
    };
    const metDate = {
        year: data.readUInt8(0x7b),
        month: data.readUInt8(0x7c),
        day: data.readUInt8(0x7d),
    };
    const eggLocation = data.readUInt16LE(0x7e);
    const metLocation = data.readUInt16LE(0x80);
    const pokerus = data.readUInt8(0x82);
    const ballId = data.readUInt8(0x83);
    const metLevelGender = data.readUInt8(0x84);
    const groundTile = data.readUInt8(0x85);
    const pokeStarFame = data.readUInt8(0x87);

    const ivs = parseIvs(ivData);
    const fatefulEncounter = (formGenderData & 0x01) === 1;
    const genderValue = (formGenderData >>> 1) & 0x03;
    const formId = formGenderData >>> 3;
    const gender = getGen5Gender(genderValue);
    const nature = GEN5_NATURES[natureId];
    const forme = getGen5Forme(speciesName, formId);
    const gameOfOrigin = getGen5GameName(originGameId);
    const stats = context.isParty && data.length >= PARTY_POKEMON_SIZE
        ? parseStats(data)
        : undefined;
    const partyLevel = stats && isValidPokemonLevel(stats.level)
        ? stats.level
        : undefined;
    const level = partyLevel ?? getGen5LevelFromExp(speciesId, exp);

    const basePid = pid.toString(16);
    const currentCount = context.pidTracker.get(basePid) || 0;
    context.pidTracker.set(basePid, currentCount + 1);
    const id = currentCount > 0 ? `${basePid}-${currentCount}` : basePid;
    const displayNickname = ivs.isNicknamed && nickname ? nickname : speciesName;
    const moves = moveIds.map((id) => MOVES_ARRAY?.[id]).filter(Boolean);
    const types = Array.from(new Set(matchSpeciesToTypes(speciesName))) as [Types, Types];
    const metLocationName = getGen5LocationName(metLocation, context.game, originGameId);
    const eggLocationName = getGen5LocationName(eggLocation, context.game, originGameId);

    return {
        species: speciesName,
        nickname: displayNickname,
        status: context.status,
        id,
        level,
        moves,
        shiny: shinyCheck(pid, otId),
        forme,
        gender,
        nature,
        gameOfOrigin,
        item: itemId ? getGen5ItemName(itemId) : undefined,
        met: metLocationName,
        metLevel: metLevelGender & 0x7f || undefined,
        position: context.position,
        egg: ivs.isEgg,
        pokeball: BALL_MAP[ballId] || `Ball #${ballId}`,
        ability: getGen5AbilityName(abilityId),
        types,
        extraData: {
            language,
            friendship,
            abilityId,
            markings,
            fatefulEncounter,
            hiddenAbility: Boolean(hiddenAbilityFlags & 0x01),
            nSparkle: Boolean(hiddenAbilityFlags & 0x02),
            ppBonuses,
            movePP,
            evs,
            contest,
            genderValue,
            formId,
            originGame: gameOfOrigin,
            originGameId,
            originalTrainerName,
            eggDate,
            metDate,
            eggLocation,
            eggLocationName,
            metLocation,
            metLocationName,
            pokerus,
            otGender: (metLevelGender >>> 7) & 0x1 ? "F" : "M",
            groundTile,
            pokeStarFame,
            ivs,
            exp,
            checksumStored: data.readUInt16LE(0x06),
            box: context.boxIndex !== undefined ? context.boxIndex + 1 : undefined,
            slot: context.slotIndex,
            stats: stats?.stats,
        },
    };
};

const parseParty = (
    save: Buffer,
    layout: Layout,
    pidTracker: Map<string, number>,
) => {
    const count = save.readUInt8(PARTY_COUNT_OFFSET) || 0;
    const party: Pokemon[] = [];
    const capped = Math.min(count, 6);
    for (let i = 0; i < capped; i++) {
        const start = PARTY_DATA_OFFSET + i * PARTY_POKEMON_SIZE;
        const slice = save.slice(start, start + PARTY_POKEMON_SIZE);
        const pokemon = decodePokemon(slice, {
            game: layout.name,
            status: "Team",
            position: i + 1,
            isParty: true,
            slotIndex: i,
            pidTracker,
        });
        if (pokemon) party.push(pokemon);
    }
    return party;
};

const parseBoxes = (
    save: Buffer,
    layout: Layout,
    options: ParserOptions,
    pidTracker: Map<string, number>,
) => {
    const boxed: Pokemon[] = [];
    for (let boxIndex = 0; boxIndex < BOX_COUNT; boxIndex++) {
        const boxStart =
            BOX_BASE_OFFSET +
            boxIndex * BOX_CAPACITY * PC_POKEMON_SIZE +
            boxIndex * 0x10;
        for (let slotIndex = 0; slotIndex < BOX_CAPACITY; slotIndex++) {
            const start = boxStart + slotIndex * PC_POKEMON_SIZE;
            const slice = save.slice(start, start + PC_POKEMON_SIZE);
            const pokemon = decodePokemon(slice, {
                game: layout.name,
                status: getBoxStatus(boxIndex, options),
                position: boxIndex * BOX_CAPACITY + slotIndex + 1,
                isParty: false,
                boxIndex,
                slotIndex,
                pidTracker,
            });
            if (pokemon) boxed.push(pokemon);
        }
    }
    return boxed;
};

const getTrainerBadges = (badgeByte: number, game?: GameName) =>
    game
        ? getBadges(game).filter(
              (_badge, index) => (badgeByte & (1 << index)) !== 0,
          )
        : [];

const parseTrainer = (save: Buffer, layout: Layout) => {
    const playerData = getBlock(save, layout, layout.trainerBlockIndex);
    const misc = getBlock(save, layout, layout.miscBlockIndex);
    const rawName = decodeGen5String(playerData.slice(0x04, 0x14), 8);
    const name = normalizeTrainerName(rawName);
    const tid = playerData.readUInt16LE(0x14);
    const gameId = playerData.readUInt8(0x1f);
    const hours = playerData.readUInt16LE(0x24);
    const minutes = playerData.readUInt8(0x26);
    const seconds = playerData.readUInt8(0x27);
    const badgeByte = misc.readUInt8(0x04);
    const game = getGen5GameName(gameId);

    return {
        trainer: {
            name,
            id: tid.toString().padStart(5, "0"),
            money: misc.readUInt32LE(0x00).toString(),
            time: `${hours}:${minutes}:${seconds}`,
            badges: getTrainerBadges(badgeByte, game),
        },
        game,
        gameId,
    };
};

export const parseGen5Save = async (
    file: Buffer,
    options: ParserOptions & { selectedGame?: Gen5Game },
) => {
    const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
    const active = selectActiveSave(buffer, options.selectedGame);
    const pidTracker = new Map<string, number>();
    const trainer = parseTrainer(active.data, active.layout);
    const party = parseParty(active.data, active.layout, pidTracker);
    const boxed = parseBoxes(active.data, active.layout, options, pidTracker);

    return {
        trainer: trainer.trainer,
        game: trainer.game,
        pokemon: [...party, ...boxed],
        debug: options.debug
            ? {
                  layout: active.layout.name,
                  game: trainer.game,
                  gameId: trainer.gameId,
                  activeBase: `0x${active.baseOffset.toString(16)}`,
                  footerChecksumValid: active.footerChecksumValid,
                  validBlockCount: active.validBlockCount,
                  partyCount: active.data.readUInt8(PARTY_COUNT_OFFSET),
              }
            : undefined,
    };
};
