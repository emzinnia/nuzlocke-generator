import { Pokemon } from "models";

export const mergeImportedPokemon = (
    currentPokemon: Pokemon[],
    importedPokemon: Pokemon[],
) => {
    const existingById = new Map(
        currentPokemon.map((poke) => [poke.id, poke]),
    );
    const importedIds = new Set(importedPokemon.map((poke) => poke.id));
    const mergedPokemon = importedPokemon.map((poke) => {
        const existingPokemon = existingById.get(poke.id);
        return existingPokemon
            ? {
                  ...existingPokemon,
                  ...poke,
              }
            : poke;
    });
    const unmatchedExistingPokemon = currentPokemon.filter(
        (poke) => !importedIds.has(poke.id),
    );
    return [...unmatchedExistingPokemon, ...mergedPokemon];
};
