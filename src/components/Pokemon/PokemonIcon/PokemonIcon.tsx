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
    id?: Pokemon["id"];
    species: Pokemon["species"];
    forme?: Pokemon["forme"];
    gender?: GenderElementProps;
    customIcon?: Pokemon["customIcon"];
    hidden?: Pokemon["hidden"];
    egg?: Pokemon["egg"];
    position?: Pokemon["position"];
    onClick?: (e?: React.MouseEvent) => void;
    selectedId?: string | null;
    shiny?: Pokemon["shiny"];
    status?: Pokemon["status"];
    className?: string;
    style?: React.CSSProperties;
    styles?: State["style"];
    includeTitle?: boolean;
    imageStyle?: React.CSSProperties;

    connectDragSource?: ConnectDragSource;
    connectDropTarget?: ConnectDropTarget;
    canDrop?: boolean;
    isDragging?: boolean;
}

type BasePokemonIconProps = Omit<PokemonIconProps, "onClick" | "selectedId" | "imageStyle">;

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
    });

    return dragRef;
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
    const baseURL = "/icons/pokemon/";
    const isShiny = shiny ? "shiny" : "regular";
    const isFemaleSpecific =
        significantGenderDifferenceList.includes(species) &&
        Gender.isFemale(gender)
            ? "female/"
            : "";

    if (egg) {
        return `${baseURL}${isShiny}/egg.png`;
    }
    const normalizedName = normalizeSpeciesName(species);
    const formeSuffix = getIconFormeSuffix(species, forme);
    return `${baseURL}${isShiny}/${isFemaleSpecific}${normalizedName}${formeSuffix}.png`;
};

export function PokemonIconPlain(
    props: BasePokemonIconProps & {
        selectedId: string | null;
        onClick: PokemonIconProps["onClick"];
        imageStyle?: React.CSSProperties;
    },
) {
    const dragRef = usePokemonDrag(props);

    const isSelected = props.id === props.selectedId;

    if (props.hidden) return null;

    const iconSrc = props.customIcon ||
        getIconURL({
            species: props.species,
            forme: props.forme,
            shiny: props.shiny,
            gender: props.gender as Pokemon["gender"],
            egg: props.egg,
        });

    return (
        <div
            ref={dragRef}
            className={props.className}
            style={{
                cursor: "grab",
                display: "inline-block",
                ...props.style,
            }}
            onClick={props.onClick}
        >
            <img
                style={{
                    filter: isSelected
                        ? "drop-shadow(0px 0px 4px cyan)"
                        : undefined,
                    width: 40,
                    height: 30,
                    imageRendering: "pixelated",
                    ...props.imageStyle,
                }}
                title={props.includeTitle ? props.species : undefined}
                alt={props.species}
                src={iconSrc}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "/icons/pokemon/unknown.png";
                }}
            />
        </div>
    );
}

export function PokemonIcon(props: PokemonIconProps) {
    const dispatch = useDispatch();
    const selectedId = useSelector((state: State) => state.selectedId);

    const handleClick = React.useCallback(
        (e?: React.MouseEvent) => {
            if (props.onClick) {
                props.onClick(e);
            } else if (props.id) {
                dispatch(selectPokemon(props.id));
            }
        },
        [dispatch, props],
    );

    return (
        <PokemonIconPlain
            {...props}
            selectedId={selectedId}
            onClick={handleClick}
        />
    );
}
