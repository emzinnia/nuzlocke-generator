import * as React from "react";
import { connect } from "store/reactZustand";
import { css, cx } from "emotion";

import { Pokemon } from "models";
import { selectPokemon } from "actions";
import {
    getContrastColor,
    getPokemonBackgroundStyle,
    Styles,
    gameOfOriginToColor,
} from "utils";
import { PokemonIcon } from "components/Pokemon/PokemonIcon/PokemonIcon";
import { GenderElement } from "components/Common/Shared";
import { State } from "state";

export type BoxedPokemonProps = Pokemon & { selectPokemon: selectPokemon } & {
    style: Styles;
    customTypes?: State["customTypes"];
};

const getAccentColor = (prop: BoxedPokemonProps) =>
    prop?.style ? prop?.style.accentColor : "#111111";

const determineWidth = (isMinimal, numerator): string => {
    return isMinimal ? "auto" : `calc(94% / ${numerator})`;
};

// @TODO: fix this messy prop soup
export const BoxedPokemonBase = (poke: BoxedPokemonProps) => {
    const isMinimal = poke?.style?.minimalBoxedLayout;
    const backgroundStyle = getPokemonBackgroundStyle({
        customTypes: poke.customTypes,
        pokemon: poke,
        style: poke.style,
    });
    return (
        <div
            className={cx("boxed-pokemon-container")}
            style={{
                background: backgroundStyle.background,
                color: backgroundStyle.color,
                width: determineWidth(
                    isMinimal,
                    poke?.style.boxedPokemonPerLine,
                ),
            }}
        >
            {
                // @TODO: NO, I don't like this approach either
                // Its dependent on the way react-dnd is wired
                // which needs to be updated to v11 anyhow
            }
            <PokemonIcon
                position={poke?.position}
                species={poke?.species}
                id={poke?.id}
                forme={poke?.forme}
                shiny={poke?.shiny}
                gender={poke?.gender}
                egg={poke?.egg}
                customIcon={poke?.customIcon}
                className={"boxed-pokemon-icon"}
            />
            {isMinimal ? null : (
                <div
                    className="boxed-pokemon-info"
                    style={{
                        borderLeftColor:
                            backgroundStyle.source !== "accent"
                                ? backgroundStyle.color
                                : getAccentColor(poke),
                    }}
                >
                    <span
                        data-testid="boxed-pokemon-name"
                        className="boxed-pokemon-name"
                    >
                        {poke?.nickname} {GenderElement(poke?.gender)}{" "}
                        {poke?.level ? <span>lv. {poke?.level}</span> : null}
                        {poke?.style?.displayGameOriginForBoxedAndDead &&
                            !backgroundStyle.usesGameOriginBackground &&
                            poke?.gameOfOrigin && (
                                <span
                                    className="boxed-pokemon-gameoforigin"
                                    style={{
                                        background: gameOfOriginToColor(
                                            poke?.gameOfOrigin,
                                        ),
                                        color: getContrastColor(
                                            gameOfOriginToColor(
                                                poke?.gameOfOrigin,
                                            ),
                                        ),
                                        fontSize: "80%",
                                        borderRadius: ".25rem",
                                        margin: ".25rem",
                                        padding: ".25rem",
                                    }}
                                >
                                    {poke?.gameOfOrigin}
                                </span>
                            )}
                    </span>
                </div>
            )}
        </div>
    );
};

export const BoxedPokemon = connect(
    (state: Pick<State, keyof State>) => ({
        customTypes: state.customTypes,
        style: state.style,
    }),
    {
        selectPokemon,
    },
)(BoxedPokemonBase);
