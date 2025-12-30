import * as React from "react";
import { Omit } from "ramda";
import { debounce } from "utils/debounce";
import { Input, Label } from "components/ui";

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

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        delayedValue(e);
    };

    return (
        <div className="flex flex-col py-1">
            <Label>{label}</Label>
            {element ? (
                element({
                    label,
                    name,
                    placeholder,
                    onEdit,
                    /*onInput,*/ value: innerValue,
                })
            ) : (
                <Input
                    type="text"
                    value={innerValue}
                    onChange={onChange}
                    placeholder={placeholder}
                    name={name}
                    small
                />
            )}
        </div>
    );
}
