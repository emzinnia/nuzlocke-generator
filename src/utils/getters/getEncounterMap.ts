import { Game, locations } from "utils";
import { getGameRegion, Region } from "./getGameRegion";
import { Generation, getGameGeneration } from "./getGameGeneration";

export function getEncounterMap(game: Game) {
    const region = getGameRegion(game);
    const generation = getGameGeneration(game);

    if (region === Region.Kanto && generation === Generation.Gen1) {
        return locations.Kanto;
    }

    if (region === Region.Kanto && generation === Generation.Gen3) {
        return [...locations.Kanto, ...locations.Sevii];
    }

    if (region === Region.Johto) {
        return [...locations.Johto, ...locations.Kanto];
    }

    if (region === Region.Hoenn) {
        return locations.Hoenn;
    }

    if (region === Region.Sinnoh) {
        return locations.Sinnoh;
    }

    if (region === Region.Unova) {
        return locations.Unova;
    }

    if (region === Region.Kalos) {
        return locations.Kalos;
    }

    if (region === Region.Alola) {
        return locations.Alola;
    }

    if (region === Region.Galar) {
        return locations.Galar;
    }

    if (region === Region.Orre) {
        return locations.Orre;
    }

    if (region === Region.Paldea) {
        return locations.Paldea;
    }

    if (region === Region.LumioseCity) {
        return locations.LumioseCity;
    }

    return ["This game does not have location info."];

    // return {
    //     areas: [
    //         {
    //             name: 'Pallet Town',
    //             pokemon: [
    //                 {
    //                     type: 'starter',
    //                     list: ['Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu']
    //                 },
    //                 {
    //                     type: 'fishing',
    //                     list: ['Magikarp', 'Poliwag', 'Goldeen', 'Tentacool', 'Staryu']
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'Route 1',
    //             pokemon: [
    //                 {
    //                     type: 'grass',
    //                     list: ['Pidgey', 'Rattata']
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'Viridian City',
    //             pokemon: [
    //                 {
    //                     type: 'fishing',
    //                     list: ['Magikarp', 'Poliwag', 'Goldeen', 'Tentacool'],
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'Route 2',
    //             pokemon: [
    //                 {
    //                     type: 'grass',
    //                     list: ['Caterpie', 'Weedle', 'Pidgey', 'Rattata', 'Nidoran♀', 'Nidoran♂'],
    //                 },
    //                 {
    //                     type: 'trade',
    //                     list: ['Mr. Mime']
    //                 }
    //             ]
    //         },
    //         {
    //             name: 'Sunyshore City',
    //             pokemon: []
    //         }
    //     ],
    // };
}
