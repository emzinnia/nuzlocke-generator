const heldItemIconFileNameOverrides: Record<string, string> = {
    BlackGlasses: "black-glasses.png",
    BrightPowder: "bright-powder.png",
    "Bug Tera Shard": "../tera/bug.png",
    "Dark Tera Shard": "../tera/dark.png",
    "Dragon Tera Shard": "../tera/dragon.png",
    "Electric Tera Shard": "../tera/electric.png",
    "Fairy Tera Shard": "../tera/fairy.png",
    "Fighting Tera Shard": "../tera/fighting.png",
    "Fire Tera Shard": "../tera/fire.png",
    "Flying Tera Shard": "../tera/flying.png",
    "Ghost Tera Shard": "../tera/ghost.png",
    "Grass Tera Shard": "../tera/grass.png",
    "Ground Tera Shard": "../tera/ground.png",
    "Ice Tera Shard": "../tera/ice.png",
    NeverMeltIce: "never-melt-ice.png",
    "Normal Tera Shard": "../tera/normal.png",
    "Poison Tera Shard": "../tera/poison.png",
    "Psychic Tera Shard": "../tera/psychic.png",
    "Rock Tera Shard": "../tera/rock.png",
    SilverPowder: "silver-powder.png",
    "Steel Tera Shard": "../tera/steel.png",
    TwistedSpoon: "twisted-spoon.png",
    "Water Tera Shard": "../tera/water.png",
};

export const formatHeldItemIconFileName = (itemName: string) =>
    heldItemIconFileNameOverrides[itemName] ??
    `${itemName.toLowerCase().replace(/'/g, "").replace(/\s/g, "-")}.png`;

export const getHeldItemIconPath = (itemName: string) =>
    `icons/hold-item/${formatHeldItemIconFileName(itemName)}`;
