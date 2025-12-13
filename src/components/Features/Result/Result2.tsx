import * as React from "react";
import { TeamPokemon } from "components/Pokemon/TeamPokemon/TeamPokemon2";
import { cx } from "emotion";
import { Box, Pokemon } from "models";
import { useSelector } from "react-redux";
import { State } from "state";
import { Menu, MenuItem } from "components/Common/ui";
import {
    Layout,
    LayoutDisplay,
    LayoutDirection,
    LayoutAlignment,
    LayoutSpacing,
    LayoutWrap,
} from "components/Layout/Layout/Layout";
import { BoxedPokemon } from "components/Pokemon/BoxedPokemon/BoxedPokemon2";
import { ChampsPokemonView } from "components/Pokemon/ChampsPokemon/ChampsPokemonCollection";
import { DeadPokemon } from "components/Pokemon/DeadPokemon/DeadPokemon2";
import { ErrorBoundary } from "components/Common/Shared";
import { TopBar } from "components/Layout/TopBar/TopBar";
import * as Styles from "./styles";
import { TrainerResult } from "./TrainerResult";
import { getContrastColor } from "utils";
import { useEvent } from "utils/hooks";
import { TrainerNotes } from "./TrainerNotes";

import { v4 as uuid } from "uuid";

async function load() {
    const resource = await import("@emmaramirez/dom-to-image");
    return resource.domToImage;
}

const getAllByStatus = (
    boxes?: Box[],
    pokemon?: Pokemon[],
    status?: string,
) => {
    const boxesByStatus = boxes
        ?.filter((box) => {
            return (
                box.name.toLowerCase() === status?.toLowerCase()
            );
        })
        .map((box) => box.name);
    const pokemonByStatus = pokemon?.filter(
        (poke) => !poke.hidden && boxesByStatus?.includes(poke.status ?? ""),
    );

    return pokemonByStatus;
};

export interface DisplayProps {
    display?: LayoutDisplay;
    direction?: LayoutDirection;
    alignment?: LayoutAlignment;
    spacing?: LayoutSpacing;
    wrap?: LayoutWrap;
    name?: string;
}

export enum DownloadStatus {
    dormant = "dormant",
    active = "active",
    error = "error",
    done = "done",
}

const toImage = (ref, setDS) => async () => {
    const resultNode = ref?.current;
    console.log(resultNode);
    try {
        setDS(DownloadStatus.active);
        const domToImage = await load();
        const dataUrl = await (domToImage as any).toPng(resultNode, {
            corsImage: true,
        });
        const link = document.createElement("a");
        link.download = `nuzlocke-${uuid()}.png`;
        link.href = dataUrl;
        link.click();
        setDS(DownloadStatus.done);
    } catch (e) {
        setDS(DownloadStatus.error);
        console.log(e);
    }
};

export const TopBarWithDownload = React.forwardRef((props, ref) => {
    const [downloadStatus, setDownloadStatus] = React.useState(
        DownloadStatus.dormant,
    );

    return (
        <ErrorBoundary>
            <TopBar
                isDownloading={downloadStatus === DownloadStatus.active}
                onClickDownload={toImage(ref, setDownloadStatus)}
            ></TopBar>
        </ErrorBoundary>
    );
});
TopBarWithDownload.displayName = "TopBarWithDownload";

export function TeamPokemonMemberView({ pokemon }: { pokemon: Pokemon }) {
    const [showContext, setShowContext] = React.useState(false);

    const onClick = (event) => {
        setShowContext(!showContext);
    };

    const renderMenu = (
        <div
            style={{
                position: "absolute",
                top: "70%",
                right: "-1rem",
                zIndex: 200,
            }}
        >
            <Menu>
                <MenuItem text="Edit..." />
                <MenuItem onClick={() => setShowContext(false)} text="Delete" />
                <MenuItem onClick={() => setShowContext(false)} text="Cancel" />
            </Menu>
        </div>
    );

    return (
        <div
            className="pokemon-member-wrapper"
            style={{
                position: "relative",
                ...(showContext && {
                    outline: "3px solid #58e3f5",
                    filter: "drop-shadow(0 0 0 2px rgba(0,0,0,0.2)",
                }),
            }}
            role="group"
            onKeyPress={onClick}
            onClick={onClick}
        >
            {showContext && renderMenu}
            <TeamPokemon options={{}} pokemon={pokemon} />
        </div>
    );
}

export type ViewProps = Partial<Pick<State, "pokemon">> & DisplayProps;

export function TeamPokemonView({
    pokemon,
    display,
    direction,
    alignment,
    spacing,
    wrap,
    name,
}: ViewProps) {
    return (
        <Layout
            name={name}
            wrap={wrap}
            display={display}
            direction={direction}
            alignment={alignment}
            spacing={spacing}
        >
            {pokemon?.map((poke) => (
                <TeamPokemonMemberView key={poke.id} pokemon={poke} />
            ))}
        </Layout>
    );
}

export function BoxedPokemonView({
    pokemon,
    display,
    direction,
    alignment,
    spacing,
}: ViewProps) {
    return (
        <Layout
            display={display}
            direction={direction}
            alignment={alignment}
            spacing={spacing}
        >
            {pokemon?.map((poke) => (
                <BoxedPokemon key={poke.id} pokemon={poke} />
            ))}
        </Layout>
    );
}

export function DeadPokemonView({
    pokemon,
    display,
    direction,
    alignment,
    spacing,
}: ViewProps) {
    return (
        <Layout
            display={display}
            direction={direction}
            alignment={alignment}
            spacing={spacing}
        >
            {pokemon?.map((poke) => (
                <DeadPokemon key={poke.id} pokemon={poke} />
            ))}
        </Layout>
    );
}

export const ResultInner = React.forwardRef(
    (props, resultRef: React.Ref<HTMLDivElement>) => {
        const [downloadStatus, setDownloadStatus] = React.useState(
            DownloadStatus.dormant,
        );
        const [scale, setScale] = React.useState(1);
        const [srollY, setScrollY] = React.useState(0);
        const pokemon = useSelector<State, State["pokemon"]>(
            (state) => state.pokemon,
        );
        const style = useSelector<State, State["style"]>(
            (state) => state.style,
        );
        const boxes = useSelector<State, State["box"]>((state) => state.box);
        const { bgColor } = style;

        const topHeaderColor = style ? style.topHeaderColor : "#333333";

        const scrollToScale = (event) => {
            console.log(scrollY - window.scrollY);
            setScrollY(window.scrollY);
        };

        React.useEffect(() => {
            console.log(resultRef);
            window.addEventListener("scroll", scrollToScale);
            return () => window.removeEventListener("scroll", scrollToScale);
        });

        return (
            <div
                data-testid="result"
                ref={resultRef}
                style={{
                    margin: "2rem",
                    background: bgColor,
                    color: "#222",
                    height: `${style.resultHeight}px`,
                    width: `${style.resultWidth}px`,
                    overflowY: "auto",
                    fontFamily: style.usePokemonGBAFont
                        ? "pokemon_font"
                        : "inherit",
                    fontSize: style.usePokemonGBAFont ? "125%" : "100%",
                }}
            >
                <style>{style.customCSS}</style>
                <div
                    className="trainer-container"
                    style={{
                        backgroundColor: topHeaderColor,
                        color: getContrastColor(topHeaderColor),
                        width: style.trainerAuto ? "100%" : style.trainerWidth,
                        height: style.trainerAuto
                            ? "auto"
                            : style.trainerHeight,
                    }}
                >
                    <TrainerResult orientation={"horizontal"} />
                </div>
                <TrainerNotes />
                <ErrorBoundary>
                    <TeamPokemonView
                        wrap={LayoutWrap.Wrap}
                        name={"team"}
                        spacing={LayoutSpacing.Center}
                        pokemon={getAllByStatus(boxes, pokemon, "team")}
                    />
                </ErrorBoundary>
                <BoxedPokemonView
                    spacing={LayoutSpacing.Center}
                    pokemon={getAllByStatus(boxes, pokemon, "boxed")}
                />
                <DeadPokemonView
                    spacing={LayoutSpacing.Center}
                    pokemon={getAllByStatus(boxes, pokemon, "dead")}
                />
                <ChampsPokemonView
                    spacing={LayoutSpacing.Center}
                    pokemon={getAllByStatus(boxes, pokemon, "champs")}
                />
            </div>
        );
    },
);
ResultInner.displayName = "ResultInner";

export class Result extends React.Component {
    public ref: React.RefObject<HTMLDivElement>;
    public constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    public render() {
        return (
            <div className={cx(Styles.result_wrapper, "hide-scrollbars")}>
                {/* @ts-expect-error - TopBar ref type mismatch */}
                <TopBar ref={this.ref} />
                <ResultInner ref={this.ref} />
            </div>
        );
    }
}
