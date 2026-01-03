import * as React from "react";
import { Pokemon } from "models";
import { addForme, Forme } from "utils";

interface TeamPokemonProps {
    teamPokemon: Pokemon[];
}

const getImage = (species: string, forme: keyof typeof Forme) => {
    return `url(/img/${(
        addForme(
            (species || "")
                .trim()
                .replace(/\s/g, "-")
                .replace(/'/g, "")
                .replace(/:/g, "-"),
            forme,
        ) || "missingno"
    ).toLowerCase()}.jpg)`;
}

export const TeamPokemon = ({ teamPokemon }: TeamPokemonProps) => {
    return (
        <div className="team-pokemon-list flex flex-wrap gap-0.5 w-full">
            {teamPokemon.map((poke) => (
                <div key={poke.id} className="team-pokemon flex gap-2 p-2">
                    <div className="team-pokemon-image-wrapper w-20 h-20">
                        <div className="team-pokemon-image" style={{ backgroundImage: getImage(poke.species, poke.forme as keyof typeof Forme) }}></div>
                    </div>
                    <div className="flex flex-row gap-2 team-pokemon-name">
                        <span className="font-semibold mb-1">{poke.nickname}</span>
                        <span>{poke.species}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

