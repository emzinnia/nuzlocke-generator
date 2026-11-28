import { Species } from "./listOfPokemon";
import { flatten } from "ramda";

function uniq<T>(array: T[]): T[] {
    // Return early for empty arrays or arrays with 1 or fewer elements
    if (!array || array.length <= 1) {
        return array ? [...array] : [];
    }

    // Create a new array to store unique values
    const result: T[] = [];

    // Use a Set to track which values have been seen
    const seen = new Set<T>();

    for (const value of array) {
        if (!seen.has(value)) {
            seen.add(value);
            result.push(value);
        }
    }

    return result;
}

export default uniq;

export type EvolutionTree = { [S in Species]?: Species[] };

export const EvolutionTree: EvolutionTree = {
    Bulbasaur: ["Ivysaur"],
    Ivysaur: ["Venusaur"],
    Charmander: ["Charmeleon"],
    Charmeleon: ["Charizard"],
    Squirtle: ["Wartortle"],
    Wartortle: ["Blastoise"],

    Caterpie: ["Metapod"],
    Metapod: ["Butterfree"],
    Weedle: ["Kakuna"],
    Kakuna: ["Beedrill"],
    Pidgey: ["Pidgeotto"],
    Pidgeotto: ["Pidgeot"],
    Rattata: ["Raticate"],
    Pichu: ["Pikachu"],
    Pikachu: ["Raichu"],

    Spearow: ["Fearow"],
    Ekans: ["Arbok"],
    Sandshrew: ["Sandslash"],
    "Nidoran♀": ["Nidorina"],
    Nidorina: ["Nidoqueen"],
    "Nidoran♂": ["Nidorino"],
    Nidorino: ["Nidoking"],
    Paras: ["Parasect"],

    Cleffa: ["Clefairy"],
    Clefairy: ["Clefable"],
    Igglybuff: ["Jigglypuff"],
    Jigglypuff: ["Wigglytuff"],

    Zubat: ["Golbat"],
    Golbat: ["Crobat"],

    Oddish: ["Gloom"],
    Gloom: ["Vileplume", "Bellossom"],

    Venonat: ["Venomoth"],

    Diglett: ["Dugtrio"],
    Meowth: ["Persian", "Perrserker"],
    Psyduck: ["Golduck"],
    Mankey: ["Primeape"],
    Primeape: ["Annihilape"],
    Growlithe: ["Arcanine"],
    Vulpix: ["Ninetales"],
    Poliwag: ["Poliwhirl"],
    Poliwhirl: ["Politoed", "Poliwrath"],
    Abra: ["Kadabra"],
    Kadabra: ["Alakazam"],

    Machop: ["Machoke"],
    Machoke: ["Machamp"],

    Bellsprout: ["Weepinbell"],
    Weepinbell: ["Victreebel"],

    Tentacool: ["Tentacruel"],
    Geodude: ["Graveler"],
    Graveler: ["Golem"],

    Ponyta: ["Rapidash"],
    Slowpoke: ["Slowking", "Slowbro"],

    Magnemite: ["Magneton"],
    Magneton: ["Magnezone"],

    "Farfetch'd": ["Sirfetch'd"],
    Doduo: ["Dodrio"],

    Seel: ["Dewgong"],
    Grimer: ["Muk"],
    Shellder: ["Cloyster"],
    Onix: ["Steelix"],
    Gastly: ["Haunter"],
    Haunter: ["Gengar"],

    Drowzee: ["Hypno"],
    Krabby: ["Kingler"],
    Voltorb: ["Electrode"],

    Exeggcute: ["Exeggutor"],
    Cubone: ["Marowak"],
    Tyrogue: ["Hitmonchan", "Hitmonlee", "Hitmontop"],

    Lickitung: ["Lickilicky"],
    Koffing: ["Weezing"],

    Rhyhorn: ["Rhydon"],
    Rhydon: ["Rhyperior"],
    Happiny: ["Chansey"],
    Chansey: ["Blissey"],

    Tangela: ["Tangrowth"],
    Horsea: ["Seadra"],
    Seadra: ["Kingdra"],
    Goldeen: ["Seaking"],
    Staryu: ["Starmie"],
    "Mime Jr.": ["Mr. Mime"],
    "Mr. Mime": ["Mr. Rime"],

    Scyther: ["Scizor", "Kleavor"],
    Smoochum: ["Jynx"],

    Elekid: ["Electabuzz"],
    Electabuzz: ["Electivire"],
    Magby: ["Magmar"],
    Magmar: ["Magmortar"],
    Magikarp: ["Gyarados"],
    Porygon: ["Porygon2"],
    Porygon2: ["Porygon-Z"],
    Eevee: [
        "Jolteon",
        "Flareon",
        "Vaporeon",
        "Sylveon",
        "Umbreon",
        "Espeon",
        "Leafeon",
        "Glaceon",
    ],
    Omanyte: ["Omastar"],
    Kabuto: ["Kabutops"],
    Munchlax: ["Snorlax"],
    Dratini: ["Dragonair"],
    Dragonair: ["Dragonite"],

    Chikorita: ["Bayleef"],
    Bayleef: ["Meganium"],
    Cyndaquil: ["Quilava"],
    Quilava: ["Typhlosion"],

    Totodile: ["Croconaw"],
    Croconaw: ["Feraligatr"],

    Hoothoot: ["Noctowl"],
    Sentret: ["Furret"],

    Ledyba: ["Ledian"],
    Spinarak: ["Ariados"],

    Togepi: ["Togetic"],
    Togetic: ["Togekiss"],

    Natu: ["Xatu"],

    Mareep: ["Flaaffy"],
    Flaaffy: ["Ampharos"],
    Wooper: ["Quagsire", "Clodsire"],

    Hoppip: ["Skiploom"],
    Skiploom: ["Jumpluff"],

    Pineco: ["Forretress"],
    Yanma: ["Yanmega"],

    Sunkern: ["Sunflora"],

    Wynaut: ["Wobbuffet"],
    Aipom: ["Ambipom"],
    Snubbull: ["Granbull"],

    Azurill: ["Marill"],
    Marill: ["Azumarill"],
    Remoraid: ["Octillery"],
    Chinchou: ["Lanturn"],
    Swinub: ["Piloswine"],
    Piloswine: ["Mamoswine"],
    Teddiursa: ["Ursaring"],
    Ursaring: ["Ursaluna"],
    Phanpy: ["Donphan"],
    Mantyke: ["Mantine"],
    Girafarig: ["Farigiraf"],
    Dunsparce: ["Dudunsparce"],
    Qwilfish: ["Overqwil"],
    Stantler: ["Wyrdeer"],

    Murkrow: ["Honchkrow"],
    Misdreavus: ["Mismagius"],
    Houndour: ["Houndoom"],
    Slugma: ["Magcargo"],

    Sneasel: ["Weavile", "Sneasler"],
    Larvitar: ["Pupitar"],
    Pupitar: ["Tyranitar"],
    Gligar: ["Gliscor"],
    Corsola: ["Cursola"],

    Treecko: ["Grovyle"],
    Grovyle: ["Sceptile"],

    Torchic: ["Combusken"],
    Combusken: ["Blaziken"],

    Mudkip: ["Marshtomp"],
    Marshtomp: ["Swampert"],

    Poochyena: ["Mightyena"],
    Zigzagoon: ["Linoone"],
    Linoone: ["Obstagoon"],

    Wurmple: ["Silcoon", "Cascoon"],
    Silcoon: ["Beautifly"],
    Cascoon: ["Dustox"],

    Lotad: ["Lombre"],
    Lombre: ["Ludicolo"],

    Seedot: ["Nuzleaf"],
    Nuzleaf: ["Shiftry"],

    Taillow: ["Swellow"],
    Wingull: ["Pelipper"],

    Ralts: ["Kirlia"],
    Kirlia: ["Gardevoir", "Gallade"],

    Surskit: ["Masquerain"],
    Shroomish: ["Breloom"],
    Slakoth: ["Vigoroth"],
    Vigoroth: ["Slaking"],

    Nincada: ["Shedinja", "Ninjask"],
    Whismur: ["Loudred"],
    Loudred: ["Exploud"],

    Makuhita: ["Hariyama"],
    Nosepass: ["Probopass"],
    Skitty: ["Delcatty"],
    Aron: ["Lairon"],
    Lairon: ["Aggron"],
    Meditite: ["Medicham"],
    Electrike: ["Manectric"],
    Gulpin: ["Swalot"],
    Carvanha: ["Sharpedo"],
    Wailmer: ["Wailord"],
    Numel: ["Camerupt"],
    Spoink: ["Grumpig"],
    Trapinch: ["Vibrava"],
    Vibrava: ["Flygon"],
    Cacnea: ["Cacturne"],
    Swablu: ["Altaria"],
    Barboach: ["Whiscash"],
    Corphish: ["Crawdaunt"],
    Baltoy: ["Claydol"],
    Lileep: ["Cradily"],
    Anorith: ["Armaldo"],
    Feebas: ["Milotic"],
    Shuppet: ["Banette"],
    Duskull: ["Dusclops"],
    Dusclops: ["Dusknoir"],
    Snorunt: ["Glalie", "Froslass"],
    Spheal: ["Sealeo"],
    Sealeo: ["Walrein"],
    Clamperl: ["Huntail", "Gorebyss"],
    Bagon: ["Shelgon"],
    Shelgon: ["Salamence"],
    Beldum: ["Metang"],
    Metang: ["Metagross"],

    Turtwig: ["Grotle"],
    Grotle: ["Torterra"],

    Chimchar: ["Monferno"],
    Monferno: ["Infernape"],

    Piplup: ["Prinplup"],
    Prinplup: ["Empoleon"],

    Starly: ["Staravia"],
    Staravia: ["Staraptor"],

    Bidoof: ["Bibarel"],
    Kricketot: ["Kricketune"],
    Shinx: ["Luxio"],
    Luxio: ["Luxray"],

    Cranidos: ["Rampardos"],
    Shieldon: ["Bastiodon"],
    Budew: ["Roselia"],
    Roselia: ["Roserade"],
    Burmy: ["Wormadam", "Mothim"],

    Combee: ["Vespiquen"],
    Buizel: ["Floatzel"],
    Cherubi: ["Cherrim"],
    Shellos: ["Gastrodon"],
    Drifloon: ["Drifblim"],

    Buneary: ["Lopunny"],
    Glameow: ["Purugly"],
    Stunky: ["Skuntank"],

    Chingling: ["Chimecho"],
    Bronzor: ["Bronzong"],
    Gible: ["Gabite"],
    Gabite: ["Garchomp"],

    Riolu: ["Lucario"],

    Hippopotas: ["Hippowdon"],
    Skorupi: ["Drapion"],

    Croagunk: ["Toxicroak"],
    Finneon: ["Lumineon"],
    Snover: ["Abomasnow"],

    Snivy: ["Servine"],
    Servine: ["Serperior"],
    Tepig: ["Pignite"],
    Pignite: ["Emboar"],
    Oshawott: ["Dewott"],
    Dewott: ["Samurott"],

    Patrat: ["Watchog"],
    Lillipup: ["Herdier"],
    Herdier: ["Stoutland"],

    Purrloin: ["Liepard"],
    Pansage: ["Simisage"],
    Pansear: ["Simisear"],
    Panpour: ["Simipour"],
    Munna: ["Musharna"],
    Pidove: ["Tranquill"],
    Tranquill: ["Unfezant"],
    Blitzle: ["Zebstrika"],
    Roggenrola: ["Boldore"],
    Boldore: ["Gigalith"],
    Woobat: ["Swoobat"],
    Drilbur: ["Excadrill"],
    Timburr: ["Gurdurr"],
    Gurdurr: ["Conkeldurr"],
    Tympole: ["Palpitoad"],
    Palpitoad: ["Seismitoad"],
    Sewaddle: ["Swadloon"],
    Swadloon: ["Leavanny"],
    Venipede: ["Whirlipede"],
    Whirlipede: ["Scolipede"],
    Cottonee: ["Whimsicott"],
    Petilil: ["Lilligant"],
    Sandile: ["Krokorok"],
    Krokorok: ["Krookodile"],
    Darumaka: ["Darmanitan"],
    Dwebble: ["Crustle"],
    Scraggy: ["Scrafty"],
    Yamask: ["Cofagrigus", "Runerigus"],
    Tirtouga: ["Carracosta"],
    Archen: ["Archeops"],
    Trubbish: ["Garbodor"],
    Zorua: ["Zoroark"],
    Minccino: ["Cinccino"],
    Gothita: ["Gothorita"],
    Gothorita: ["Gothitelle"],
    Solosis: ["Duosion"],
    Duosion: ["Reuniclus"],
    Ducklett: ["Swanna"],
    Vanillite: ["Vanillish"],
    Vanillish: ["Vanilluxe"],
    Deerling: ["Sawsbuck"],
    Karrablast: ["Escavalier"],
    Foongus: ["Amoonguss"],
    Frillish: ["Jellicent"],
    Joltik: ["Galvantula"],
    Ferroseed: ["Ferrothorn"],
    Klink: ["Klang"],
    Klang: ["Klinklang"],
    Tynamo: ["Eelektrik"],
    Eelektrik: ["Eelektross"],
    Elgyem: ["Beheeyem"],
    Litwick: ["Lampent"],
    Lampent: ["Chandelure"],
    Axew: ["Fraxure"],
    Fraxure: ["Haxorus"],
    Cubchoo: ["Beartic"],
    Shelmet: ["Accelgor"],
    Mienfoo: ["Mienshao"],
    Golett: ["Golurk"],
    Pawniard: ["Bisharp"],
    Bisharp: ["Kingambit"],
    Rufflet: ["Braviary"],
    Vullaby: ["Mandibuzz"],
    Deino: ["Zweilous"],
    Zweilous: ["Hydreigon"],
    Larvesta: ["Volcarona"],
    Basculin: ["Basculegion"],

    Chespin: ["Quilladin"],
    Quilladin: ["Chesnaught"],
    Fennekin: ["Braixen"],
    Braixen: ["Delphox"],
    Froakie: ["Frogadier"],
    Frogadier: ["Greninja"],
    Bunnelby: ["Diggersby"],
    Fletchling: ["Fletchinder"],
    Fletchinder: ["Talonflame"],
    Scatterbug: ["Spewpa"],
    Spewpa: ["Vivillon"],
    Litleo: ["Pyroar"],
    Flabébé: ["Floette"],
    Floette: ["Florges"],
    Skiddo: ["Gogoat"],
    Pancham: ["Pangoro"],
    Espurr: ["Meowstic"],
    Honedge: ["Doublade"],
    Doublade: ["Aegislash"],
    Spritzee: ["Aromatisse"],
    Swirlix: ["Slurpuff"],
    Inkay: ["Malamar"],
    Binacle: ["Barbaracle"],
    Skrelp: ["Dragalge"],
    Clauncher: ["Clawitzer"],
    Helioptile: ["Heliolisk"],
    Tyrunt: ["Tyrantrum"],
    Amaura: ["Aurorus"],
    Goomy: ["Sliggoo"],
    Sliggoo: ["Goodra"],
    Phantump: ["Trevenant"],
    Pumpkaboo: ["Gourgeist"],
    Bergmite: ["Avalugg"],
    Noibat: ["Noivern"],

    Rowlet: ["Dartrix"],
    Dartrix: ["Decidueye"],
    Litten: ["Torracat"],
    Torracat: ["Incineroar"],
    Popplio: ["Brionne"],
    Brionne: ["Primarina"],
    Pikipek: ["Trumbeak"],
    Trumbeak: ["Toucannon"],
    Yungoos: ["Gumshoos"],
    Grubbin: ["Charjabug"],
    Charjabug: ["Vikavolt"],
    Crabrawler: ["Crabominable"],
    Cutiefly: ["Ribombee"],
    Rockruff: ["Lycanroc"],
    Mareanie: ["Toxapex"],
    Mudbray: ["Mudsdale"],
    Dewpider: ["Araquanid"],
    Fomantis: ["Lurantis"],
    Morelull: ["Shiinotic"],
    Salandit: ["Salazzle"],
    Stufful: ["Bewear"],
    Bounsweet: ["Steenee"],
    Steenee: ["Tsareena"],
    Wimpod: ["Golisopod"],
    Sandygast: ["Palossand"],
    "Type: Null": ["Silvally"],
    "Jangmo-o": ["Hakamo-o"],
    "Hakamo-o": ["Kommo-o"],
    Cosmog: ["Cosmoem"],
    Cosmoem: ["Solgaleo", "Lunala"],
    Meltan: ["Melmetal"],

    Grookey: ["Thwackey"],
    Thwackey: ["Rillaboom"],
    Scorbunny: ["Raboot"],
    Raboot: ["Cinderace"],
    Sobble: ["Drizzile"],
    Drizzile: ["Inteleon"],
    Skwovet: ["Greedent"],
    Rookidee: ["Corvisquire"],
    Corvisquire: ["Corviknight"],
    Blipbug: ["Dottler"],
    Dottler: ["Orbeetle"],
    Nickit: ["Thievul"],
    Gossifleur: ["Eldegoss"],
    Wooloo: ["Dubwool"],
    Chewtle: ["Drednaw"],
    Yamper: ["Boltund"],
    Rolycoly: ["Carkol"],
    Carkol: ["Coalossal"],
    Applin: ["Flapple", "Appletun", "Dipplin"],
    Dipplin: ["Hydrapple"],
    Duraludon: ["Archaludon"],
    Silicobra: ["Sandaconda"],
    Arrokuda: ["Barraskewda"],
    Toxel: ["Toxtricity"],
    Sizzlipede: ["Centiskorch"],
    Clobbopus: ["Grapploct"],
    Sinistea: ["Polteageist"],
    Hatenna: ["Hattrem"],
    Hattrem: ["Hatterene"],
    Impidimp: ["Morgrem"],
    Morgrem: ["Grimmsnarl"],
    Milcery: ["Alcremie"],
    Snom: ["Frosmoth"],
    Cufant: ["Copperajah"],
    Dreepy: ["Drakloak"],
    Drakloak: ["Dragapult"],
    Kubfu: ["Urshifu"],

    Sprigatito: ["Floragato"],
    Floragato: ["Meowscarada"],
    Fuecoco: ["Crocalor"],
    Crocalor: ["Skeledirge"],
    Quaxly: ["Quaxwell"],
    Quaxwell: ["Quaquaval"],
    Lechonk: ["Oinkologne"],
    Tarountula: ["Spidops"],
    Nymble: ["Lokix"],
    Pawmi: ["Pawmo"],
    Pawmo: ["Pawmot"],
    Tandemaus: ["Maushold"],
    Fidough: ["Dachsbun"],
    Smoliv: ["Dolliv"],
    Dolliv: ["Arboliva"],
    Nacli: ["Naclstack"],
    Naclstack: ["Garganacl"],
    Charcadet: ["Armarouge", "Ceruledge"],
    Tadbulb: ["Bellibolt"],
    Wattrel: ["Kilowattrel"],
    Maschiff: ["Mabosstiff"],
    Shroodle: ["Grafaiai"],
    Bramblin: ["Brambleghast"],
    Toedscool: ["Toedscruel"],
    Capsakid: ["Scovillain"],
    Rellor: ["Rabsca"],
    Flittle: ["Espathra"],
    Tinkatink: ["Tinkatuff"],
    Tinkatuff: ["Tinkaton"],
    Wiglett: ["Wugtrio"],
    Finizen: ["Palafin"],
    Varoom: ["Revavroom"],
    Glimmet: ["Glimmora"],
    Greavard: ["Houndstone"],
    Cetoddle: ["Cetitan"],
    Poltchageist: ["Sinistcha"],
    Frigibax: ["Arctibax"],
    Arctibax: ["Baxcalibur"],
    Gimmighoul: ["Gholdengo"],
};

const cycleThrough = (species: Species) => {
    const found: Species[] = [];
    for (const pokemon in EvolutionTree) {
        if (EvolutionTree[pokemon].includes(species)) {
            found.push(pokemon as Species);
        }
    }
    return found;
};

export const getEvolutionLine = (
    species: Species,
    linear: boolean = false,
): Species[] => {
    const line: Species[] = [];

    // include queries species
    line.push(species);

    const getPriors = (species) => {
        const priors = cycleThrough(species);
        if (priors.length) {
            line.push(...priors);
            priors.forEach((prior) => {
                getPriors(prior);
                getNextEvo(prior);
            });
        }
    };

    const getNextEvo = (species: Species) => {
        const evolution = EvolutionTree[species];

        console.log(`evo for ${species}`, evolution, cycleThrough(species));

        if (!evolution) {
            getPriors(species);
        }
        if (evolution && evolution.length === 1) {
            line.push(evolution[0]);
            if (EvolutionTree[evolution[0]]) {
                getNextEvo(evolution[0]);
            }
        }
        if (evolution && evolution.length > 1) {
            return evolution.forEach((ev) => getNextEvo(ev));
        }
    };

    getNextEvo(species);

    return uniq(line);
};

/**
 * @NOTE: there were original plans to style this as a tree, but I think it was pointlessly complex.
 */
const tree = [
    ["Bulbasaur", "Ivysaur", "Venusaur"],
    ["Burmy", ["Mothim", "Wormadam"]],
    ["Wurmple", ["Silcoon", "Cascoon"], ["Beautifly", "Dustox"]],
];

const getFlat = tree.map((branch) => flatten(branch));
