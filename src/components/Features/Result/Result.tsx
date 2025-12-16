import * as React from "react";

import { connect } from "react-redux";
import { v4 as uuid } from "uuid";
import { cx } from "emotion";

import { selectPokemon, toggleMobileResultView, toggleDialog } from "actions";
import {
    TeamPokemon,
    TeamPokemonBaseProps,
} from "components/Pokemon/TeamPokemon/TeamPokemon";
import { DeadPokemon } from "components/Pokemon/DeadPokemon/DeadPokemon";
import { BoxedPokemon } from "components/Pokemon/BoxedPokemon/BoxedPokemon";
import { ChampsPokemon } from "components/Pokemon/ChampsPokemon/ChampsPokemon";
import { TrainerResult } from "components/Features/Result/TrainerResult"; // Self-referential? Or maybe Result2?
import { TopBar } from "components/Layout/TopBar/TopBar";
import { ErrorBoundary } from "components/Common/Shared";
import { Stats } from "./Stats";
import { TypeMatchupDialog } from "./TypeMatchupDialog";
import { Pokemon, Trainer, Editor, Box } from "models";
import { reducers } from "reducers";
import {
    Styles as StyleState,
    getGameRegion,
    sortPokes,
    getContrastColor,
    isLocal,
    feature,
    getIconFormeSuffix,
    Species,
} from "utils";

import * as Styles from "./styles";

import "./Result.css";
import "./themes.css";
import { State } from "state";
import isMobile from "is-mobile";
import { Button, Classes, MenuItem } from "@blueprintjs/core";
import { clamp } from "ramda";
import { resultSelector } from "selectors";
import { PokemonImage } from "components/Common/Shared/PokemonImage";
import { normalizeSpeciesName } from "utils/getters/normalizeSpeciesName";
import { Select } from "@blueprintjs/select";

async function load() {
    const resource = await import("@emmaramirez/dom-to-image");
    return resource.domToImage;
}

interface ResultProps {
    pokemon: Pokemon[];
    game: any;
    trainer: Trainer;
    box: State["box"];
    editor: Editor;
    selectPokemon: selectPokemon;
    toggleMobileResultView: typeof toggleMobileResultView;
    toggleDialog: toggleDialog;
    style: State["style"];
    rules: string[];
    customTypes: State["customTypes"];
}

interface ResultState {
    isDownloading: boolean;
    downloadError: string | null;
    panningCoordinates: [number?, number?];
    zoomLevel: number;
}

const getNumberOf = (status?: string, pokemon?: Pokemon[]) =>
    status
        ? pokemon
              ?.filter((v) => v.hasOwnProperty("id"))
              .filter((poke) => poke.status === status && !poke.hidden).length
        : 0;

const ZoomValues = [
    { key: 0.25, value: "25%" },
    { key: 0.5, value: "50%" },
    { key: 0.75, value: "75%" },
    { key: 1, value: "100%" },
    { key: 1.25, value: "125%" },
    { key: 1.5, value: "150%" },
    { key: 2, value: "200%" },
    { key: 3, value: "300%" },
];
type ZoomValue = (typeof ZoomValues)[number];

const convertToPercentage = (n: number) => `${n * 100}%`;

const TopBarItems = ({ editorDarkMode, setZoomLevel, currentZoomLevel }) => {
    // @TODO: make this look decent
    return (
        <Select<ZoomValue>
            className={cx({ "bp5-dark": editorDarkMode })}
            filterable={false}
            items={ZoomValues}
            itemRenderer={(item, { handleClick }) => (
                <MenuItem
                    key={item.key}
                    onClick={handleClick}
                    text={item.value}
                />
            )}
            noResults={<MenuItem disabled={true} text="No results." />}
            onItemSelect={(item) => {
                console.log("item", item);
                setZoomLevel(item.key);
            }}
        >
            <Button
                text={convertToPercentage(currentZoomLevel) ?? "100%"}
                endIcon="double-caret-vertical"
            />
        </Select>
    );
};

export function BackspriteMontage({ pokemon }: { pokemon: Pokemon[] }) {
    return (
        <div
            className="backsprite-montage"
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "bottom",
                margin: "0 auto",
                height: "92px",
            }}
        >
            {pokemon.map((poke, idx) => {
                const image = `https://img.pokemondb.net/sprites/platinum/back-normal/${(
                    normalizeSpeciesName(poke.species as Species) || ""
                ).toLowerCase()}${getIconFormeSuffix(poke.forme as any)}.png`;

                return (
                    <PokemonImage key={poke.id} url={image}>
                        {(backgroundImage) => (
                            <img
                                className="backsprite-montage-sprite"
                                data-sprite-id={idx}
                                data-sprite-species={poke.species}
                                style={{
                                    height: "128px",
                                    marginLeft: "-32px",
                                    zIndex: 6 - idx,
                                    imageRendering: "pixelated",
                                }}
                                alt=""
                                role="presentation"
                                src={backgroundImage}
                            />
                        )}
                    </PokemonImage>
                );
            })}
        </div>
    );
}

export class ResultBase extends React.PureComponent<ResultProps, ResultState> {
    public resultRef: React.RefObject<HTMLDivElement>;
    public constructor(props: ResultProps) {
        super(props);
        this.resultRef = React.createRef();
        this.state = {
            isDownloading: false,
            downloadError: null,
            panningCoordinates: [undefined, undefined],
            zoomLevel: 1,
        };
    }

    private renderTeamPokemon() {
        return this.props.pokemon
            .filter((v) => v.hasOwnProperty("id"))
            .filter((poke) => poke.status === "Team")
            .filter((poke) => !poke.hidden)
            .sort(sortPokes)
            .map((poke, index) => {
                return <TeamPokemon key={index} pokemon={poke} />;
            });
    }

    private getPokemonByStatus(status: string) {
        return this.props.pokemon
            .filter((v) => v.hasOwnProperty("id"))
            .filter((poke) => poke.status === status)
            .filter((poke) => !poke.hidden);
    }

    private getCorrectStatusWrapper(
        pokes: Pokemon[],
        box,
        paddingForVerticalTrainerSection,
    ) {
        return this.renderContainer(
            pokes,
            paddingForVerticalTrainerSection,
            box,
        );
    }

    private renderOtherPokemonStatuses(paddingForVerticalTrainerSection) {
        return this.props.box
            .filter((box) => !["Team"].includes(box.name))
            .sort((a, b) => {
                const posA = a.position || 0;
                const posB = b.position || 1;

                return posA - posB;
            })
            .map((box) => {
                const pokes = this.props.pokemon
                    .filter((v) => v.hasOwnProperty("id"))
                    .filter((poke) => poke.status === box.name)
                    .filter((poke) => !poke.hidden);
                return this.getCorrectStatusWrapper(
                    pokes,
                    box,
                    paddingForVerticalTrainerSection,
                );
            });
    }

    private async toImage() {
        const resultNode = this.resultRef.current;
        this.setState({ isDownloading: true });
        try {
            const domToImage = await load();
            const dataUrl = await domToImage.toPng(resultNode, {
                corsImage: true,
            });
            console.log(dataUrl, resultNode);
            const link = document.createElement("a");
            link.download = `nuzlocke-${uuid()}.png`;
            link.href = dataUrl;
            link.click();
            this.setState({ downloadError: null, isDownloading: false });
        } catch (e) {
            console.log(e);
            this.setState({
                downloadError:
                    "Failed to download. This is likely due to your image containing an image resource that does not allow Cross-Origin",
                isDownloading: false,
            });
        }
    }

    private getBoxClass = (s) => {
        if (s === "Dead") return "dead";
        if (s === "Boxed") return "boxed";
        if (s === "Champs") return "champs";
        if (s === "Team") return "team";
        return "boxed";
    };

    private getBoxStyle = (s) => {
        if (s === "Champs")
            return {
                margin: this.props.style.template === "Compact" ? 0 : ".5rem",
                display: "flex",
                flexWrap: "wrap" as React.CSSProperties["flexWrap"],
            };
        if (s === "Dead")
            return {
                display: "flex",
                flexWrap: "wrap" as React.CSSProperties["flexWrap"],
                justifyContent: "center",
                margin: this.props.style.template === "Compact" ? 0 : ".5rem",
            };

        return {};
    };

    private getH3 = (box: Box, n: number) => {
        if (box.name === "Dead" || box.name === "Champs") {
            if (n) {
                return ` (${n})`;
            }
        }
        return null;
    };

    private renderContainer = (
        pokemon: Pokemon[],
        paddingForVerticalTrainerSection: any,
        box?: Box,
    ) =>
        box && pokemon && getNumberOf(box?.name, pokemon)! > 0 ? (
            <div
                key={box.id}
                style={paddingForVerticalTrainerSection}
                className={`${this.getBoxClass(box?.inheritFrom || box.name)}-container`}
            >
                {box?.name !== "Team" && (
                    <h3
                        style={{
                            color: getContrastColor(
                                this.props.style.bgColor || "#383840",
                            ),
                        }}
                    >
                        {box?.name}
                        {this.getH3(box, getNumberOf(box?.name, pokemon) ?? 0)}
                    </h3>
                )}
                <div
                    className="boxed-container-inner"
                    style={this.getBoxStyle(box?.name || box?.inheritFrom)}
                >
                    {pokemon.map((poke, index) => {
                        if (
                            box?.name === "Boxed" ||
                            box?.inheritFrom === "Boxed"
                        )
                            return <BoxedPokemon key={poke.id} {...poke} />;
                        if (box?.name === "Dead" || box?.inheritFrom === "Dead")
                            return (
                                <DeadPokemon
                                    minimal={false}
                                    key={poke.id}
                                    {...poke}
                                />
                            );
                        if (
                            box?.name === "Champs" ||
                            box?.inheritFrom === "Champs"
                        )
                            return (
                                <ChampsPokemon
                                    useSprites={
                                        this.props.style
                                            .useSpritesForChampsPokemon
                                    }
                                    showGender={
                                        !this.props.style.minimalChampsLayout
                                    }
                                    showLevel={
                                        !this.props.style.minimalChampsLayout
                                    }
                                    showNickname={
                                        !this.props.style.minimalChampsLayout
                                    }
                                    key={poke.id}
                                    {...poke}
                                />
                            );
                        if (box?.name === "Team" || box?.inheritFrom === "Team")
                            return <TeamPokemon key={poke.id} pokemon={poke} />;
                        return null;
                    })}
                </div>
            </div>
        ) : null;

    private getScale(
        style: State["style"],
        editor: State["editor"],
        coords: ResultState["panningCoordinates"],
    ) {
        const rw = parseInt(style.resultWidth.toString());
        const ww = window.innerWidth;
        const scale = ww / rw / 1.1;
        const height =
            (this.resultRef?.current?.offsetHeight ?? 0) / this.state.zoomLevel;
        const width =
            (this.resultRef?.current?.offsetWidth ?? 300) /
            this.state.zoomLevel;
        const translate = `translateX(${clamp(-width, width, (coords?.[0] ?? 0) / 1)}px) translateY(${clamp(-height, Infinity, (coords?.[1] ?? 0) / 1)}px)`;
        if (this.state.isDownloading) {
            return { transform: undefined };
        }
        if (!editor.showResultInMobile) {
            return { transform: `scale(${this.state.zoomLevel}) ${translate}` };
        }
        if (!Number.isNaN(rw)) {
            return { transform: `scale(${scale.toFixed(2)})` };
        } else {
            return { transform: "scale(0.3)" };
        }
    }

    private onPan = (e?: React.MouseEvent<HTMLElement>) => {
        e?.preventDefault();
        e?.persist();
        if (e?.buttons === 1) {
            this.setState((state) => ({
                panningCoordinates: [
                    (state.panningCoordinates?.[0] ?? 0) + e?.movementX,
                    (state.panningCoordinates?.[1] ?? 0) + e?.movementY,
                ],
            }));
        }
    };

    private onZoom = (e?: React.WheelEvent<HTMLElement>) => {
        if (e?.shiftKey) {
            const deltaY = e?.deltaY ?? -3;
            this.setState({ zoomLevel: clamp(0.1, 5, -deltaY / 3) });
        }
    };

    private resetPan = (e?: React.MouseEvent<HTMLElement>) => {
        this.setState({ panningCoordinates: [0, 0], zoomLevel: 1 });
    };

    public render() {
        const {
            style,
            box,
            trainer,
            pokemon,
            editor,
            game,
            customTypes,
            toggleDialog,
        } = this.props;
        const numberOfTeam = getNumberOf("Team", pokemon);
        const bgColor = style ? style.bgColor : "#383840";
        const topHeaderColor = style ? style.topHeaderColor : "#333333";
        const accentColor = style ? style.accentColor : "#111111";
        const trainerSectionOrientation =
            this.props.style.trainerSectionOrientation;
        const paddingForVerticalTrainerSection =
            trainerSectionOrientation === "vertical"
                ? {
                      paddingLeft: style.trainerWidth,
                  }
                : {};
        const teamContainer = (
            <div
                style={paddingForVerticalTrainerSection}
                className="team-container"
            >
                {this.renderTeamPokemon()}
            </div>
        );

        const rulesContainer = (
            <div className="rules-container">
                <h3 style={{ color: getContrastColor(bgColor) }}>Rules</h3>
                <ol style={{ color: getContrastColor(bgColor) }}>
                    {this.props.rules.map((rule, index) => {
                        return <li key={index}>{rule}</li>;
                    })}
                </ol>
            </div>
        );
        const enableStats = style.displayStats;
        const enableChampImage = feature.emmaMode;
        const enableBackSpriteMontage = feature.emmaMode;
        const EMMA_MODE = feature.emmaMode;

        return (
            <div
                onWheel={this.onZoom}
                onMouseMove={this.onPan}
                onDoubleClick={this.resetPan}
                className="hide-scrollbars"
                style={{ width: "100%", overflowY: "scroll" }}
            >
                <TypeMatchupDialog />
                {isMobile() && editor.showResultInMobile && (
                    <div className={Classes.OVERLAY_BACKDROP}></div>
                )}
                <ErrorBoundary>
                    {/* @ts-expect-error suppress typing error */}
                    <TopBar
                        isDownloading={this.state.isDownloading}
                        onClickDownload={() => this.toImage()}
                    >
                        <Button
                            className={Classes.MINIMAL}
                            icon="layout-group-by"
                            onClick={() => toggleDialog("typeMatchups")}
                        >
                            Type Matchups
                        </Button>
                        <TopBarItems
                            editorDarkMode={this.props.style.editorDarkMode}
                            setZoomLevel={(zoomLevel) =>
                                this.setState({ zoomLevel })
                            }
                            currentZoomLevel={this.state.zoomLevel}
                        />
                    </TopBar>
                    <style>
                        {`
                            .result {
                                --background-color: ${bgColor};
                                --accent-color: ${accentColor};
                                --header-color: ${topHeaderColor};
                            }
                        `}
                    </style>
                    <style>{style.customCSS}</style>
                    {isMobile() && editor.showResultInMobile && (
                        <Button
                            className={Styles.result_download}
                            icon="download"
                            onClick={() => {
                                this.props.toggleMobileResultView();
                                this.toImage();
                            }}
                        >
                            Download
                        </Button>
                    )}
                    <div
                        ref={this.resultRef}
                        className={`result ng-container ${
                            (style.template &&
                                style.template
                                    .toLowerCase()
                                    .replace(/\s/g, "-")) ||
                            ""
                        } region-${getGameRegion(
                            this.props.game.name,
                        )} team-size-${numberOfTeam} ${trainerSectionOrientation}-trainer
                       ${editor.showResultInMobile ? Styles.result_mobile : ""}
                        `}
                        style={{
                            fontFamily: style.usePokemonGBAFont
                                ? "pokemon_font"
                                : "inherit",
                            fontSize: style.usePokemonGBAFont ? "125%" : "100%",
                            margin: this.state.isDownloading
                                ? "0"
                                : "3rem auto",
                            backgroundColor: bgColor,
                            backgroundImage: `url(${style.backgroundImage})`,
                            backgroundRepeat: style.tileBackground
                                ? "repeat"
                                : "no-repeat",
                            border: "none",
                            height: style.useAutoHeight
                                ? "auto"
                                : `${style.resultHeight}px`,
                            minHeight: style.useAutoHeight
                                ? "600px"
                                : undefined,
                            transition: "transform 300ms ease-in-out",
                            transformOrigin: "0 0",
                            width: `${style.resultWidth}px`,
                            zIndex: 1,
                            ...this.getScale(
                                style,
                                editor,
                                this.state.panningCoordinates,
                            ),
                        }}
                    >
                        <div
                            className="trainer-container"
                            style={
                                trainerSectionOrientation === "vertical"
                                    ? {
                                          backgroundColor: topHeaderColor,
                                          color: getContrastColor(
                                              topHeaderColor,
                                          ),
                                          width: style.trainerWidth,
                                          position: "absolute",
                                          height: `calc(${style.trainerHeight} + 2%)`,
                                          display: "flex",
                                      }
                                    : {
                                          backgroundColor: topHeaderColor,
                                          color: getContrastColor(
                                              topHeaderColor,
                                          ),
                                          width: style.trainerAuto
                                              ? "100%"
                                              : style.trainerWidth,
                                          height: style.trainerAuto
                                              ? "auto"
                                              : style.trainerHeight,
                                      }
                            }
                        >
                            <TrainerResult
                                orientation={trainerSectionOrientation}
                            />
                        </div>
                        {trainer && trainer.notes ? (
                            <div
                                style={{ color: getContrastColor(bgColor) }}
                                className="result-notes"
                            >
                                {trainer.notes}
                            </div>
                        ) : null}
                        {style.displayRules &&
                        style.displayRulesLocation === "top"
                            ? rulesContainer
                            : null}
                        {teamContainer}
                        {style.template === "Generations" &&
                        trainerSectionOrientation === "vertical" ? (
                            <div className="statuses-wrapper">
                                {/* {this.renderContainer(
                                        this.getPokemonByStatus('Boxed'),
                                        paddingForVerticalTrainerSection,
                                    box?.[1],
                                    )}
                                    {this.renderContainer(
                                        this.getPokemonByStatus('Dead'),
                                        paddingForVerticalTrainerSection,
                                    box?.[2],
                                    )}
                                    {this.renderContainer(
                                        this.getPokemonByStatus('Champs'),
                                        paddingForVerticalTrainerSection,
                                    box?.[3],
                                    )} */}
                                {this.renderOtherPokemonStatuses(
                                    paddingForVerticalTrainerSection,
                                )}
                            </div>
                        ) : (
                            <>
                                {/* {this.renderContainer(
                                        this.getPokemonByStatus('Boxed'),
                                        paddingForVerticalTrainerSection,
                                    box?.[1],
                                    )}
                                    {this.renderContainer(
                                        this.getPokemonByStatus('Dead'),
                                        paddingForVerticalTrainerSection,
                                    box?.[2],
                                    )}
                                    {this.renderContainer(
                                        this.getPokemonByStatus('Champs'),
                                        paddingForVerticalTrainerSection,
                                    box?.[3],
                                    )} */}
                                {this.renderOtherPokemonStatuses(
                                    paddingForVerticalTrainerSection,
                                )}
                            </>
                        )}

                        <div
                            style={{
                                ...paddingForVerticalTrainerSection,
                                display: "flex",
                                color: getContrastColor(bgColor),
                            }}
                        >
                            {style.displayRules &&
                            style.displayRulesLocation === "bottom"
                                ? rulesContainer
                                : null}
                        </div>

                        {enableStats && !EMMA_MODE && (
                            <Stats color={getContrastColor(bgColor)} />
                        )}

                        {enableBackSpriteMontage && (
                            <BackspriteMontage
                                pokemon={this.getPokemonByStatus("Team")}
                            />
                        )}
                    </div>
                </ErrorBoundary>
            </div>
        );
    }
}

export const Result = connect(resultSelector, {
    selectPokemon,
    toggleMobileResultView,
    toggleDialog,
})(ResultBase as any);
