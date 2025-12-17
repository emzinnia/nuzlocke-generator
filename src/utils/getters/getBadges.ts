import { Badge, Game } from "models";

export function getBadges(name: Game["name"]): Badge[] {
    if (
        name === "Red" ||
        name === "Blue" ||
        name === "Yellow" ||
        name === "Green" ||
        name === "FireRed" ||
        name === "LeafGreen" ||
        name === "Let's Go Eevee" ||
        name === "Let's Go Pikachu"
    ) {
        return [
            { name: "Boulder Badge", image: "boulder-badge" },
            { name: "Cascade Badge", image: "cascade-badge" },
            { name: "Thunder Badge", image: "thunder-badge" },
            { name: "Rainbow Badge", image: "rainbow-badge" },
            { name: "Soul Badge", image: "soul-badge" },
            { name: "Marsh Badge", image: "marsh-badge" },
            { name: "Volcano Badge", image: "volcano-badge" },
            { name: "Earth Badge", image: "earth-badge" },
        ];
    }

    if (
        name === "Gold" ||
        name === "Silver" ||
        name === "Crystal" ||
        name === "HeartGold" ||
        name === "SoulSilver"
    ) {
        return [
            { name: "Zephyr Badge", image: "zephyr-badge" },
            { name: "Hive Badge", image: "hive-badge" },
            { name: "Plain Badge", image: "plain-badge" },
            { name: "Fog Badge", image: "fog-badge" },
            { name: "Storm Badge", image: "storm-badge" },
            { name: "Mineral Badge", image: "mineral-badge" },
            { name: "Glacier Badge", image: "glacier-badge" },
            { name: "Rising Badge", image: "rising-badge" },
            { name: "Boulder Badge", image: "boulder-badge" },
            { name: "Cascade Badge", image: "cascade-badge" },
            { name: "Thunder Badge", image: "thunder-badge" },
            { name: "Rainbow Badge", image: "rainbow-badge" },
            { name: "Soul Badge", image: "soul-badge" },
            { name: "Marsh Badge", image: "marsh-badge" },
            { name: "Volcano Badge", image: "volcano-badge" },
            { name: "Earth Badge", image: "earth-badge" },
        ];
    }

    if (
        name === "Ruby" ||
        name === "Sapphire" ||
        name === "Emerald" ||
        name === "AlphaSapphire" ||
        name === "OmegaRuby"
    ) {
        return [
            { name: "Stone Badge", image: "stone-badge" },
            { name: "Knuckle Badge", image: "knuckle-badge" },
            { name: "Dynamo Badge", image: "dynamo-badge" },
            { name: "Heat Badge", image: "heat-badge" },
            { name: "Balance Badge", image: "balance-badge" },
            { name: "Feather Badge", image: "feather-badge" },
            { name: "Mind Badge", image: "mind-badge" },
            { name: "Rain Badge", image: "rain-badge" },
        ];
    }

    if (
        name === "Diamond" ||
        name === "Pearl" ||
        name === "Platinum" ||
        name === "Brilliant Diamond" ||
        name === "Shining Pearl"
    ) {
        return [
            { name: "Coal Badge", image: "coal-badge" },
            { name: "Forest Badge", image: "forest-badge" },
            { name: "Cobble Badge", image: "cobble-badge" },
            { name: "Fen Badge", image: "fen-badge" },
            { name: "Relic Badge", image: "relic-badge" },
            { name: "Mine Badge", image: "mine-badge" },
            { name: "Icicle Badge", image: "icicle-badge" },
            { name: "Beacon Badge", image: "beacon-badge" },
        ];
    }

    if (name === "Black" || name === "White") {
        return [
            { name: "Trio Badge", image: "trio-badge" },
            { name: "Basic Badge", image: "basic-badge" },
            { name: "Insect Badge", image: "insect-badge" },
            { name: "Bolt Badge", image: "bolt-badge" },
            { name: "Quake Badge", image: "quake-badge" },
            { name: "Jet Badge", image: "jet-badge" },
            { name: "Freeze Badge", image: "freeze-badge" },
            { name: "Legend Badge", image: "legend-badge" },
        ];
    }

    if (name === "Black 2" || name === "White 2") {
        return [
            { name: "Basic Badge", image: "basic-badge" },
            { name: "Toxic Badge", image: "toxic-badge" },
            { name: "Insect Badge", image: "insect-badge" },
            { name: "Bolt Badge", image: "bolt-badge" },
            { name: "Quake Badge", image: "quake-badge" },
            { name: "Jet Badge", image: "jet-badge" },
            { name: "Legend Badge", image: "legend-badge" },
            { name: "Wave Badge", image: "wave-badge" },
        ];
    }

    if (name === "X" || name === "Y") {
        return [
            { name: "Bug Badge", image: "bug-badge" },
            { name: "Cliff Badge", image: "cliff-badge" },
            { name: "Rumble Badge", image: "rumble-badge" },
            { name: "Plant Badge", image: "plant-badge" },
            { name: "Voltage Badge", image: "voltage-badge" },
            { name: "Fairy Badge", image: "fairy-badge" },
            { name: "Psychic Badge", image: "psychic-badge" },
            { name: "Iceberg Badge", image: "iceberg-badge" },
        ];
    }

    if (name === "Sun" || name === "Moon") {
        return [
            { name: "Normalium Z", image: "normalium-z" },
            { name: "Fightium Z", image: "fightium-z" },
            { name: "Waterium Z", image: "waterium-z" },
            { name: "Firium Z", image: "firium-z" },
            { name: "Grassium Z", image: "grassium-z" },
            { name: "Rockium Z", image: "rockium-z" },
            { name: "Electrium Z", image: "electrium-z" },
            { name: "Ghostium Z", image: "ghostium-z" },
            { name: "Darkinium Z", image: "darkinium-z" },
            { name: "Dragonium Z", image: "dragonium-z" },
            { name: "Groundium Z", image: "groundium-z" },
        ];
    }

    if (name === "Ultra Sun" || name === "Ultra Moon") {
        return [
            { name: "Normalium Z", image: "normalium-z" },
            { name: "Fightium Z", image: "fightium-z" },
            { name: "Waterium Z", image: "waterium-z" },
            { name: "Firium Z", image: "firium-z" },
            { name: "Grassium Z", image: "grassium-z" },
            { name: "Rockium Z", image: "rockium-z" },
            { name: "Electrium Z", image: "electrium-z" },
            { name: "Ghostium Z", image: "ghostium-z" },
            { name: "Darkinium Z", image: "darkinium-z" },
            { name: "Dragonium Z", image: "dragonium-z" },
            { name: "Fairium Z", image: "fairium-z" },
            { name: "Groundium Z", image: "groundium-z" },
        ];
    }

    if (name === "Sword") {
        return [
            { name: "Grass Badge", image: "grass-badge" },
            { name: "Water Badge", image: "water-badge" },
            { name: "Fire Badge", image: "fire-badge" },
            { name: "Fighting Badge", image: "fighting-badge" },
            { name: "Fairy Badge", image: "galar-fairy-badge" },
            { name: "Rock Badge", image: "rock-badge" },
            { name: "Dark Badge", image: "dark-badge" },
            { name: "Dragon Badge", image: "dragon-badge" },
        ];
    }

    if (name === "Shield") {
        return [
            { name: "Grass Badge", image: "grass-badge" },
            { name: "Water Badge", image: "water-badge" },
            { name: "Fire Badge", image: "fire-badge" },
            { name: "Ghost Badge", image: "ghost-badge" },
            { name: "Fairy Badge", image: "galar-fairy-badge" },
            { name: "Ice Badge", image: "ice-badge" },
            { name: "Dark Badge", image: "dark-badge" },
            { name: "Dragon Badge", image: "dragon-badge" },
        ];
    }

    if (name === "Scarlet" || name === "Violet") {
        return [
            { name: "Cortondo Gym", image: "paldea/bug-badge" },
            { name: "Stony Cliff Titan", image: "paldea/rock-badge" },
            { name: "Artazon Gym", image: "paldea/grass-badge" },
            { name: "Open Sky Titan", image: "paldea/flying-badge" },
            { name: "Team Star Dark", image: "paldea/dark-badge" },
            { name: "Levincia Gym", image: "paldea/electric-badge" },
            { name: "Team Star Fire", image: "paldea/fire-badge" },
            { name: "Lurking Steel Titan", image: "paldea/steel-badge" },
            { name: "Cascarrafa Gym", image: "paldea/water-badge" },
            { name: "Team Star Poison", image: "paldea/poison-badge" },
            { name: "Medali Gym", image: "paldea/normal-badge" },
            { name: "Montenevera Gym", image: "paldea/ghost-badge" },
            { name: "Quaking Earth Titan", image: "paldea/ground-badge" },
            { name: "Alfornada Gym", image: "paldea/psychic-badge" },
            { name: "Glaseado Gym", image: "paldea/ice-badge" },
            { name: "Team Star Fairy", image: "paldea/fairy-badge" },
            { name: "False Dragon Titan", image: "paldea/dragon-badge" },
            { name: "Team Star Fighting", image: "paldea/fighting-badge" },
        ];
    }

    return [];
}

export function getAllBadges() {
    return [
        ...getBadges("Gold"),
        { name: "Champion", image: "champion-ribbon" },
        { name: "Legend Ribbon", image: "legend-ribbon" },
        ...getBadges("Emerald"),
        { name: "Hoenn Champion", image: "hoenn-champion-ribbon" },
        ...getBadges("Platinum"),
        { name: "Sinnoh Champion", image: "sinnoh-champion-ribbon" },
        { name: "Trio Badge", image: "trio-badge" },
        { name: "Freeze Badge", image: "freeze-badge" },
        ...getBadges("Black 2"),
        { name: "Unova Champion", image: "unova-champion-ribbon" },
        ...getBadges("X"),
        { name: "Kalos Champion", image: "kalos-champion-ribbon" },
        ...getBadges("Ultra Sun"),
        { name: "Alola Champion", image: "alola-champion-ribbon" },
        ...getBadges("Sword"),
        { name: "Ghost Badge", image: "ghost-badge" },
        { name: "Ice Badge", image: "ice-badge" },
        ...getBadges("Violet"),
        { name: "Paldea Champion", image: "paldea-champion-ribbon" },
        { name: "Empty Badge", image: "unknown" },
    ];
}
