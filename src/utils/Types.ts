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
}

export const getListOfTypes = (
    customTypes: State["customTypes"],
) =>
    [
        "None",
        Types.Bug,
        Types.Dark,
        Types.Dragon,
        Types.Electric,
        Types.Fairy,
        Types.Fighting,
        Types.Fire,
        Types.Flying,
        Types.Ghost,
        Types.Grass,
        Types.Ground,
        Types.Ice,
        Types.Normal,
        Types.Poison,
        Types.Psychic,
        Types.Rock,
        Types.Shadow,
        Types.Steel,
        Types.Water,
        ...(customTypes?.map((c) => c.type) ?? []),
    ];
