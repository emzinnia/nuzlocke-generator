import { State } from "state";

export type CopyNuzlockeDataMode = "pokemon" | "boxes" | "boxes-and-pokemon";

const cloneJsonValue = <T,>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T;

const copyPokemon = (
    targetData: State,
    sourceData: State,
): Pick<State, "pokemon" | "selectedId"> => {
    const pokemon = cloneJsonValue(sourceData.pokemon ?? []);
    const selectedId =
        sourceData.selectedId &&
        pokemon.some((poke) => poke.id === sourceData.selectedId)
            ? sourceData.selectedId
            : pokemon[0]?.id ?? targetData.selectedId;

    return {
        pokemon,
        selectedId,
    };
};

export const copyNuzlockeData = (
    targetData: State,
    sourceData: State,
    mode: CopyNuzlockeDataMode,
): State => {
    const nextData = { ...targetData };

    if (mode === "boxes" || mode === "boxes-and-pokemon") {
        nextData.box = cloneJsonValue(sourceData.box ?? []);
    }

    if (mode === "pokemon" || mode === "boxes-and-pokemon") {
        Object.assign(nextData, copyPokemon(targetData, sourceData));
    }

    return nextData;
};

