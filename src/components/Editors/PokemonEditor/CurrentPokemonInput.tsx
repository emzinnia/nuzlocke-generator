import * as React from "react";
import { useSelector, useDispatch } from "store/reactZustand";

import {
    matchSpeciesToTypes,
    getMoveType,
    formatBallText,
    typeToColor,
    getContrastColor,
    matchNatureToToxtricityForme,
    Species,
    normalizePokeballName,
    movesByType,
} from "utils";
import { editPokemon } from "actions";

import { ErrorBoundary } from "components/Common/Shared";

import { TagInput, Classes, TextArea, HTMLSelect } from "@blueprintjs/core";
import { State } from "state";
import { Pokemon } from "models";
import { cx } from "emotion";
import { useDebounceCallback } from "@react-hook/debounce";
import { useMemo } from "react";

const MAX_MOVE_SUGGESTIONS = 8;

const normalizeMoveName = (move: string) => move.trim().toLowerCase();

const getKnownMoves = (customMoveMap: State["customMoveMap"] = []) => {
    const moves = [
        ...Object.values(movesByType).flat(),
        ...customMoveMap.map(({ move }) => move),
    ].filter((move): move is string => Boolean(move?.trim()));

    const uniqueMoves = new Map<string, string>();
    moves.forEach((move) => {
        const normalizedMove = normalizeMoveName(move);
        if (!uniqueMoves.has(normalizedMove)) {
            uniqueMoves.set(normalizedMove, move);
        }
    });

    return Array.from(uniqueMoves.values()).sort((a, b) => a.localeCompare(b));
};

const findKnownMove = (moves: string[], move: string) =>
    moves.find((knownMove) => normalizeMoveName(knownMove) === normalizeMoveName(move));

type PokemonInputValue =
    | Pokemon[keyof Pokemon]
    | string
    | number
    | boolean
    | null
    | undefined;
type PokemonEditDraft = Partial<Pokemon> & Record<string, PokemonInputValue>;
type SelectOption = string | { key: string; value: string | null };

interface CurrentPokemonInputProps {
    labelName: string;
    inputName: string;
    type:
        | "number"
        | "text"
        | "select"
        | "checkbox"
        | "double-select"
        | "moves"
        | "textArea"
        | "autocomplete"
        | "rich-text";
    value: PokemonInputValue;
    placeholder?: string;
    transform?: (v: PokemonInputValue) => string;
    disabled?: boolean;
    options?: SelectOption[];
    pokemon?: Pokemon;
    usesKeyValue?: boolean;
    className?: string;
    items?: string[];
    rightElement?: React.ReactNode;
    key: string;
}
interface ChangeArgs {
    inputName: CurrentPokemonInputProps["inputName"];
    position?: number;
    value?: PokemonInputValue;
    pokemon?: Pokemon;
    edit: PokemonEditDraft;
}

const createEdit = ({ inputName, value, pokemon, edit }: ChangeArgs) => {
    if (inputName === "species") {
        const species = edit["species"];
        return {
            ...edit,
            types:
                typeof species === "string"
                    ? matchSpeciesToTypes(species as Species)
                    : pokemon?.types,
        };
    } else if (inputName === "nature" && pokemon?.species === "Toxtricity") {
        return {
            ...edit,
            forme:
                typeof value === "string"
                    ? matchNatureToToxtricityForme(
                          value as Parameters<
                              typeof matchNatureToToxtricityForme
                          >[0],
                      )
                    : pokemon.forme,
        };
    } else if (inputName === "forme") {
        return {
            ...edit,
            types:
                pokemon && typeof value === "string"
                    ? matchSpeciesToTypes(
                          pokemon.species as Species,
                          value as Parameters<typeof matchSpeciesToTypes>[1],
                      )
                    : pokemon?.types,
        };
    }

    return edit;
};

export type InputTypesFromState = Partial<
    Pick<State, "selectedId" | "customMoveMap" | "customTypes">
>;
export type InputTypesFromActions = Record<string, never>;
export type InputTypesFromInternalState = {
    setEdit: React.Dispatch<React.SetStateAction<PokemonEditDraft>>;
    edit: PokemonEditDraft;
    onChange: (event: React.ChangeEvent<HTMLElement>) => void;
};
export type PokemonInputProps = CurrentPokemonInputProps &
    InputTypesFromState &
    InputTypesFromInternalState;

export const renderItems = (
    visibleItems: string[] | undefined,
    setSelectedItem: React.Dispatch<React.SetStateAction<string | undefined>>,
    selectedItem: string | undefined,
) =>
    visibleItems?.map((v, i) => {
        return (
            <li
                key={i}
                onClick={(_e) => setSelectedItem(v)}
                style={v === selectedItem ? { color: "lightblue" } : {}}
            >
                {v}
            </li>
        );
    });

export function PokemonAutocompleteInput({
    className,
    placeholder,
    inputName,
    edit,
    disabled,
    setEdit,
    items,
}: PokemonInputProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [visibleItems, setVisibleItems] = React.useState(items);
    const [selectedItem, setSelectedItem] = React.useState<string>();
    const handleKeyDown = () => {};
    const closeList = () => setIsOpen(false);
    const openList = () => setIsOpen(true);

    return (
        <>
            <input
                autoComplete="off"
                className={cx(className)}
                onKeyDown={handleKeyDown}
                onFocus={openList}
                onChange={closeList}
                placeholder={placeholder}
                name={inputName}
                type="text"
                value={String(edit[inputName] ?? "")}
                disabled={disabled}
                onInput={(e) => {
                    setEdit({ [inputName]: e.currentTarget.value });
                    setVisibleItems(
                        items?.filter((item) =>
                            item
                                .toLowerCase()
                                .includes(e.currentTarget.value.toLowerCase()),
                        ),
                    );
                }}
            />
            {isOpen ? (
                <ul className="autocomplete-items has-nice-scrollbars">
                    {renderItems(visibleItems, setSelectedItem, selectedItem)}
                </ul>
            ) : null}
        </>
    );
}

export function PokemonTextInput({
    inputName,
    type,
    placeholder,
    disabled,
    edit,
    setEdit,
    onChange,
}: PokemonInputProps) {
    return (
        <input
            onChange={onChange}
            onInput={(e) => setEdit({ [inputName]: e.currentTarget.value })}
            type={type}
            name={inputName}
            value={String(edit[inputName] ?? "")}
            placeholder={placeholder}
            disabled={disabled}
            className={
                disabled ? `${Classes.DISABLED} ${Classes.TEXT_MUTED}` : ""
            }
        />
    );
}

export function PokemonTextAreaInput({
    inputName,
    placeholder,
    disabled,
    onChange,
    setEdit,
    edit,
}: PokemonInputProps) {
    return (
        <TextArea
            onChange={onChange}
            onInput={(e) => setEdit({ [inputName]: e.currentTarget.value })}
            name={inputName}
            value={String(edit[inputName] ?? "")}
            placeholder={placeholder}
            disabled={disabled}
            style={{ width: "100%" }}
            className={
                disabled
                    ? `${Classes.DISABLED} ${Classes.TEXT_MUTED} ${Classes.FILL}`
                    : ""
            }
        />
    );
}

export function PokemonNumberInput({
    inputName,
    type,
    value,
    placeholder,
    disabled,
    onChange,
    setEdit,
    edit,
}: PokemonInputProps) {
    return (
        <input
            onChange={onChange}
            onInput={(e) => setEdit({ [inputName]: e.currentTarget.value })}
            type={type}
            name={inputName}
            value={String(edit[inputName] ?? "")}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
}

export function PokemonSelectInput({
    inputName,
    value,
    usesKeyValue,
    options,
    onChange,
    setEdit,
}: PokemonInputProps) {
    const normalizedValue =
        inputName === "pokeball" && typeof value === "string"
            ? normalizePokeballName(value)
            : value;
    const normalizedPokeball =
        typeof normalizedValue === "string" ? normalizedValue : undefined;

    const _pokeball =
        inputName === "pokeball" &&
        normalizedPokeball &&
        normalizedPokeball !== "None" ? (
            <img
                style={{ position: "absolute" }}
                alt={normalizedPokeball}
                src={`icons/pokeball/${formatBallText(normalizedPokeball)}.png`}
            />
        ) : null;

    return (
        <HTMLSelect
            style={inputName === "status" ? { width: "120px" } : {}}
            onChange={(e) => {
                onChange(e);
                setEdit({ [inputName]: e.currentTarget.value });
            }}
            value={String(normalizedValue ?? "")}
            name={inputName}
        >
            {!usesKeyValue
                ? options
                    ? options.map((item, index) => (
                          <option key={index}>
                              {typeof item === "string" ? item : item.key}
                          </option>
                      ))
                    : null
                : options?.map((item, index) =>
                      typeof item === "string" ? (
                          <option value={item} key={index}>
                              {item}
                          </option>
                      ) : (
                          <option value={item.value ?? undefined} key={index}>
                              {item.key}
                          </option>
                      ),
                  )}
        </HTMLSelect>
    );
}

export function PokemonDoubleSelectInput({
    inputName,
    value,
    type,
    usesKeyValue,
    options,
    placeholder,
    onChange,
    edit,
    setEdit,
}: PokemonInputProps) {
    // Ensure we have a valid array - fallback to default types if not
    const currentEditValue = edit[inputName];
    const editValueSource = Array.isArray(currentEditValue)
        ? currentEditValue
        : Array.isArray(value)
          ? value
          : ["Normal", "Normal"];
    const editValue = editValueSource.map(String);
    const renderOption = (item: SelectOption, index: number) => {
        const optionValue = typeof item === "string" ? item : item.value ?? item.key;
        const label = typeof item === "string" ? item : item.key;
        return (
            <option value={optionValue} key={index}>
                {label}
            </option>
        );
    };

    const onSelect = React.useMemo(
        () => (position: number) => (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange(e);
            const newEdit = [...editValue];
            newEdit[position] = e.currentTarget.value;
            setEdit({ [inputName]: newEdit });
        },
        [inputName, editValue],
    );

    return (
        <span className="double-select-wrapper">
            <HTMLSelect
                onChange={onSelect(0)}
                value={editValue[0]}
                name={inputName}
            >
                {options
                    ? options.map(renderOption)
                    : null}
            </HTMLSelect>
            <span>&nbsp;</span>
            <HTMLSelect
                onChange={onSelect(1)}
                value={editValue[1]}
                name={inputName}
            >
                {options
                    ? options.map(renderOption)
                    : null}
            </HTMLSelect>
        </span>
    );
}

export function PokemonCheckboxInput({
    inputName,
    type,
    onChange,
    edit,
    setEdit,
}: PokemonInputProps) {
    return (
        <label className={cx(Classes.CONTROL, Classes.CHECKBOX)}>
            <input
                onChange={(e) => {
                    onChange(e);
                    setEdit({ [inputName]: e.currentTarget.checked });
                }}
                checked={Boolean(edit[inputName])}
                type={type}
                name={inputName}
            />
            <span className={Classes.CONTROL_INDICATOR} />
        </label>
    );
}

export function PokemonMoveInput({
    value,
    customTypes,
    customMoveMap,
    selectedId,
}: PokemonInputProps) {
    const dispatch = useDispatch();
    const currentMoves = useMemo(
        () => (Array.isArray(value) ? value.map(String) : []),
        [value],
    );
    const knownMoves = useMemo(
        () => getKnownMoves(customMoveMap),
        [customMoveMap],
    );
    const [inputValue, setInputValue] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(0);
    const visibleSuggestions = useMemo(() => {
        const normalizedInput = normalizeMoveName(inputValue);
        const selectedMoves = new Set(currentMoves.map(normalizeMoveName));
        const filteredMoves = knownMoves.filter((move) => {
            const normalizedMove = normalizeMoveName(move);
            return (
                !selectedMoves.has(normalizedMove) &&
                (normalizedInput === "" || normalizedMove.includes(normalizedInput))
            );
        });

        return filteredMoves
            .sort((a, b) => {
                const normalizedA = normalizeMoveName(a);
                const normalizedB = normalizeMoveName(b);
                const aExact = normalizedA === normalizedInput;
                const bExact = normalizedB === normalizedInput;
                const aStartsWith = normalizedA.startsWith(normalizedInput);
                const bStartsWith = normalizedB.startsWith(normalizedInput);

                if (aExact !== bExact) {
                    return aExact ? -1 : 1;
                }
                if (aStartsWith !== bStartsWith) {
                    return aStartsWith ? -1 : 1;
                }

                return a.localeCompare(b);
            })
            .slice(0, MAX_MOVE_SUGGESTIONS);
    }, [currentMoves, inputValue, knownMoves]);
    const getCustomMoveType = useMemo(
        () => (v: string) =>
            customMoveMap?.find(
                (m) => normalizeMoveName(m?.move ?? "") === normalizeMoveName(v),
            )?.type,
        [customMoveMap],
    );
    const commitMoves = React.useCallback(
        (nextMoves: string[]) => {
            if (selectedId) {
                dispatch(editPokemon({ moves: nextMoves }, selectedId));
            }
        },
        [dispatch, selectedId],
    );
    const addMoveValues = React.useCallback(
        (values: string[], preferredMove?: string) => {
            const selectedSuggestion =
                preferredMove ??
                (values.length === 1 ? visibleSuggestions[activeSuggestionIndex] : undefined);
            const nextMoves = [...currentMoves];

            values.forEach((rawValue) => {
                const trimmedValue = rawValue.trim();
                if (!trimmedValue) {
                    return;
                }
                const move =
                    findKnownMove(knownMoves, trimmedValue) ??
                    selectedSuggestion ??
                    trimmedValue;
                const normalizedMove = normalizeMoveName(move);

                if (!nextMoves.some((existingMove) => normalizeMoveName(existingMove) === normalizedMove)) {
                    nextMoves.push(move);
                }
            });

            commitMoves(nextMoves);
            setInputValue("");
            setIsOpen(false);
            setActiveSuggestionIndex(0);

            return true;
        },
        [
            activeSuggestionIndex,
            commitMoves,
            currentMoves,
            knownMoves,
            visibleSuggestions,
        ],
    );
    const addMoves = React.useCallback(
        (values: string[]) => addMoveValues(values),
        [addMoveValues],
    );
    const removeMove = React.useCallback(
        (_move: React.ReactNode, index: number) => {
            commitMoves(currentMoves.filter((_, moveIndex) => moveIndex !== index));
        },
        [commitMoves, currentMoves],
    );
    const selectSuggestion = React.useCallback(
        (move: string) => {
            addMoveValues([move], move);
        },
        [addMoveValues],
    );

    React.useEffect(() => {
        setActiveSuggestionIndex(0);
    }, [inputValue]);

    return (
        <ErrorBoundary>
            <div className="autocomplete">
                <TagInput
                    addOnBlur
                    fill
                    inputProps={{
                        "aria-autocomplete": "list",
                        "aria-expanded": isOpen && visibleSuggestions.length > 0,
                        list: "pokemon-move-suggestions",
                    }}
                    inputValue={inputValue}
                    leftIcon="ninja"
                    onAdd={addMoves}
                    onInputChange={(event) => {
                        setInputValue(event.currentTarget.value);
                        setIsOpen(true);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            setIsOpen(false);
                            return;
                        }
                        if (!visibleSuggestions.length) {
                            return;
                        }
                        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                            event.preventDefault();
                            const direction = event.key === "ArrowDown" ? 1 : -1;
                            setIsOpen(true);
                            setActiveSuggestionIndex((index) =>
                                Math.min(
                                    Math.max(index + direction, 0),
                                    visibleSuggestions.length - 1,
                                ),
                            );
                        }
                    }}
                    onRemove={removeMove}
                    placeholder="Add a move"
                    tagProps={(v, _i) => {
                        // @TODO: Fix inconsistencies with bad parameter types
                        const move = v?.toString()?.trim() || "";
                        const customMoveType = getCustomMoveType(move) as
                            | Parameters<typeof typeToColor>[0]
                            | undefined;
                        const background =
                            typeToColor(
                                customMoveType || getMoveType(move),
                                customTypes,
                            ) || "transparent";
                        const color = getContrastColor(background);
                        return {
                            style: {
                                background,
                                color,
                            },
                        };
                    }}
                    values={currentMoves}
                />
                <datalist id="pokemon-move-suggestions">
                    {visibleSuggestions.map((move) => (
                        <option value={move} key={move} />
                    ))}
                </datalist>
                {isOpen && inputValue && visibleSuggestions.length ? (
                    <ul className="autocomplete-items has-nice-scrollbars" role="listbox">
                        {visibleSuggestions.map((move, index) => (
                            <li
                                aria-selected={index === activeSuggestionIndex}
                                className={
                                    index === activeSuggestionIndex
                                        ? "autocomplete-selected"
                                        : undefined
                                }
                                key={move}
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    selectSuggestion(move);
                                }}
                                role="option"
                            >
                                {move}
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </ErrorBoundary>
    );
}

export function CurrentPokemonInput(props: CurrentPokemonInputProps) {
    const { inputName, value, className } = props;
    const selectedId = useSelector<State, State["selectedId"]>(
        (state) => state.selectedId,
    );
    const customMoveMap = useSelector<State, State["customMoveMap"]>(
        (state) => state.customMoveMap,
    );
    const _customTypes = useSelector<State, State["customTypes"]>(
        (state) => state.customTypes,
    );
    const dispatch = useDispatch();

    const [edit, setEdit] = React.useState({ [inputName]: value });
    if (!selectedId) {
        return null;
    }
    const onChange = useDebounceCallback(
        () =>
            dispatch(
                editPokemon(
                    createEdit({
                        inputName,
                        value: edit[inputName],
                        edit,
                        pokemon: props.pokemon,
                    }),
                    selectedId,
                ),
            ),
        300,
    );
    React.useEffect(() => setEdit({ [inputName]: value }), [inputName, value]);

    return (
        <span
            className={`current-pokemon-input-wrapper current-pokemon-${props.type} ${props.type === "autocomplete" && "autocomplete"} current-pokemon-${props.inputName} ${className}`}
        >
            <label>{props.labelName}</label>
            {props.rightElement ? (
                <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {getInput({
                            ...props,
                            selectedId,
                            onChange,
                            setEdit,
                            edit,
                            customMoveMap,
                        })}
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                        {props.rightElement}
                    </span>
                </div>
            ) : (
                getInput({
                    ...props,
                    selectedId,
                    onChange,
                    setEdit,
                    edit,
                    customMoveMap,
                })
            )}
        </span>
    );
}

export function getInput(props: PokemonInputProps) {
    switch (props.type) {
        case "text":
            return <PokemonTextInput {...props} />;
        case "textArea":
            return <PokemonTextAreaInput {...props} />;
        case "select":
            return <PokemonSelectInput {...props} />;
        case "checkbox":
            return <PokemonCheckboxInput {...props} />;
        case "moves":
            return <PokemonMoveInput {...props} />;
        case "number":
            return <PokemonNumberInput {...props} />;
        case "double-select":
            return <PokemonDoubleSelectInput {...props} />;
        case "autocomplete":
            return <PokemonAutocompleteInput {...props} />;
        default:
            return "No input for this type exists.";
    }
}
