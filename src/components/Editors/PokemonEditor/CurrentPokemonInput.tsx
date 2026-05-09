import * as React from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    matchSpeciesToTypes,
    getMoveType,
    formatBallText,
    typeToColor,
    getContrastColor,
    matchNatureToToxtricityForme,
    Species,
    normalizePokeballName,
} from "utils";
import { editPokemon } from "actions";

import { ErrorBoundary } from "components/Common/Shared";

import { TagInput, Classes, TextArea, HTMLSelect } from "@blueprintjs/core";
import { State } from "state";
import { Pokemon } from "models";
import { cx } from "emotion";
import { useDebounceCallback } from "@react-hook/debounce";
import { useMemo } from "react";

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
    const moves = useMemo(
        () => (v: string) => customMoveMap?.find((m) => m?.move === v)?.type,
        [customMoveMap],
    );

    return (
        <ErrorBoundary>
            <TagInput
                fill
                leftIcon="ninja"
                tagProps={(v, _i) => {
                    // @TODO: Fix inconsitencies with bad parameter types
                    const background =
                        typeToColor(
                            // @ts-expect-error @TODO: fix mapping
                            moves(v) ||
                                getMoveType(v?.toString()?.trim() || ""),
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
                onChange={(values) => {
                    const edit = {
                        moves: values,
                    };
                    if (selectedId) {
                        dispatch(editPokemon(edit, selectedId));
                    }
                }}
                values={Array.isArray(value) ? value.map(String) : []}
            />
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
