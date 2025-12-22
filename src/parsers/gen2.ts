import * as fs from "fs";
import {
    HELD_ITEM,
    GEN_2_POKEMON_MAP,
    GEN_2_CHARACTER_MAP,
    MOVES_ARRAY,
    splitUp,
    GEN_2_LOCATIONS,
} from "./utils";
import { Buffer } from "buffer";
import { Forme } from "utils/Forme";
import { getBadges } from "utils/getters/getBadges";
import { matchSpeciesToTypes } from "utils/formatters/matchSpeciesToTypes";
import type { Species } from "utils/data/listOfPokemon";
import { Pokemon } from "models";
import { parseTime } from "./utils/parseTime";
import { ParserOptions } from "./utils/parserOptions";

// Offset	Contents	Size
// 0x00	Index number of the species	1 byte
// 0x01	Index number of held item	1 byte
// 0x02	Index number of move 1	1 byte
// 0x03	Index number of move 2	1 byte
// 0x04	Index number of move 3	1 byte
// 0x05	Index number of move 4	1 byte
// 0x06	Original Trainer ID number	2 bytes
// 0x08	Experience points	3 bytes
// 0x0B	HP EV data	2 bytes
// 0x0D	Attack EV data	2 bytes
// 0x0F	Defense EV data	2 bytes
// 0x11	Speed EV data	2 bytes
// 0x13	Special EV data	2 bytes
// 0x15	IV data	2 bytes
// 0x17	Move 1's PP values	1 byte
// 0x18	Move 2's PP values	1 byte
// 0x19	Move 3's PP values	1 byte
// 0x1A	Move 4's PP values	1 byte
// 0x1B	Friendship	1 byte
// 0x1C	Pokérus	1 byte
// 0x1D	Caught data	2 bytes
// 0x1F	Level	1 byte
// 0x20	Status condition	1 byte
// 0x21	Unused byte	1 byte
// 0x22	Current HP	2 bytes
// 0x24	Maximum HP	2 bytes
// 0x26	Attack	2 bytes
// 0x28	Defense	2 bytes
// 0x2A	Speed	2 bytes
// 0x2C	Special Attack	2 bytes
// 0x2E	Special Defense	2 bytes

export interface Gen2PokemonObject {
    entriesUsed: number;
    speciesList: string[];
    pokemonList: Pick<
        Pokemon,
        | "species"
        | "level"
        | "moves"
        | "id"
        | "item"
        | "extraData"
        | "shiny"
        | "met"
        | "metLevel"
        | "forme"
    >[];
    pokemonNames: string[];
}

const OFFSETS = {
    PLAYER_ID: [0x2009, 0x2009 + 2],
    PLAYER_NAME: [0x200b, 0x200b + 11],
    PLAYER_MONEY: [0x23db, 0x23db + 3],
    RIVAL_NAME: [0x2013, 0x2013 + 11],
    TIME_PLAYED: [0x2053, 0x2053 + 4],
    JOHTO_BADGES: [0x23e4, 0x23e4 + 2],
    CURRENT_PC_BOX_NUMBER: [0x2724, 0x2724 + 1],
    TEAM_POKEMON_LIST: [0x288a, 0x288a + 428],
    CURRENT_BOX_POKEMON_LIST: [0x2d6c, 0x2d6c + 1102],
    PC_BOXES_POKEMON_LIST: [0x4000, 0x4000 + 1102 * 14],
    POKEMON_NAMES: [0x1b0b74, 0x1b0b74 + 256 * 10],
    BOXES: [
        [0x4000, 0x4000 + 1102],
        [0x4450, 0x4450 + 1102],
        [0x48a0, 0x48a0 + 1102],
        [0x4cf0, 0x4cf0 + 1102],
        [0x5140, 0x5140 + 1102],
        [0x5590, 0x5590 + 1102],
        [0x59e0, 0x59e0 + 1102],
        [0x6000, 0x6000 + 1102],
        [0x6450, 0x6450 + 1102],
        [0x68a0, 0x68a0 + 1102],
        [0x6cf0, 0x6cf0 + 1102],
        [0x7140, 0x7140 + 1102],
        [0x7590, 0x7590 + 1102],
        [0x79e0, 0x79e0 + 1102],
    ],
};

const CRYSTAL_OFFSETS = {
    PLAYER_MONEY: [0x23dc, 0x23dc + 3],
    JOHTO_BADGES: [0x23e5, 0x23e5 + 2],
    CURRENT_PC_BOX_NUMBER: [0x2700, 0x2700 + 1],
    TEAM_POKEMON_LIST: [0x2865, 0x2865 + 428],
    CURRENT_BOX_POKEMON_LIST: [0x2d10, 0x2d10 + 1102],
    PLAYER_GENDER: [0x3e3d, 0x3e3d + 1],
    POKEMON_NAMES: [0x53384, 0x53384 + 256 * 10],
};

function buf2hex(buffer: Buffer) {
    return [...new Uint8Array(buffer)]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
}

// Caught data is only generated in Crystal but transferrable across versions
const readCaughtData = (data: Buffer) => {
    const buf = Buffer.from(data);
    // @NOTE: buffer.map() coerces types
    const [binaryA, binaryB]: string[] = [
        buf[0].toString(2).padStart(8, "0"),
        buf[1].toString(2).padStart(8, "0"),
    ];

    if (binaryA === "0" && binaryB === "0")
        return {
            level: undefined,
            timeOfDay: undefined,
            location: undefined,
            otGender: undefined,
        };
    const level = Number.parseInt(binaryA.slice(1, 7), 2);
    const timeDigit = Number.parseInt(binaryA.slice(0, 1), 2);
    const timeMap = {
        1: "morning",
        2: "day",
        3: "night",
    };
    const timeOfDay = timeMap[timeDigit];
    const otGender = binaryB[0] ? "M" : "F";
    const locationAddress = Number.parseInt(binaryB.slice(1), 2)
        .toString(16)
        .toUpperCase();
    const location = GEN_2_LOCATIONS?.[locationAddress];
    console.log(
        "parser - location",
        location,
        binaryB.slice(1),
        locationAddress,
    );

    return {
        timeOfDay,
        level,
        location,
        otGender,
    };
};

// In Generation II, Unown's letter is taken from the combination of the center two bits of the Attack, Defense, Speed and Special IV nibbles. This combination is then divided by ten, and the result is rounded down (floor[]) to only include the integer part of the number. This integer will range from 0-25, corresponding to a letter in the Latin alphabet, which will be the Unown's letter (where 0=A, 1=B, 2=C, ..., 23=X, 24=Y, 25=Z).

// In Generation II, due to this method of calculating Unown's letter and the way that Shiny Pokémon are determined, a Shiny Unown can only exist in the shape of the letter I or V. Additionally, due to this method of calculating Unown's letter, only 6 combinations correspond to Unown Z, whereas 10 combinations correspond to every other Unown, making Unown Z less common.

// In Generation III, Unown's letter is determined by the Pokémon's personality value. From Generation IV onward, it is determined by a separate form identifier. Generation III also introduced Unown '!' or '?'.

// Array index access for Unown formes
const unownFormes = [
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
];

const determineUnownForme = (ivs: Buffer): Forme => {
    const part1 = ivs[0].toString(2).padStart(8, "0");
    const part2 = ivs[1].toString(2).padStart(8, "0");
    const atk = part1.slice(0, 4).slice(1, 3);
    const def = part1.slice(4).slice(1, 3);
    const speed = part2.slice(0, 4).slice(1, 3);
    const special = part2.slice(4).slice(1, 3);
    const comboString = atk + def + speed + special;
    const formeId = Math.floor(Number.parseInt(comboString, 2) / 10);

    return unownFormes?.[formeId]?.toUpperCase() as Forme;
};

// const badgesBinary = (badgesByte >>> 0).toString(2);
//     const badges = badgesBinary
//         .split('')
//         .map((bit, index) => {
//             return parseInt(bit) ? badgesPossible[index] : null;
//         })
//         .filter((badge) => badge);

// Its Defense, Speed, and Special IVs are all 10.
// Its Attack IV is 2, 3, 6, 7, 10, 11, 14, or 15.
// The HP IV is calculated by taking the least significant bit (the final binary digit) of the Attack, Defense, Speed, and Special IVs, then creating a binary string by placing them in that order. As such, a Pokémon with an odd-number Attack IV has 8 added to its HP IV, an odd-number Defense IV has 4 added, an odd-number Speed IV has 2 added, and an odd-number Special IV has 1 added.

interface Ivs {
    atk: number;
    def: number;
    special: number;
    speed: number;
    hp: number;
}

const getIvs = (ivs: Buffer): Ivs => {
    const part1 = ivs[0].toString(2).padStart(8, "0");
    const part2 = ivs[1].toString(2).padStart(8, "0");
    const atk = parseInt(part1.slice(0, 4), 2);
    const def = parseInt(part1.slice(4, 8), 2);
    const speed = parseInt(part2.slice(0, 4), 2);
    const special = parseInt(part2.slice(4, 8), 2);
    const hp = parseInt(part1[3] + part1[7] + part2[3] + part2[7], 2);

    return {
        atk,
        def,
        speed,
        special,
        hp,
    };
};

const isShiny = (ivs: Buffer): boolean => {
    const { atk, def, special, speed } = getIvs(ivs);

    if (
        [2, 3, 6, 7, 10, 11, 14, 15].includes(atk) &&
        def === 10 &&
        speed === 10 &&
        special === 10
    ) {
        return true;
    } else {
        return false;
    }
};

const to16BitInt = (buf: Buffer) => Buffer.from(buf).readInt16BE(0);

const parsePokemon = (
    buf: Buffer,
    boxed = false,
): Gen2PokemonObject["pokemonList"][number] => {
    const pokemon = Buffer.from(buf);
    const species = GEN_2_POKEMON_MAP[pokemon[0x00]];
    const item = HELD_ITEM[pokemon[0x01]];
    const moves = [
        MOVES_ARRAY[pokemon[0x02]],
        MOVES_ARRAY[pokemon[0x03]],
        MOVES_ARRAY[pokemon[0x04]],
        MOVES_ARRAY[pokemon[0x05]],
    ];
    const friendship = pokemon[0x1b];

    let caughtData;
    if (!boxed) {
        caughtData = readCaughtData(pokemon.slice(0x1d, 0x1d + 2));
    } else {
        caughtData = { level: undefined, location: undefined };
    }
    // const caughtData = readCaughtData(pokemon.slice(0x1d, 0x1d + 2));
    const expData = boxed
        ? undefined
        : to16BitInt(pokemon.slice(0x08, 0x08 + 3));

    const level = pokemon[0x1f];
    const id = pokemon.toString("binary");
    const ivs = pokemon.slice(0x15, 0x15 + 2);
    const unownForme =
        species === "Unown" ? determineUnownForme(ivs) : undefined;
    const shiny = isShiny(Buffer.from(ivs));

    const extraData = boxed
        ? {}
        : {
              currentHp: to16BitInt(pokemon.slice(0x22, 0x22 + 2)),
              maxHp: to16BitInt(pokemon.slice(0x24, 0x24 + 2)),
              attack: to16BitInt(pokemon.slice(0x26, 0x26 + 2)),
              defense: to16BitInt(pokemon.slice(0x28, 0x28 + 2)),
              speed: to16BitInt(pokemon.slice(0x2a, 0x2a + 2)),
              specialAttack: to16BitInt(pokemon.slice(0x2c, 0x2c + 2)),
              specialDefense: to16BitInt(pokemon.slice(0x2e, 0x2e + 2)),
          };

    return {
        species,
        level,
        moves,
        id,
        item,
        shiny,
        forme: unownForme,
        met: caughtData.location,
        metLevel: caughtData.level,
        extraData: {
            friendship,
            expData,
            caughtData,
            ...extraData,
        },
    };
};

const getSpeciesList = (buf: Buffer) => {
    const str: any[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] === 0xff) {
            break;
        } else {
            str.push(GEN_2_POKEMON_MAP[buf[i]] || "MISSINGNO");
        }
    }
    return str;
};

const getPokemonList = (
    buf: Buffer,
    entries: number = 6,
    boxed: boolean = false,
) => {
    const party = splitUp(Buffer.from(buf), entries);
    const pokes = party.map((box) => parsePokemon(box, boxed));
    return pokes;
};

const getPokemonNames = (buf: Buffer, entries: number = 6) => {
    const names = splitUp(Buffer.from(buf), entries);
    const pokes = names.map((name) => convertWithCharMap(name, true));
    return pokes;
};

const parseJohtoBadges = (buf: Buffer) => {
    const bits =
        buf[0].toString(2).padStart(8, "0") +
        buf[1].toString(2).padStart(8, "0");
    const badges = getBadges("Gold"); // Doesn't matter as long as it's gen 2
    const badgesObtainedMap = bits.split("").map((badge) => {
        return badge === "1" ? true : false;
    });
    const badgesFiltered = badges.filter((badge, idx) => {
        return badgesObtainedMap[idx];
    });
    return badgesFiltered;
};

const transformPokemon = (
    pokemonObject: Gen2PokemonObject,
    status: string,
    boxIndex: number = 1,
) => {
    return pokemonObject.pokemonList
        .map((poke, index) => {
            return {
                position: (index + 1) * boxIndex,
                species: poke.species,
                status: status,
                level: poke.level,
                types: matchSpeciesToTypes(poke.species as Species),
                moves: poke.moves,
                shiny: poke.shiny,
                forme: poke.forme,
                nickname: pokemonObject.pokemonNames[index],
                met: poke.met,
                metLevel: poke.metLevel,
                id: `${poke.id}-sav`,
                extraData: poke.extraData,
                // @NOTE: A pokemon nicknamed "EGG" would override this and show up as egg: true, but that's your own fault lol
                egg: pokemonObject.pokemonNames[index] === "EGG" ? true : false,
            };
        })
        .filter((poke) => poke.species);
};

const convertWithCharMap = (buf: Buffer, nickname = false) => {
    const str: any[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < buf.length; i++) {
        // tslint:disable-next-line:triple-equals
        if (buf[i] === 0xff || (nickname && buf[i] === 0x50)) break;
        str.push(GEN_2_CHARACTER_MAP[buf[i]] || "");
    }
    return str.join("");
};

const makeFileSlicer = (file) => (offset: number[]) => {
    return file.slice(offset[0], offset[1]);
};

export const parsePokemonList = (
    buf: Buffer,
    entries = 6,
): Gen2PokemonObject => {
    const data = Buffer.from(buf);
    const isBoxed = entries > 6 ? true : false;
    const entriesUsed = data[0x00];
    const speciesListEnd = 0x01 + entries + 1;
    const speciesList = getSpeciesList(
        Buffer.from(data.slice(0x01, speciesListEnd)),
    );
    const pokemonListAddress = speciesListEnd;
    const pokemonListAddressEnd =
        pokemonListAddress + (isBoxed ? 32 : 48) * entries;
    const otsAddress = pokemonListAddressEnd;
    const otsAddressEnd = otsAddress + 11 * entries;
    const pokemonNamesAddress = otsAddressEnd;
    const pokemonNamesAddressEnd = pokemonNamesAddress + 11 * entries;
    const pokemonList = getPokemonList(
        data.slice(pokemonListAddress, pokemonListAddressEnd),
        entries,
        isBoxed,
    );
    const pokemonNames = getPokemonNames(
        data.slice(pokemonNamesAddress, pokemonNamesAddressEnd),
        entries,
    );

    return {
        entriesUsed,
        speciesList,
        pokemonList,
        pokemonNames,
    };
};

const sliceBoxes = (buf: Buffer) => {
    const fileSlice = makeFileSlicer(buf);

    return OFFSETS.BOXES.map((box) => fileSlice(box));
};

export const parseGen2Save = async (file, options: ParserOptions) => {
    const fileSlice = makeFileSlicer(file);

    const name = convertWithCharMap(fileSlice(OFFSETS.PLAYER_NAME));
    const id = fileSlice(OFFSETS.PLAYER_ID)
        .map((char) => char.toString())
        .join("");
    const trainerMoney = options.isCrystal
        ? fileSlice(CRYSTAL_OFFSETS.PLAYER_MONEY)
        : fileSlice(OFFSETS.PLAYER_MONEY);
    const money = parseInt(trainerMoney.map((d) => d.toString(16)).join(""));
    const time = parseTime(fileSlice(OFFSETS.TIME_PLAYED));
    const badges = parseJohtoBadges(
        options.isCrystal
            ? fileSlice(CRYSTAL_OFFSETS.JOHTO_BADGES)
            : fileSlice(OFFSETS.JOHTO_BADGES),
    );
    const currentPCId = options.isCrystal
        ? fileSlice(CRYSTAL_OFFSETS.CURRENT_PC_BOX_NUMBER)
        : fileSlice(OFFSETS.CURRENT_PC_BOX_NUMBER);
    const partyPokemonData = options.isCrystal
        ? fileSlice(CRYSTAL_OFFSETS.TEAM_POKEMON_LIST)
        : fileSlice(OFFSETS.TEAM_POKEMON_LIST);
    const partyPokemon = transformPokemon(
        parsePokemonList(partyPokemonData),
        "Team",
    );
    const boxedPokemon = sliceBoxes(file)
        .map((boxData, boxIndex) => {
            return transformPokemon(
                parsePokemonList(boxData, 20),
                options.boxMappings[boxIndex]["status"],
                boxIndex + 1,
            );
        })
        .flat();

    return {
        trainer: {
            name,
            id,
            time,
            money,
            badges,
        },
        pokemon: [...partyPokemon, ...boxedPokemon],
    };
};
