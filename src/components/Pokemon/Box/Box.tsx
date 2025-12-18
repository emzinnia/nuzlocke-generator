import * as React from "react";
import { useState } from "react";
import { Pokemon } from "models";
import { Boxes } from "models";
import {
    editPokemon,
    clearBox,
    editBox,
    deleteBox,
    deletePokemon,
    updateBoxes,
} from "actions";
import { Box as BoxType } from "models";

import { PokemonByFilter } from "components/Common/Shared";
import {
    ConnectDragSource,
    ConnectDropTarget,
    useDrag,
    useDrop,
} from "react-dnd";
import {
    Icon,
    Popover,
    PopoverInteractionKind,
    Menu,
    MenuItem,
    Position,
    Button,
    Intent,
    Alert,
    Classes,
    Toast,
} from "@blueprintjs/core";
import { connect, useDispatch } from "react-redux";
import {
    PokemonIcon,
    PokemonIconProps,
} from "components/Pokemon/PokemonIcon/PokemonIcon";
import { showToast } from "components/Common/Shared/appToaster";

export type BoxProps = {
    pokemon: Pokemon[];
    connectDropTarget?: ConnectDropTarget;
    connectDragSource?: ConnectDragSource;
    connectDropTargetBox?: ConnectDropTarget;
    canDrop?: boolean;
    clearBox?: clearBox;
    editBox?: editBox;
    deletePokemon?: deletePokemon;
    background?: string;
    deleteBox?: deleteBox;
    updateBoxes?: updateBoxes;
    searchTerm: string;
    matchedIds: Set<string>;
    hasSearchQuery: boolean;
} & BoxType;

export const wallpapers = [
    {
        name: "Route 1",
        background: "route-1",
    },
    {
        name: "Grass Meadow",
        background: "grass-meadow",
    },
    {
        name: "Stars",
        background: "stars",
    },
    {
        name: "Sky",
        background: "sky",
    },
    {
        name: "Bubbles",
        background: "bubbles",
    },
    {
        name: "Beach",
        background: "beach",
    },
    {
        name: "Seafloor",
        background: "seafloor",
    },
    {
        name: "Croagunk",
        background: "croagunk",
    },
    {
        name: "Simple",
        background: "simple",
    },
    {
        name: "Snow",
        background: "snow",
    },
];

export interface BoxState {
    deleteConfirmationOpen: boolean;
}

export const Box: React.FC<BoxProps> = (props) => {
    const {
        pokemon,
        inheritFrom,
        name,
        id,
        canDrop,
        background,
        collapsed: isCollapsed,
        searchTerm,
        matchedIds,
        hasSearchQuery,
    } = props;

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const dispatch = useDispatch();

    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: "BOX",
        item: { id, position: props.position },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [id, props.position]);

    const [{ isOver, isOverBox }, dropRef] = useDrop(() => ({
        accept: ["POKEMON_ICON", "BOX"],
        drop: (item: PokemonIconProps | { id: number; position: number }, monitor) => {
            const itemType = monitor.getItemType();
            
            // Handle Pokemon drops
            if (itemType === "POKEMON_ICON") {
                const pokemonItem = item as PokemonIconProps;
                if (props.id == null || pokemonItem.id == null) {
                    showToast({
                        message: "Failed to move Pokémon",
                        intent: Intent.DANGER,
                    });
                    return;
                }
                dispatch(
                    editPokemon(
                        {
                            status: props.name,
                        },
                        pokemonItem.id,
                    ),
                );
            }
            
            // Handle Box drops (reordering)
            if (itemType === "BOX") {
                const boxItem = item as { id: number; position: number };
                if (props.id == null || boxItem.id == null || boxItem.id === props.id) {
                    return; // Don't swap with self
                }
                
                // Swap positions between the two boxes
                dispatch(
                    editBox(props.id, {
                        position: boxItem.position,
                    }),
                );
                dispatch(
                    editBox(boxItem.id, {
                        position: props.position,
                    }),
                );
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            isOverBox: monitor.isOver() && monitor.getItemType() === "BOX",
        }),
    }), [props.id, props.name, props.position, dispatch]);

    const toggleDialog = () =>
        setDeleteConfirmationOpen(!deleteConfirmationOpen);

    const handleDeleteBox = () => {
        dispatch(deleteBox(id));

        pokemon
            .filter((p) => p.status === name)
            .forEach((p) => deletePokemon(p.id));

        setDeleteConfirmationOpen(false);
    };

    const handleEditBox = (edits: Partial<BoxType>) => {
        dispatch(editBox(id, edits));
    };

    const handleToggleCollapse = () => {
        dispatch(editBox(id, { collapsed: !isCollapsed }));
    };

    const handleClearBox = () => {
        dispatch(clearBox(name));
    };

    const getBoxBackground = () => {
        const bg = background || getDefaultBackground(name);
        return bg?.startsWith("http")
            ? `url(${bg})`
            : `url(./assets/img/box/${bg}.png)`;
    };

    const getDefaultBackground = (boxName: string) => {
        switch (boxName) {
            case "Team":
                return "route-1";
            case "Boxed":
                return "grass-meadow";
            case "Dead":
                return "stars";
            case "Champs":
                return "sky";
            default:
                return undefined;
        }
    };

    const collapsedStyle = isCollapsed
        ? {
              height: "54px",
              overflow: "hidden",
              WebkitMaskImage:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.33) 25%, black 75%)",
              marginBottom: "-18px",
          }
        : {};

    return (
        <div
            ref={dropRef}
            style={{
                backgroundImage: getBoxBackground(),
                opacity: isDragging ? 0.5 : 1,
                outline: isOverBox ? "2px dashed #48aff0" : "none",
                outlineOffset: "-2px",
                ...collapsedStyle,
            }}
            className={`box ${name.replace(/\s/g, "-")}-box`}
        >
            <Alert
                icon="trash"
                isOpen={deleteConfirmationOpen}
                onCancel={toggleDialog}
                onConfirm={handleDeleteBox}
                confirmButtonText="Delete Box"
                cancelButtonText="Cancel"
                intent={Intent.DANGER}
            >
                <p>
                    This will delete the currently selected Box and all Pokémon
                    stored inside the box. Are you sure you want to do that?
                </p>
            </Alert>
            <Popover
                position={Position.BOTTOM_LEFT}
                minimal
                interactionKind={PopoverInteractionKind.CLICK_TARGET_ONLY}
                popoverClassName="no-list-item-types"
                content={
                    <>
                        <MenuItem text="Change Wallpaper">
                            {wallpapers.map((wall) => (
                                <MenuItem
                                    key={wall.name}
                                    onClick={() =>
                                        handleEditBox({
                                            background: wall.background,
                                        })
                                    }
                                    text={wall.name}
                                />
                            ))}
                        </MenuItem>
                        {!["Team", "Boxed", "Dead", "Champs"].includes(
                            name,
                        ) && (
                            <MenuItem text="Change Type">
                                {["Team", "Boxed", "Dead", "Champs"].map(
                                    (b) => (
                                        <MenuItem
                                            key={b}
                                            onClick={() =>
                                                handleEditBox({
                                                    inheritFrom: b,
                                                })
                                            }
                                            text={
                                                b === inheritFrom ? (
                                                    <>
                                                        <Icon icon="small-tick" />{" "}
                                                        {b}
                                                    </>
                                                ) : (
                                                    b
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </MenuItem>
                        )}
                        <MenuItem
                            onClick={handleToggleCollapse}
                            text={isCollapsed ? "Expand Box" : "Collapse Box"}
                        />
                        <MenuItem
                            onClick={handleClearBox}
                            className={Classes.FILL}
                            text="Clear Box"
                        />
                        {!["Team", "Boxed", "Dead", "Champs"].includes(
                            name,
                        ) && (
                            <MenuItem
                                onClick={toggleDialog}
                                className={Classes.FILL}
                                text="Delete Box"
                            />
                        )}
                    </>
                }
            >
                <span
                    style={{
                        alignItems: "center",
                        background: canDrop
                            ? "black"
                            : "rgba(33, 33, 33, 0.33)",
                        borderRadius: ".25rem",
                        color: "#eee",
                        display: "inline-flex",
                        minHeight: "2rem",
                        gap: "0.25rem",
                        margin: ".25rem",
                        padding: ".25rem .5rem",
                        textAlign: "center",
                        minWidth: "5rem",
                        userSelect: "none",
                    }}
                >
                    <span
                        ref={dragRef}
                        style={{
                            cursor: isDragging ? "grabbing" : "grab",
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.25rem",
                            marginLeft: "-0.25rem",
                            borderRadius: "0.125rem",
                        }}
                        title="Drag to reorder"
                    >
                        <Icon style={{ opacity: 0.5 }} icon="drag-handle-vertical" />
                    </span>
                    {name}
                    <Icon style={{ opacity: 0.7 }} icon="caret-down" />
                </span>
            </Popover>
            <PokemonByFilter
                searchTerm={searchTerm}
                matchedIds={matchedIds}
                hasSearchQuery={hasSearchQuery}
                team={pokemon}
                status={name}
            />
        </div>
    );
};
