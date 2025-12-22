/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getIconFormeSuffix,
    Forme,
    Species,
    significantGenderDifferenceList,
} from "utils";
import { Gender, GenderElementProps } from "components/Common/Shared";
import { editPokemon, selectPokemon } from "actions";
import { store } from "store";
import {
    ConnectDragSource,
    ConnectDropTarget,
} from "react-dnd";
import { useDrag, useDrop } from "react-dnd";
import { State } from "state";
import { Omit } from "ramda";
import { normalizeSpeciesName } from "utils/getters/normalizeSpeciesName";
import { PokemonImage } from "components/Common/Shared/PokemonImage";
import { ResizedImage } from "components/Common/Shared/ResizedImage";
import { Pokemon } from "models";

export interface PokemonIconProps {
    /** The id of the Pokemon, used for selection **/
    id?: Pokemon["id"];
    /** The id of the Pokemon **/
    species: Pokemon["species"];
    /** The forme of the Pokemon **/
    forme?: Pokemon["forme"];
    /** The gender of the Pokemon */
    gender?: GenderElementProps;
    customIcon?: Pokemon["customIcon"];
    hidden?: Pokemon["hidden"];
    egg?: Pokemon["egg"];
    position?: Pokemon["position"];
    onClick: () => void;
    selectedId: string | null;
    /** Renders its shiny version if true **/
    shiny?: Pokemon["shiny"];
    status?: Pokemon["status"];
    className?: string;
    style?: React.CSSProperties;
    styles?: State["style"];
    includeTitle?: boolean;

    connectDragSource?: ConnectDragSource;
    connectDropTarget?: ConnectDropTarget;
    canDrop?: boolean;
    isDragging?: boolean;
}

type BasePokemonIconProps = Omit<PokemonIconProps, "onClick" | "selectedId">;

type IconURLArgs = Pick<
    Pokemon,
    "id" | "species" | "forme" | "shiny" | "gender" | "customIcon" | "egg"
>;

const usePokemonDrag = (props: BasePokemonIconProps) => {
    const [, dragRef] = useDrag({
        type: "POKEMON_ICON",
        item: {
            id: props.id,
            position: props.position,
            status: props.status,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        // @TODO: figure out where this piece should go
        // item: () => {
        //     store.dispatch(selectPokemon(props.id!));
        // },
    });

    return dragRef;
};

const usePokemonDrop = (props: BasePokemonIconProps) => {
    const [, dropRef] = useDrop({
        accept: "POKEMON_ICON",
        drop: (item: { id: string; position: number; status: string }) => {
            const newPosition = props.position;
            const newId = props.id;
            const newStatus = props.status;
            const oldId = item?.id;
            const oldPosition = item?.position;
            const oldStatus = item?.status;

            if (
                newId == null ||
                oldId == null ||
                oldPosition == null ||
                oldStatus == null
            ) {
                return;
            }

            store.dispatch(
                editPokemon(
                    {
                        position: oldPosition,
                        status: oldStatus,
                    },
                    newId,
                ),
            );
            store.dispatch(
                editPokemon(
                    {
                        position: newPosition,
                        status: newStatus,
                    },
                    oldId,
                ),
            );
        },
    });

    return dropRef;
};

export const getIconURL = ({
    id,
    species,
    forme,
    shiny,
    gender,
    customIcon,
    egg,
}: IconURLArgs) => {
    const baseURL = "icons/pokemon/";
    const isShiny = shiny ? "shiny" : "regular";
    const isFemaleSpecific =
        significantGenderDifferenceList.includes(species) &&
        Gender.isFemale(gender)
            ? "female/"
            : "";

    if (species === "Egg" || egg) return `${baseURL}egg.png`;

    return `${baseURL}${isShiny}/${isFemaleSpecific}${normalizeSpeciesName(
        species as Species,
    )}${getIconFormeSuffix(forme as keyof typeof Forme)}.png`;
};

export function PokemonIconPlain({
    isDragging,
    canDrop,
    id,
    gender,
    species,
    forme,
    onClick,
    selectedId,
    className,
    shiny,
    egg,
    style,
    customIcon,
    includeTitle,
    imageStyle,
}: PokemonIconProps & { imageStyle: any }) {
    // className={`${isDragging ? 'opacity-medium' : ''} ${canDrop ? 'droppable' : ''}`}
    return (
        <div
            role="presentation"
            onClick={(e) => {
                e.preventDefault();
                if (onClick) {
                    onClick();
                }
            }}
            id={id}
            title={includeTitle ? species : undefined}
            style={style}
            className={`${id === selectedId ? "pokemon-icon selected" : "pokemon-icon"} ${className || ""} ${isDragging ? "opacity-medium" : ""} ${canDrop ? "droppable" : ""}`}
        >
            {customIcon ? (
                <PokemonImage url={customIcon}>
                    {(image) => (
                        <ResizedImage
                            // Keep layout consistent with default icons, but cap custom icon data at 64x64.
                            src={image}
                            width={64}
                            height={64}
                            style={imageStyle}
                            alt={species}
                        />
                    )}
                </PokemonImage>
            ) : (
                <img
                    style={imageStyle}
                    alt={species}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = "icons/pokemon/unknown.png";
                    }}
                    src={getIconURL({
                        id,
                        species,
                        forme,
                        shiny,
                        gender,
                        egg,
                        customIcon,
                    } as IconURLArgs)}
                />
            )}
        </div>
    );
}

export const PokemonIcon = (props: BasePokemonIconProps) => {
    const { selectedId, style } = useSelector<
        State,
        Pick<State, "selectedId" | "style">
    >((state) => ({ selectedId: state.selectedId, style: state.style }));
    const dispatch = useDispatch();

    const { styles, hidden } = props;
    const dragRef = usePokemonDrag(props);
    const dropRef = usePokemonDrop(props);
    const onClick = () => {
        dispatch(selectPokemon(props.id!));
    };
    const imageStyle = {
        height: "32px",
        maxWidth: "auto",
        imageRendering: styles?.iconRendering,
    };

    return (
        <div ref={(node) => dragRef(dropRef(node))}>
            <PokemonIconPlain
                onClick={onClick}
                imageStyle={imageStyle}
                selectedId={selectedId}
                style={style}
                {...props}
            />
        </div>
    );
};
