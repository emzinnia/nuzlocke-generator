import React from "react";
import { classNames } from "./classNames";

interface RadioProps {
    label: string;
    value: string;
    disabled?: boolean;
}

interface RadioGroupProps {
    label?: string;
    selectedValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children: React.ReactNode;
    className?: string;
    inline?: boolean;
}

export const Radio: React.FC<RadioProps & { 
    name?: string; 
    checked?: boolean; 
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
    label,
    value,
    disabled = false,
    name,
    checked,
    onChange,
}) => {
    return (
        <label
            className={classNames(
                "inline-flex items-center gap-2 cursor-pointer text-sm",
                { "opacity-50 cursor-not-allowed": disabled }
            )}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
        </label>
    );
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    selectedValue,
    onChange,
    children,
    className = "",
    inline = false,
}) => {
    const name = React.useId();

    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement<RadioProps>(child) && child.type === Radio) {
            return React.cloneElement(child, {
                name,
                checked: child.props.value === selectedValue,
                onChange,
            } as any);
        }
        return child;
    });

    return (
        <div className={classNames("space-y-1", className)}>
            {label && (
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {label}
                </label>
            )}
            <div
                className={classNames(
                    { "flex flex-row gap-4": inline },
                    { "flex flex-col gap-1": !inline }
                )}
            >
                {childrenWithProps}
            </div>
        </div>
    );
};

