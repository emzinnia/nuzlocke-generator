import { Species } from "utils/data/listOfPokemon";

export const GEN_3_HELD_ITEM_MAP = [];

export const GEN_3_CHARACTER_MAP = [];

// Gen 3 location index to location name mapping
// Based on https://bulbapedia.bulbagarden.net/wiki/List_of_locations_by_index_number_in_Generation_III
// Indices 0x00-0x57: Hoenn (Ruby, Sapphire, Emerald)
// Indices 0x58-0xC4: Kanto (FireRed, LeafGreen, Emerald)
// Indices 0xC5-0xD4: Emerald-exclusive
// Indices 0xFD-0xFF: Special (all games)
export const GEN_3_LOCATIONS: Record<number, string> = {
    // Hoenn locations (0x00-0x57)
    0x00: "Littleroot Town",
    0x01: "Oldale Town",
    0x02: "Dewford Town",
    0x03: "Lavaridge Town",
    0x04: "Fallarbor Town",
    0x05: "Verdanturf Town",
    0x06: "Pacifidlog Town",
    0x07: "Petalburg City",
    0x08: "Slateport City",
    0x09: "Mauville City",
    0x0a: "Rustboro City",
    0x0b: "Fortree City",
    0x0c: "Lilycove City",
    0x0d: "Mossdeep City",
    0x0e: "Sootopolis City",
    0x0f: "Ever Grande City",
    0x10: "Route 101",
    0x11: "Route 102",
    0x12: "Route 103",
    0x13: "Route 104",
    0x14: "Route 105",
    0x15: "Route 106",
    0x16: "Route 107",
    0x17: "Route 108",
    0x18: "Route 109",
    0x19: "Route 110",
    0x1a: "Route 111",
    0x1b: "Route 112",
    0x1c: "Route 113",
    0x1d: "Route 114",
    0x1e: "Route 115",
    0x1f: "Route 116",
    0x20: "Route 117",
    0x21: "Route 118",
    0x22: "Route 119",
    0x23: "Route 120",
    0x24: "Route 121",
    0x25: "Route 122",
    0x26: "Route 123",
    0x27: "Route 124",
    0x28: "Route 125",
    0x29: "Route 126",
    0x2a: "Route 127",
    0x2b: "Route 128",
    0x2c: "Route 129",
    0x2d: "Route 130",
    0x2e: "Route 131",
    0x2f: "Route 132",
    0x30: "Route 133",
    0x31: "Route 134",
    0x32: "Underwater",
    0x33: "Granite Cave",
    0x34: "Mt. Chimney",
    0x35: "Safari Zone",
    0x36: "Battle Tower",
    0x37: "Weather Institute",
    0x38: "Sealed Chamber",
    0x39: "Victory Road",
    0x3a: "Shoal Cave",
    0x3b: "Cave of Origin",
    0x3c: "Fiery Path",
    0x3d: "Mt. Pyre",
    0x3e: "Team Aqua Hideout",
    0x3f: "Meteor Falls",
    0x40: "Team Magma Hideout",
    0x41: "Mirage Island",
    0x42: "Hideout",
    0x43: "Safari Zone",
    0x44: "Scorched Slab",
    0x45: "Island Cave",
    0x46: "Desert Ruins",
    0x47: "Ancient Tomb",
    0x48: "Inside of Truck",
    0x49: "Secret Base",
    0x4a: "Petalburg Woods",
    0x4b: "Slateport City",
    0x4c: "Slateport City",
    0x4d: "Contest Hall",
    0x4e: "Lilycove City",
    0x4f: "Lilycove City",
    0x50: "S.S. Tidal",
    0x51: "Abandoned Ship",
    0x52: "Mossdeep City",
    0x53: "Sky Pillar",
    0x54: "Mystery Zone",
    0x55: "Underwater",
    0x56: "Secret Base",
    0x57: "Ferry",

    // Kanto locations (0x58-0xC4)
    0x58: "Pallet Town",
    0x59: "Viridian City",
    0x5a: "Pewter City",
    0x5b: "Cerulean City",
    0x5c: "Lavender Town",
    0x5d: "Vermilion City",
    0x5e: "Celadon City",
    0x5f: "Fuchsia City",
    0x60: "Cinnabar Island",
    0x61: "Indigo Plateau",
    0x62: "Saffron City",
    0x63: "Route 1",
    0x64: "Route 2",
    0x65: "Route 3",
    0x66: "Route 4",
    0x67: "Route 5",
    0x68: "Route 6",
    0x69: "Route 7",
    0x6a: "Route 8",
    0x6b: "Route 9",
    0x6c: "Route 10",
    0x6d: "Route 11",
    0x6e: "Route 12",
    0x6f: "Route 13",
    0x70: "Route 14",
    0x71: "Route 15",
    0x72: "Route 16",
    0x73: "Route 17",
    0x74: "Route 18",
    0x75: "Route 19",
    0x76: "Route 20",
    0x77: "Route 21",
    0x78: "Route 22",
    0x79: "Route 23",
    0x7a: "Route 24",
    0x7b: "Route 25",
    0x7c: "Viridian Forest",
    0x7d: "Mt. Moon",
    0x7e: "S.S. Anne",
    0x7f: "Underground Path",
    0x80: "Underground Path",
    0x81: "Diglett's Cave",
    0x82: "Victory Road",
    0x83: "Rocket Hideout",
    0x84: "Silph Co.",
    0x85: "Pokémon Mansion",
    0x86: "Safari Zone",
    0x87: "Pokémon League",
    0x88: "Rock Tunnel",
    0x89: "Seafoam Islands",
    0x8a: "Pokémon Tower",
    0x8b: "Cerulean Cave",
    0x8c: "Power Plant",
    0x8d: "One Island",
    0x8e: "Two Island",
    0x8f: "Three Island",
    0x90: "Four Island",
    0x91: "Five Island",
    0x92: "Seven Island",
    0x93: "Six Island",
    0x94: "Kindle Road",
    0x95: "Treasure Beach",
    0x96: "Cape Brink",
    0x97: "Bond Bridge",
    0x98: "Three Isle Port",
    0x99: "Sevii Isle 6",
    0x9a: "Sevii Isle 7",
    0x9b: "Sevii Isle 8",
    0x9c: "Sevii Isle 9",
    0x9d: "Resort Gorgeous",
    0x9e: "Water Labyrinth",
    0x9f: "Five Isle Meadow",
    0xa0: "Memorial Pillar",
    0xa1: "Outcast Island",
    0xa2: "Green Path",
    0xa3: "Water Path",
    0xa4: "Ruin Valley",
    0xa5: "Trainer Tower",
    0xa6: "Canyon Entrance",
    0xa7: "Sevault Canyon",
    0xa8: "Tanoby Ruins",
    0xa9: "Sevii Isle 22",
    0xaa: "Sevii Isle 23",
    0xab: "Sevii Isle 24",
    0xac: "Navel Rock",
    0xad: "Mt. Ember",
    0xae: "Berry Forest",
    0xaf: "Icefall Cave",
    0xb0: "Rocket Warehouse",
    0xb1: "Trainer Tower",
    0xb2: "Dotted Hole",
    0xb3: "Lost Cave",
    0xb4: "Pattern Bush",
    0xb5: "Altering Cave",
    0xb6: "Tanoby Chambers",
    0xb7: "Three Isle Path",
    0xb8: "Tanoby Key",
    0xb9: "Birth Island",
    0xba: "Monean Chamber",
    0xbb: "Liptoo Chamber",
    0xbc: "Weepth Chamber",
    0xbd: "Dilford Chamber",
    0xbe: "Scufib Chamber",
    0xbf: "Rixy Chamber",
    0xc0: "Viapois Chamber",
    0xc1: "Ember Spa",
    0xc2: "Special Area",
    0xc3: "Pokémon Network Center",
    0xc4: "Celadon Dept.",

    // Emerald-exclusive locations (0xC5-0xD4)
    0xc5: "Special Area",
    0xc6: "Southern Island",
    0xc7: "Fiery Path",
    0xc8: "Jagged Pass",
    0xc9: "Mossdeep City",
    0xca: "Artisan Cave",
    0xcb: "Safari Zone",
    0xcc: "Underwater",
    0xcd: "Terra Cave",
    0xce: "Underwater",
    0xcf: "Underwater",
    0xd0: "Underwater",
    0xd1: "Desert Underpass",
    0xd2: "Altering Cave",
    0xd3: "Navel Rock",
    0xd4: "Trainer Hill",

    // Special locations (0xFD-0xFF)
    0xfd: "Gift Egg",
    0xfe: "In-game Trade",
    0xff: "Fateful Encounter",
};

// Gen 3 Pokémon ability mapping by species ID (1: Bulbasaur, etc.)
// Source: https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_Ability
export const ABILITY_MAP: { [speciesId: number]: string[] } = {
    // 1-3: Bulbasaur line
    1: ["Overgrow"],
    2: ["Overgrow"],
    3: ["Overgrow"],
    // 4-6: Charmander line
    4: ["Blaze"],
    5: ["Blaze"],
    6: ["Blaze"],
    // 7-9: Squirtle line
    7: ["Torrent"],
    8: ["Torrent"],
    9: ["Torrent"],
    // 10-12: Caterpie line
    10: ["Shield Dust"],
    11: ["Shed Skin"],
    12: ["Compound Eyes"],
    // 13-15: Weedle line
    13: ["Shield Dust"],
    14: ["Shed Skin"],
    15: ["Intimidate"],
    // 16-18: Pidgey line
    16: ["Keen Eye"],
    17: ["Keen Eye"],
    18: ["Keen Eye"],
    // 19-20: Rattata line
    19: ["Run Away", "Guts"],
    20: ["Run Away", "Guts"],
    // 21-22: Spearow line
    21: ["Keen Eye"],
    22: ["Keen Eye"],
    // 23-24: Ekans line
    23: ["Intimidate"],
    24: ["Intimidate"],
    // 25-26: Pikachu line
    25: ["Static"],
    26: ["Static"],
    // 27-28: Sandshrew line
    27: ["Sand Veil"],
    28: ["Sand Veil"],
    // 29-31: Nidoran♀ line
    29: ["Poison Point"],
    30: ["Poison Point"],
    31: ["Poison Point"],
    // 32-34: Nidoran♂ line
    32: ["Poison Point"],
    33: ["Poison Point"],
    34: ["Poison Point"],
    // 35-36: Clefairy line
    35: ["Cute Charm"],
    36: ["Cute Charm"],
    // 37-38: Vulpix line
    37: ["Flash Fire"],
    38: ["Flash Fire"],
    // 39-40: Jigglypuff line
    39: ["Cute Charm"],
    40: ["Cute Charm"],
    // 41-42: Zubat line
    41: ["Inner Focus"],
    42: ["Inner Focus"],
    // 43-45: Oddish line
    43: ["Chlorophyll"],
    44: ["Chlorophyll"],
    45: ["Chlorophyll"],
    // 46-47: Paras line
    46: ["Effect Spore"],
    47: ["Effect Spore"],
    // 48-49: Venonat line
    48: ["Compound Eyes"],
    49: ["Shield Dust"],
    // 50-51: Diglett line
    50: ["Sand Veil"],
    51: ["Sand Veil"],
    // 52-53: Meowth line
    52: ["Pickup"],
    53: ["Limber"],
    // 54-55: Psyduck line
    54: ["Damp", "Cloud Nine"],
    55: ["Damp", "Cloud Nine"],
    // 56-57: Mankey line
    56: ["Vital Spirit"],
    57: ["Vital Spirit"],
    // 58-59: Growlithe line
    58: ["Intimidate"],
    59: ["Intimidate"],
    // 60-62: Poliwag line
    60: ["Water Absorb", "Damp"],
    61: ["Water Absorb", "Damp"],
    62: ["Water Absorb", "Damp"],
    // 63-65: Abra line
    63: ["Synchronize"],
    64: ["Synchronize"],
    65: ["Synchronize"],
    // 66-68: Machop line
    66: ["Guts"],
    67: ["Guts"],
    68: ["Guts"],
    // 69-71: Bellsprout line
    69: ["Chlorophyll"],
    70: ["Chlorophyll"],
    71: ["Chlorophyll"],
    // 72-73: Tentacool line
    72: ["Clear Body", "Liquid Ooze"],
    73: ["Clear Body", "Liquid Ooze"],
    // 74-76: Geodude line
    74: ["Rock Head", "Sturdy"],
    75: ["Rock Head", "Sturdy"],
    76: ["Rock Head", "Sturdy"],
    // 77-78: Ponyta line
    77: ["Run Away", "Flash Fire"],
    78: ["Run Away", "Flash Fire"],
    // 79-80: Slowpoke line
    79: ["Oblivious", "Own Tempo"],
    80: ["Oblivious", "Own Tempo"],
    // 81-82: Magnemite line
    81: ["Magnet Pull"],
    82: ["Magnet Pull"],
    // 83: Farfetch'd
    83: ["Keen Eye"],
    // 84-85: Doduo line
    84: ["Run Away", "Early Bird"],
    85: ["Run Away", "Early Bird"],
    // 86-87: Seel line
    86: ["Thick Fat"],
    87: ["Thick Fat"],
    // 88-89: Grimer line
    88: ["Stench", "Sticky Hold"],
    89: ["Stench", "Sticky Hold"],
    // 90-91: Shellder line
    90: ["Shell Armor"],
    91: ["Shell Armor"],
    // 92-94: Gastly line
    92: ["Levitate"],
    93: ["Levitate"],
    94: ["Levitate"],
    // 95: Onix
    95: ["Rock Head", "Sturdy"],
    // 96-97: Drowzee line
    96: ["Insomnia"],
    97: ["Insomnia"],
    // 98-99: Krabby line
    98: ["Hyper Cutter", "Shell Armor"],
    99: ["Hyper Cutter", "Shell Armor"],
    // 100-101: Voltorb line
    100: ["Soundproof", "Static"],
    101: ["Soundproof", "Static"],
    // 102-103: Exeggcute line
    102: ["Chlorophyll"],
    103: ["Chlorophyll"],
    // 104-105: Cubone line
    104: ["Rock Head", "Lightning Rod"],
    105: ["Rock Head", "Lightning Rod"],
    // 106: Hitmonlee
    106: ["Limber"],
    // 107: Hitmonchan
    107: ["Keen Eye"],
    // 108: Lickitung
    108: ["Own Tempo", "Oblivious"],
    // 109-110: Koffing line
    109: ["Levitate"],
    110: ["Levitate"],
    // 111-112: Rhyhorn line
    111: ["Lightning Rod", "Rock Head"],
    112: ["Lightning Rod", "Rock Head"],
    // 113: Chansey
    113: ["Natural Cure", "Serene Grace"],
    // 114: Tangela
    114: ["Chlorophyll"],
    // 115: Kangaskhan
    115: ["Early Bird"],
    // 116-117: Horsea line
    116: ["Swift Swim"],
    117: ["Swift Swim"],
    // 118-119: Goldeen line
    118: ["Swift Swim", "Water Veil"],
    119: ["Swift Swim", "Water Veil"],
    // 120-121: Staryu line
    120: ["Illuminate", "Natural Cure"],
    121: ["Illuminate", "Natural Cure"],
    // 122: Mr. Mime
    122: ["Soundproof"],
    // 123: Scyther
    123: ["Swarm"],
    // 124: Jynx
    124: ["Oblivious", "Forewarn"],
    // 125: Electabuzz
    125: ["Static"],
    // 126: Magmar
    126: ["Flame Body"],
    // 127: Pinsir
    127: ["Hyper Cutter"],
    // 128: Tauros
    128: ["Intimidate"],
    // 129-130: Magikarp line
    129: ["Swift Swim"],
    130: ["Intimidate"],
    // 131: Lapras
    131: ["Water Absorb", "Shell Armor"],
    // 132: Ditto
    132: ["Limber"],
    // 133-136: Eevee line
    133: ["Run Away", "Adaptability"],
    134: ["Water Absorb"],
    135: ["Volt Absorb"],
    136: ["Flash Fire"],
    // 137: Porygon
    137: ["Trace"],
    // 138-139: Omanyte line
    138: ["Swift Swim", "Shell Armor"],
    139: ["Swift Swim", "Shell Armor"],
    // 140-141: Kabuto line
    140: ["Swift Swim", "Battle Armor"],
    141: ["Swift Swim", "Battle Armor"],
    // 142: Aerodactyl
    142: ["Rock Head", "Pressure"],
    // 143: Snorlax
    143: ["Immunity", "Thick Fat"],
    // 144: Articuno
    144: ["Pressure"],
    // 145: Zapdos
    145: ["Pressure"],
    // 146: Moltres
    146: ["Pressure"],
    // 147-149: Dratini line
    147: ["Shed Skin"],
    148: ["Shed Skin"],
    149: ["Inner Focus"],
    // 150: Mewtwo
    150: ["Pressure"],
    // 151: Mew
    151: ["Synchronize"],
    // 152-154: Chikorita line
    152: ["Overgrow"],
    153: ["Overgrow"],
    154: ["Overgrow"],
    // 155-157: Cyndaquil line
    155: ["Blaze"],
    156: ["Blaze"],
    157: ["Blaze"],
    // 158-160: Totodile line
    158: ["Torrent"],
    159: ["Torrent"],
    160: ["Torrent"],
    // 161-162: Sentret line
    161: ["Run Away", "Keen Eye"],
    162: ["Run Away", "Keen Eye"],
    // 163-164: Hoothoot line
    163: ["Insomnia"],
    164: ["Insomnia"],
    // 165-166: Ledyba line
    165: ["Swarm", "Early Bird"],
    166: ["Swarm", "Early Bird"],
    // 167-168: Spinarak line
    167: ["Swarm", "Insomnia"],
    168: ["Swarm", "Insomnia"],
    // 169: Crobat
    169: ["Inner Focus"],
    // 170-171: Chinchou line
    170: ["Volt Absorb", "Illuminate"],
    171: ["Volt Absorb", "Illuminate"],
    // 172: Pichu
    172: ["Static"],
    // 173: Cleffa
    173: ["Cute Charm"],
    // 174: Igglybuff
    174: ["Cute Charm"],
    // 175-176: Togepi line
    175: ["Hustle", "Serene Grace"],
    176: ["Hustle", "Serene Grace"],
    // 177-178: Natu line
    177: ["Synchronize", "Early Bird"],
    178: ["Synchronize", "Early Bird"],
    // 179-181: Mareep line
    179: ["Static"],
    180: ["Static"],
    181: ["Static"],
    // 182: Bellossom
    182: ["Chlorophyll"],
    // 183-184: Marill line
    183: ["Thick Fat", "Huge Power"],
    184: ["Thick Fat", "Huge Power"],
    // 185: Sudowoodo
    185: ["Sturdy", "Rock Head"],
    // 186: Politoed
    186: ["Water Absorb", "Damp"],
    // 187-189: Hoppip line
    187: ["Chlorophyll", "Leaf Guard"],
    188: ["Chlorophyll", "Leaf Guard"],
    189: ["Chlorophyll", "Leaf Guard"],
    // 190: Aipom
    190: ["Run Away", "Pickup"],
    // 191-192: Sunkern line
    191: ["Chlorophyll", "Solar Power"],
    192: ["Chlorophyll", "Solar Power"],
    // 193: Yanma
    193: ["Speed Boost"],
    // 194-195: Wooper line
    194: ["Water Absorb", "Damp"],
    195: ["Water Absorb", "Damp"],
    // 196-197: Espeon/Umbreon
    196: ["Synchronize"],
    197: ["Synchronize"],
    // 198: Murkrow
    198: ["Insomnia"],
    // 199: Slowking
    199: ["Oblivious", "Own Tempo"],
    // 200: Misdreavus
    200: ["Levitate"],
    // 201: Unown
    201: ["Levitate"],
    // 202: Wobbuffet
    202: ["Shadow Tag"],
    // 203: Girafarig
    203: ["Inner Focus", "Early Bird"],
    // 204-205: Pineco line
    204: ["Sturdy"],
    205: ["Sturdy"],
    // 206: Dunsparce
    206: ["Serene Grace", "Run Away"],
    // 207: Gligar
    207: ["Hyper Cutter", "Sand Veil"],
    // 208: Steelix
    208: ["Rock Head", "Sturdy"],
    // 209-210: Snubbull line
    209: ["Intimidate", "Run Away"],
    210: ["Intimidate", "Run Away"],
    // 211: Qwilfish
    211: ["Poison Point", "Swift Swim"],
    // 212: Scizor
    212: ["Swarm", "Technician"],
    // 213: Shuckle
    213: ["Sturdy", "Gluttony"],
    // 214: Heracross
    214: ["Swarm", "Guts"],
    // 215: Sneasel
    215: ["Inner Focus", "Keen Eye"],
    // 216-217: Teddiursa line
    216: ["Pickup", "Quick Feet"],
    217: ["Guts", "Quick Feet"],
    // 218-219: Slugma line
    218: ["Magma Armor", "Flame Body"],
    219: ["Magma Armor", "Flame Body"],
    // 220-221: Swinub line
    220: ["Oblivious", "Snow Cloak"],
    221: ["Oblivious", "Snow Cloak"],
    // 222: Corsola
    222: ["Hustle", "Natural Cure"],
    // 223-224: Remoraid line
    223: ["Hustle", "Sniper"],
    224: ["Suction Cups", "Sniper"],
    // 225: Delibird
    225: ["Vital Spirit", "Hustle"],
    // 226: Mantine
    226: ["Swift Swim", "Water Absorb"],
    // 227: Skarmory
    227: ["Keen Eye", "Sturdy"],
    // 228-229: Houndour line
    228: ["Early Bird", "Flash Fire"],
    229: ["Early Bird", "Flash Fire"],
    // 230: Kingdra
    230: ["Swift Swim", "Sniper"],
    // 231-232: Phanpy line
    231: ["Pickup", "Sand Veil"],
    232: ["Sturdy", "Sand Veil"],
    // 233: Porygon2
    233: ["Trace", "Download"],
    // 234: Stantler
    234: ["Intimidate", "Frisk"],
    // 235: Smeargle
    235: ["Own Tempo", "Technician"],
    // 236-238: Tyrogue line and baby forms
    236: ["Guts", "Steadfast"],
    237: ["Guts"],
    238: ["Oblivious", "Own Tempo"],
    // 239: Elekid
    239: ["Static"],
    // 240: Magby
    240: ["Flame Body"],
    // 241: Miltank
    241: ["Thick Fat", "Scrappy"],
    // 242: Blissey
    242: ["Natural Cure", "Serene Grace"],
    // 243: Raikou
    243: ["Pressure"],
    // 244: Entei
    244: ["Pressure"],
    // 245: Suicune
    245: ["Pressure"],
    // 246-248: Larvitar line
    246: ["Guts"],
    247: ["Shed Skin"],
    248: ["Sand Stream"],
    // 249: Lugia
    249: ["Pressure"],
    // 250: Ho-Oh
    250: ["Pressure"],
    // 251: Celebi
    251: ["Natural Cure"],
    // 252-254: Treecko line
    252: ["Overgrow"],
    253: ["Overgrow"],
    254: ["Overgrow"],
    // 255-257: Torchic line
    255: ["Blaze"],
    256: ["Blaze"],
    257: ["Blaze"],
    // 258-260: Mudkip line
    258: ["Torrent"],
    259: ["Torrent"],
    260: ["Torrent"],
    // 261-262: Poochyena line
    261: ["Run Away", "Quick Feet"],
    262: ["Intimidate", "Quick Feet"],
    // 263-264: Zigzagoon line
    263: ["Pickup", "Gluttony"],
    264: ["Pickup", "Gluttony"],
    // 265-267: Wurmple line -> includes Silcoon/Beautifly and Cascoon/Dustox
    265: ["Shield Dust", "Run Away"],
    266: ["Shed Skin"],
    267: ["Swarm"],
    268: ["Shed Skin"],
    269: ["Shield Dust", "Compound Eyes"],
    // 270-271: Lotad line
    270: ["Rain Dish", "Swift Swim"],
    271: ["Rain Dish", "Swift Swim"],
    272: ["Rain Dish", "Swift Swim"],
    // 273-275: Seedot line
    273: ["Chlorophyll", "Early Bird"],
    274: ["Chlorophyll", "Early Bird"],
    275: ["Chlorophyll", "Early Bird"],
    // 276-277: Taillow line
    276: ["Guts"],
    277: ["Guts"],
    // 278-279: Wingull line
    278: ["Keen Eye", "Hydration"],
    279: ["Keen Eye", "Hydration"],
    // 280-282: Ralts line
    280: ["Synchronize", "Trace"],
    281: ["Synchronize", "Trace"],
    282: ["Synchronize", "Trace"],
    // 283-284: Surskit line
    283: ["Swift Swim"],
    284: ["Intimidate"],
    // 285-286: Shroomish line
    285: ["Effect Spore", "Poison Heal"],
    286: ["Effect Spore", "Poison Heal"],
    // 287-289: Slakoth line
    287: ["Truant"],
    288: ["Vital Spirit"],
    289: ["Truant"],
    // 290-292: Nincada line (292: Shedinja)
    290: ["Compound Eyes", "Run Away"],
    291: ["Speed Boost"],
    292: ["Wonder Guard"],
    // 293-295: Whismur line
    293: ["Soundproof"],
    294: ["Soundproof"],
    295: ["Soundproof"],
    // 296-297: Makuhita line
    296: ["Thick Fat", "Guts"],
    297: ["Thick Fat", "Guts"],
    // 298: Azurill
    298: ["Thick Fat", "Huge Power"],
    // 299: Nosepass
    299: ["Sturdy", "Magnet Pull"],
    // 300-301: Skitty line
    300: ["Cute Charm", "Normalize"],
    301: ["Cute Charm", "Normalize"],
    // 302: Sableye
    302: ["Keen Eye", "Stall"],
    // 303: Mawile
    303: ["Hyper Cutter", "Intimidate"],
    // 304-306: Aron line
    304: ["Sturdy", "Rock Head"],
    305: ["Sturdy", "Rock Head"],
    306: ["Sturdy", "Rock Head"],
    // 307-308: Meditite line
    307: ["Pure Power"],
    308: ["Pure Power"],
    // 309-310: Electrike line
    309: ["Lightning Rod", "Static"],
    310: ["Lightning Rod", "Static"],
    // 311: Plusle
    311: ["Plus"],
    // 312: Minun
    312: ["Minus"],
    // 313: Volbeat
    313: ["Illuminate", "Swarm"],
    // 314: Illumise
    314: ["Oblivious", "Tinted Lens"],
    // 315: Roselia
    315: ["Natural Cure", "Poison Point"],
    // 316-317: Gulpin line
    316: ["Liquid Ooze", "Sticky Hold"],
    317: ["Liquid Ooze", "Sticky Hold"],
    // 318-319: Carvanha line
    318: ["Rough Skin", "Speed Boost"],
    319: ["Rough Skin", "Speed Boost"],
    // 320-321: Wailmer line
    320: ["Water Veil", "Oblivious"],
    321: ["Water Veil", "Oblivious"],
    // 322-323: Numel line
    322: ["Oblivious", "Simple"],
    323: ["Oblivious", "Simple"],
    // 324: Torkoal
    324: ["White Smoke", "Shell Armor"],
    // 325-326: Spoink line
    325: ["Thick Fat", "Own Tempo"],
    326: ["Thick Fat", "Own Tempo"],
    // 327: Spinda
    327: ["Own Tempo", "Tangled Feet"],
    // 328-330: Trapinch line
    328: ["Hyper Cutter", "Arena Trap"],
    329: ["Levitate"],
    330: ["Levitate"],
    // 331-332: Cacnea line
    331: ["Sand Veil", "Water Absorb"],
    332: ["Sand Veil", "Water Absorb"],
    // 333-334: Swablu line
    333: ["Natural Cure", "Cloud Nine"],
    334: ["Natural Cure", "Cloud Nine"],
    // 335: Zangoose
    335: ["Immunity", "Toxic Boost"],
    // 336: Seviper
    336: ["Shed Skin", "Infiltrator"],
    // 337-338: Lunatone/Solgaleo
    337: ["Levitate"],
    338: ["Levitate"],
    // 339-340: Barboach line
    339: ["Oblivious", "Anticipation"],
    340: ["Oblivious", "Anticipation"],
    // 341-342: Corphish line
    341: ["Hyper Cutter", "Adaptability"],
    342: ["Hyper Cutter", "Adaptability"],
    // 343-344: Baltoy line
    343: ["Levitate"],
    344: ["Levitate"],
    // 345-346: Lileep line
    345: ["Suction Cups", "Storm Drain"],
    346: ["Suction Cups", "Storm Drain"],
    // 347-348: Anorith line
    347: ["Battle Armor", "Swift Swim"],
    348: ["Battle Armor", "Swift Swim"],
    // 349-350: Feebas line
    349: ["Swift Swim", "Oblivious"],
    350: ["Marvel Scale", "Oblivious"],
    // 351: Castform
    351: ["Forecast"],
    // 352: Kecleon
    352: ["Color Change", "Protean"],
    // 353-354: Shuppet line
    353: ["Insomnia", "Frisk"],
    354: ["Insomnia", "Frisk"],
    // 355-356: Duskull line
    355: ["Levitate", "Frisk"],
    356: ["Levitate", "Frisk"],
    // 357: Tropius
    357: ["Chlorophyll", "Solar Power"],
    // 358: Chimecho
    358: ["Levitate"],
    // 359: Absol
    359: ["Pressure", "Super Luck"],
    // 360: Wynaut
    360: ["Shadow Tag", "Telepathy"],
    // 361-362: Snorunt line
    361: ["Inner Focus", "Ice Body"],
    362: ["Inner Focus", "Ice Body"],
    // 363-365: Spheal line
    363: ["Thick Fat", "Ice Body"],
    364: ["Thick Fat", "Ice Body"],
    365: ["Thick Fat", "Ice Body"],
    // 366-368: Clamperl/Huntail/Gorebyss
    366: ["Shell Armor", "Rattled"],
    367: ["Swift Swim", "Water Veil"],
    368: ["Swift Swim", "Hydration"],
    // 369: Relicanth
    369: ["Swift Swim", "Rock Head"],
    // 370: Luvdisc
    370: ["Swift Swim", "Hydration"],
    // 371-373: Bagon line
    371: ["Rock Head", "Sheer Force"],
    372: ["Rock Head", "Sheer Force"],
    373: ["Intimidate", "Moxie"],
    // 374-376: Beldum line
    374: ["Clear Body", "Light Metal"],
    375: ["Clear Body", "Light Metal"],
    376: ["Clear Body", "Light Metal"],
    // 377: Regirock
    377: ["Clear Body"],
    // 378: Regice
    378: ["Clear Body"],
    // 379: Registeel
    379: ["Clear Body"],
    // 380: Latias
    380: ["Levitate"],
    // 381: Latios
    381: ["Levitate"],
    // 382: Kyogre
    382: ["Drizzle"],
    // 383: Groudon
    383: ["Drought"],
    // 384: Rayquaza
    384: ["Air Lock"],
    // 385: Jirachi
    385: ["Serene Grace"],
    // 386: Deoxys
    386: ["Pressure"],
};

// Alternate species mapping using the Pokémon hex index numbers from Gen 3 internal order
// Based on https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_by_index_number_in_Generation_III
export const GEN3_SPECIES_MAP: { [hexIndex: number]: Species } = {
    // Gen 1 & 2 Pokémon (indices 1-251 match National Dex numbers)
    0x001: "Bulbasaur",
    0x002: "Ivysaur",
    0x003: "Venusaur",
    0x004: "Charmander",
    0x005: "Charmeleon",
    0x006: "Charizard",
    0x007: "Squirtle",
    0x008: "Wartortle",
    0x009: "Blastoise",
    0x00A: "Caterpie",
    0x00B: "Metapod",
    0x00C: "Butterfree",
    0x00D: "Weedle",
    0x00E: "Kakuna",
    0x00F: "Beedrill",
    0x010: "Pidgey",
    0x011: "Pidgeotto",
    0x012: "Pidgeot",
    0x013: "Rattata",
    0x014: "Raticate",
    0x015: "Spearow",
    0x016: "Fearow",
    0x017: "Ekans",
    0x018: "Arbok",
    0x019: "Pikachu",
    0x01A: "Raichu",
    0x01B: "Sandshrew",
    0x01C: "Sandslash",
    0x01D: "Nidoran♀",
    0x01E: "Nidorina",
    0x01F: "Nidoqueen",
    0x020: "Nidoran♂",
    0x021: "Nidorino",
    0x022: "Nidoking",
    0x023: "Clefairy",
    0x024: "Clefable",
    0x025: "Vulpix",
    0x026: "Ninetales",
    0x027: "Jigglypuff",
    0x028: "Wigglytuff",
    0x029: "Zubat",
    0x02A: "Golbat",
    0x02B: "Oddish",
    0x02C: "Gloom",
    0x02D: "Vileplume",
    0x02E: "Paras",
    0x02F: "Parasect",
    0x030: "Venonat",
    0x031: "Venomoth",
    0x032: "Diglett",
    0x033: "Dugtrio",
    0x034: "Meowth",
    0x035: "Persian",
    0x036: "Psyduck",
    0x037: "Golduck",
    0x038: "Mankey",
    0x039: "Primeape",
    0x03A: "Growlithe",
    0x03B: "Arcanine",
    0x03C: "Poliwag",
    0x03D: "Poliwhirl",
    0x03E: "Poliwrath",
    0x03F: "Abra",
    0x040: "Kadabra",
    0x041: "Alakazam",
    0x042: "Machop",
    0x043: "Machoke",
    0x044: "Machamp",
    0x045: "Bellsprout",
    0x046: "Weepinbell",
    0x047: "Victreebel",
    0x048: "Tentacool",
    0x049: "Tentacruel",
    0x04A: "Geodude",
    0x04B: "Graveler",
    0x04C: "Golem",
    0x04D: "Ponyta",
    0x04E: "Rapidash",
    0x04F: "Slowpoke",
    0x050: "Slowbro",
    0x051: "Magnemite",
    0x052: "Magneton",
    0x053: "Farfetch'd",
    0x054: "Doduo",
    0x055: "Dodrio",
    0x056: "Seel",
    0x057: "Dewgong",
    0x058: "Grimer",
    0x059: "Muk",
    0x05A: "Shellder",
    0x05B: "Cloyster",
    0x05C: "Gastly",
    0x05D: "Haunter",
    0x05E: "Gengar",
    0x05F: "Onix",
    0x060: "Drowzee",
    0x061: "Hypno",
    0x062: "Krabby",
    0x063: "Kingler",
    0x064: "Voltorb",
    0x065: "Electrode",
    0x066: "Exeggcute",
    0x067: "Exeggutor",
    0x068: "Cubone",
    0x069: "Marowak",
    0x06A: "Hitmonlee",
    0x06B: "Hitmonchan",
    0x06C: "Lickitung",
    0x06D: "Koffing",
    0x06E: "Weezing",
    0x06F: "Rhyhorn",
    0x070: "Rhydon",
    0x071: "Chansey",
    0x072: "Tangela",
    0x073: "Kangaskhan",
    0x074: "Horsea",
    0x075: "Seadra",
    0x076: "Goldeen",
    0x077: "Seaking",
    0x078: "Staryu",
    0x079: "Starmie",
    0x07A: "Mr. Mime",
    0x07B: "Scyther",
    0x07C: "Jynx",
    0x07D: "Electabuzz",
    0x07E: "Magmar",
    0x07F: "Pinsir",
    0x080: "Tauros",
    0x081: "Magikarp",
    0x082: "Gyarados",
    0x083: "Lapras",
    0x084: "Ditto",
    0x085: "Eevee",
    0x086: "Vaporeon",
    0x087: "Jolteon",
    0x088: "Flareon",
    0x089: "Porygon",
    0x08A: "Omanyte",
    0x08B: "Omastar",
    0x08C: "Kabuto",
    0x08D: "Kabutops",
    0x08E: "Aerodactyl",
    0x08F: "Snorlax",
    0x090: "Articuno",
    0x091: "Zapdos",
    0x092: "Moltres",
    0x093: "Dratini",
    0x094: "Dragonair",
    0x095: "Dragonite",
    0x096: "Mewtwo",
    0x097: "Mew",
    0x098: "Chikorita",
    0x099: "Bayleef",
    0x09A: "Meganium",
    0x09B: "Cyndaquil",
    0x09C: "Quilava",
    0x09D: "Typhlosion",
    0x09E: "Totodile",
    0x09F: "Croconaw",
    0x0A0: "Feraligatr",
    0x0A1: "Sentret",
    0x0A2: "Furret",
    0x0A3: "Hoothoot",
    0x0A4: "Noctowl",
    0x0A5: "Ledyba",
    0x0A6: "Ledian",
    0x0A7: "Spinarak",
    0x0A8: "Ariados",
    0x0A9: "Crobat",
    0x0AA: "Chinchou",
    0x0AB: "Lanturn",
    0x0AC: "Pichu",
    0x0AD: "Cleffa",
    0x0AE: "Igglybuff",
    0x0AF: "Togepi",
    0x0B0: "Togetic",
    0x0B1: "Natu",
    0x0B2: "Xatu",
    0x0B3: "Mareep",
    0x0B4: "Flaaffy",
    0x0B5: "Ampharos",
    0x0B6: "Bellossom",
    0x0B7: "Marill",
    0x0B8: "Azumarill",
    0x0B9: "Sudowoodo",
    0x0BA: "Politoed",
    0x0BB: "Hoppip",
    0x0BC: "Skiploom",
    0x0BD: "Jumpluff",
    0x0BE: "Aipom",
    0x0BF: "Sunkern",
    0x0C0: "Sunflora",
    0x0C1: "Yanma",
    0x0C2: "Wooper",
    0x0C3: "Quagsire",
    0x0C4: "Espeon",
    0x0C5: "Umbreon",
    0x0C6: "Murkrow",
    0x0C7: "Slowking",
    0x0C8: "Misdreavus",
    0x0C9: "Unown",
    0x0CA: "Wobbuffet",
    0x0CB: "Girafarig",
    0x0CC: "Pineco",
    0x0CD: "Forretress",
    0x0CE: "Dunsparce",
    0x0CF: "Gligar",
    0x0D0: "Steelix",
    0x0D1: "Snubbull",
    0x0D2: "Granbull",
    0x0D3: "Qwilfish",
    0x0D4: "Scizor",
    0x0D5: "Shuckle",
    0x0D6: "Heracross",
    0x0D7: "Sneasel",
    0x0D8: "Teddiursa",
    0x0D9: "Ursaring",
    0x0DA: "Slugma",
    0x0DB: "Magcargo",
    0x0DC: "Swinub",
    0x0DD: "Piloswine",
    0x0DE: "Corsola",
    0x0DF: "Remoraid",
    0x0E0: "Octillery",
    0x0E1: "Delibird",
    0x0E2: "Mantine",
    0x0E3: "Skarmory",
    0x0E4: "Houndour",
    0x0E5: "Houndoom",
    0x0E6: "Kingdra",
    0x0E7: "Phanpy",
    0x0E8: "Donphan",
    0x0E9: "Porygon2",
    0x0EA: "Stantler",
    0x0EB: "Smeargle",
    0x0EC: "Tyrogue",
    0x0ED: "Hitmontop",
    0x0EE: "Smoochum",
    0x0EF: "Elekid",
    0x0F0: "Magby",
    0x0F1: "Miltank",
    0x0F2: "Blissey",
    0x0F3: "Raikou",
    0x0F4: "Entei",
    0x0F5: "Suicune",
    0x0F6: "Larvitar",
    0x0F7: "Pupitar",
    0x0F8: "Tyranitar",
    0x0F9: "Lugia",
    0x0FA: "Ho-Oh",
    0x0FB: "Celebi",

    // Gen 3 Pokémon (indices 277-411) - internal order differs from National Dex
    // Chimecho (0x19B) was added late in development and placed at the end
    0x115: "Treecko",
    0x116: "Grovyle",
    0x117: "Sceptile",
    0x118: "Torchic",
    0x119: "Combusken",
    0x11A: "Blaziken",
    0x11B: "Mudkip",
    0x11C: "Marshtomp",
    0x11D: "Swampert",
    0x11E: "Poochyena",
    0x11F: "Mightyena",
    0x120: "Zigzagoon",
    0x121: "Linoone",
    0x122: "Wurmple",
    0x123: "Silcoon",
    0x124: "Beautifly",
    0x125: "Cascoon",
    0x126: "Dustox",
    0x127: "Lotad",
    0x128: "Lombre",
    0x129: "Ludicolo",
    0x12A: "Seedot",
    0x12B: "Nuzleaf",
    0x12C: "Shiftry",
    0x12D: "Nincada",
    0x12E: "Ninjask",
    0x12F: "Shedinja",
    0x130: "Taillow",
    0x131: "Swellow",
    0x132: "Shroomish",
    0x133: "Breloom",
    0x134: "Spinda",
    0x135: "Wingull",
    0x136: "Pelipper",
    0x137: "Surskit",
    0x138: "Masquerain",
    0x139: "Wailmer",
    0x13A: "Wailord",
    0x13B: "Skitty",
    0x13C: "Delcatty",
    0x13D: "Kecleon",
    0x13E: "Baltoy",
    0x13F: "Claydol",
    0x140: "Nosepass",
    0x141: "Torkoal",
    0x142: "Sableye",
    0x143: "Barboach",
    0x144: "Whiscash",
    0x145: "Luvdisc",
    0x146: "Corphish",
    0x147: "Crawdaunt",
    0x148: "Feebas",
    0x149: "Milotic",
    0x14A: "Carvanha",
    0x14B: "Sharpedo",
    0x14C: "Trapinch",
    0x14D: "Vibrava",
    0x14E: "Flygon",
    0x14F: "Makuhita",
    0x150: "Hariyama",
    0x151: "Electrike",
    0x152: "Manectric",
    0x153: "Numel",
    0x154: "Camerupt",
    0x155: "Spheal",
    0x156: "Sealeo",
    0x157: "Walrein",
    0x158: "Cacnea",
    0x159: "Cacturne",
    0x15A: "Snorunt",
    0x15B: "Glalie",
    0x15C: "Lunatone",
    0x15D: "Solrock",
    0x15E: "Azurill",
    0x15F: "Spoink",
    0x160: "Grumpig",
    0x161: "Plusle",
    0x162: "Minun",
    0x163: "Mawile",
    0x164: "Meditite",
    0x165: "Medicham",
    0x166: "Swablu",
    0x167: "Altaria",
    0x168: "Wynaut",
    0x169: "Duskull",
    0x16A: "Dusclops",
    0x16B: "Roselia",
    0x16C: "Slakoth",
    0x16D: "Vigoroth",
    0x16E: "Slaking",
    0x16F: "Gulpin",
    0x170: "Swalot",
    0x171: "Tropius",
    0x172: "Whismur",
    0x173: "Loudred",
    0x174: "Exploud",
    0x175: "Clamperl",
    0x176: "Huntail",
    0x177: "Gorebyss",
    0x178: "Absol",
    0x179: "Shuppet",
    0x17A: "Banette",
    0x17B: "Seviper",
    0x17C: "Zangoose",
    0x17D: "Relicanth",
    0x17E: "Aron",
    0x17F: "Lairon",
    0x180: "Aggron",
    0x181: "Castform",
    0x182: "Volbeat",
    0x183: "Illumise",
    0x184: "Lileep",
    0x185: "Cradily",
    0x186: "Anorith",
    0x187: "Armaldo",
    0x188: "Ralts",
    0x189: "Kirlia",
    0x18A: "Gardevoir",
    0x18B: "Bagon",
    0x18C: "Shelgon",
    0x18D: "Salamence",
    0x18E: "Beldum",
    0x18F: "Metang",
    0x190: "Metagross",
    0x191: "Regirock",
    0x192: "Regice",
    0x193: "Registeel",
    0x194: "Kyogre",
    0x195: "Groudon",
    0x196: "Rayquaza",
    0x197: "Latias",
    0x198: "Latios",
    0x199: "Jirachi",
    0x19A: "Deoxys",
    0x19B: "Chimecho",
    0x19C: "Egg" as Species,

    // Unown form indices (0x19D-0x1B7) - forms handled separately
    0x19D: "Unown",
    0x19E: "Unown",
    0x19F: "Unown",
    0x1A0: "Unown",
    0x1A1: "Unown",
    0x1A2: "Unown",
    0x1A3: "Unown",
    0x1A4: "Unown",
    0x1A5: "Unown",
    0x1A6: "Unown",
    0x1A7: "Unown",
    0x1A8: "Unown",
    0x1A9: "Unown",
    0x1AA: "Unown",
    0x1AB: "Unown",
    0x1AC: "Unown",
    0x1AD: "Unown",
    0x1AE: "Unown",
    0x1AF: "Unown",
    0x1B0: "Unown",
    0x1B1: "Unown",
    0x1B2: "Unown",
    0x1B3: "Unown",
    0x1B4: "Unown",
    0x1B5: "Unown",
    0x1B6: "Unown",
    0x1B7: "Unown",
};