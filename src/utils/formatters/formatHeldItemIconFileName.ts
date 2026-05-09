const heldItemIconFileNameOverrides: Record<string, string> = {
    BlackGlasses: "black-glasses.png",
    BrightPowder: "bright-powder.png",
    NeverMeltIce: "never-melt-ice.png",
    SilverPowder: "silver-powder.png",
    TwistedSpoon: "twisted-spoon.png",
};

export const formatHeldItemIconFileName = (itemName: string) =>
    heldItemIconFileNameOverrides[itemName] ??
    `${itemName.toLowerCase().replace(/'/g, "").replace(/\s/g, "-")}.png`;

export const getHeldItemIconPath = (itemName: string) =>
    `icons/hold-item/${formatHeldItemIconFileName(itemName)}`;
