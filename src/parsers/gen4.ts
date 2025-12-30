import { Buffer } from "buffer";
import { Pokemon } from "models";
import { matchSpeciesToTypes } from "utils/formatters/matchSpeciesToTypes";
import { Forme } from "utils/Forme";
import { Types } from "utils/Types";
import { listOfPokemon, Species } from "utils/data/listOfPokemon";
import { MOVES_ARRAY } from "./utils";
import { ParserOptions } from "./utils/parserOptions";
import { ABILITY_MAP } from "./utils/gen3";
import { GEN4_ITEM_MAP } from "./utils/gen4";

type Gen4Game = "DP" | "Platinum" | "HGSS";

type Layout = {
    name: Gen4Game;
    generalStart: number;
    generalSize: number;
    storageStart: number;
    storageSize: number;
    pairStride: number;
    storageKind: "dppt" | "hgss";
};

type ValidatedBlock = {
    ok: boolean;
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
    status: string;
    position: number;
    isParty: boolean;
    boxIndex?: number;
    slotIndex?: number;
    pidTracker: Map<string, number>;
};

const FOOTER_SIZE = 0x14;
const PARTY_POKEMON_SIZE = 236;
const PC_POKEMON_SIZE = 136;
const BOX_COUNT = 18;
const BOX_CAPACITY = 30;
const STORAGE_HEADER_DPPT = 0x04;
const BOX_STRIDE_HGSS = 0x1000;
const BOX_PADDING_HGSS = 0x10;
const PARTY_OFFSET = 0x98;
const PARTY_COUNT_OFFSET = 0x94;

const GEN4_LAYOUTS: Layout[] = [
    {
        name: "DP",
        generalStart: 0x00000,
        generalSize: 0x0c100,
        storageStart: 0x0c100,
        storageSize: 0x121e0,
        pairStride: 0x40000,
        storageKind: "dppt",
    },
    {
        name: "Platinum",
        generalStart: 0x00000,
        generalSize: 0x0cf2c,
        storageStart: 0x0cf2c,
        storageSize: 0x121e4,
        pairStride: 0x40000,
        storageKind: "dppt",
    },
    {
        name: "HGSS",
        generalStart: 0x00000,
        generalSize: 0x0f700,
        storageStart: 0x0f700,
        storageSize: 0x12311,
        pairStride: 0x40000,
        storageKind: "hgss",
    },
];

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

const listSpeciesByDex = new Map<number, Species>(
    listOfPokemon.map((s, i) => [i + 1, s]),
);

const getSpeciesName = (id: number) => listSpeciesByDex.get(id);

const getAbilityForSpecies = (species: Species | undefined, abilitySlot: number) => {
    if (!species) return undefined;
    const dex = listOfPokemon.indexOf(species) + 1;
    const abilities = ABILITY_MAP[dex] ?? [];
    const index = abilitySlot === 1 ? 1 : 0;
    return abilities[index] || abilities[0];
};

const determineUnownForme = (personality: number): Forme => {
    const value =
        ((personality & 0x3000000) >> 18) |
        ((personality & 0x30000) >> 12) |
        ((personality & 0x300) >> 6) |
        (personality & 0x3);
    const formes: Forme[] = [
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
    return formes[value % formes.length];
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
    let seed = checksum & 0xffff;
    for (let i = 0; i < encrypted.length; i += 2) {
        seed = (seed * 0x41c64e6d + 0x6073) >>> 0;
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
    attack: (value >> 5) & 0x1f,
    defense: (value >> 10) & 0x1f,
    speed: (value >> 15) & 0x1f,
    specialAttack: (value >> 20) & 0x1f,
    specialDefense: (value >> 25) & 0x1f,
    isEgg: Boolean((value >> 30) & 0x1),
    abilitySlot: (value >> 31) & 0x1,
});

const shinyCheck = (pid: number, otId: number) => {
    const tid = otId & 0xffff;
    const sid = (otId >> 16) & 0xffff;
    const value =
        (tid ^ sid ^ (pid & 0xffff) ^ ((pid >> 16) & 0xffff)) & 0xffff;
    return value < 8;
};

// Gen 4 character table constants (DS games use 16-bit character codes)
// Uppercase A-Z: 0x012B - 0x0144
// Lowercase a-z: 0x0145 - 0x015E
// Digits 0-9: 0x0121 - 0x012A
const GEN4_CHAR_UPPER_START = 0x012b;
const GEN4_CHAR_LOWER_START = 0x0145;
const GEN4_CHAR_DIGIT_START = 0x0121;

const decodeGen4Char = (code: number): string | null => {
    if (code === 0xffff || code === 0x0000) return null;
    // Uppercase A-Z
    if (code >= GEN4_CHAR_UPPER_START && code < GEN4_CHAR_UPPER_START + 26) {
        return String.fromCharCode("A".charCodeAt(0) + (code - GEN4_CHAR_UPPER_START));
    }
    // Lowercase a-z
    if (code >= GEN4_CHAR_LOWER_START && code < GEN4_CHAR_LOWER_START + 26) {
        return String.fromCharCode("a".charCodeAt(0) + (code - GEN4_CHAR_LOWER_START));
    }
    // Digits 0-9
    if (code >= GEN4_CHAR_DIGIT_START && code < GEN4_CHAR_DIGIT_START + 10) {
        return String.fromCharCode("0".charCodeAt(0) + (code - GEN4_CHAR_DIGIT_START));
    }
    // Space and common punctuation (near ASCII range)
    if (code === 0x0000) return " ";
    // Fallback: try ASCII if in printable range
    if (code >= 0x20 && code <= 0x7e) {
        return String.fromCharCode(code);
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

// High-priority species for brute-force recovery: final evolutions and legendaries
// that are commonly used in party teams. Lower numbers = higher priority.
const PRIORITY_SPECIES: Record<number, number> = {
    // Legendary/Mythical Pokemon (highest priority)
    150: 1, 151: 1, // Mewtwo, Mew
    249: 1, 250: 1, 251: 1, // Lugia, Ho-Oh, Celebi
    382: 1, 383: 1, 384: 1, 385: 1, 386: 1, // Weather trio, Jirachi, Deoxys
    483: 1, 484: 1, 487: 1, 491: 1, 492: 1, 493: 1, // Sinnoh legends
    // Ghost-type final evolutions (high priority for party)
    94: 2, // Gengar
    477: 2, // Dusknoir
    429: 2, // Mismagius
    // Dragon-type final evolutions
    149: 2, // Dragonite
    373: 2, // Salamence
    445: 2, // Garchomp
    // Other popular final evolutions
    130: 3, 131: 3, 143: 3, 248: 3, 376: 3, 448: 3, // Gyarados, Lapras, Snorlax, T-tar, Metagross, Lucario
    400: 3, // Bibarel (HM slave common in DP)
};

const validateEvs = (evsBlock: Buffer): boolean => {
    const evs = [
        evsBlock.readUInt8(0x00),
        evsBlock.readUInt8(0x01),
        evsBlock.readUInt8(0x02),
        evsBlock.readUInt8(0x03),
        evsBlock.readUInt8(0x04),
        evsBlock.readUInt8(0x05),
    ];
    const sum = evs.reduce((a, b) => a + b, 0);
    return sum <= 510 && evs.every((v) => v <= 252);
};

const bruteForceDecrypt = (
    encrypted: Buffer,
    pid: number,
): { decrypted: Buffer; blocks: Record<"A" | "B" | "C" | "D", Buffer>; speciesId: number } | null => {
    // Collect all valid candidates, then pick the best one based on priority
    let bestResult: { decrypted: Buffer; blocks: Record<"A" | "B" | "C" | "D", Buffer>; speciesId: number } | null = null;
    let bestPriority = Infinity;

    for (let checksum = 0; checksum <= 0xffff; checksum++) {
        const decrypted = decryptPk4Payload(encrypted, checksum);
        const blocks = unshufflePk4Blocks(decrypted, pid);
        const speciesId = blocks.A.readUInt16LE(0x00);

        if (speciesId > 0 && speciesId <= 493 && validateEvs(blocks.C)) {
            const priority = PRIORITY_SPECIES[speciesId] ?? 100;
            if (priority < bestPriority) {
                bestResult = { decrypted, blocks, speciesId };
                bestPriority = priority;
                // If we found a priority 1 species, stop searching
                if (priority === 1) break;
            }
        }
    }
    return bestResult;
};

const parsePartyStats = (buffer: Buffer) => {
    // Party stats region is 100 bytes; offsets here follow common PK4 structure.
    const level = buffer.readUInt8(0x04);
    const currentHp = buffer.readUInt16LE(0x08);
    const maxHp = buffer.readUInt16LE(0x0a);
    const attack = buffer.readUInt16LE(0x0c);
    const defense = buffer.readUInt16LE(0x0e);
    const speed = buffer.readUInt16LE(0x10);
    const specialAttack = buffer.readUInt16LE(0x12);
    const specialDefense = buffer.readUInt16LE(0x14);
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

    // Checksum is at offset 0x06 (not 0x04)
    const checksumStored = buffer.readUInt16LE(0x06);
    const encrypted = buffer.slice(0x08, 0x08 + 0x80);

    // Try decryption with stored checksum first
    let finalDecrypted = decryptPk4Payload(encrypted, checksumStored);
    let finalBlocks = unshufflePk4Blocks(finalDecrypted, pid);
    let speciesId = finalBlocks.A.readUInt16LE(0x00);

    // If species is invalid, try brute-forcing to recover the data
    if (speciesId === 0 || speciesId > 493) {
        const recovered = bruteForceDecrypt(encrypted, pid);
        if (recovered) {
            finalDecrypted = recovered.decrypted;
            finalBlocks = recovered.blocks;
            speciesId = recovered.speciesId;
        } else {
            return null;
        }
    }

    const growth = finalBlocks.A;
    const attacks = finalBlocks.B;
    const evsBlock = finalBlocks.C;
    const misc = finalBlocks.D;

    if (!speciesId) return null;
    const speciesName = getSpeciesName(speciesId);
    const itemId = growth.readUInt16LE(0x02);
    const otId = growth.readUInt32LE(0x04); // TID/SID combined
    const exp = growth.readUInt32LE(0x08);
    const ppBonuses = growth.readUInt8(0x0c);
    const friendship = growth.readUInt8(0x0d);
    const language = growth.readUInt8(0x17);

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

    const evs = {
        hp: evsBlock.readUInt8(0x00),
        attack: evsBlock.readUInt8(0x01),
        defense: evsBlock.readUInt8(0x02),
        speed: evsBlock.readUInt8(0x03),
        specialAttack: evsBlock.readUInt8(0x04),
        specialDefense: evsBlock.readUInt8(0x05),
    };

    const contest = {
        cool: evsBlock.readUInt8(0x06),
        beauty: evsBlock.readUInt8(0x07),
        cute: evsBlock.readUInt8(0x08),
        smart: evsBlock.readUInt8(0x09),
        tough: evsBlock.readUInt8(0x0a),
        sheen: evsBlock.readUInt8(0x0b),
    };

    const pokerus = misc.readUInt8(0x00);
    const metLocation = misc.readUInt8(0x01);
    const originInfo = misc.readUInt16LE(0x02);
    const ivData = misc.readUInt32LE(0x04);
    const ribbons = misc.readUInt32LE(0x08);

    const ivs = parseIvs(ivData);
    const metLevel = originInfo & 0x7f;
    const originGame = (originInfo >> 7) & 0xf;
    const ballId = (originInfo >> 11) & 0xf;
    const otGender = (originInfo >> 15) & 0x1 ? "F" : "M";

    const statsSection =
        context.isParty && buffer.length >= PARTY_POKEMON_SIZE
            ? parsePartyStats(buffer.slice(PC_POKEMON_SIZE))
            : undefined;

    const level = statsSection?.level || undefined;

    const moves = moveIds.map((id) => MOVES_ARRAY?.[id]).filter(Boolean);
    const pokeball = BALL_MAP[ballId] || `Ball #${ballId}`;
    const ability = getAbilityForSpecies(
        speciesName,
        ivs.abilitySlot === 1 ? 1 : 0,
    );
    const types = speciesName
        ? (Array.from(new Set(matchSpeciesToTypes(speciesName))) as [Types, Types])
        : undefined;
    const shiny = shinyCheck(pid, otId);
    const forme =
        speciesName === "Unown" ? determineUnownForme(pid) : undefined;

    const basePid = pid.toString(16);
    const currentCount = context.pidTracker.get(basePid) || 0;
    context.pidTracker.set(basePid, currentCount + 1);
    const id = currentCount > 0 ? `${basePid}-${currentCount}` : basePid;

    const pokemon: Pokemon = {
        species: speciesName || `Species ${speciesId}`,
        nickname: undefined,
        status: context.status,
        id,
        level,
        moves,
        shiny,
        forme,
        item: itemId
            ? GEN4_ITEM_MAP[itemId] ?? `Item #${itemId}`
            : undefined,
        met: metLocation ? `Location #${metLocation}` : undefined,
        metLevel: metLevel || undefined,
        position: context.position,
        egg: ivs.isEgg,
        pokeball,
        ability,
        types,
        extraData: {
            language,
            friendship,
            ppBonuses,
            movePP,
            evs,
            contest,
            pokerus,
            originGame,
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

const validateBlock = (buffer: Buffer): ValidatedBlock => {
    if (buffer.length < FOOTER_SIZE)
        return {
            ok: false,
            buffer,
            saveCount: 0,
            linkValue: 0,
            checksumStored: 0,
            checksumComputed: 0,
        };
    const footerStart = buffer.length - FOOTER_SIZE;
    const linkValue = buffer.readUInt32LE(footerStart + 0x00);
    const saveCount = buffer.readUInt32LE(footerStart + 0x04);
    const checksumStored = buffer.readUInt16LE(footerStart + 0x12);
    const checksumComputed = crc16Ccitt(buffer.slice(0, footerStart));
    return {
        ok: checksumStored === checksumComputed,
        buffer,
        saveCount,
        linkValue,
        checksumStored,
        checksumComputed,
    };
};

const selectLayoutAndBlocks = (file: Buffer, preferred?: Gen4Game): ActiveBlocks => {
    const layouts = preferred
        ? GEN4_LAYOUTS.filter((l) => l.name === preferred)
        : GEN4_LAYOUTS;

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
            const general = validateBlock(generalBuf);
            const storage = validateBlock(storageBuf);
            validated.push({ base, general, storage });
        }

        const validGenerals = validated.filter((v) => v.general.ok);
        if (!validGenerals.length) continue;
        const selectedGeneral = validGenerals.reduce((a, b) =>
            b.general.saveCount > a.general.saveCount ? b : a,
        );

        const candidateStorage = validated
            .filter((v) => v.storage.ok)
            .sort((a, b) => b.storage.saveCount - a.storage.saveCount);

        let chosenStorage = candidateStorage.find(
            (v) => v.storage.linkValue === selectedGeneral.general.saveCount,
        );
        if (!chosenStorage && candidateStorage.length) {
            chosenStorage = candidateStorage[0];
        }
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
        );
        const storage = validateBlock(
            file.slice(
                fallbackLayout.storageStart,
                fallbackLayout.storageStart + fallbackLayout.storageSize,
            ),
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
    options: ParserOptions,
    pidTracker: Map<string, number>,
) => {
    const count = general.readUInt8(PARTY_COUNT_OFFSET) || 0;
    const party: Pokemon[] = [];
    const capped = Math.min(count, 6);
    for (let i = 0; i < capped; i++) {
        const start = PARTY_OFFSET + i * PARTY_POKEMON_SIZE;
        const slice = general.slice(start, start + PARTY_POKEMON_SIZE);
        const context: PokemonContext = {
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
                    status: getBoxStatus(boxIndex, options),
                    position: (slotIndex + 1) * (boxIndex + 1),
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
                    status: getBoxStatus(boxIndex, options),
                    position: (slotIndex + 1) * (boxIndex + 1),
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

const parseTrainer = (general: Buffer) => {
    // Trainer name at 0x64 (8 characters max, 16 bytes)
    // Apply title case as DS games store names in uppercase
    const rawName = decodeGen4String(general.slice(0x64, 0x64 + 16), 8);
    const name = titleCase(rawName);
    // TID at 0x74, SID at 0x76
    const tid = general.readUInt16LE(0x74);
    // Money at 0x78
    const money = general.readUInt32LE(0x78);
    // Play time at 0x86: hours (u16), minutes (u8), seconds (u8)
    const hours = general.readUInt16LE(0x86);
    const minutes = general.readUInt8(0x88);
    const seconds = general.readUInt8(0x89);
    const time = `${hours}:${minutes}:${seconds}`;
    // Badges at 0x7E (1 byte bitfield, each bit = 1 badge)
    const badgeByte = general.readUInt8(0x7e);
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

    const trainer = parseTrainer(active.general.buffer);
    const party = parseParty(active.general.buffer, options, pidTracker);
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
              }
            : undefined,
    };
};
