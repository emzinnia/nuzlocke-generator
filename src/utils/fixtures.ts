import { generateEmptyPokemon } from "./generateEmptyPokemon";
import { Types } from "./Types";
import { Moves } from "components/Pokemon/TeamPokemon/Moves";
import { Forme } from "./Forme";
import { matchSpeciesToTypes } from "./formatters/matchSpeciesToTypes";
import { Pokemon } from "models";

export type PokemonFixtures = Record<
    "Pikachu" | "Dragonite" | "MegaMewtwoX" | "ShinyCorsola" | "CustomPokemon",
    Pokemon
>;

export const PokemonFixtures: PokemonFixtures = {
    Pikachu: {
        ...generateEmptyPokemon(),
        species: "Pikachu",
        nickname: "Sparky",
        types: [Types.Electric, Types.Electric],
    },
    Dragonite: {
        ...generateEmptyPokemon(),
        species: "Dragonite",
        nickname: "Buff the Dragon",
        types: [Types.Dragon, Types.Flying],
        moves: ["Outrage", "Wing Attack", "Flamethrower", "Blizzard"],
    },
    MegaMewtwoX: {
        ...generateEmptyPokemon(),
        species: "Mewtwo",
        nickname: "Clone",
        forme: Forme["Mega-X"],
        types: matchSpeciesToTypes("Mewtwo", "Mega-X"),
        moves: [
            "Psystrike",
            "Ice Punch",
            "Fire Punch",
            "Earthquake",
            "Bulk Up",
        ],
        item: "Mewtonite-X",
    },
    ShinyCorsola: {
        ...generateEmptyPokemon(),
        species: "Corsola",
        shiny: true,
        nickname: "Coraline",
        types: [Types.Rock, Types.Water],
    },
    CustomPokemon: {
        ...generateEmptyPokemon(),
        species: "Nutto",
        nickname: "Meltan",
        customImage: "",
        customIcon: "",
        moves: ["Corkscrew Crash", "Transform", "Ice Beam", "New Move"],
    },
};

export const TeamFixture = [
    PokemonFixtures.Pikachu,
    PokemonFixtures.Dragonite,
    PokemonFixtures.MegaMewtwoX,
    PokemonFixtures.ShinyCorsola,
];

export const BoxedFixtures = {
    Pikachu: {
        ...PokemonFixtures.Pikachu,
        status: "Dead",
    },
};
