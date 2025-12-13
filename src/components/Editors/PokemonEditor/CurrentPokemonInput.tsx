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
} from "utils";
import { editPokemon } from "actions";

import { ErrorBoundary } from "components/Common/Shared";

import { TagInput, TextArea, HTMLSelect } from "components/Common/ui";
import { State } from "state";
import { Pokemon } from "models";
import { cx } from "emotion";
import { useDebounceCallback } from "@react-hook/debounce";
import { useMemo } from "react";
import { Swords } from "lucide-react";

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
    value: any;
    placeholder?: string;
    transform?: (v: any) => string;
    disabled?: boolean;
    options?: string[] | { key: string; value: string | null }[];
    pokemon?: Pokemon;
    usesKeyValue?: boolean;
    className?: string;
    items?: string[];
    key: string;
}
interface ChangeArgs {
    inputName: CurrentPokemonInputProps["inputName"];
    position?: number;
    value?: any;
    pokemon?: Pokemon;
    edit: { [x: string]: any };
}

const createEdit = ({ inputName, value, pokemon, edit }: ChangeArgs) => {
    if (inputName === "species") {
        return {
            ...edit,
            types: matchSpeciesToTypes(edit["species"]),
        };
    } else if (inputName === "nature" && pokemon?.species === "Toxtricity") {
        return {
            ...edit,
            forme: matchNatureToToxtricityForme(value),
        };
    } else if (inputName === "forme") {
        return {
            ...edit,
            types:
                pokemon &&
                matchSpeciesToTypes(pokemon?.species as Species, value),
        };
    }

    return edit;
};

export type InputTypesFromState = Partial<
    Pick<State, "selectedId" | "customMoveMap" | "customTypes">
>;
export type InputTypesFromActions = {};
export type InputTypesFromInternalState = {
    setEdit: React.Dispatch<
        React.SetStateAction<{
            [x: string]: any;
        }>
    >;
    edit: { [x: string]: any };
    onChange: (event: React.ChangeEvent<HTMLElement>) => void;
};
export type PokemonInputProps = CurrentPokemonInputProps &
    InputTypesFromState &
    InputTypesFromInternalState;

export const renderItems = (visibleItems, setSelectedItem, selectedItem) =>
    visibleItems.map((v, i) => {
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
    _onChange,
    setEdit,
    items,
}: PokemonInputProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [visibleItems, setVisibleItems] = React.useState(items);
    const [selectedItem, setSelectedItem] = React.useState();
    const handleKeyDown = () => {};
    const _updateItems = () => {};
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
                value={edit[inputName]}
                disabled={disabled}
                onInput={(e) => setEdit({ [inputName]: e.currentTarget.value })}
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
    _value,
    placeholder,
    disabled,
    _selectedId,
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
            value={edit[inputName]}
            placeholder={placeholder}
            disabled={disabled}
            className={
                disabled ? "opacity-50 cursor-not-allowed text-muted-foreground" : ""
            }
        />
    );
}

export function PokemonTextAreaInput({
    inputName,
    _type,
    _value,
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
            value={edit[inputName]}
            placeholder={placeholder}
            disabled={disabled}
            style={{ width: "100%" }}
            fill
            className={
                disabled
                    ? "opacity-50 cursor-not-allowed text-muted-foreground"
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
            value={edit[inputName]}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
}

export function PokemonSelectInput({
    inputName,
    value,
    _type,
    usesKeyValue,
    options,
    _placeholder,
    onChange,
    _edit,
    setEdit,
}: PokemonInputProps) {
    const _pokeball =
        inputName === "pokeball" && value && value !== "None" ? (
            <img
                style={{ position: "absolute" }}
                alt={value}
                src={`/icons/pokeball/${formatBallText(value)}.png`}
            />
        ) : null;

    const formattedOptions = usesKeyValue
        ? (options as { key: string; value: string | null }[])?.map((item) => ({
              label: item.key,
              value: item.value ?? "",
          }))
        : (options as string[])?.map((item) => ({
              label: item,
              value: item,
          }));

    return (
        <HTMLSelect
            style={inputName === "status" ? { width: "120px" } : {}}
            onChange={(e) => {
                onChange(e);
                setEdit({ [inputName]: e.currentTarget.value });
            }}
            value={value}
            name={inputName}
            options={formattedOptions}
        />
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
    if (!Array.isArray(edit[inputName])) {
        throw new Error("Could not read input as Array");
    }

    const onSelect = React.useMemo(
        () => (position: number) => (e) => {
            onChange(e);
            const newEdit = [...edit[inputName]];
            newEdit[position] = e.currentTarget.value;
            setEdit({ [inputName]: newEdit });
        },
        [inputName, edit],
    );

    const formattedOptions = (options as string[])?.map((item) => ({
        label: item,
        value: item,
    }));

    return (
        <span className="double-select-wrapper">
            <HTMLSelect
                onChange={onSelect(0)}
                value={edit?.[inputName]?.[0]}
                name={inputName}
                options={formattedOptions}
            />
            <span>&nbsp;</span>
            <HTMLSelect
                onChange={onSelect(1)}
                value={edit?.[inputName]?.[1]}
                name={inputName}
                options={formattedOptions}
            />
        </span>
    );
}

export function PokemonCheckboxInput({
    inputName,
    _value,
    type,
    _usesKeyValue,
    _options,
    _placeholder,
    onChange,
    edit,
    setEdit,
}: PokemonInputProps) {
    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                onChange={(e) => {
                    onChange(e);
                    setEdit({ [inputName]: e.currentTarget.checked });
                }}
                checked={edit[inputName]}
                type={type}
                name={inputName}
                className="w-4 h-4 border border-border rounded bg-input"
            />
        </label>
    );
}

export function PokemonMoveInput({
    _inputName,
    value,
    _type,
    _usesKeyValue,
    _options,
    _placeholder,
    _onChange,
    _edit,
    _setEdit,
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
            <div className="flex items-center gap-2">
                <Swords size={14} className="text-muted-foreground" />
                <TagInput
                    values={value || []}
                    onChange={(values) => {
                        const edit = {
                            moves: values,
                        };
                        if (selectedId) {
                            dispatch(editPokemon(edit, selectedId));
                        }
                    }}
                    className="flex-1"
                />
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
            {getInput({
                ...props,
                selectedId,
                onChange,
                setEdit,
                edit,
                customMoveMap,
            })}
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
