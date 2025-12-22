import * as React from "react";
import { Pokemon } from "models";
import { css } from "emotion";
import { stripURLCSS, getPokemonImage } from "utils";
import { State } from "state";

const styles = {
    showdownBase: css`
        padding: 1rem;
        font-size: 1.5rem;
        vertical-align: top;
    `,
    showdownImage: css`
        height: 6rem;
        border-radius: 0.5rem;
    `,
};

export const Showdown = ({
    pokemon,
    style,
    editor,
    game,
}: {
    pokemon: Pokemon;
    style: State["style"];
    editor: State["editor"];
    game: State["game"];
}) => {
    const { customImage, shiny, species, gender, forme, nickname } = pokemon;
    const { name } = game;

    return (
        <div className={styles.showdownBase}>
            <img
                alt={nickname}
                className={styles.showdownImage}
                src={stripURLCSS(
                    getPokemonImage({
                        customImage,
                        shiny,
                        species,
                        style,
                        editor,
                        gender,
                        forme: forme as any,
                        name,
                    }),
                )}
            />
            <div>
                {pokemon.nickname && `(${pokemon.nickname})`} {pokemon.species}{" "}
                {pokemon.gender === "f" ? "(F)" : "(M)"}{" "}
                {pokemon.item && `@ ${pokemon.item}`}
            </div>
            {pokemon?.ability && (
                <div>Ability: {pokemon.ability && "Cursed Body"}</div>
            )}
            {pokemon?.level && <div>Level: {pokemon.level}</div>}
            {pokemon?.shiny && <div>Shiny: Yes</div>}
            {/* EVs: 252 HP / 252 Atk / 4 SpD  */}
            {pokemon?.nature && <div>{pokemon?.nature} Nature</div>}
            {pokemon?.moves?.map((move, index) => (
                <div key={index}>- {move}</div>
            ))}
            {pokemon?.notes}
        </div>
    );
};
