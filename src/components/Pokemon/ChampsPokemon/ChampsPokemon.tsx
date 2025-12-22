import * as React from "react";

import { PokemonIcon } from "components/Pokemon/PokemonIcon/PokemonIcon";
import {
    getBackgroundGradient,
    typeToColor,
    getPokemonImage,
    Styles,
    Generation,
    getGameGeneration,
    getContrastColor,
    gameOfOriginToColor,
} from "utils";
import { Pokemon } from "models";
import { GenderElement } from "components/Common/Shared";
import { css, cx } from "emotion";
import { PokemonImage } from "components/Common/Shared/PokemonImage";

export const champsPokemon = (options: any) => css`
    height: ${options.height};
    width: ${options.width};
    margin: ${options.margin};
    display: inline-flex;
    align-items: center;
    justify-content: ${options.minimal ? "center" : "start"};
    background: ${options.background};
    color: ${options.color};
    padding: ${options.padding};
    cursor: pointer;
    /* flex-grow: 4; */
`;

export type ChampsPokemonProps = { [P in keyof Pokemon]?: any } & {
    showNickname?: boolean;
    showGender?: boolean;
    showLevel?: boolean;
    useSprites?: boolean;
    margin?: string;
    padding?: string;
    background?: string;
    customCSS?: string;
};

export class ChampsPokemon extends React.Component<ChampsPokemonProps> {
    private static defaultProps = {
        showNickname: false,
        showGender: false,
        showLevel: false,
    };

    private getWidth = () => {
        const base = 48;
        return (
            base +
            (this.props.showGender ? 24 : 0) +
            (this.props.showNickname ? 128 : 0) +
            (this.props.showLevel ? 24 : 0)
        );
    };

    private getPokemonImage() {
        const {
            customImage,
            forme,
            species,
            gameOfOrigin,
            shiny,
            gender,
            nickname,
        } = this.props;

        return (
            <PokemonImage
                customImage={customImage}
                name={gameOfOrigin}
                species={species}
                shiny={shiny}
                gender={gender}
                forme={forme}
                style={
                    {
                        spritesMode: true,
                        useSpritesForChampsPokemon: true,
                    } as any
                }
            >
                {(backgroundImage) => (
                    <img
                        className="champs-pokemon-image"
                        alt={""}
                        style={{
                            backgroundImage,
                            backgroundPosition: "center center",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            height: "48px",
                            width: "48px",
                        }}
                    />
                )}
            </PokemonImage>
        );
    }

    public render() {
        const { margin, padding, customCSS } = this.props;
        const color = gameOfOriginToColor(this.props.gameOfOrigin);
        const minimal = !(
            this.props.showNickname ||
            this.props.showGender ||
            this.props.showLevel
        );
        const className = champsPokemon({
            background: color,
            color: getContrastColor(color),
            height: "48px",
            width: minimal ? `${this.getWidth()}px` : "auto",
            margin,
            padding: minimal ? padding : "0 4px 0 0",
            minimal,
        });

        return (
            <>
                <div className={cx(className, "champs-pokemon")}>
                    {this.props.useSprites ? (
                        this.getPokemonImage()
                    ) : (
                        <PokemonIcon
                            className="champs-pokemon-image"
                            {...(this.props as any)}
                        />
                    )}
                    <span
                        className="champs-pokemon-nickname"
                        style={{ margin: "0 4px" }}
                    >
                        {this.props.showNickname && this.props.nickname}
                    </span>
                    {this.props.showGender && GenderElement(this.props.gender)}
                    <span
                        className="champs-pokemon-level"
                        style={{ marginLeft: "2px" }}
                    >
                        {this.props.showLevel && ` Lv ${this.props.level ?? 0}`}
                    </span>
                </div>
                {customCSS && (
                    <style>
                        {`.${className} {
                        ${customCSS}
                    }`}
                    </style>
                )}
            </>
        );
    }
}
