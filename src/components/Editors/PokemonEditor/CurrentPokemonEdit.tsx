import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    EvolutionTree,
    feature,
    Forme,
    Game,
    getAdditionalFormes,
    getGameGeneration,
    getListOfTypes,
    listOfAbilities,
    listOfItems,
    listOfLocations,
    listOfNatures,
    listOfPokeballs,
    listOfPokemon,
    matchSpeciesToTypes,
    Species,
} from "utils";
import { Pokemon, Editor } from "models";
import { Boxes } from "models";
import { CurrentPokemonInput } from "./CurrentPokemonInput";
import { DeletePokemonButton } from "components/Pokemon/DeletePokemonButton/DeletePokemonButton";
import { Autocomplete, ErrorBoundary } from "components/Common/Shared";
import { selectPokemon, editPokemon } from "actions";
import { connect } from "react-redux";
import { listOfGames, accentedE } from "utils";
import { cx } from "emotion";
import * as Styles from "./styles";
import { v4 as uuid } from "uuid";
import {
    Classes,
    Popover,
    Position,
    PopoverInteractionKind,
    Button,
    Intent,
    ButtonGroup,
    Tooltip,
} from "components/ui/shims";
import { Icon } from "components/ui";
import { addPokemon } from "actions";
import { State } from "state";
import { CurrentPokemonLayoutItem } from "./CurrentPokemonLayoutItem";
import { MoveEditor } from "components/Editors/MoveEditor/MoveEditor";
import { PokemonIconPlain } from "components/Pokemon/PokemonIcon/PokemonIcon";
import { CheckpointsInputList } from "components/Editors/TrainerEditor/BadgeInput";
import { getImages, Image } from "components/Common/Shared/ImagesDrawer";
import { DexieImagePickerPopover } from "components/Common/Shared/DexieImagePickerPopover";
import { normalizePokeballName } from "utils";

const pokeball = "./assets/pokeball.png";

export interface CopyPokemonButtonProps {
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export const CopyPokemonButton: React.FunctionComponent<
    CopyPokemonButtonProps
> = ({ onClick }: CopyPokemonButtonProps) => {
    return (
        <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.TOP}
            content={
                <div
                    style={{ padding: "1rem" }}
                >{`Copy Pok${accentedE}mon`}</div>
            }
        >
            <Icon
                title="Copy Pokemon"
                icon="duplicate"
                className={cx(Styles.copyButton)}
                onClick={onClick}
            />
        </Popover>
    );
};

export interface CurrentPokemonEditProps {
    selectedId: Pokemon["id"];
    box: Boxes;
    pokemon: Pokemon[];
    selectPokemon: selectPokemon;
    editPokemon: editPokemon;
    addPokemon: addPokemon;
    game: { name: Game; customName: string };
    editor: Editor;
    customTypes: State["customTypes"];
    customAreas: State["customAreas"];
}

const getEvos = (species): string[] | undefined => {
    return EvolutionTree?.[species];
};

export function EvolutionSelection({ currentPokemon, onEvolve }) {
    const evos = getEvos(currentPokemon?.species);

    if (!evos?.length) {
        return null;
    }

    if (evos?.length === 1) {
        const species = evos?.[0];
        return (
            <Button
                onClick={onEvolve(species)}
                className={Classes.MINIMAL}
                intent={Intent.PRIMARY}
            >
                Evolve
            </Button>
        );
    } else {
        return (
            <Popover
                popoverClassName={"no-list-item-types"}
                minimal
                position={Position.BOTTOM_LEFT}
                interactionKind={PopoverInteractionKind.CLICK_TARGET_ONLY}
                content={
                    <>
                        {evos.map((evo) => (
                            <div
                                role="button"
                                tabIndex={-2}
                                className={Styles.evoMenuItem}
                                key={evo}
                                onClick={onEvolve(evo)}
                                onKeyPress={onEvolve(evo)}
                            >
                                {evo}
                            </div>
                        ))}
                    </>
                }
            >
                <Button className={Classes.MINIMAL} intent={Intent.PRIMARY}>
                    Evolve
                </Button>
            </Popover>
        );
    }
}

export const CurrentPokemonEditBase: React.FC<CurrentPokemonEditProps> = ({
    selectedId: propsSelectedId,
    box,
    pokemon,
    selectPokemon,
    editPokemon,
    addPokemon,
    game,
    customTypes,
    customAreas,
}) => {
    const [selectedId, setSelectedId] = useState<string>(propsSelectedId ?? "5");
    const [expandedView, setExpandedView] = useState(false);
    const [isMoveEditorOpen, setIsMoveEditorOpen] = useState(false);
    const [images, setImages] = useState<Image[]>([]);

    // Sync selectedId from props when it changes
    useEffect(() => {
        if (propsSelectedId !== undefined) {
            setSelectedId(propsSelectedId);
        }
    }, [propsSelectedId]);

    // Fetch images and auto-select first Pokemon if none selected
    useEffect(() => {
        getImages().then((res) => setImages(res));

        if (!propsSelectedId && pokemon?.length) {
            const firstId = pokemon[0]?.id;
            if (firstId) {
                selectPokemon(firstId);
                setSelectedId(firstId);
            }
        }
    }, []);

    const currentPokemon = useMemo(
        () => pokemon.find((v: Pokemon) => v.id === selectedId),
        [pokemon, selectedId],
    );

    const copyPokemon = useCallback(() => {
        if (currentPokemon) {
            const newPokemon = {
                ...currentPokemon,
                id: uuid(),
                position: currentPokemon.position! + 1,
            };
            addPokemon(newPokemon);
        }
    }, [currentPokemon, addPokemon]);

    const expandView = useCallback(() => {
        setExpandedView((prev) => !prev);
    }, []);

    const evolvePokemon = useCallback(
        (species: Species) => () => {
            const edit = {
                species,
                types: matchSpeciesToTypes(
                    species,
                    (currentPokemon?.forme || "Normal") as keyof typeof Forme,
                ),
            };
            editPokemon(edit, selectedId);
        },
        [currentPokemon?.forme, editPokemon, selectedId],
    );

    const levelPokemon = useCallback(
        (levelUp?: boolean) => () => {
            // @ts-expect-error data from level can sometimes be a string... whoops
            const level = Number.parseInt(currentPokemon?.level ?? "0");
            const edit = {
                level: (level ?? 0) + (levelUp ? 1 : -1),
            };
            editPokemon(edit, selectedId);
        },
        [currentPokemon?.level, editPokemon, selectedId],
    );

    const toggleDialog = useCallback(() => {
        setIsMoveEditorOpen((prev) => !prev);
    }, []);

    const getTypes = useCallback(
        (includeShadow = true) => {
            return getListOfTypes(customTypes).filter((type) =>
                includeShadow ? true : type !== "Shadow",
            );
        },
        [customTypes],
    );

    const imageNames = useMemo(
        () => images?.map((img) => img.name ?? "") ?? [],
        [images],
    );

    const pokemonForLink = useMemo(
        () =>
            pokemon.map((p) => ({
                key: `${p.nickname} (${p.species})`,
                value: p.id,
            })),
        [pokemon],
    );

    const renderMoreInputs = (currentPokemon: Pokemon) => {
        return (
            <div className="expanded-edit">
                <CurrentPokemonInput
                    labelName="Forme"
                    inputName="forme"
                    placeholder=""
                    value={currentPokemon.forme}
                    type="select"
                    options={[
                        "Normal",
                        ...getAdditionalFormes(currentPokemon.species),
                    ]}
                    pokemon={currentPokemon}
                    key={selectedId + "forme"}
                />
                <CurrentPokemonInput
                    labelName="Types"
                    inputName="types"
                    value={currentPokemon.types}
                    type="double-select"
                    options={getTypes()}
                    key={selectedId + "types"}
                />
                <span
                    className={
                        'current-pokemon-input-wrapper current-pokemon-checklist current-pokemon-checkpoints'
                    }>
                    <label htmlFor="checkpointsInputList">Checkpoints</label>
                    <CheckpointsInputList
                        checkpointsObtained={currentPokemon.checkpoints ?? []}
                        onChange={(checkpoints) => editPokemon({ checkpoints }, currentPokemon.id)}
                        buttonText="Award Checkpoints"
                    />
                </span>
                <CurrentPokemonLayoutItem checkboxes>
                    <CurrentPokemonInput
                        labelName="Shiny"
                        inputName="shiny"
                        value={currentPokemon.shiny}
                        type="checkbox"
                        key={selectedId + "shiny"}
                    />
                    <CurrentPokemonInput
                        labelName="Egg"
                        inputName="egg"
                        value={currentPokemon.egg}
                        type="checkbox"
                        key={selectedId + "egg"}
                    />
                    <CurrentPokemonInput
                        labelName="Hidden"
                        inputName="hidden"
                        value={currentPokemon.hidden}
                        type="checkbox"
                        key={selectedId + "hidden"}
                    />
                    <CurrentPokemonInput
                        labelName="MVP"
                        inputName="mvp"
                        value={currentPokemon.mvp}
                        type="checkbox"
                        key={selectedId + "mvp"}
                    />
                    <CurrentPokemonInput
                        labelName="Gift"
                        inputName="gift"
                        value={currentPokemon?.gift}
                        type="checkbox"
                        key={selectedId + "gift"}
                    />
                    <CurrentPokemonInput
                        labelName="Alpha"
                        inputName="alpha"
                        value={currentPokemon?.alpha}
                        type="checkbox"
                        key={selectedId + "alpha"}
                    />
                </CurrentPokemonLayoutItem>
                {feature.imageUploads ? (
                    <Autocomplete
                        items={imageNames}
                        name="customImage"
                        label="Custom Image"
                        placeholder="http://..."
                        value={currentPokemon.customImage || ""}
                        onChange={(e) => {
                            const edit = {
                                customImage: e.target.value,
                            };
                            editPokemon(edit, selectedId);
                        }}
                        rightElement={
                            <DexieImagePickerPopover
                                selectedName={currentPokemon.customImage || ""}
                                onSelect={(name) =>
                                    editPokemon(
                                        { customImage: name },
                                        selectedId,
                                    )
                                }
                            />
                        }
                        key={selectedId + "customimage"}
                    />
                ) : (
                    <CurrentPokemonInput
                        labelName="Custom Image"
                        inputName="customImage"
                        placeholder="http://..."
                        value={currentPokemon.customImage}
                        type="text"
                        rightElement={
                            <DexieImagePickerPopover
                                selectedName={currentPokemon.customImage || ""}
                                onSelect={(name) =>
                                    editPokemon(
                                        { customImage: name },
                                        selectedId,
                                    )
                                }
                            />
                        }
                        key={selectedId + "customImage"}
                    />
                )}
                <CurrentPokemonInput
                    labelName="Custom Icon"
                    inputName="customIcon"
                    placeholder="http://..."
                    value={currentPokemon.customIcon}
                    type="text"
                    rightElement={
                        <DexieImagePickerPopover
                            selectedName={currentPokemon.customIcon || ""}
                            onSelect={(name) =>
                                editPokemon(
                                    { customIcon: name },
                                    selectedId,
                                )
                            }
                        />
                    }
                    key={selectedId + "customIcon"}
                />
                <CurrentPokemonInput
                    labelName="Cause of Death"
                    inputName="causeOfDeath"
                    value={currentPokemon.causeOfDeath}
                    type="text"
                    key={selectedId + "cod"}
                />
                <Autocomplete
                    items={listOfItems}
                    name="item"
                    label="Item"
                    placeholder="Item"
                    value={currentPokemon.item || ""}
                    onChange={(e) => {
                        const edit = {
                            item: e.target.value,
                        };
                        editPokemon(edit, selectedId);
                        selectPokemon(selectedId);
                    }}
                    key={selectedId + "item"}
                />
                <CurrentPokemonInput
                    labelName="Custom Item Image"
                    inputName="customItemImage"
                    placeholder="http://.."
                    value={currentPokemon.customItemImage}
                    type="text"
                    rightElement={
                        <DexieImagePickerPopover
                            selectedName={currentPokemon.customItemImage || ""}
                            onSelect={(name) =>
                                editPokemon(
                                    { customItemImage: name },
                                    selectedId,
                                )
                            }
                        />
                    }
                    key={selectedId + "customItemImage"}
                />
                <CurrentPokemonInput
                    labelName="Poké Ball"
                    inputName="pokeball"
                    value={normalizePokeballName(currentPokemon.pokeball)}
                    type="select"
                    options={[
                        "None",
                        ...listOfPokeballs.map(
                            (ball) =>
                                `${ball.charAt(0).toUpperCase() + ball.slice(1, ball.length)} Ball`,
                        ),
                    ]}
                    key={selectedId + "ball"}
                />
                <CurrentPokemonLayoutItem>
                    <CurrentPokemonInput
                        labelName="Wonder Traded"
                        inputName="wonderTradedFor"
                        value={currentPokemon.wonderTradedFor}
                        type="text"
                        key={selectedId + "wt"}
                    />
                    <CurrentPokemonInput
                        labelName="Position"
                        inputName="position"
                        value={currentPokemon.position}
                        type="number"
                        key={selectedId + "position"}
                    />
                    <CurrentPokemonInput
                        labelName="Game of Origin"
                        inputName="gameOfOrigin"
                        value={currentPokemon.gameOfOrigin}
                        type="select"
                        options={listOfGames}
                        key={selectedId + "goo"}
                    />
                    <CurrentPokemonInput
                        labelName="Tera Type"
                        inputName="teraType"
                        value={currentPokemon.teraType}
                        type="select"
                        options={getTypes(false)}
                        key={selectedId + "teraType"}
                    />
                </CurrentPokemonLayoutItem>
                <CurrentPokemonLayoutItem>
                    <CurrentPokemonInput
                        labelName="Link To..."
                        inputName="linkedTo"
                        value={currentPokemon?.linkedTo}
                        type="select"
                        options={[
                            {
                                key: "None",
                                value: null,
                            },
                            ...pokemonForLink,
                        ]}
                        usesKeyValue={true}
                        key={selectedId + "linked"}
                    />
                </CurrentPokemonLayoutItem>
                <CurrentPokemonLayoutItem>
                    <CurrentPokemonInput
                        labelName="Notes"
                        inputName="notes"
                        value={currentPokemon.notes}
                        type="textArea"
                        key={selectedId + "notes"}
                    />
                    {/* <PokemonNotes /> */}
                </CurrentPokemonLayoutItem>
                <CurrentPokemonLayoutItem fullWidth>
                    {currentPokemon.extraData && (
                        <CurrentPokemonInput
                            labelName="Extra Data"
                            inputName="extraData"
                            type="textArea"
                            disabled
                            className="full-width"
                            value={JSON.stringify(currentPokemon.extraData)}
                            key={selectedId + "extradata"}
                        />
                    )}
                </CurrentPokemonLayoutItem>
            </div>
        );
    };

    if (currentPokemon == null) {
        return (
            <div className="border border-gray-300 dark:border-gray-700 rounded m-1 p-1 flex items-center p-2">
                <img alt="pokeball" src={pokeball} />{" "}
                <p className="m-1 pl-1">Select a Pok&eacute;mon to edit</p>
            </div>
        );
    }

    return (
        <div className="border border-gray-300 dark:border-gray-700 rounded m-1 p-1">
            <span className="flex items-center justify-start">
                <PokemonIconPlain
                    className="p-0.5 border border-gray-300 dark:border-none dark:bg-slate-600 rounded-sm ml-1 h-10"
                    id={currentPokemon.id}
                    species={currentPokemon.species}
                    forme={currentPokemon.forme}
                    shiny={currentPokemon.shiny}
                    gender={currentPokemon.gender}
                    customIcon={currentPokemon.customIcon}
                    egg={currentPokemon.egg}
                    selectedId={null}
                    onClick={() => { }}
                    imageStyle={{
                        maxHeight: "100%",
                        height: "32px",
                    }}
                />
                <CurrentPokemonInput
                    labelName="Status"
                    inputName="status"
                    value={currentPokemon.status}
                    type="select"
                    options={box.map((n) => n.name)}
                    key={selectedId + "status"}
                />

                <div className={cx(Styles.iconBar)}>
                    <Tooltip content="Level Up/Down">
                        <ButtonGroup>
                            <Button
                                onClick={levelPokemon(false)}
                                small
                            >
                                -1
                            </Button>
                            <Button onClick={levelPokemon(true)} small>
                                +1
                            </Button>
                        </ButtonGroup>
                    </Tooltip>

                    <EvolutionSelection
                        currentPokemon={currentPokemon}
                        onEvolve={evolvePokemon}
                    />
                    <CopyPokemonButton onClick={copyPokemon} />
                    <DeletePokemonButton id={selectedId} />
                </div>
            </span>
            <CurrentPokemonLayoutItem>
                <ErrorBoundary>
                    {/*<CurrentPokemonInput
                        inputName="species"
                        labelName="Species"
                        disabled={currentPokemon.egg}
                        placeholder="Missing No."
                        value={currentPokemon.species}
                        type='autocomplete'
                        items={(listOfPokemon as unknown) as string[]}
                    />*/}
                    <Autocomplete
                        items={listOfPokemon as unknown as string[]}
                        name="species"
                        label="Species"
                        disabled={currentPokemon.egg}
                        makeInvisibleText={currentPokemon.egg}
                        placeholder="Missing No."
                        value={currentPokemon.species}
                        onChange={(e) => {
                            const edit = {
                                species: e.target.value,
                            };
                            editPokemon(edit, selectedId);
                            editPokemon(
                                {
                                    types: matchSpeciesToTypes(
                                        e.target.value as Species,
                                        // @TODO: tighten type
                                        currentPokemon.forme as any,
                                        getGameGeneration(game.name as Game),
                                    ),
                                },
                                selectedId,
                            );
                            selectPokemon(selectedId);
                        }}
                    />
                </ErrorBoundary>
                <CurrentPokemonInput
                    labelName="Nickname"
                    inputName="nickname"
                    value={currentPokemon.nickname}
                    placeholder="Fluffy"
                    type="text"
                    key={selectedId + "nickname"}
                />
            </CurrentPokemonLayoutItem>
            <CurrentPokemonLayoutItem>
                <CurrentPokemonInput
                    labelName="Level"
                    inputName="level"
                    placeholder="5"
                    value={currentPokemon.level}
                    type="number"
                    key={selectedId + "level"}
                />
                <Autocomplete
                    items={[...listOfLocations, ...customAreas]}
                    name="met"
                    label="Met Location"
                    placeholder="Pallet Town"
                    value={currentPokemon.met || ""}
                    onChange={(e) => {
                        if (!e?.target?.value) {
                            return;
                        }
                        const edit = {
                            met: e.target.value,
                        };
                        editPokemon(edit, selectedId);
                        selectPokemon(selectedId);
                    }}
                />
                <CurrentPokemonInput
                    labelName="Met Level"
                    inputName="metLevel"
                    placeholder="5"
                    value={currentPokemon.metLevel}
                    type="number"
                    key={selectedId + "metlevel"}
                />
            </CurrentPokemonLayoutItem>
            <CurrentPokemonLayoutItem>
                <CurrentPokemonInput
                    labelName="Gender"
                    inputName="gender"
                    placeholder=""
                    value={currentPokemon.gender}
                    type="select"
                    options={["Neutral", "Male", "Female"]}
                    key={selectedId + "gender"}
                />
                <CurrentPokemonInput
                    labelName="Nature"
                    inputName="nature"
                    placeholder="Sassy"
                    value={currentPokemon.nature}
                    type="select"
                    options={listOfNatures}
                    pokemon={currentPokemon}
                    key={selectedId + "nature"}
                />
                <Autocomplete
                    items={listOfAbilities}
                    name="ability"
                    label="Ability"
                    placeholder=""
                    value={currentPokemon.ability || ""}
                    onChange={(e) => {
                        const edit = {
                            ability: e.target.value,
                        };
                        editPokemon(edit, selectedId);
                        selectPokemon(selectedId);
                    }}
                    key={selectedId + "ability"}
                />
            </CurrentPokemonLayoutItem>
            <CurrentPokemonLayoutItem className={Styles.moveInputWrapper}>
                <CurrentPokemonInput
                    labelName="Moves"
                    inputName="moves"
                    placeholder=""
                    value={currentPokemon.moves}
                    type="moves"
                    key={selectedId + "moves"}
                />
                <Button
                    className={Styles.moveEditButton}
                    intent={Intent.PRIMARY}
                    onClick={toggleDialog}
                    minimal
                >
                    Edit Moves
                </Button>
            </CurrentPokemonLayoutItem>
            <MoveEditor
                isOpen={isMoveEditorOpen}
                toggleDialog={toggleDialog}
            />
            {expandedView ? renderMoreInputs(currentPokemon) : null}
            <br />
            <Button
                onClick={expandView}
                data-expandedview={expandedView.toString()}
                intent={Intent.PRIMARY}
                className={cx(Classes.FILL, "current-pokemon-more")}
                icon={
                    expandedView
                        ? "symbol-triangle-up"
                        : "symbol-triangle-down"
                }
            >
                {expandedView ? "Less" : "More"}
            </Button>
        </div>
    );
};

export const CurrentPokemonEdit = connect(
    (state: Pick<State, keyof State>) => ({
        box: state.box,
        selectedId: state.selectedId,
        pokemon: state.pokemon,
        game: state.game,
        editor: state.editor,
        customTypes: state.customTypes,
        customAreas: state.customAreas,
    }),
    {
        selectPokemon,
        editPokemon,
        addPokemon,
    },
)(CurrentPokemonEditBase);
