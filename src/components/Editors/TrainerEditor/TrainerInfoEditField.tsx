import * as React from "react";
import { Omit } from "ramda";
import { debounce } from "utils/debounce";

export interface TrainerInfoEditFieldProps {
    label: React.ReactElement<any> | string;
    name: string;
    placeholder: string;
    onEdit?: any;
    onInput?: any;
    value?: string;
    element?: (inputProps: Omit<TrainerInfoEditFieldProps, "element">) => any;
}

export function TrainerInfoEditField({
    label,
    name,
    placeholder,
    onEdit,
    // onInput,
    value,
    element,
}: TrainerInfoEditFieldProps) {
    const [innerValue, setValue] = React.useState<string | undefined>("");

    const delayedValue = React.useCallback(
        debounce((e) => onEdit(e), 300),
        [value],
    );

    React.useEffect(() => {
        setValue(value);
    }, [value]);

    const onChange = (e) => {
        e.persist();
        setValue(e.target.value);
        delayedValue(e);
    };

    return (
        <div className="flex items-center justify-between border-b border-gray-300 dark:border-slate-600">
            <label>{label}</label>
            {element ? (
                element({
                    label,
                    name,
                    placeholder,
                    onEdit,
                    /*onInput,*/ value: innerValue,
                })
            ) : (
                <input
                    type="text"
                    value={innerValue}
                    onChange={onChange}
                    placeholder={placeholder}
                    name={name}
                    className="bg-inherit border-0 border-l border-gray-200 dark:border-slate-600 rounded-sm text-inherit p-1"
                />
            )}
        </div>
    );
}
