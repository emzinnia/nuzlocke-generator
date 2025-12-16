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

import { store } from "store";
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

const boxSource = {
    drop(props, monitor, component) {
        const newStatus = props.name;
        store.dispatch(
            editPokemon({ status: newStatus }, monitor.getItem().id),
        );
        return {};
    },

    hover(props, monitor) {
        return { isHovering: monitor.isOver({ shallow: true }) };
    },
};

const boxSourceDrop = {
    drop(props, monitor, component) {
        const item = monitor.getItem();

        if (props.id == null || item.id == null) {
            showToast({
                message: "Failed to move Boxes",
                intent: Intent.DANGER,
            });
            return;
        }

        store.dispatch(
            editBox(props.id, {
                position: item.position,
            }),
        );
        store.dispatch(
            editBox(item.id, {
                position: props.position,
            }),
        );

        return {};
    },
    hover(props, monitor) {
        return { isHovering: monitor.isOver({ shallow: true }) };
    },
};

export type BoxProps = {
    pokemon: Pokemon[];
    connectDropTarget?: ConnectDropTarget;
    connectDragSource?: ConnectDragSource;
    connectDropTargetBox?: ConnectDropTarget;
    canDrop?: boolean;
    clearBox: clearBox;
    editBox: editBox;
    deletePokemon: deletePokemon;
    background?: string;
    deleteBox: deleteBox;
    updateBoxes: updateBoxes;
    searchTerm: string;
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
    } = props;

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const dispatch = useDispatch();

    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: "BOX",
        item: { id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: "POKEMON_ICON",
        drop: (item: PokemonIconProps, monitor) => {
            if (props.id == null || item.id == null) {
                showToast({
                    message: "Failed to move Pokémon",
                    intent: Intent.DANGER,
                });
                return;
            }
            dispatch(
                editPokemon(
                    {
                        // position: oldPosition,
                        status: props.name,
                    },
                    item.id,
                ),
            );
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

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
            ref={(node) => dragRef(dropRef(node))}
            style={{
                backgroundImage: getBoxBackground(),
                opacity: isDragging ? 0.5 : 1,
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
                        justifyContent: "space-around",
                        margin: ".25rem",
                        padding: ".25rem",
                        textAlign: "center",
                        minWidth: "5rem",
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    <Icon style={{ transform: "rotate(90deg)" }} icon="more" />
                    {name}
                </span>
            </Popover>
            <PokemonByFilter
                searchTerm={searchTerm}
                team={pokemon}
                status={name}
            />
        </div>
    );
};

// export class BoxBase extends React.PureComponent<BoxProps, BoxState> {
//     public state = {
//         deleteConfirmationOpen: false,
//     };

//     public componentDidMount() {
//         this.props.updateBoxes();
//     }

//     private clearBox = (name: string) => () => {
//         this.props.clearBox(name);
//     };

//     private deleteBox = (id: number) => () => {
//         this.setState({ deleteConfirmationOpen: true });
//     };

//     private editBox = (id: number, edits: Partial<BoxType>) => () => {
//         this.props.editBox(id, edits);
//     };

//     private toggleCollapse = (isCollapsed, id) => () => {
//         this.props.editBox(id, { collapsed: !isCollapsed });
//     };

//     private static getDefault(name) {
//         if (name === 'Team') return 'route-1';
//         if (name === 'Boxed') return 'grass-meadow';
//         if (name === 'Dead') return 'stars';
//         if (name === 'Champs') return 'sky';
//         return undefined;
//     }

//     private static getBoxBackground(background, name) {
//         const bg = background || BoxBase.getDefault(name);
//         return bg && bg.startsWith('http') ? `url(${bg})` : `url(./assets/img/box/${bg}.png)`;
//     }

//     private toggleDialog = () =>
//         this.setState({ deleteConfirmationOpen: !this.state.deleteConfirmationOpen });

//     public render() {
//         const {
//             pokemon,
//             inheritFrom,
//             name,
//             id,
//             connectDropTarget,
//             connectDragSource,
//             connectDropTargetBox,
//             canDrop,
//             background,
//             collapsed: isCollapsed,
//         } = this.props;

//         const collapsedStyle = isCollapsed
//             ? {
//                 height: '54px',
//                 overflow: 'hidden',
//                 WebkitMaskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.33) 25%, black 75%)',
//                 marginBottom: '-18px',
//             }
//             : {};

//         return connectDropTargetBox!(connectDragSource!(connectDropTarget!(
//             <div
//                 style={{
//                     backgroundImage: BoxBase.getBoxBackground(background, name),
//                     //cursor: 'grab',
//                     ...collapsedStyle,
//                 }}
//                 className={`box ${name.replace(/\s/g, '-')}-box`}>
//                 <Alert
//                     icon="trash"
//                     isOpen={this.state.deleteConfirmationOpen}
//                     onCancel={this.toggleDialog}
//                     onConfirm={(e) => {
//                         this.props.deleteBox(id);

//                         pokemon
//                             .filter((pokemon) => pokemon.status === name)
//                             .forEach((element) => {
//                                 this.props.deletePokemon(element.id);
//                             });

//                         this.setState({ deleteConfirmationOpen: true });
//                     }}
//                     confirmButtonText="Delete Box"
//                     cancelButtonText="Cancel"
//                     intent={Intent.DANGER}>
//                     <p>
//                         This will delete the currently selected Box and all Pokémon stored inside
//                         the box. Are you sure you want to do that?
//                     </p>
//                 </Alert>
//                 <Popover
//                     position={Position.BOTTOM_LEFT}
//                     minimal
//                     interactionKind={PopoverInteractionKind.CLICK_TARGET_ONLY}
//                     popoverClassName={'no-list-item-types'}
//                     content={
//                         <>
//                             {/*<MenuItem className='bp3-fill' text='Edit' />*/}
//                             <MenuItem text="Change Wallpaper">
//                                 {wallpapers.map((wall) => (
//                                     <MenuItem
//                                         key={wall.name}
//                                         onClick={this.editBox(id, { background: wall.background })}
//                                         text={wall.name}
//                                     />
//                                 ))}
//                             </MenuItem>
//                             {!['Team', 'Boxed', 'Dead', 'Champs'].includes(name) && (
//                                 <MenuItem text="Change Type">
//                                     {['Team', 'Boxed', 'Dead', 'Champs'].map((b) => (
//                                         <MenuItem
//                                             key={b}
//                                             onClick={this.editBox(id, { inheritFrom: b })}
//                                             text={
//                                                 b === inheritFrom ? (
//                                                     <>
//                                                         <Icon icon="small-tick" /> {b}
//                                                     </>
//                                                 ) : (
//                                                     b
//                                                 )
//                                             }
//                                         />
//                                     ))}
//                                 </MenuItem>
//                             )}
//                             <MenuItem
//                                 onClick={this.toggleCollapse(isCollapsed, id)}
//                                 text={isCollapsed ? 'Expand Box' : 'Collapse Box'}
//                             />
//                             <MenuItem
//                                 onClick={this.clearBox(name)}
//                                 className={Classes.FILL}
//                                 text={'Clear Box'}
//                             />
//                             {!['Team', 'Boxed', 'Dead', 'Champs'].includes(name) && (
//                                 <MenuItem
//                                     onClick={this.deleteBox(id)}
//                                     className={Classes.FILL}
//                                     text={'Delete Box'}
//                                 />
//                             )}
//                         </>
//                     }>
//                     <span
//                         style={{
//                             alignItems: 'center',
//                             background: canDrop ? 'black' : 'rgba(33, 33, 33, 0.33)',
//                             borderRadius: '.25rem',
//                             color: '#eee',
//                             display: 'inline-flex',
//                             minHeight: '2rem',
//                             justifyContent: 'space-around',
//                             margin: '.25rem',
//                             padding: '.25rem',
//                             textAlign: 'center',
//                             minWidth: '5rem',
//                             cursor: 'pointer',
//                             userSelect: 'none',
//                         }}>
//                         <Icon style={{ transform: 'rotate(90deg)' }} icon="more" />
//                         {name}
//                     </span>
//                 </Popover>
//                 <PokemonByFilter searchTerm={this.props.searchTerm} team={pokemon} status={name} />
//             </div>,
//         )));
//     }
// }

// export const Box = connect(null, {
//     clearBox,
//     editBox,
//     deleteBox,
//     deletePokemon,
//     updateBoxes,
// })(BoxBase);
