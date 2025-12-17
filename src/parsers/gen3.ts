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
import { parseTime } from "./utils/parseTime";
import {
    GEN3_SPECIES_MAP,
    ABILITY_MAP,
    GEN_3_LOCATIONS,
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
    TEAM_POKEMON_LIST: 0x0238,
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

const decodeCharacter = (code: number): string => {
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

const decodeGameText = (buffer: Buffer): string => {
    let result = "";
    for (const code of buffer) {
        if (code === 0xff || code === 0x00) break;
        result += decodeCharacter(code);
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
        const remaining = Math.min(4, limit - i);
        let value = 0;
        if (remaining === 4) {
            value = buffer.readUInt32LE(i);
        } else {
            for (let b = 0; b < remaining; b++) {
                value |= buffer[i + b] << (8 * b);
            }
        }
        sum = (sum + value) >>> 0;
    }
    return ((sum & 0xffff) + (sum >>> 16)) & 0xffff;
};

const isSectionValid = (section: SaveSection) => {
    const size = SECTION_SAVE_SIZES[section.id];
    if (!size) return true;
    const computed = computeChecksum(section.data, size);
    const isValid = computed === section.checksum;
    if (!isValid) {
        log("checksum", `Section ${section.id} failed checksum`, {
            expected: `0x${section.checksum.toString(16)}`,
            computed: `0x${computed.toString(16)}`,
            saveIndex: section.saveIndex,
        });
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
    const saveIndex = footer.readUInt32LE(8);

    log(
        "readSection",
        `Section ${sectionIndex}: ID=${id}, checksum=0x${checksum.toString(16)}, saveIndex=${saveIndex}`,
        {
            offset: `0x${offset.toString(16)}`,
            dataSize: SECTION_DATA_SIZE,
        },
    );

    return {
        id,
        checksum,
        saveIndex,
        order: sectionIndex,
        data: file.slice(dataStart, dataEnd),
    };
};

const readBlock = (file: Buffer, blockIndex: number): SaveSection[] => {
    const start = blockIndex * BLOCK_SIZE;
    const blockBuffer = file.slice(start, start + BLOCK_SIZE);
    const sections: SaveSection[] = [];

    log(
        "readBlock",
        `Reading block ${blockIndex} at offset 0x${start.toString(16)}, size=${BLOCK_SIZE}`,
    );

    for (let i = 0; i < SECTION_COUNT; i++) {
        sections.push(readSection(blockBuffer, i));
    }

    return sections;
};

const buildSectionMap = (blockA: SaveSection[], blockB: SaveSection[]) => {
    const map = new Map<number, SaveSection>();
    const sectionsByIdA = new Map<number, SaveSection>();
    const sectionsByIdB = new Map<number, SaveSection>();

    blockA.forEach((section) => sectionsByIdA.set(section.id, section));
    blockB.forEach((section) => sectionsByIdB.set(section.id, section));

    for (let id = 0; id < SECTION_COUNT; id++) {
        const sectionA = sectionsByIdA.get(id);
        const sectionB = sectionsByIdB.get(id);
        const validA = sectionA ? isSectionValid(sectionA) : false;
        const validB = sectionB ? isSectionValid(sectionB) : false;

        let selected: SaveSection | undefined;

        if (validA && validB) {
            selected =
                sectionA!.saveIndex >= sectionB!.saveIndex
                    ? sectionA
                    : sectionB;
        } else if (validA) {
            selected = sectionA;
        } else if (validB) {
            selected = sectionB;
        } else if (sectionA && sectionB) {
            selected =
                sectionA.saveIndex >= sectionB.saveIndex ? sectionA : sectionB;
        } else {
            selected = sectionA || sectionB;
        }

        if (selected) {
            map.set(id, selected);
        }
    }

    log("buildSectionMap", `Built section map with ${map.size} sections`, {
        sectionIds: Array.from(map.keys()),
    });

    return map;
};

const getSpeciesName = (
    speciesId: number,
    nickname?: string,
): Species | undefined => {
    // Convert Gen 3 internal species ID to National Dex number
    const nationalDexId =
            GEN3_SPECIES_MAP[speciesId];
    if (
        nationalDexId &&
        nationalDexId.length > 0 &&
        nationalDexId.length <= MAX_SUPPORTED_SPECIES
    ) {
        return nationalDexId;
    }
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
    const nickname = decodeGameText(buffer.slice(0x08, 0x08 + 10));
    const language = buffer.readUInt16LE(0x12);
    const markings = buffer.readUInt8(0x14);
    const checksum = buffer.readUInt16LE(0x1c);
    const encryptedData = buffer.slice(0x20, 0x20 + 48);
    const key = (personality ^ otId) >>> 0;
    const decrypted = xorBufferWithKey(encryptedData, key);
    const orderKey =
        SUBSTRUCTURE_ORDERS[personality % SUBSTRUCTURE_ORDERS.length];
    const sub = splitSubstructures(orderKey, decrypted);

    log(
        "decodePokemon",
        `Decoding Pokemon at ${context.status} position ${context.position}`,
        {
            personality: `0x${personality.toString(16)}`,
            otId: `0x${otId.toString(16)}`,
            encryptionKey: `0x${key.toString(16)}`,
            substructureOrder: orderKey,
            nickname,
        },
    );

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

    log("decodePokemon", `Species data extracted`, {
        internalSpeciesId: speciesId,
        nationalDexId: GEN3_SPECIES_MAP[speciesId],
        itemId,
        exp,
        friendship,
        moveIds,
    });

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
    const metLevel = originInfo & 0x7f;
    const originGame = (originInfo >> 7) & 0xf;
    const ballId = (originInfo >> 11) & 0x3;
    const otGender = (originInfo >> 15) & 0x1 ? "F" : "M";

    // For party Pokemon, use the stored level. For boxed Pokemon, use metLevel as fallback
    const level = context.isParty ? context.level : metLevel || undefined;
    const speciesName = getSpeciesName(speciesId, nickname);
    const moves = moveIds.map((id) => MOVES_ARRAY?.[id]).filter(Boolean);
    const pokeball = BALL_MAP[ballId] || `Ball #${ballId}`;

    // Get ability from ABILITY_MAP
    let nationalDexId = GEN3_SPECIES_MAP[speciesId];

    // If that also fails but we have a valid species name, find the national dex ID from SPECIES_MAP
    if ((!nationalDexId || nationalDexId.length === 0) && speciesName) {
        // Search SPECIES_MAP to find the national dex ID for this species name
        const foundKey = Object.keys(SPECIES_MAP).find(
            (key) => SPECIES_MAP[key as unknown as number] === speciesName,
        );
        if (foundKey) {
            nationalDexId = SPECIES_MAP[parseInt(foundKey as unknown as string)];
        }
    }

    const abilities =
        nationalDexId && ABILITY_MAP[nationalDexId]
            ? ABILITY_MAP[nationalDexId]
            : [];
    const abilityIndex = ivs.abilitySlot === 1 ? 1 : 0;
    const ability = abilities[abilityIndex] || abilities[0] || undefined;

    const shiny = shinyCheck(personality, otId);
    const forme =
        speciesName === "Unown" ? determineUnownForme(personality) : undefined;

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

    const typeTuple = speciesName
        ? matchSpeciesToTypes(speciesName as Species)
        : undefined;
    const types = typeTuple
        ? (Array.from(new Set(typeTuple)) as [Types, Types])
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
        item: itemId ? `Item #${itemId}` : undefined,
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
    const size = section.readUInt8(offsets.TEAM_SIZE) || 0;
    const count = Math.min(size, TEAM_CAPACITY);
    const start = offsets.TEAM_POKEMON_LIST;
    const party: Pokemon[] = [];

    log("parseParty", `Parsing party: team size=${size}, capped at ${count}`, {
        teamSizeOffset: `0x${offsets.TEAM_SIZE.toString(16)}`,
        pokemonListOffset: `0x${start.toString(16)}`,
    });

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

    log("parseParty", `Found ${party.length} Pokemon in party`);

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

    log("parseBoxes", `Found ${buffers.length} PC storage sections`, {
        expectedSections: PC_SECTION_IDS.length,
        sectionIds: PC_SECTION_IDS,
    });

    if (!buffers.length) {
        log(
            "parseBoxes",
            "No PC storage sections found, returning empty array",
        );
        return [];
    }

    const storage = Buffer.concat(buffers).slice(STORAGE_HEADER_SIZE);
    const pokemonBytes = BOX_COUNT * BOX_CAPACITY * BOX_POKEMON_SIZE;
    const pokemonArea = storage.slice(0, pokemonBytes);
    const boxed: Pokemon[] = [];

    log(
        "parseBoxes",
        `Parsing ${BOX_COUNT} boxes with ${BOX_CAPACITY} slots each`,
        {
            totalSlots: BOX_COUNT * BOX_CAPACITY,
            pokemonAreaSize: pokemonBytes,
        },
    );

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
            log("parseBoxes", `Box ${boxIndex + 1}: found ${boxCount} Pokemon`);
        }
    }

    log("parseBoxes", `Total boxed Pokemon: ${boxed.length}`);

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
    const trainerId = section.readUInt16LE(offsets.PLAYER_ID[0]);
    const time = parseTime(
        section.slice(offsets.TIME_PLAYED[0], offsets.TIME_PLAYED[1]),
    );
    const moneyBytes = section.slice(offsets.MONEY[0], offsets.MONEY[1]);
    const money = formatMoney(moneyBytes);

    log("parseTrainer", `Trainer: ${name} (ID: ${trainerId})`, {
        time,
        money,
        game: options.selectedGame,
    });

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
    const startTime = performance.now();

    // Ensure file is a Buffer (might be Uint8Array in worker context)
    const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);

    log("parseGen3Save", "=== Starting Gen 3 save file parsing ===", {
        fileSize: buffer.length,
        expectedSize: BLOCK_SIZE * 2,
        selectedGame: options.selectedGame,
    });

    const blockA = readBlock(buffer, 0);
    const blockB = readBlock(buffer, 1);
    log("parseGen3Save", "Merging save blocks", {
        blockA_saveIndex: blockA[SECTION_COUNT - 1].saveIndex,
        blockB_saveIndex: blockB[SECTION_COUNT - 1].saveIndex,
    });
    const sectionMap = buildSectionMap(blockA, blockB);
    const offsets = getOffsets(options.selectedGame as GameSaveFormat);

    log("parseGen3Save", "Offsets determined", {
        game: options.selectedGame,
        teamSize: `0x${offsets.TEAM_SIZE.toString(16)}`,
        teamList: `0x${offsets.TEAM_POKEMON_LIST.toString(16)}`,
    });

    const trainerSection = sectionMap.get(0);
    const teamSection = sectionMap.get(1);

    if (!trainerSection || !teamSection) {
        log("parseGen3Save", "ERROR: Missing critical sections", {
            hasTrainerSection: !!trainerSection,
            hasTeamSection: !!teamSection,
        });
        throw new Error("Unable to locate trainer or party data in save file.");
    }

    // Create a PID tracker to ensure unique IDs across all Pokemon
    const pidTracker = new Map<string, number>();

    const trainer = parseTrainer(trainerSection.data, offsets, options);
    const party = parseParty(teamSection.data, offsets, pidTracker);
    const boxed = parseBoxes(sectionMap, options, pidTracker);

    const endTime = performance.now();
    const parseTime = endTime - startTime;

    log("parseGen3Save", "=== Parsing complete ===", {
        parseTimeMs: parseTime.toFixed(2),
        trainerName: trainer.name,
        partyCount: party.length,
        boxedCount: boxed.length,
        totalPokemon: party.length + boxed.length,
    });

    const result = {
        trainer,
        pokemon: [...party, ...boxed],
        debug: DEBUG
            ? {
                  fileSize: buffer.length,
                  game: options.selectedGame,
                  selectedBlock: blockA[SECTION_COUNT - 1].saveIndex,
                  sectionCount: sectionMap.size,
                  parseTimeMs: parseTime,
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
