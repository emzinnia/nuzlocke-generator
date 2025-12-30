import { Types } from "../Types";
import { Generation } from "../getters/getGameGeneration";
import { Forme } from "../Forme";
import { Species } from "../data/listOfPokemon";

const match = ({
    s,
    f,
    g,
    species,
    forme,
    generation,
}: {
    species: string[];
    forme?: (keyof typeof Forme)[];
    generation?: Generation[];
    s: string; // species input
    f?: string;
    g?: Generation;
}) => {
    if (species.includes(s)) {
        if (generation) {
            if (g && generation.includes(g)) {
                // We know f is always a string based off of Forme's type
                if (forme && f && forme.includes(f as any)) {
                    return true;
                } else {
                    if (forme == null) return true;
                    return false;
                }
            } else {
                return false;
            }
        } else {
            // Ibid: We know f is always a string based off of Forme's type
            if (f && forme && forme.includes(f as any)) {
                return true;
            } else {
                return false;
            }
        }
    }
    return false;
};

export const handleSpeciesTypeEdgeCases = ({
    species,
    forme,
    generation,
}: {
    species: Species;
    forme?: keyof typeof Forme;
    generation?: Generation;
}): [Types, Types] | null => {
    const s = species;
    const f = forme || undefined;
    const g = generation || undefined;
    const data = { s, f, g };
    if (
        match({
            ...data,
            species: ["Rattata", "Raticate"],
            forme: ["Alolan"],
        })
    )
        return [Types.Dark, Types.Normal];

    if (
        match({
            ...data,
            species: ["Raichu"],
            forme: ["Alolan"],
        })
    )
        return [Types.Electric, Types.Psychic];

    if (
        match({
            ...data,
            species: ["Sandslash", "Sandshrew"],
            forme: ["Alolan"],
        })
    )
        return [Types.Ice, Types.Steel];

    if (
        match({
            ...data,
            species: ["Vulpix"],
            forme: ["Alolan"],
        })
    )
        return [Types.Ice, Types.Ice];

    if (
        match({
            ...data,
            species: ["Ninetales"],
            forme: ["Alolan"],
        })
    )
        return [Types.Ice, Types.Fairy];

    if (
        match({
            ...data,
            species: ["Diglett", "Dugtrio"],
            forme: ["Alolan"],
        })
    )
        return [Types.Ground, Types.Steel];

    if (
        match({
            ...data,
            species: ["Meowth", "Persian"],
            forme: ["Alolan"],
        })
    )
        return [Types.Dark, Types.Dark];

    if (
        match({
            ...data,
            species: ["Geodude", "Graveler", "Golem"],
            forme: ["Alolan"],
        })
    )
        return [Types.Rock, Types.Electric];

    if (
        match({
            ...data,
            species: ["Meowth"],
            forme: ["Galarian"],
        })
    )
        return [Types.Steel, Types.Steel];

    if (
        match({
            ...data,
            species: ["Ponyta"],
            forme: ["Galarian"],
        })
    )
        return [Types.Psychic, Types.Psychic];

    if (
        match({
            ...data,
            species: ["Rapidash"],
            forme: ["Galarian"],
        })
    )
        return [Types.Fairy, Types.Psychic];

    if (
        match({
            ...data,
            species: ["Farfetch'd"],
            forme: ["Galarian"],
        })
    )
        return [Types.Fighting, Types.Fighting];

    if (
        match({
            ...data,
            species: ["Weezing"],
            forme: ["Galarian"],
        })
    )
        return [Types.Poison, Types.Fairy];

    if (
        match({
            ...data,
            species: ["Mr. Mime"],
            forme: ["Galarian"],
        })
    )
        return [Types.Ice, Types.Psychic];

    if (
        match({
            ...data,
            species: ["Corsola"],
            forme: ["Galarian"],
        })
    )
        return [Types.Ghost, Types.Ghost];

    if (
        match({
            ...data,
            species: ["Zigzagoon", "Linoone"],
            forme: ["Galarian"],
        })
    )
        return [Types.Dark, Types.Normal];

    if (
        match({
            ...data,
            species: ["Darumaka", "Darmanitan"],
            forme: ["Galarian"],
        })
    )
        return [Types.Ice, Types.Ice];

    if (
        match({
            ...data,
            species: ["Yamask"],
            forme: ["Galarian"],
        })
    )
        return [Types.Ground, Types.Ghost];

    if (
        match({
            ...data,
            species: ["Stunfisk"],
            forme: ["Galarian"],
        })
    )
        return [Types.Ground, Types.Steel];

    if (
        match({
            ...data,
            species: ["Marowak"],
            forme: ["Alolan"],
        })
    )
        return [Types.Ghost, Types.Fire];

    if (
        match({
            ...data,
            species: ["Slowpoke"],
            forme: ["Galarian"],
        })
    )
        return [Types.Psychic, Types.Psychic];

    if (
        match({
            ...data,
            species: ["Slowbro", "Slowking"],
            forme: ["Galarian"],
        })
    )
        return [Types.Poison, Types.Psychic];

    if (
        match({
            ...data,
            species: ["Zapdos"],
            forme: ["Galarian"],
        })
    )
        return [Types.Fighting, Types.Flying];

    if (
        match({
            ...data,
            species: ["Articuno"],
            forme: ["Galarian"],
        })
    )
        return [Types.Psychic, Types.Flying];

    if (
        match({
            ...data,
            species: ["Moltres"],
            forme: ["Galarian"],
        })
    )
        return [Types.Dark, Types.Flying];

    if (
        match({
            ...data,
            species: ["Calyrex"],
            forme: ["IceRider"],
        })
    )
        return [Types.Psychic, Types.Ice];

    if (
        match({
            ...data,
            species: ["Calyrex"],
            forme: ["ShadowRider"],
        })
    )
        return [Types.Psychic, Types.Ghost];

    if (
        match({
            ...data,
            species: [
                "Clefairy",
                "Clefable",
                "Cleffa",
                "Togepi",
                "Jigglypuff",
                "Wigglytuff",
            ],
            generation: [
                Generation.Gen1,
                Generation.Gen2,
                Generation.Gen3,
                Generation.Gen4,
                Generation.Gen5,
            ],
        })
    )
        return [Types.Normal, Types.Normal];

    if (
        match({
            ...data,
            species: ["Togetic", "Togekiss"],
            generation: [
                Generation.Gen1,
                Generation.Gen2,
                Generation.Gen3,
                Generation.Gen4,
                Generation.Gen5,
            ],
        })
    )
        return [Types.Normal, Types.Flying];

    if (
        match({
            ...data,
            species: ["Ralts", "Kirlia", "Gardevoir", "Mr. Mime", "Mime Jr."],
            generation: [
                Generation.Gen1,
                Generation.Gen2,
                Generation.Gen3,
                Generation.Gen4,
                Generation.Gen5,
            ],
        })
    )
        return [Types.Psychic, Types.Psychic];

    if (
        match({
            ...data,
            species: ["Mawile"],
            generation: [
                Generation.Gen1,
                Generation.Gen2,
                Generation.Gen3,
                Generation.Gen4,
                Generation.Gen5,
            ],
        })
    )
        return [Types.Steel, Types.Steel];

    if (
        match({
            ...data,
            species: ["Cottonee", "Whimsicott"],
            generation: [Generation.Gen5],
        })
    )
        return [Types.Grass, Types.Grass];

    if (
        match({
            ...data,
            species: ["Shaymin"],
            forme: ["Sky"],
        })
    ) {
        return [Types.Grass, Types.Flying];
    }

    if (
        match({
            ...data,
            species: ["Rotom"],
            forme: ["Mow"],
        })
    ) {
        return [Types.Electric, Types.Grass];
    }

    if (
        match({
            ...data,
            species: ["Rotom"],
            forme: ["Wash"],
        })
    ) {
        return [Types.Electric, Types.Water];
    }

    if (
        match({
            ...data,
            species: ["Rotom"],
            forme: ["Frost"],
        })
    ) {
        return [Types.Electric, Types.Ice];
    }

    if (
        match({
            ...data,
            species: ["Rotom"],
            forme: ["Fan"],
        })
    ) {
        return [Types.Electric, Types.Flying];
    }

    if (
        match({
            ...data,
            species: ["Rotom"],
            forme: ["Heat"],
        })
    ) {
        return [Types.Electric, Types.Fire];
    }

    if (
        match({
            ...data,
            species: ["Castform"],
            forme: ["Sunny"],
        })
    ) {
        return [Types.Fire, Types.Fire];
    }

    if (
        match({
            ...data,
            species: ["Castform"],
            forme: ["Hail"],
        })
    ) {
        return [Types.Ice, Types.Ice];
    }

    if (
        match({
            ...data,
            species: ["Castform"],
            forme: ["Rainy"],
        })
    ) {
        return [Types.Water, Types.Water];
    }

    if (
        match({
            ...data,
            species: ["Wormadam"],
            forme: ["Sandy"],
        })
    ) {
        return [Types.Bug, Types.Ground];
    }

    if (
        match({
            ...data,
            species: ["Wormadam"],
            forme: ["Trash"],
        })
    ) {
        return [Types.Bug, Types.Steel];
    }

    if (
        match({
            ...data,
            species: ["Oricorio"],
            forme: ["Baile"],
        })
    ) {
        return [Types.Fire, Types.Flying];
    }

    if (
        match({
            ...data,
            species: ["Oricorio"],
            forme: ["Pa'u"],
        })
    ) {
        return [Types.Psychic, Types.Flying];
    }

    if (
        match({
            ...data,
            species: ["Oricorio"],
            forme: ["Pom-Pom"],
        })
    ) {
        return [Types.Electric, Types.Flying];
    }

    if (
        match({
            ...data,
            species: ["Oricorio"],
            forme: ["Sensu"],
        })
    ) {
        return [Types.Ghost, Types.Flying];
    }

    if (
        match({
            ...data,
            species: ["Meloetta"],
            forme: ["Pirouette"],
        })
    ) {
        return [Types.Normal, Types.Fighting];
    }

    if (match({ ...data, species: ["Growlithe"], forme: ["Hisuian"] })) {
        return [Types.Fire, Types.Rock];
    }

    if (match({ ...data, species: ["Voltorb"], forme: ["Hisuian"] })) {
        return [Types.Electric, Types.Grass];
    }

    if (match({ ...data, species: ["Zorua", "Zoroark"], forme: ["Hisuian"] })) {
        return [Types.Normal, Types.Ghost];
    }

    if (match({ ...data, species: ["Braviary"], forme: ["Hisuian"] })) {
        return [Types.Psychic, Types.Flying];
    }

    if (match({ ...data, species: ["Sneasel"], forme: ["Hisuian"] })) {
        return [Types.Fighting, Types.Poison];
    }

    if (match({ ...data, species: ["Qwilfish"], forme: ["Hisuian"] })) {
        return [Types.Dark, Types.Poison];
    }

    if (match({ ...data, species: ["Wooper"], forme: ["Paldean"] })) {
        return [Types.Poison, Types.Ground];
    }

    if (match({ ...data, species: ["Tauros"], forme: ["Paldean"] })) {
        return [Types.Fighting, Types.Fighting];
    }

    if (match({ ...data, species: ["Tauros"], forme: ["Paldean-Blaze"] })) {
        return [Types.Fighting, Types.Fire];
    }

    if (match({ ...data, species: ["Tauros"], forme: ["Paldean-Aqua"] })) {
        return [Types.Fighting, Types.Water];
    }

    if (match({ ...data, species: ["Ogerpon"], forme: ["Wellspring"] })) {
        return [Types.Grass, Types.Water];
    }

    if (match({ ...data, species: ["Ogerpon"], forme: ["Heartflame"] })) {
        return [Types.Grass, Types.Fire];
    }

    if (match({ ...data, species: ["Ogerpon"], forme: ["Cornerstone"] })) {
        return [Types.Grass, Types.Rock];
    }

    return null;
};

export const matchSpeciesToTypes = (
    species: Species,
    forme?: keyof typeof Forme,
    generation?: Generation
): [Types, Types] => {
    const result = handleSpeciesTypeEdgeCases({ species, forme, generation });
    if (result) return result;
    switch (species) {
        /**
         * @type Grass Types
         */
        case "Bulbasaur":
        case "Ivysaur":
        case "Venusaur":
        case "Roselia":
        case "Budew":
        case "Roserade":
        case "Oddish":
        case "Gloom":
        case "Vileplume":
        case "Bellsprout":
        case "Weepinbell":
        case "Victreebel":
        case "Foongus":
        case "Amoonguss":
            return [Types.Grass, Types.Poison];
        case "Tangela":
        case "Tangrowth":
        case "Chikorita":
        case "Bayleef":
        case "Meganium":
        case "Sunkern":
        case "Sunflora":
        case "Treecko":
        case "Grovyle":
        case "Sceptile":
        case "Bellossom":
        case "Snivy":
        case "Servine":
        case "Serperior":
        case "Cherubi":
        case "Cherrim":
        case "Petilil":
        case "Lilligant":
        case "Maractus":
        case "Leafeon":
        case "Turtwig":
        case "Grotle":
        case "Carnivine":
        case "Fomantis":
        case "Lurantis":
        case "Grookey":
        case "Thwackey":
        case "Rillaboom":
        case "Gossifleur":
        case "Eldegoss":
        case "Shaymin":
        case "Pansage":
        case "Simisage":
        case "Chespin":
        case "Quilladin":
        case "Skiddo":
        case "Gogoat":
        case "Ogerpon":
            return [Types.Grass, Types.Grass];
        case "Torterra":
            return [Types.Grass, Types.Ground];
        case "Hoppip":
        case "Skiploom":
        case "Jumpluff":
        case "Rowlet":
        case "Dartrix":
            return [Types.Grass, Types.Flying];
        case "Decidueye":
        case "Poltchageist":
        case "Sinistcha":
            return [Types.Grass, Types.Ghost];
        /**
         * @type Fire Types
         */
        case "Charmander":
        case "Charmeleon":
        case "Vulpix":
        case "Ninetales":
        case "Growlithe":
        case "Arcanine":
        case "Ponyta":
        case "Rapidash":
        case "Magmar":
        case "Flareon":
        case "Cyndaquil":
        case "Quilava":
        case "Typhlosion":
        case "Slugma":
        case "Magby":
        case "Entei":
        case "Torchic":
        case "Torkoal":
        case "Chimchar":
        case "Magmortar":
        case "Tepig":
        case "Pansear":
        case "Simisear":
        case "Darumaka":
        case "Darmanitan":
        case "Heatmor":
        case "Fennekin":
        case "Braixen":
        case "Litten":
        case "Torracat":
        case "Scorbunny":
        case "Raboot":
        case "Cinderace":
        case "Fuecoco":
        case "Crocalor":
            return [Types.Fire, Types.Fire];
        case "Charizard":
        case "Moltres":
        case "Ho-Oh":
        case "Fletchinder":
        case "Talonflame":
            return [Types.Fire, Types.Flying];
        case "Meowscarada":
            return [Types.Grass, Types.Dark];
        case "Skeledirge":
            return [Types.Fire, Types.Ghost];
        case "Quaquaval":
            return [Types.Water, Types.Fighting];
        case "Lechonk":
        case "Oinkologne":
        case "Tandemaus":
        case "Maushold":
        case "Dudunsparce":
        case "Castform":
            return [Types.Normal, Types.Normal];
        case "Tarountula":
        case "Spidops":
        case "Nymble":
            return [Types.Bug, Types.Bug];
        case "Lokix":
            return [Types.Bug, Types.Dark];
        case "Pawmi":
            return [Types.Electric, Types.Electric];
        case "Pawmo":
        case "Pawmot":
            return [Types.Electric, Types.Fighting];
        case "Fidough":
        case "Dachsbun":
            return [Types.Fairy, Types.Fairy];
        case "Smoliv":
        case "Dolliv":
        case "Arboliva":
            return [Types.Grass, Types.Normal];
        case "Squawkabilly":
            return [Types.Normal, Types.Flying];
        case "Nacli":
        case "Naclstack":
        case "Garganacl":
        case "Klawf":
            return [Types.Rock, Types.Rock];
        case "Charcadet":
            return [Types.Fire, Types.Fire];
        case "Armarouge":
            return [Types.Fire, Types.Psychic];
        case "Ceruledge":
            return [Types.Fire, Types.Ghost];
        case "Tadbulb":
        case "Bellibolt":
            return [Types.Electric, Types.Electric];
        case "Wattrel":
        case "Kilowattrel":
            return [Types.Electric, Types.Flying];
        case "Maschiff":
        case "Mabosstiff":
            return [Types.Dark, Types.Dark];
        case "Shroodle":
        case "Grafaiai":
            return [Types.Poison, Types.Normal];
        case "Bramblin":
        case "Brambleghast":
            return [Types.Grass, Types.Ghost];
        case "Toedscool":
        case "Toedscruel":
            return [Types.Ground, Types.Grass];
        case "Capsakid":
            return [Types.Grass, Types.Grass];
        case "Scovillain":
            return [Types.Grass, Types.Fire];
        case "Rellor":
            return [Types.Bug, Types.Bug];
        case "Rabsca":
            return [Types.Bug, Types.Psychic];
        case "Flittle":
        case "Espathra":
            return [Types.Psychic, Types.Psychic];
        case "Tinkaton":
        case "Tinkatink":
        case "Tinkatuff":
            return [Types.Fairy, Types.Steel];
        case "Wiglett":
        case "Wugtrio":
        case "Finizen":
        case "Palafin":
        case "Dondozo":
            return [Types.Water, Types.Water];
        case "Bombirdier":
            return [Types.Flying, Types.Dark];
        case "Varoom":
        case "Revavroom":
            return [Types.Steel, Types.Poison];
        case "Cyclizar":
            return [Types.Dragon, Types.Normal];
        case "Orthworm":
            return [Types.Steel, Types.Steel];
        case "Glimmet":
        case "Glimmora":
            return [Types.Rock, Types.Poison];
        case "Greavard":
        case "Houndstone":
        case "Gimmighoul":
            return [Types.Ghost, Types.Ghost];
        case "Flamigo":
            return [Types.Flying, Types.Fighting];
        case "Cetoddle":
        case "Cetitan":
            return [Types.Ice, Types.Ice];
        case "Veluza":
            return [Types.Water, Types.Psychic];
        case "Tatsugiri":
            return [Types.Dragon, Types.Water];
        case "Annihilape":
            return [Types.Fighting, Types.Ghost];
        case "Clodsire":
            return [Types.Poison, Types.Ground];
        case "Farigiraf":
            return [Types.Normal, Types.Psychic];
        case "Kingambit":
            return [Types.Dark, Types.Steel];
        case "Great Tusk":
            return [Types.Ground, Types.Fighting];
        case "Scream Tail":
            return [Types.Fairy, Types.Psychic];
        case "Brute Bonnet":
            return [Types.Grass, Types.Dark];
        case "Flutter Mane":
            return [Types.Ghost, Types.Fairy];
        case "Slither Wing":
            return [Types.Bug, Types.Fighting];
        case "Sandy Shocks":
            return [Types.Electric, Types.Ground];
        case "Iron Treads":
            return [Types.Ground, Types.Steel];
        case "Iron Bundle":
            return [Types.Ice, Types.Water];
        case "Iron Hands":
            return [Types.Fighting, Types.Electric];
        case "Iron Moth":
            return [Types.Fire, Types.Poison];
        case "Frigibax":
        case "Arctibax":
        case "Baxcalibur":
            return [Types.Dragon, Types.Ice];
        case "Gholdengo":
            return [Types.Steel, Types.Ghost];
        case "Wo-Chien":
            return [Types.Dark, Types.Grass];
        case "Chien-Pao":
            return [Types.Dark, Types.Ice];
        case "Ting-Lu":
            return [Types.Dark, Types.Ground];
        case "Chi-Yu":
            return [Types.Dark, Types.Fire];
        case "Roaring Moon":
            return [Types.Dragon, Types.Dark];
        case "Iron Valiant":
            return [Types.Fairy, Types.Fighting];
        case "Koraidon":
            return [Types.Fighting, Types.Dragon];
        case "Miraidon":
            return [Types.Electric, Types.Dragon];
        case "Iron Thorns":
            return [Types.Steel, Types.Electric];
        case "Iron Jugulis":
            return [Types.Flying, Types.Dark];
        /**
         * @type Water Type
         */
        case "Squirtle":
        case "Wartortle":
        case "Blastoise":
        case "Psyduck":
        case "Golduck":
        case "Poliwag":
        case "Poliwhirl":
        case "Seel":
        case "Shellder":
        case "Krabby":
        case "Kingler":
        case "Horsea":
        case "Seadra":
        case "Goldeen":
        case "Seaking":
        case "Staryu":
        case "Magikarp":
        case "Vaporeon":
        case "Totodile":
        case "Croconaw":
        case "Feraligatr":
        case "Politoed":
        case "Remoraid":
        case "Octillery":
        case "Suicune":
        case "Mudkip":
        case "Wailmer":
        case "Wailord":
        case "Corphish":
        case "Feebas":
        case "Milotic":
        case "Clamperl":
        case "Huntail":
        case "Gorebyss":
        case "Luvdisc":
        case "Kyogre":
        case "Piplup":
        case "Prinplup":
        case "Buizel":
        case "Floatzel":
        case "Shellos":
        case "Finneon":
        case "Lumineon":
        case "Phione":
        case "Manaphy":
        case "Oshawott":
        case "Dewott":
        case "Samurott":
        case "Panpour":
        case "Simipour":
        case "Tympole":
        case "Basculin":
        case "Alomomola":
        case "Froakie":
        case "Frogadier":
        case "Clauncher":
        case "Clawitzer":
        case "Popplio":
        case "Brionne":
        case "Wishiwashi":
        case "Pyukumuku":
        case "Sobble":
        case "Drizzile":
        case "Inteleon":
        case "Quaxly":
        case "Quaxwell":
            return [Types.Water, Types.Water];
        case "Slowpoke":
        case "Slowbro":
        case "Slowking":
        case "Starmie":
            return [Types.Water, Types.Psychic];
        case "Gyarados":
        case "Mantine":
            return [Types.Water, Types.Flying];
        /**
         * @type Fighting Type
         */
        case "Mankey":
        case "Primeape":
        case "Machop":
        case "Machoke":
        case "Machamp":
        case "Hitmonlee":
        case "Hitmonchan":
        case "Tyrogue":
        case "Hitmontop":
        case "Makuhita":
        case "Hariyama":
        case "Riolu":
        case "Timburr":
        case "Gurdurr":
        case "Conkeldurr":
        case "Throh":
        case "Sawk":
        case "Mienfoo":
        case "Mienshao":
        case "Pancham":
        case "Crabrawler":
        case "Passimian":
            return [Types.Fighting, Types.Fighting];
        /**
         * @type Flying
         */
        case "Tornadus":
        case "Rookidee":
        case "Corvisquire":
            return [Types.Flying, Types.Flying];
        case "Noibat":
        case "Noivern":
            return [Types.Flying, Types.Dragon];
        /**
         * @type Ground
         */
        case "Sandshrew":
        case "Sandslash":
        case "Diglett":
        case "Dugtrio":
        case "Cubone":
        case "Marowak":
        case "Groudon":
        case "Phanpy":
        case "Donphan":
        case "Trapinch":
        case "Hippopotas":
        case "Hippowdon":
        case "Drilbur":
        case "Mudbray":
        case "Mudsdale":
            return [Types.Ground, Types.Ground];
        /**
         * @type Rock
         */
        case "Geodude":
        case "Graveler":
        case "Golem":
        case "Onix":
        case "Rhyhorn":
        case "Rhydon":
        case "Rhyperior":
            return [Types.Rock, Types.Ground];
        /**
         * @type Ghost
         */
        case "Misdreavus":
        case "Shuppet":
        case "Banette":
        case "Duskull":
        case "Dusclops":
        case "Mismagius":
        case "Dusknoir":
        case "Yamask":
        case "Cofagrigus":
            return [Types.Ghost, Types.Ghost];
        case "Gastly":
        case "Haunter":
        case "Gengar":
            return [Types.Ghost, Types.Poison];
        case "Drifloon":
        case "Drifblim":
            return [Types.Ghost, Types.Flying];
        case "Spiritomb":
            return [Types.Ghost, Types.Dark];
        case "Giratina":
            return [Types.Ghost, Types.Dragon];
        case "Litwick":
        case "Lampent":
        case "Chandelure":
            return [Types.Ghost, Types.Fire];
        case "Phantump":
        case "Trevenant":
        case "Pumpkaboo":
        case "Gourgeist":
        case "Dhelmise":
            return [Types.Ghost, Types.Grass];
        case "Sandygast":
        case "Palossand":
            return [Types.Ghost, Types.Ground];

        case "Shedinja":
            return [Types.Bug, Types.Ghost];
        case "Sableye":
            return [Types.Dark, Types.Ghost];
        case "Rotom":
            return [Types.Electric, Types.Ghost];
        case "Blacephalon":
            return [Types.Fire, Types.Ghost];
        case "Golett":
        case "Golurk":
            return [Types.Ground, Types.Ghost];
        case "Froslass":
            return [Types.Ice, Types.Ghost];
        case "Hoopa":
        case "Lunala":
            return [Types.Psychic, Types.Ghost];
        case "Honedge":
        case "Doublade":
        case "Aegislash":
            return [Types.Steel, Types.Ghost];
        case "Frillish":
        case "Jellicent":
        case "Basculegion":
            return [Types.Water, Types.Ghost];
        /**
         * @type Fighting
         */
        case "Meditite":
        case "Medicham":
            return [Types.Fighting, Types.Psychic];
        case "Sneasler":
            return [Types.Fighting, Types.Poison];
        case "Lucario":
            return [Types.Fighting, Types.Steel];
        case "Pangoro":
            return [Types.Fighting, Types.Dark];
        case "Hawlucha":
            return [Types.Fighting, Types.Flying];
        case "Crabominable":
            return [Types.Fighting, Types.Ice];
        case "Heracross":
        case "Buzzwole":
        case "Pheromosa":
            return [Types.Bug, Types.Fighting];
        case "Scraggy":
        case "Scrafty":
            return [Types.Dark, Types.Fighting];
        case "Hakamo-o":
        case "Kommo-o":
            return [Types.Dragon, Types.Fighting];
        case "Combusken":
        case "Blaziken":
        case "Monferno":
        case "Infernape":
        case "Pignite":
        case "Emboar":
            return [Types.Fire, Types.Fighting];
        case "Breloom":
        case "Virizion":
        case "Chesnaught":
            return [Types.Grass, Types.Fighting];
        case "Stufful":
        case "Bewear":
            return [Types.Normal, Types.Fighting];
        case "Gallade":
            return [Types.Psychic, Types.Fighting];
        case "Terrakion":
            return [Types.Rock, Types.Fighting];
        case "Cobalion":
            return [Types.Steel, Types.Fighting];
        case "Poliwrath":
        case "Keldeo":
            return [Types.Water, Types.Fighting];
        case "Croagunk":
        case "Toxicroak":
        case "Okidogi":
            return [Types.Poison, Types.Fighting];
        case "Marshadow":
            return [Types.Ghost, Types.Fighting];
        case "Dratini":
        case "Dragonair":
        case "Bagon":
        case "Shelgon":
        case "Druddigon":
        case "Axew":
        case "Fraxure":
        case "Haxorus":
        case "Goomy":
        case "Sliggoo":
        case "Goodra":
            return [Types.Dragon, Types.Dragon];
        case "Dragonite":
        case "Salamence":
            return [Types.Dragon, Types.Flying];
        case "Omanyte":
        case "Omastar":
        case "Kabuto":
        case "Kabutops":
        case "Tirtouga":
        case "Carracosta":
        case "Corsola":
        case "Drednaw":
            return [Types.Water, Types.Rock];
        case "Binacle":
        case "Barbaracle":
            return [Types.Rock, Types.Water];
        /**
         * @type Bug
         */
        case "Caterpie":
        case "Metapod":
        case "Pinsir":
        case "Pineco":
        case "Wurmple":
        case "Silcoon":
        case "Volbeat":
        case "Illumise":
        case "Kricketot":
        case "Kricketune":
        case "Burmy":
        case "Karrablast":
        case "Shelmet":
        case "Accelgor":
        case "Scatterbug":
        case "Spewpa":
        case "Grubbin":
            return [Types.Bug, Types.Bug];
        case "Joltik":
        case "Galvantula":
        case "Charjabug":
        case "Vikavolt":
            return [Types.Bug, Types.Electric];
        case "Cutiefly":
        case "Ribombee":
            return [Types.Bug, Types.Fairy];
        case "Larvesta":
        case "Volcarona":
            return [Types.Bug, Types.Fire];
        case "Butterfree":
        case "Scyther":
        case "Ledyba":
        case "Ledian":
        case "Yanma":
        case "Beautifly":
        case "Masquerain":
        case "Ninjask":
        case "Mothim":
        case "Combee":
        case "Vespiquen":
        case "Yanmega":
        case "Vivillon":
            return [Types.Bug, Types.Flying];
        case "Paras":
        case "Parasect":
        case "Sewaddle":
        case "Wormadam":
        case "Swadloon":
        case "Leavanny":
            return [Types.Bug, Types.Grass];
        case "Nincada":
            return [Types.Bug, Types.Ground];
        case "Weedle":
        case "Kakuna":
        case "Beedrill":
        case "Venonat":
        case "Venomoth":
        case "Spinarak":
        case "Ariados":
        case "Dustox":
        case "Venipede":
        case "Whirlipede":
        case "Scolipede":
            return [Types.Bug, Types.Poison];
        case "Shuckle":
        case "Dwebble":
        case "Crustle":
        case "Kleavor":
            return [Types.Bug, Types.Rock];
        case "Forretress":
        case "Scizor":
        case "Escavalier":
        case "Durant":
        case "Genesect":
            return [Types.Bug, Types.Steel];
        case "Surskit":
        case "Wimpod":
        case "Golisopod":
            return [Types.Bug, Types.Water];
        case "Dewpider":
        case "Araquanid":
            return [Types.Bug, Types.Water];
        case "Anorith":
        case "Armaldo":
            return [Types.Rock, Types.Bug];
        case "Skorupi":
            return [Types.Poison, Types.Bug];
        case "Wooper":
        case "Quagsire":
        case "Marshtomp":
        case "Swampert":
        case "Gastrodon":
        case "Barboach":
        case "Whiscash":
            return [Types.Water, Types.Ground];
        case "Mr. Mime":
        case "Ralts":
        case "Kirlia":
        case "Gardevoir":
        case "Mime Jr.":
        case "Tapu Lele":
            return [Types.Psychic, Types.Fairy];
        /**
         * @type Fairy
         */
        case "Clefairy":
        case "Clefable":
        case "Cleffa":
        case "Togepi":
        case "Snubbull":
        case "Granbull":
        case "Flabébé":
        case "Floette":
        case "Florges":
        case "Spritzee":
        case "Aromatisse":
        case "Swirlix":
        case "Slurpuff":
        case "Sylveon":
        case "Xerneas":
        case "Comfey":
            return [Types.Fairy, Types.Fairy];
        case "Togetic":
        case "Togekiss":
        case "Enamorus":
            return [Types.Fairy, Types.Flying];
        case "Dedenne":
        case "Tapu Koko":
            return [Types.Electric, Types.Fairy];
        case "Mimikyu":
            return [Types.Ghost, Types.Fairy];
        case "Cottonee":
        case "Whimsicott":
        case "Morelull":
        case "Shiinotic":
        case "Tapu Bulu":
            return [Types.Grass, Types.Fairy];
        case "Jigglypuff":
        case "Wigglytuff":
        case "Igglybuff":
        case "Azurill":
            return [Types.Normal, Types.Fairy];
        case "Carbink":
        case "Diancie":
            return [Types.Rock, Types.Fairy];
        case "Mawile":
        case "Klefki":
        case "Magearna":
            return [Types.Steel, Types.Fairy];
        case "Marill":
        case "Azumarill":
        case "Primarina":
        case "Tapu Fini":
            return [Types.Water, Types.Fairy];
        case "Umbreon":
        case "Poochyena":
        case "Mightyena":
        case "Absol":
        case "Darkrai":
        case "Purrloin":
        case "Liepard":
        case "Zorua":
        case "Zoroark":
        case "Nickit":
        case "Thievul":
            return [Types.Dark, Types.Dark];
        case "Deino":
        case "Zweilous":
        case "Hydreigon":
        case "Guzzlord":
            return [Types.Dark, Types.Dragon];
        case "Houndour":
        case "Houndoom":
            return [Types.Dark, Types.Fire];
        case "Murkrow":
        case "Honchkrow":
        case "Vullaby":
        case "Mandibuzz":
        case "Yveltal":
            return [Types.Dark, Types.Flying];

        case "Sneasel":
        case "Weavile":
            return [Types.Dark, Types.Ice];
        case "Inkay":
        case "Malamar":
            return [Types.Dark, Types.Psychic];
        case "Pawniard":
        case "Bisharp":
            return [Types.Dark, Types.Steel];
        case "Incineroar":
            return [Types.Fire, Types.Dark];
        case "Nuzleaf":
        case "Shiftry":
        case "Cacturne":
            return [Types.Grass, Types.Dark];
        case "Sandile":
        case "Krokorok":
        case "Krookodile":
            return [Types.Ground, Types.Dark];
        case "Ursaluna":
            return [Types.Ground, Types.Normal];
        case "Stunky":
        case "Skuntank":
        case "Drapion":
            return [Types.Poison, Types.Dark];
        case "Overqwil":
            return [Types.Dark, Types.Poison];
        case "Tyranitar":
            return [Types.Rock, Types.Dark];
        case "Carvanha":
        case "Sharpedo":
        case "Crawdaunt":
        case "Greninja":
            return [Types.Water, Types.Dark];
        /**
         * @type Electric
         */
        case "Pikachu":
        case "Raichu":
        case "Voltorb":
        case "Electabuzz":
        case "Jolteon":
        case "Electrode":
        case "Pichu":
        case "Mareep":
        case "Flaaffy":
        case "Ampharos":
        case "Elekid":
        case "Raikou":
        case "Electrike":
        case "Manectric":
        case "Plusle":
        case "Minun":
        case "Shinx":
        case "Luxio":
        case "Luxray":
        case "Pachirisu":
        case "Electivire":
        case "Blitzle":
        case "Zebstrika":
        case "Tynamo":
        case "Eelektrik":
        case "Eelektross":
        case "Xurkitree":
        case "Zeraora":
            return [Types.Electric, Types.Electric];
        case "Magnemite":
        case "Magneton":
        case "Magnezone":
        case "Togedemaru":
            return [Types.Electric, Types.Steel];
        case "Zapdos":
        case "Emolga":
        case "Thundurus":
            return [Types.Electric, Types.Flying];
        case "Chinchou":
        case "Lanturn":
            return [Types.Water, Types.Electric];
        /**
         * @type Psychic
         */
        case "Abra":
        case "Kadabra":
        case "Alakazam":
        case "Drowzee":
        case "Hypno":
        case "Mewtwo":
        case "Mew":
        case "Unown":
        case "Wobbuffet":
        case "Espeon":
        case "Spoink":
        case "Grumpig":
        case "Chimecho":
        case "Wynaut":
        case "Deoxys":
        case "Chingling":
        case "Uxie":
        case "Mesprit":
        case "Azelf":
        case "Cresselia":
        case "Munna":
        case "Musharna":
        case "Gothita":
        case "Gothorita":
        case "Gothitelle":
        case "Solosis":
        case "Duosion":
        case "Reuniclus":
        case "Elgyem":
        case "Beheeyem":
        case "Espurr":
        case "Meowstic":
        case "Cosmog":
        case "Cosmoem":
        case "Necrozma":
            return [Types.Psychic, Types.Psychic];
        case "Magcargo":
            return [Types.Fire, Types.Rock];
        case "Exeggcute":
        case "Exeggutor":
        case "Celebi":
        case "Iron Leaves":
            return [Types.Grass, Types.Psychic];
        case "Tentacool":
        case "Tentacruel":
        case "Skrelp":
            return [Types.Water, Types.Poison];
        case "Dragalge":
            return [Types.Dragon, Types.Poison];
        case "Helioptile":
        case "Heliolisk":
            return [Types.Electric, Types.Normal];
        case "Tyrunt":
        case "Tyrantrum":
            return [Types.Rock, Types.Dragon];
        case "Amaura":
        case "Aurorus":
            return [Types.Rock, Types.Ice];
        case "Naganadel":
            return [Types.Poison, Types.Dragon];
        case "Stakataka":
            return [Types.Rock, Types.Steel];
        case "Farfetch'd":
            return [Types.Normal, Types.Flying];
        case "Dewgong":
        case "Cloyster":
            return [Types.Water, Types.Ice];
        case "Ekans":
        case "Arbok":
        case "Nidoran♀":
        case "Nidorina":
        case "Nidoran♂":
        case "Nidorino":
        case "Grimer":
        case "Muk":
        case "Koffing":
        case "Weezing":
        case "Trubbish":
        case "Garbodor":
        case "Poipole":
            return [Types.Poison, Types.Poison];
        case "Nidoqueen":
        case "Nidoking":
            return [Types.Poison, Types.Ground];
        case "Zubat":
        case "Golbat":
        case "Crobat":
            return [Types.Poison, Types.Flying];
        case "Aerodactyl":
        case "Archen":
        case "Archeops":
            return [Types.Rock, Types.Flying];
        case "Articuno":
        case "Delibird":
            return [Types.Ice, Types.Flying];
        case "Lapras":
            return [Types.Water, Types.Ice];
        case "Xatu":
        case "Natu":
        case "Lugia":
            return [Types.Psychic, Types.Flying];
        case "Swinub":
        case "Piloswine":
        case "Mamoswine":
            return [Types.Ground, Types.Ice];
        case "Kingdra":
            return [Types.Water, Types.Dragon];
        case "Jynx":
        case "Smoochum":
            return [Types.Ice, Types.Psychic];
        /**
         * @type Normal
         */
        case "Rattata":
        case "Raticate":
        case "Meowth":
        case "Persian":
        case "Eevee":
        case "Porygon":
        case "Sentret":
        case "Furret":
        case "Ditto":
        case "Lickitung":
        case "Kangaskhan":
        case "Snorlax":
        case "Teddiursa":
        case "Ursaring":
        case "Aipom":
        case "Chansey":
        case "Blissey":
        case "Miltank":
        case "Stantler":
        case "Tauros":
        case "Dunsparce":
        case "Porygon2":
        case "Smeargle":
        case "Zigzagoon":
        case "Linoone":
        case "Slakoth":
        case "Vigoroth":
        case "Slaking":
        case "Whismur":
        case "Loudred":
        case "Exploud":
        case "Skitty":
        case "Delcatty":
        case "Spinda":
        case "Zangoose":
        case "Kecleon":
        case "Bidoof":
        case "Ambipom":
        case "Buneary":
        case "Lopunny":
        case "Glameow":
        case "Purugly":
        case "Happiny":
        case "Munchlax":
        case "Lickilicky":
        case "Porygon-Z":
        case "Regigigas":
        case "Arceus":
        case "Patrat":
        case "Watchog":
        case "Lillipup":
        case "Herdier":
        case "Stoutland":
        case "Audino":
        case "Minccino":
        case "Cinccino":
        case "Bouffalant":
        case "Bunnelby":
        case "Furfrou":
        case "Yungoos":
        case "Gumshoos":
        case "Type: Null":
        case "Silvally":
        case "Komala":
        case "Wooloo":
        case "Skwovet":
        case "Greedent":
        case "Dubwool":
        case "Terapagos":
            return [Types.Normal, Types.Normal];
        case "Drampa":
            return [Types.Normal, Types.Dragon];
        case "Deerling":
        case "Sawsbuck":
            return [Types.Normal, Types.Grass];
        case "Diggersby":
            return [Types.Normal, Types.Ground];
        case "Girafarig":
        case "Meloetta":
        case "Oranguru":
        case "Wyrdeer":
            return [Types.Normal, Types.Psychic];
        case "Bibarel":
            return [Types.Normal, Types.Water];
        case "Steelix":
            return [Types.Steel, Types.Ground];
        case "Qwilfish":
            return [Types.Water, Types.Poison];
        case "Skarmory":
        case "Celesteela":
        case "Corviknight":
            return [Types.Steel, Types.Flying];

        case "Larvitar":
        case "Pupitar":
            return [Types.Rock, Types.Ground];
        case "Lotad":
        case "Lombre":
        case "Ludicolo":
            return [Types.Grass, Types.Water];
        case "Gligar":
        case "Gliscor":
            return [Types.Ground, Types.Flying];
        case "Pelipper":
        case "Wingull":
            return [Types.Water, Types.Flying];
        case "Aron":
        case "Lairon":
        case "Aggron":
            return [Types.Rock, Types.Steel];
        case "Gulpin":
        case "Swalot":
            return [Types.Poison, Types.Poison];
        case "Numel":
        case "Camerupt":
            return [Types.Fire, Types.Ground];
        case "Altaria":
            return [Types.Dragon, Types.Flying];
        case "Baltoy":
        case "Claydol":
            return [Types.Ground, Types.Psychic];
        case "Lileep":
        case "Cradily":
            return [Types.Rock, Types.Grass];
        case "Lunatone":
        case "Solrock":
            return [Types.Rock, Types.Psychic];
        case "Snorunt":
        case "Glalie":
        case "Regice":
        case "Glaceon":
        case "Vanillite":
        case "Vanillish":
        case "Vanilluxe":
        case "Cubchoo":
        case "Beartic":
        case "Cryogonal":
        case "Bergmite":
        case "Avalugg":
            return [Types.Ice, Types.Ice];
        case "Beldum":
        case "Metang":
        case "Metagross":
        case "Jirachi":
            return [Types.Steel, Types.Psychic];
        case "Cascoon":
        case "Blipbug":
            return [Types.Bug, Types.Bug];
        case "Dottler":
        case "Orbeetle":
            return [Types.Bug, Types.Psychic];
        case "Nosepass":
        case "Sudowoodo":
        case "Regirock":
        case "Roggenrola":
        case "Boldore":
        case "Gigalith":
            return [Types.Rock, Types.Rock];
        case "Rockruff":
        case "Lycanroc":
            return [Types.Rock, Types.Rock];
        case "Seedot":
        case "Shroomish":
        case "Sprigatito":
        case "Floragato":
            return [Types.Grass, Types.Grass];
        case "Vibrava":
        case "Flygon":
        case "Gible":
        case "Gabite":
        case "Garchomp":
            return [Types.Dragon, Types.Ground];
        case "Cacnea":
            return [Types.Grass, Types.Grass];
        case "Seviper":
            return [Types.Poison, Types.Poison];
        case "Tropius":
            return [Types.Grass, Types.Flying];
        case "Spheal":
        case "Sealeo":
        case "Walrein":
            return [Types.Water, Types.Ice];
        case "Relicanth":
            return [Types.Rock, Types.Water];
        case "Registeel":
        case "Melmetal":
        case "Meltan":
        case "Klink":
        case "Klang":
        case "Klinklang":
            return [Types.Steel, Types.Steel];
        case "Latias":
        case "Latios":
            return [Types.Dragon, Types.Psychic];
        case "Rayquaza":
            return [Types.Dragon, Types.Flying];
        case "Empoleon":
            return [Types.Water, Types.Steel];
        case "Cranidos":
        case "Rampardos":
            return [Types.Rock, Types.Rock];
        case "Shieldon":
        case "Bastiodon":
            return [Types.Rock, Types.Steel];
        case "Bronzor":
        case "Bronzong":
            return [Types.Steel, Types.Psychic];
        case "Bonsly":
            return [Types.Rock, Types.Rock];
        case "Mantyke":
            return [Types.Water, Types.Flying];
        case "Snover":
        case "Abomasnow":
            return [Types.Grass, Types.Ice];
        case "Probopass":
            return [Types.Rock, Types.Steel];
        case "Dialga":
            return [Types.Dragon, Types.Steel];
        case "Palkia":
            return [Types.Dragon, Types.Water];
        case "Obstagoon":
            return [Types.Dark, Types.Normal];
        case "Perrserker":
            return [Types.Steel, Types.Steel];
        case "Cursola":
            return [Types.Ghost, Types.Ghost];
        case "Sirfetch'd":
        case "Falinks":
            return [Types.Fighting, Types.Fighting];
        case "Mr. Rime":
            return [Types.Ice, Types.Psychic];
        case "Runerigus":
            return [Types.Ground, Types.Ghost];
        case "Chewtle":
            return [Types.Water, Types.Water];
        case "Yamper":
        case "Boltund":
            return [Types.Electric, Types.Electric];
        case "Rolycoly":
            return [Types.Rock, Types.Rock];
        case "Carkol":
        case "Coalossal":
            return [Types.Rock, Types.Fire];
        case "Applin":
        case "Flapple":
        case "Appletun":
        case "Dipplin":
        case "Hydrapple":
            return [Types.Grass, Types.Dragon];
        case "Silicobra":
        case "Sandaconda":
            return [Types.Ground, Types.Ground];
        case "Cramorant":
            return [Types.Flying, Types.Water];
        case "Arrokuda":
        case "Barraskewda":
            return [Types.Water, Types.Water];
        case "Toxel":
        case "Toxtricity":
            return [Types.Electric, Types.Poison];
        case "Sizzlipede":
        case "Centiskorch":
            return [Types.Fire, Types.Bug];
        case "Clobbopus":
        case "Grapploct":
            return [Types.Fighting, Types.Fighting];
        case "Sinistea":
        case "Polteageist":
            return [Types.Ghost, Types.Ghost];
        case "Hatenna":
        case "Hattrem":
            return [Types.Psychic, Types.Psychic];
        case "Hatterene":
            return [Types.Psychic, Types.Fairy];
        case "Impidimp":
        case "Morgrem":
        case "Grimmsnarl":
            return [Types.Dark, Types.Fairy];
        case "Milcery":
        case "Alcremie":
            return [Types.Fairy, Types.Fairy];
        case "Pincurchin":
            return [Types.Electric, Types.Electric];
        case "Snom":
        case "Frosmoth":
            return [Types.Ice, Types.Bug];
        case "Stonjourner":
            return [Types.Rock, Types.Rock];
        case "Eiscue":
            return [Types.Ice, Types.Ice];
        case "Indeedee":
            return [Types.Psychic, Types.Psychic];
        case "Morpeko":
            return [Types.Electric, Types.Dark];
        case "Cufant":
        case "Copperajah":
            return [Types.Steel, Types.Steel];
        case "Dracozolt":
            return [Types.Electric, Types.Dragon];
        case "Arctozolt":
            return [Types.Electric, Types.Ice];
        case "Dracovish":
        case "Walking Wake":
            return [Types.Water, Types.Dragon];
        case "Arctovish":
            return [Types.Water, Types.Ice];
        case "Duraludon":
        case "Archaludon":
            return [Types.Steel, Types.Dragon];
        case "Dreepy":
        case "Drakloak":
        case "Dragapult":
            return [Types.Dragon, Types.Ghost];
        case "Zacian":
            return [Types.Fairy, Types.Fairy];
        case "Zamazenta":
            return [Types.Fighting, Types.Fighting];
        case "Eternatus":
            return [Types.Poison, Types.Dragon];
        case "Zarude":
            return [Types.Grass, Types.Dark];
        case "Kubfu":
            return [Types.Fighting, Types.Fighting];
        case "Urshifu":
            return [Types.Fighting, Types.Water];
        case "Kyurem":
            return [Types.Dragon, Types.Ice];
        case "Heatran":
            return [Types.Steel, Types.Fire];
        // 'Shaymin',
        case "Victini":
            return [Types.Fire, Types.Psychic];
        case "Regieleki":
            return [Types.Electric, Types.Electric];
        case "Regidrago":
            return [Types.Dragon, Types.Dragon];
        case "Glastrier":
            return [Types.Ice, Types.Ice];
        case "Spectrier":
            return [Types.Ghost, Types.Ghost];
        case "Calyrex":
            return [Types.Psychic, Types.Grass];
        case "Woobat":
        case "Swoobat":
            return [Types.Psychic, Types.Flying];
        case "Excadrill":
            return [Types.Ground, Types.Steel];
        case "Palpitoad":
        case "Seismitoad":
            return [Types.Water, Types.Ground];

        case "Landorus":
            return [Types.Ground, Types.Flying];
        case "Sigilyph":
            return [Types.Psychic, Types.Flying];
        case "Ducklett":
        case "Swanna":
            return [Types.Water, Types.Flying];
        case "Stunfisk":
            return [Types.Ground, Types.Electric];
        case "Reshiram":
            return [Types.Dragon, Types.Fire];
        case "Zekrom":
            return [Types.Dragon, Types.Electric];
        case "Delphox":
            return [Types.Fire, Types.Psychic];
        case "Litleo":
        case "Pyroar":
            return [Types.Fire, Types.Normal];
        case "Zygarde":
            return [Types.Dragon, Types.Ground];
        case "Volcanion":
            return [Types.Fire, Types.Water];

        case "Mareanie":
        case "Toxapex":
            return [Types.Water, Types.Poison];
        // default in generator is Baile form
        case "Oricorio":
            return [Types.Fire, Types.Flying];
        case "Salandit":
        case "Salazzle":
            return [Types.Poison, Types.Fire];
        case "Bounsweet":
        case "Steenee":
        case "Tsareena":
            return [Types.Grass, Types.Grass];
        case "Minior":
            return [Types.Rock, Types.Flying];
        case "Turtonator":
            return [Types.Dragon, Types.Fire];
        case "Bruxish":
            return [Types.Psychic, Types.Water];
        case "Jangmo-o":
            return [Types.Dragon, Types.Dragon];
        case "Solgaleo":
            return [Types.Psychic, Types.Steel];
        case "Nihilego":
            return [Types.Rock, Types.Poison];

        case "Kartana":
            return [Types.Steel, Types.Grass];
        case "Ferroseed":
        case "Ferrothorn":
            return [Types.Grass, Types.Steel];
        case "Fezandipiti":
            return [Types.Poison, Types.Fairy];
        case "Munkidori":
            return [Types.Poison, Types.Psychic];
        case "Gouging Fire":
            return [Types.Fire, Types.Dragon];
        case "Raging Bolt":
            return [Types.Electric, Types.Dragon];
        case "Iron Boulder":
            return [Types.Rock, Types.Psychic];
        case "Iron Crown":
            return [Types.Steel, Types.Psychic];
        case "Pecharunt":
            return [Types.Poison, Types.Ghost];
        case "Taillow":
        case "Pidgey":
        case "Pidgeotto":
        case "Pidgeot":
        case "Spearow":
        case "Fearow":
        case "Doduo":
        case "Dodrio":
        case "Hoothoot":
        case "Noctowl":
        case "Swellow":
        case "Swablu":
        case "Starly":
        case "Staravia":
        case "Staraptor":
        case "Chatot":
        case "Pidove":
        case "Tranquill":
        case "Unfezant":
        case "Rufflet":
        case "Braviary":
        case "Fletchling":
        case "Pikipek":
        case "Trumbeak":
        case "Toucannon":
            return [Types.Normal, Types.Flying];
        default:
            return [Types.Normal, Types.Normal];
    }
};
