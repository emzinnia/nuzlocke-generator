import { State } from "state";

export enum Types {
    Grass = "Grass",
    Fire = "Fire",
    Water = "Water",
    Electric = "Electric",
    Rock = "Rock",
    Ground = "Ground",
    Steel = "Steel",
    Flying = "Flying",
    Poison = "Poison",
    Psychic = "Psychic",
    Fighting = "Fighting",
    Bug = "Bug",
    Fairy = "Fairy",
    Normal = "Normal",
    Ice = "Ice",
    Dragon = "Dragon",
    Dark = "Dark",
    Ghost = "Ghost",

    Shadow = "Shadow",

    Neutral = "Neutral",
    Crystal = "Crystal",
    Digital = "Digital",
    Earth = "Earth",
    Melee = "Melee",
    Mental = "Mental",
    Toxic = "Toxic",
    Wind = "Wind",
    Nature = "Nature",
}

export type TemtemTypes =
    | Types.Neutral
    | Types.Crystal
    | Types.Digital
    | Types.Earth
    | Types.Melee
    | Types.Mental
    | Types.Toxic
    | Types.Wind
    | Types.Nature;
export const isTemTemType = (type: Types) => {
    return (
        type === Types.Neutral ||
        type === Types.Crystal ||
        type === Types.Digital ||
        type === Types.Earth ||
        type === Types.Melee ||
        type === Types.Mental ||
        type === Types.Toxic ||
        type === Types.Wind ||
        type === Types.Nature
    );
};

export const getListOfTypes = (
    customTypes: State["customTypes"],
    includeTemTemTypes: boolean = true,
) =>
    [
        "None",
        Types.Bug,
        Types.Crystal,
        Types.Dark,
        Types.Digital,
        Types.Dragon,
        Types.Earth,
        Types.Electric,
        Types.Fairy,
        Types.Fighting,
        Types.Fire,
        Types.Flying,
        Types.Ghost,
        Types.Grass,
        Types.Ground,
        Types.Ice,
        Types.Melee,
        Types.Mental,
        Types.Nature,
        Types.Neutral,
        Types.Normal,
        Types.Poison,
        Types.Psychic,
        Types.Rock,
        Types.Shadow,
        Types.Steel,
        Types.Toxic,
        Types.Water,
        Types.Wind,
        ...customTypes.map((c) => c.type),
    ].filter((t) => (includeTemTemTypes ? true : !isTemTemType(t as Types)));
