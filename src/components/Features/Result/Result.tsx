import * as React from "react";

import { connect } from "react-redux";
import { v4 as uuid } from "uuid";

import { selectPokemon, toggleMobileResultView, toggleDialog } from "actions";
import {
    TeamPokemon,
    TeamPokemonBaseProps,
} from "components/Pokemon/TeamPokemon/TeamPokemon";
import { DeadPokemon } from "components/Pokemon/DeadPokemon/DeadPokemon";
import { BoxedPokemon } from "components/Pokemon/BoxedPokemon/BoxedPokemon";
import { ChampsPokemon } from "components/Pokemon/ChampsPokemon/ChampsPokemon";
import { TrainerResult } from "components/Features/Result/TrainerResult"; // Self-referential? Or maybe Result2?
import { ErrorBoundary } from "components/Common/Shared";
import { Stats } from "./Stats";
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
    Forme,
} from "utils";

import * as Styles from "./styles";

import "./Result.css";
import "./themes.css";
import { State } from "state";
import isMobile from "is-mobile";
import { Button } from "components/ui/shims";
import { clamp } from "ramda";
import { resultSelector } from "selectors";
import { PokemonImage } from "components/Common/Shared/PokemonImage";
import { normalizeSpeciesName } from "utils/getters/normalizeSpeciesName";

async function load() {
    const resource = await import("@emmaramirez/dom-to-image");
    return resource.domToImage;
}

interface ResultProps {
    pokemon: Pokemon[];
    game: State["game"];
    trainer: Trainer;
    box: State["box"];
    editor: Editor;
    selectPokemon: selectPokemon;
    toggleMobileResultView: typeof toggleMobileResultView;
    toggleDialog: toggleDialog;
    style: State["style"];
    rules: string[];
    customTypes: State["customTypes"];
    onDownloadStateChange?: (isDownloading: boolean) => void;
    onZoomLevelChange?: (zoomLevel: number) => void;
}

export interface ResultHandle {
    toImage: () => Promise<void>;
    setZoomLevel: (zoomLevel: number) => void;
}

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
                ).toLowerCase()}${getIconFormeSuffix(poke.forme as keyof typeof Forme)}.png`;

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

export const ResultBase = React.forwardRef<ResultHandle, ResultProps>(
    (props, ref) => {
        const {
            style,
            box,
            trainer,
            pokemon,
            editor,
            game,
            rules,
            onDownloadStateChange,
            onZoomLevelChange,
            toggleMobileResultView,
        } = props;

        const resultRef = React.useRef<HTMLDivElement>(null);
        const [isDownloading, setIsDownloading] = React.useState(false);
        const [downloadError, setDownloadError] = React.useState<string | null>(
            null,
        );
        const [panningCoordinates, setPanningCoordinates] = React.useState<
            [number?, number?]
        >([undefined, undefined]);
        const [zoomLevel, setZoomLevel] = React.useState(1);

        React.useEffect(() => {
            onZoomLevelChange?.(zoomLevel);
        }, [onZoomLevelChange, zoomLevel]);

        const renderTeamPokemon = React.useCallback((teamPokemon: Pokemon[]) => {
            return teamPokemon.sort(sortPokes).map((poke) => {
                return <TeamPokemon key={poke.id} pokemon={poke} />;
            });
        }, []);

        const getBoxClass = React.useCallback((s) => {
            if (s === "Dead") return "dead";
            if (s === "Boxed") return "boxed";
            if (s === "Champs") return "champs";
            if (s === "Team") return "team";
            return "boxed";
        }, []);

        const getBoxStyle = React.useCallback(
            (s) => {
                if (s === "Champs")
                    return {
                        margin: style.template === "Compact" ? 0 : ".5rem",
                        display: "flex",
                        flexWrap: "wrap" as React.CSSProperties["flexWrap"],
                    };
                if (s === "Dead")
                    return {
                        display: "flex",
                        flexWrap: "wrap" as React.CSSProperties["flexWrap"],
                        justifyContent: "center",
                        margin: style.template === "Compact" ? 0 : ".5rem",
                    };

                return {};
            },
            [style.template],
        );

        const getH3 = React.useCallback((box: Box, n: number) => {
            if (box.name === "Dead" || box.name === "Champs") {
                if (n) {
                    return ` (${n})`;
                }
            }
            return null;
        }, []);

        const renderContainer = React.useCallback(
            (
                pokemonList: Pokemon[],
                paddingForVerticalTrainerSection: React.CSSProperties,
                boxItem?: Box,
            ) =>
                boxItem && pokemonList && pokemonList.length > 0 ? (
                    <div
                        key={boxItem.id}
                        style={paddingForVerticalTrainerSection}
                        className={`${getBoxClass(boxItem?.inheritFrom || boxItem.name)}-container`}
                    >
                        {boxItem?.name !== "Team" && (
                            <h3
                                style={{
                                    color: getContrastColor(
                                        style.bgColor || "#383840",
                                    ),
                                }}
                            >
                                {boxItem?.name}
                                {getH3(boxItem, pokemonList.length)}
                            </h3>
                        )}
                        <div
                            className="boxed-container-inner"
                            style={getBoxStyle(
                                boxItem?.name || boxItem?.inheritFrom,
                            )}
                        >
                            {pokemonList.map((poke) => {
                                if (
                                    boxItem?.name === "Boxed" ||
                                    boxItem?.inheritFrom === "Boxed"
                                )
                                    return (
                                        <BoxedPokemon key={poke.id} {...poke} />
                                    );
                                if (
                                    boxItem?.name === "Dead" ||
                                    boxItem?.inheritFrom === "Dead"
                                )
                                    return (
                                        <DeadPokemon
                                            minimal={false}
                                            key={poke.id}
                                            {...poke}
                                        />
                                    );
                                if (
                                    boxItem?.name === "Champs" ||
                                    boxItem?.inheritFrom === "Champs"
                                )
                                    return (
                                        <ChampsPokemon
                                            useSprites={style.useSpritesForChampsPokemon}
                                            showGender={
                                                !style.minimalChampsLayout
                                            }
                                            showLevel={!style.minimalChampsLayout}
                                            showNickname={
                                                !style.minimalChampsLayout
                                            }
                                            key={poke.id}
                                            {...poke}
                                        />
                                    );
                                if (
                                    boxItem?.name === "Team" ||
                                    boxItem?.inheritFrom === "Team"
                                )
                                    return (
                                        <TeamPokemon
                                            key={poke.id}
                                            pokemon={poke}
                                        />
                                    );
                                return null;
                            })}
                        </div>
                    </div>
                ) : null,
            [getBoxClass, getBoxStyle, getH3, style],
        );

        const getCorrectStatusWrapper = React.useCallback(
            (
                pokes: Pokemon[],
                boxItem,
                paddingForVerticalTrainerSection: React.CSSProperties,
            ) => {
                return renderContainer(
                    pokes,
                    paddingForVerticalTrainerSection,
                    boxItem,
                );
            },
            [renderContainer],
        );

        const renderOtherPokemonStatuses = React.useCallback(
            (
                paddingForVerticalTrainerSection: React.CSSProperties,
                pokemonByStatus: Map<string, Pokemon[]>,
                orderedBoxes: Box[],
            ) => {
                return orderedBoxes.map((boxItem) => {
                    const pokes = pokemonByStatus.get(boxItem.name) ?? [];
                    return getCorrectStatusWrapper(
                        pokes,
                        boxItem,
                        paddingForVerticalTrainerSection,
                    );
                });
            },
            [getCorrectStatusWrapper],
        );

        const getScale = React.useCallback(
            (
                styleState: State["style"],
                editorState: State["editor"],
                coords: [number?, number?],
            ) => {
                const rw = parseInt(styleState.resultWidth.toString());
                const ww = window.innerWidth;
                const scale = ww / rw / 1.1;
                const height =
                    (resultRef?.current?.offsetHeight ?? 0) / zoomLevel;
                const width =
                    (resultRef?.current?.offsetWidth ?? 300) / zoomLevel;
                const translate = `translateX(${clamp(-width, width, (coords?.[0] ?? 0) / 1)}px) translateY(${clamp(-height, Infinity, (coords?.[1] ?? 0) / 1)}px)`;
                if (isDownloading) {
                    return { transform: undefined };
                }
                if (!editorState.showResultInMobile) {
                    return { transform: `scale(${zoomLevel}) ${translate}` };
                }
                if (!Number.isNaN(rw)) {
                    return { transform: `scale(${scale.toFixed(2)})` };
                } else {
                    return { transform: "scale(0.3)" };
                }
            },
            [isDownloading, resultRef, zoomLevel],
        );

        const onPan = React.useCallback((e?: React.MouseEvent<HTMLElement>) => {
            e?.preventDefault();
            e?.persist();
            if (e?.buttons === 1) {
                setPanningCoordinates((coords) => [
                    (coords?.[0] ?? 0) + (e?.movementX ?? 0),
                    (coords?.[1] ?? 0) + (e?.movementY ?? 0),
                ]);
            }
        }, []);

        const updateZoomLevel = React.useCallback((zoom: number) => {
            setZoomLevel(zoom);
        }, []);

        const onZoom = React.useCallback(
            (e?: React.WheelEvent<HTMLElement>) => {
                if (e?.shiftKey) {
                    const deltaY = e?.deltaY ?? -3;
                    updateZoomLevel(clamp(0.1, 5, -deltaY / 3));
                }
            },
            [updateZoomLevel],
        );

        const resetPan = React.useCallback(() => {
            setPanningCoordinates([0, 0]);
            setZoomLevel(1);
        }, []);

        const notifyDownloadState = React.useCallback(
            (state: boolean) => onDownloadStateChange?.(state),
            [onDownloadStateChange],
        );

        const toImage = React.useCallback(async () => {
            const resultNode = resultRef.current;
            setIsDownloading(true);
            notifyDownloadState(true);
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
                setDownloadError(null);
                setIsDownloading(false);
                notifyDownloadState(false);
            } catch (e) {
                console.log(e);
                setDownloadError(
                    "Failed to download. This is likely due to your image containing an image resource that does not allow Cross-Origin",
                );
                setIsDownloading(false);
                notifyDownloadState(false);
            }
        }, [notifyDownloadState]);

        React.useImperativeHandle(
            ref,
            () => ({
                toImage,
                setZoomLevel: updateZoomLevel,
            }),
            [toImage, updateZoomLevel],
        );

        const pokemonWithId = (pokemon ?? [])
            .filter((v): v is Pokemon => typeof (v as Pokemon).id === "string")
            .filter((p) => !p.hidden);
        const pokemonByStatus = new Map<string, Pokemon[]>();
        for (const p of pokemonWithId) {
            const status = p.status ?? "";
            const arr = pokemonByStatus.get(status) ?? [];
            arr.push(p);
            pokemonByStatus.set(status, arr);
        }
        const teamPokemon = pokemonByStatus.get("Team") ?? [];
        const numberOfTeam = teamPokemon.length;
        const bgColor = style ? style.bgColor : "#383840";
        const topHeaderColor = style ? style.topHeaderColor : "#333333";
        const accentColor = style ? style.accentColor : "#111111";
        const trainerSectionOrientation = style.trainerSectionOrientation;
        const paddingForVerticalTrainerSection =
            trainerSectionOrientation === "vertical"
                ? {
                      paddingLeft: style.trainerWidth,
                  }
                : {};
        const orderedBoxes = (box ?? [])
            .filter((b) => !["Team"].includes(b.name))
            .slice()
            .sort((a, b) => {
                const posA = a.position || 0;
                const posB = b.position || 1;
                return posA - posB;
            });
        const teamContainer = (
            <div
                style={paddingForVerticalTrainerSection}
                className="team-container"
            >
                {renderTeamPokemon(teamPokemon)}
            </div>
        );

        const rulesContainer = (
            <div className="rules-container">
                <h3 style={{ color: getContrastColor(bgColor) }}>Rules</h3>
                <ol style={{ color: getContrastColor(bgColor) }}>
                    {rules.map((rule, index) => {
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
                onWheel={onZoom}
                onMouseMove={onPan}
                onDoubleClick={resetPan}
                className="hide-scrollbars"
                style={{ 
                    flex: 1, 
                    minWidth: 0, 
                    overflowY: "scroll",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start"
                }}
            >
                {isMobile() && editor.showResultInMobile && (
                    <div className="ui-overlay-backdrop"></div>
                )}
                <ErrorBoundary>
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
                                toggleMobileResultView();
                                toImage();
                            }}
                        >
                            Download
                        </Button>
                    )}
                    <div
                        ref={resultRef}
                        className={`result ng-container ${
                            (style.template &&
                                style.template
                                    .toLowerCase()
                                    .replace(/\s/g, "-")) ||
                            ""
                        } region-${getGameRegion(
                            game.name,
                        )} team-size-${numberOfTeam} ${trainerSectionOrientation}-trainer
                       ${editor.showResultInMobile ? Styles.result_mobile : ""}
                        `}
                        style={{
                            fontFamily: style.usePokemonGBAFont
                                ? "pokemon_font"
                                : "inherit",
                            fontSize: style.usePokemonGBAFont ? "125%" : "100%",
                            margin: isDownloading ? "0" : "3rem 0",
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
                            transformOrigin: "center top",
                            width: `${style.resultWidth}px`,
                            zIndex: 1,
                            ...getScale(
                                style,
                                editor,
                                panningCoordinates,
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
                                {renderOtherPokemonStatuses(
                                    paddingForVerticalTrainerSection,
                                    pokemonByStatus,
                                    orderedBoxes,
                                )}
                            </div>
                        ) : (
                            <>
                                {renderOtherPokemonStatuses(
                                    paddingForVerticalTrainerSection,
                                    pokemonByStatus,
                                    orderedBoxes,
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
                            <BackspriteMontage pokemon={teamPokemon} />
                        )}
                    </div>
                </ErrorBoundary>
            </div>
        );
    },
);

ResultBase.displayName = "ResultBase";

export const Result = connect(
    resultSelector,
    {
        selectPokemon,
        toggleMobileResultView,
        toggleDialog,
    },
    null,
    { forwardRef: true },
)(ResultBase);
