import * as React from "react";
import { debounce } from "utils/debounce";

export interface TrainerInfoEditFieldProps {
    label: React.ReactNode;
    name: string;
    placeholder: string;
    onEdit?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
    value?: string;
    element?: (
        inputProps: Omit<TrainerInfoEditFieldProps, "element">,
    ) => React.ReactNode;
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
        debounce((e: React.ChangeEvent<HTMLInputElement>) => onEdit?.(e), 300),
        [value],
    );

    React.useEffect(() => {
        setValue(value);
    }, [value]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.persist();
        setValue(e.target.value);
        delayedValue(e);
    };

    return (
        <div className="trainer-info-field">
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
                />
            )}
        </div>
    );
}
