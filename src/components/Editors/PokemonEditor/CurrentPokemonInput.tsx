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

import { TagInput, Classes, TextArea, HTMLSelect } from "components/ui/shims";
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
    rightElement?: React.ReactNode;
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

export function PokemonAutocompleteInput({
    className,
    placeholder,
    inputName,
    edit,
    disabled,
    setEdit,
    items,
    onChange,
}: PokemonInputProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [visibleItems, setVisibleItems] = React.useState<string[]>(items ?? []);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const listRef = React.useRef<HTMLUListElement>(null);
    const closeTimeoutRef = React.useRef<number | undefined>(undefined);

    const currentValue = edit[inputName] ?? "";

    React.useEffect(() => {
        setVisibleItems(
            items?.filter((item) =>
                item.toLowerCase().includes(currentValue.toLowerCase())
            ) ?? []
        );
    }, [items, currentValue]);

    const selectItem = (value: string) => {
        if (closeTimeoutRef.current) {
            window.clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = undefined;
        }
        setEdit({ [inputName]: value });
        onChange?.({} as React.ChangeEvent<HTMLElement>);
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const openList = () => {
        if (closeTimeoutRef.current) {
            window.clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = undefined;
        }
        setIsOpen(true);
        setSelectedIndex(-1);
    };

    const closeList = () => {
        if (closeTimeoutRef.current) {
            window.clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = window.setTimeout(() => {
            setIsOpen(false);
            setSelectedIndex(-1);
            closeTimeoutRef.current = undefined;
        }, 200);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!visibleItems.length) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < visibleItems.length - 1 ? prev + 1 : prev
                );
                setIsOpen(true);
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                setIsOpen(true);
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && visibleItems[selectedIndex]) {
                    selectItem(visibleItems[selectedIndex]);
                }
                break;
            case "Escape":
            case "Tab":
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    React.useEffect(() => {
        if (selectedIndex < 0 || !listRef.current) return;
        const selectedNode = listRef.current.children[selectedIndex] as HTMLElement | undefined;
        selectedNode?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    return (
        <div className="autocomplete relative flex-1">
            <input
                autoComplete="off"
                className={cx(className, "w-full")}
                onKeyDown={handleKeyDown}
                onFocus={openList}
                onBlur={closeList}
                placeholder={placeholder}
                name={inputName}
                type="text"
                value={currentValue}
                disabled={disabled}
                onChange={(e) => {
                    setEdit({ [inputName]: e.currentTarget.value });
                    setVisibleItems(
                        items?.filter((item) =>
                            item.toLowerCase().includes(e.currentTarget.value.toLowerCase())
                        ) ?? []
                    );
                    setSelectedIndex(-1);
                    setIsOpen(true);
                }}
            />
            {isOpen && visibleItems.length > 0 && (
                <ul
                    ref={listRef}
                    className="autocomplete-items has-nice-scrollbars"
                >
                    {visibleItems.map((item, i) => (
                        <li
                            key={i}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                selectItem(item);
                            }}
                            className={i === selectedIndex ? "autocomplete-selected" : ""}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
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
    usesKeyValue,
    options,
    onChange,
    setEdit,
}: PokemonInputProps) {
    const normalizedValue =
        inputName === "pokeball" ? normalizePokeballName(value) : value;

    const _pokeball =
        inputName === "pokeball" &&
        normalizedValue &&
        normalizedValue !== "None" ? (
            <img
                style={{ position: "absolute" }}
                alt={normalizedValue}
                src={`icons/pokeball/${formatBallText(normalizedValue)}.png`}
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
            value={normalizedValue}
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
        <span className="flex">
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
    type,
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
            className={`inline-flex flex-col p-1 ${props.type === "autocomplete" ? "autocomplete" : ""} ${className || ""} [&_label]:text-[10px] [&_input]:border [&_input]:border-gray-200 [&_input]:p-1 dark:[&_input]:bg-[rgba(16,22,26,0.3)] dark:[&_input]:border-none dark:[&_input]:text-gray-100 dark:[&_input]:shadow-[inset_0_0_0_1px_rgba(16,22,26,0.3),inset_0_1px_1px_rgba(16,22,26,0.4)]`}
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
