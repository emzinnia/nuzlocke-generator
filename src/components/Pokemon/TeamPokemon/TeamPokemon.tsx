import * as React from "react";
import { connect } from "react-redux";

import { Pokemon, Game, Editor } from "models";
import {
    getBackgroundGradient,
    typeToColor,
    getPokemonImage,
    Styles,
    Generation,
    getGameGeneration,
    getContrastColor,
    TemplateName,
    Types,
} from "utils";
import { GenderElement, ErrorBoundary } from "components/Common/Shared";
import { selectPokemon } from "actions";
import { Moves } from "./Moves";
import { State } from "state";
import { css, cx } from "emotion";
import { PokemonIcon } from "components/Pokemon/PokemonIcon/PokemonIcon";
import { getMetLocationString } from "./getMetLocationString";
import { CheckpointsDisplay } from "components/Features/Result/TrainerResult";
import { PokemonImage } from "components/Common/Shared/PokemonImage";
import { PokemonItem } from "./PokemonItem";
import { PokemonPokeball } from "./PokemonPokeball";
import { PokemonFriendship } from "./PokemonFriendship";

export interface TeamPokemonInfoProps {
    generation: Generation;
    style: Styles;
    pokemon: Pokemon;
    customTypes: State["customTypes"];
    linkedPokemon?: Pokemon;
    game: State["game"];
}

function getSpriteStyle({ spritesMode, scaleSprites, teamImages }) {
    if (spritesMode) {
        if (scaleSprites) {
            return {
                backgroundSize: "auto",
                backgroundRepeat: "no-repeat",
            };
        } else {
            return {
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
            };
        }
    }
    if (teamImages === "dream world") {
        return {
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
        };
    } else {
        return {
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
        };
    }
}

export class TeamPokemonInfo extends React.PureComponent<TeamPokemonInfoProps> {
    public render() {
        const { pokemon, style, customTypes, linkedPokemon, game, generation } =
            this.props;
        const effectiveGeneration = generation ?? getGameGeneration(game.name);

        if (!pokemon) {
            return null;
        }

        const accentColor = style ? style.accentColor : "#111111";
        const isCardsTheme = style.template === TemplateName.Cards;
        const isCompactTheme =
            style.template === TemplateName.Compact ||
            style.template === TemplateName.CompactWithIcons;
        const getTypeOrNone = () => {
            if (pokemon) {
                if (pokemon.types) {
                    if (pokemon.types.length) {
                        return pokemon?.types[1];
                    }
                }
            }
            return "None";
        };
        const stat = (stat, statName) => (
            <div
                className={`pokemon-stat-${statName}`}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    margin: "0 2px",
                }}
            >
                <div>{statName}</div>
                <div>{stat}</div>
            </div>
        );

        return (
            <ErrorBoundary>
                <div
                    className="pokemon-info"
                    style={{
                        backgroundColor: isCardsTheme ? undefined : accentColor,
                        // backgroundImage: isCardsTheme ? undefined : `linear-gradient(to right, #2d2d2d 1px, transparent 1px), linear-gradient(to bottom, #2d2d2d 1px, transparent 1px)`,
                        backgroundImage: isCompactTheme
                            ? getBackgroundGradient(
                                  pokemon.types != null && !pokemon.egg
                                      ? pokemon?.types[1]
                                      : "Normal",
                                  pokemon.types != null && !pokemon.egg
                                      ? pokemon?.types[0]
                                      : "Normal",
                                  customTypes,
                              )
                            : undefined,
                        color: isCompactTheme
                            ? getContrastColor(
                                  typeToColor(getTypeOrNone(), customTypes),
                              )
                            : getContrastColor(accentColor),
                    }}
                >
                    <div className="pokemon-info-inner">
                        <div className="pokemon-main-info">
                            <span
                                style={{ margin: "0.25rem 0 0" }}
                                className="pokemon-nickname"
                            >
                                {pokemon.nickname}
                            </span>
                            <span className="pokemon-name">
                                {!pokemon.egg ? pokemon.species : "???"}
                                {pokemon.item && style.itemStyle === "text"
                                    ? ` @ ${pokemon.item}`
                                    : null}
                            </span>
                            {Boolean(pokemon.alpha) && (
                                <span className="pokemon-alpha">
                                    <img
                                        alt={"alpha"}
                                        style={{ height: "1rem" }}
                                        src={"icons/alpha-icon.png"}
                                    />
                                </span>
                            )}
                            {Boolean(
                                pokemon.teraType &&
                                    pokemon.teraType !== ("None" as Types),
                            ) && (
                                <span className="pokemon-teratype">
                                    <img
                                        alt={`Tera: ${pokemon.teraType}`}
                                        style={{ height: "1rem" }}
                                        src={`icons/tera/${pokemon.teraType?.toLowerCase()}.png`}
                                    />
                                </span>
                            )}
                            {GenderElement(pokemon.gender)}
                            {pokemon.level ? (
                                <span className="pokemon-level">
                                    lv. {pokemon.level}
                                </span>
                            ) : null}
                        </div>
                        {/* <span style={{
                                background: gameOfOriginToColor(pokemon.gameOfOrigin!),
                                color: getContrastColor(gameOfOriginToColor(pokemon.gameOfOrigin!)),
                                borderRadius: '.25rem',
                                display: 'inline-block',
                                fontSize: '90%',
                                margin: 0,
                                padding: '.25rem',
                                textAlign: 'center',
                                width: '200px',
                            }}>{ pokemon.gameOfOrigin }
                        </span> */}
                        <div className="pokemon-met">
                            {getMetLocationString({
                                poke: pokemon,
                                oldMetLocationFormat:
                                    style.oldMetLocationFormat,
                            })}
                            {pokemon.pokeball && style.pokeballStyle === "text"
                                ? ` (in ${pokemon.pokeball})`
                                : null}
                        </div>
                        {pokemon.nature && pokemon.nature !== "None" ? (
                            <div className="pokemon-nature">
                                <strong>{pokemon.nature}</strong> nature
                            </div>
                        ) : null}
                        {pokemon.ability ? (
                            <div className="pokemon-ability">
                                {pokemon.ability}
                            </div>
                        ) : null}
                        {pokemon.notes && (
                            <div
                                className="pokemon-notes"
                                dangerouslySetInnerHTML={{
                                    __html: pokemon.notes,
                                }}
                            />
                        )}
                        {pokemon.checkpoints && (
                            <div
                                className="flex flex-wrap pokemon-checkpoints"
                                style={{ maxWidth: "14rem" }}
                            >
                                <CheckpointsDisplay
                                    className="pokemon-checkpoint"
                                    game={game}
                                    clearedCheckpoints={pokemon.checkpoints}
                                    style={style}
                                />
                            </div>
                        )}
                        {style.displayExtraData && pokemon.extraData ? (
                            <div
                                className="pokemon-extra-data"
                                style={{
                                    display: "flex",
                                    //justifyContent: 'space-evenly',
                                    fontSize: "12px",
                                    width: "255px",
                                }}
                            >
                                {/* @TOOD: allow as styles option */}
                                {/* {Object.keys(pokemon.extraData).map(key => {
                                    return <React.Fragment key={key}>
                                        {stat(pokemon?.extraData?.[key], key)}
                                    </React.Fragment>;
                                })} */}
                                {effectiveGeneration === Generation.Gen1 ? (
                                    <>
                                        {stat(
                                            pokemon.extraData["currentHp"],
                                            "HP",
                                        )}
                                        {stat(
                                            pokemon.extraData["attack"],
                                            "ATK",
                                        )}
                                        {stat(
                                            pokemon.extraData["defense"],
                                            "DEF",
                                        )}
                                        {stat(
                                            pokemon.extraData["special"],
                                            "SPC",
                                        )}
                                        {stat(
                                            pokemon.extraData["speed"],
                                            "SPE",
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {stat(
                                            pokemon.extraData["currentHp"],
                                            "HP",
                                        )}
                                        {stat(
                                            pokemon.extraData["attack"],
                                            "ATK",
                                        )}
                                        {stat(
                                            pokemon.extraData["defense"],
                                            "DEF",
                                        )}
                                        {stat(
                                            pokemon.extraData["specialAttack"],
                                            "SPATK",
                                        )}
                                        {stat(
                                            pokemon.extraData["specialDefense"],
                                            "SPDEF",
                                        )}
                                        {stat(
                                            pokemon.extraData["speed"],
                                            "SPE",
                                        )}
                                    </>
                                )}
                            </div>
                        ) : null}
                        {style.displayExtraData && pokemon.extraData ? (
                            <PokemonFriendship
                                friendship={pokemon.extraData?.["friendship"]}
                            />
                        ) : null}
                        {linkedPokemon && (
                            <div className="pokemon-linked">
                                {style.linkedPokemonText}{" "}
                                {linkedPokemon.nickname ||
                                    linkedPokemon.species}
                                <PokemonIcon {...linkedPokemon} />
                            </div>
                        )}
                    </div>
                    {style.showPokemonMoves && !pokemon.egg ? (
                        <Moves
                            generation={this.props.generation}
                            moves={pokemon.moves}
                            movesPosition={style.movesPosition}
                        />
                    ) : null}
                </div>
            </ErrorBoundary>
        );
    }
}

export interface TeamPokemonBaseProps {
    pokemon?: Pokemon;
    game: Game;
    style: Styles;
    selectPokemon: selectPokemon;
    editor: Editor;
    customTypes: State["customTypes"];
    linkedPokemon?: Pokemon;
}

export function TeamPokemonBaseMinimal(
    props: TeamPokemonBaseProps & { spriteStyle?: object },
) {
    const { pokemon, style, game, editor } = props;
    const poke = pokemon;

    if (!pokemon) {
        return <div>A Pokémon could not be rendered.</div>;
    }

    return (
        <div
            className="pokemon-container minimal"
            style={{ color: getContrastColor(props?.style?.bgColor) }}
        >
            <div
                role="presentation"
                onClick={() => props.selectPokemon?.(poke.id)}
                style={{ cursor: "pointer" }}
            >
                <PokemonImage
                    species={poke?.species}
                    gender={poke?.gender}
                    forme={poke?.forme}
                    customImage={poke?.customImage}
                    style={style}
                    editor={editor}
                    shiny={poke?.shiny}
                    egg={poke?.egg}
                    name={game.name}
                >
                    {(backgroundImage) => {
                        return (
                            <div
                                style={{
                                    backgroundImage,
                                    ...(props.spriteStyle as React.CSSProperties),
                                }}
                                className={`pokemon-image ${(poke?.species || "missingno").toLowerCase()} ${
                                    props.style.imageStyle === "round"
                                        ? "round"
                                        : "square"
                                }`}
                            />
                        );
                    }}
                </PokemonImage>
            </div>
            <div className="pokemon-info">
                <div className="pokemon-info-inner">
                    <span className="pokemon-nickname">{pokemon.nickname}</span>
                    <span className="pokemon-name">
                        {!pokemon.egg ? pokemon.species : "???"}
                    </span>
                    {pokemon.level ? (
                        <span className="pokemon-level">
                            lv. {pokemon.level}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export class TeamPokemonBase extends React.Component<
    TeamPokemonBaseProps,
    { image: string }
> {
    public state = {
        image: "",
    };

    public async componentDidMount() {
        const { pokemon, style, game, editor } = this.props;
        const poke = pokemon;

        const image = await getPokemonImage({
            customImage: poke?.customImage,
            forme: poke?.forme as any,
            species: poke?.species,
            shiny: poke?.shiny,
            style: style,
            name: game.name,
            editor: editor,
            gender: poke?.gender,
            egg: poke?.egg,
        });

        this.setState({ image });
    }

    public render() {
        const {
            pokemon,
            style,
            game,
            selectPokemon,
            editor,
            customTypes,
            linkedPokemon,
        } = this.props;
        const poke = pokemon;
        const showdown = false;

        if (!poke) {
            return <div>A Pokémon could not be rendered.</div>;
        }

        const getFirstType = poke.types ? poke.types[0] : "Normal";
        const getSecondType = poke.types ? poke.types[1] : "Normal";
        const { spritesMode, scaleSprites, teamImages } = style;
        const spriteStyle = getSpriteStyle({
            spritesMode,
            scaleSprites,
            teamImages,
        });

        const addProp = (item: any) => {
            const propName = `data-${item.toLowerCase()}`;
            if (item === "type") return { [propName]: poke[item].join(" ") };
            if (poke[item] == null || poke[item] === "") return {};
            return { [propName]: poke[item].toString() };
        };

        // @TODO: update with new keys
        const dataKeys = [
            "id",
            "position",
            "species",
            "nickname",
            "status",
            "gender",
            "level",
            "metLevel",
            "nature",
            "ability",
            "item",
            "types",
            "forme",
            "moves",
            "causeOfDeath",
            "shiny",
            "champion",
            "num",
            "wonderTradedFor",
            "mvp",
            "customImage",
        ].sort();
        const data = dataKeys.reduce((prev, curr) => {
            return { ...prev, ...addProp(curr) };
        }, {});

        if (this.props.style.minimalTeamLayout) {
            return (
                <TeamPokemonBaseMinimal
                    selectPokemon={selectPokemon}
                    style={style}
                    game={game}
                    spriteStyle={spriteStyle}
                    pokemon={poke}
                    editor={editor}
                    customTypes={customTypes}
                    linkedPokemon={linkedPokemon}
                />
            );
        }

        const mvpLabelStyle = {
            base: css`
                position: absolute;
                top: 0;
                left: calc(50% - 3rem);
                width: 6rem;
                background: #e2d5a9;
                border: 1px solid #eee;
                padding: 2px 0.5rem;
                text-align: center;
                border-radius: 1rem;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #111;
                font-size: 90%;
                z-index: 10;
            `,
            Cards: css`
                top: 2.25rem;
            `,
            Hexagons: css`
                top: 18px;
                transform: scale(0.8);
            `,
            Generations: css`
                top: -4px;
            `,
        };

        const itemLabelStyle = {
            base: css`
                background: #111;
                border: 5px solid white;
                bottom: 0;
                height: 3rem;
                display: flex;
                justify-content: center;
                align-items: center;
                left: 12px;
                padding: 0.5rem;
                position: absolute;
                width: 3rem;
                z-index: 10;
            `,
            ["round"]: css`
                border-radius: 50%;
            `,
            ["square"]: css`
                border-radius: 0;
            `,
            ["outer glow"]: css`
                background: transparent !important;
                border: none !important;
                filter: drop-shadow(0 0 2px white);
                padding: 0;
                margin: 0;
                bottom: 0.5rem;
            `,
            ["text"]: css`
                display: none !important;
            `,
        };

        const EMMA_MODE = false;

        return (
            <div className="pokemon-container" {...data}>
                {style.template === "Compact with Icons" && (
                    <PokemonIcon className="pokemon-icon-main" {...poke} />
                )}
                {EMMA_MODE ? (
                    <>
                        <div
                            role="presentation"
                            onClick={(e) => this.props.selectPokemon(poke.id)}
                            className={`${this.props.style.imageStyle} pokemon-image-wrapper`}
                            style={{
                                cursor: "pointer",
                                background: this.props.style.teamPokemonBorder
                                    ? getBackgroundGradient(
                                          poke.types != null && !poke.egg
                                              ? poke.types[0]
                                              : "Normal",
                                          poke.types != null && !poke.egg
                                              ? poke.types[1]
                                              : "Normal",
                                          customTypes,
                                      )
                                    : "transparent",
                            }}
                        />
                        <PokemonImage
                            species={poke.species}
                            gender={poke.gender}
                            forme={poke.forme}
                            customImage={poke.customImage}
                            style={style}
                            editor={editor}
                            name={game.name}
                            egg={poke.egg}
                            shiny={poke.shiny}
                        >
                            {(backgroundImage) => {
                                return (
                                    <div
                                        style={{
                                            backgroundImage,
                                            ...(spriteStyle as React.CSSProperties),
                                            imageRendering: style.iconRendering,
                                        }}
                                        className={`pokemon-image ${(poke.species || "missingno").toLowerCase()} ${
                                            this.props.style.imageStyle ===
                                            "round"
                                                ? "round"
                                                : "square"
                                        }`}
                                    />
                                );
                            }}
                        </PokemonImage>
                    </>
                ) : (
                    <div
                        role="presentation"
                        onClick={(e) => this.props.selectPokemon(poke.id)}
                        className={`${this.props.style.imageStyle} pokemon-image-wrapper`}
                        style={{
                            cursor: "pointer",
                            background: this.props.style.teamPokemonBorder
                                ? getBackgroundGradient(
                                      poke.types != null && !poke.egg
                                          ? poke.types[0]
                                          : "Normal",
                                      poke.types != null && !poke.egg
                                          ? poke.types[1]
                                          : "Normal",
                                      customTypes,
                                  )
                                : "transparent",
                        }}
                    >
                        <PokemonImage
                            species={poke.species}
                            gender={poke.gender}
                            forme={poke.forme}
                            customImage={poke.customImage}
                            style={style}
                            editor={editor}
                            name={game.name}
                            egg={poke.egg}
                            shiny={poke.shiny}
                        >
                            {(backgroundImage) => {
                                return (
                                    <div
                                        style={{
                                            backgroundImage,
                                            ...(spriteStyle as React.CSSProperties),
                                            imageRendering: style.iconRendering,
                                        }}
                                        className={`pokemon-image ${(poke.species || "missingno").toLowerCase()} ${
                                            this.props.style.imageStyle ===
                                            "round"
                                                ? "round"
                                                : "square"
                                        }`}
                                    />
                                );
                            }}
                        </PokemonImage>
                    </div>
                )}
                {poke.mvp && (
                    <div
                        className={cx(
                            mvpLabelStyle.base,
                            mvpLabelStyle[style.template],
                            "pokemon-mvp-label",
                        )}
                    >
                        <span
                            style={{
                                marginRight: "0.5rem",
                                fontWeight: "bold",
                            }}
                        >
                            MVP
                        </span>
                        <img
                            style={{ height: "1rem" }}
                            alt=""
                            role="presentation"
                            src="./assets/mvp-crown.png"
                        />
                    </div>
                )}
                <PokemonPokeball
                    pokemon={poke}
                    style={style}
                    customTypes={customTypes}
                />
                <PokemonItem
                    pokemon={poke}
                    style={style}
                    customTypes={customTypes}
                />
                {pokemon && (
                    <TeamPokemonInfo
                        generation={getGameGeneration(this.props.game.name)}
                        style={style}
                        pokemon={pokemon}
                        customTypes={customTypes}
                        linkedPokemon={linkedPokemon}
                        game={game}
                    />
                )}
            </div>
        );
    }
}

export const TeamPokemon = connect(
    (state: State, ownProps: { pokemon: { linkedTo?: string | null } }) => ({
        style: state.style,
        game: state.game,
        editor: state.editor,
        customTypes: state.customTypes,
        linkedPokemon: state.pokemon.find(
            (p) => p.id === ownProps?.pokemon?.linkedTo,
        ),
    }),
    {
        selectPokemon,
    },
    null,
    {
        pure: true,
    },
)(TeamPokemonBase);
