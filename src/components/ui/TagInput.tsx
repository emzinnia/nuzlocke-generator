import * as React from "react";
import { X } from "lucide-react";
import { Icon, type IconName } from "./Icon";
import { Intent, intentToBgClass } from "./intent";

export interface TagProps {
    /** Tag content */
    children: React.ReactNode;
    /** Tag icon */
    icon?: IconName | string;
    /** Removable callback */
    onRemove?: () => void;
    /** Intent color */
    intent?: Intent;
    /** Large size */
    large?: boolean;
    /** Round style */
    round?: boolean;
    /** Interactive (clickable) */
    interactive?: boolean;
    /** Minimal style */
    minimal?: boolean;
    /** Additional className */
    className?: string;
    /** Click handler */
    onClick?: () => void;
    /** Inline styles */
    style?: React.CSSProperties;
}

/**
 * Tag component for displaying labels/chips.
 */
export const Tag: React.FC<TagProps> = ({
    children,
    icon,
    onRemove,
    intent = Intent.NONE,
    large = false,
    round = false,
    interactive = false,
    minimal = false,
    className = "",
    onClick,
    style,
}) => {
    const sizeClass = large ? "h-7 px-3 text-sm" : "h-5 px-2 text-xs";
    const roundClass = round ? "rounded-full" : "rounded";

    const bgClasses = minimal
        ? "bg-transparent border border-border"
        : intent === Intent.NONE
          ? "bg-slate-200 dark:bg-slate-700"
          : intentToBgClass[intent];

    return (
        <span
            className={`inline-flex items-center gap-1 font-medium transition-colors ${sizeClass} ${roundClass} ${bgClasses} ${interactive ? "cursor-pointer hover:opacity-80" : ""} ${className}`}
            onClick={onClick}
            style={style}
        >
            {icon && <Icon icon={icon} size={large ? 14 : 12} />}
            <span>{children}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                >
                    <X size={large ? 14 : 12} />
                </button>
            )}
        </span>
    );
};

export interface TagInputProps {
    /** Current tag values */
    values: string[];
    /** Change handler */
    onChange?: (values: string[]) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Left icon */
    leftIcon?: IconName | string;
    /** Whether input is disabled */
    disabled?: boolean;
    /** Fill available width */
    fill?: boolean;
    /** Tag intent */
    tagIntent?: Intent;
    /** Large size */
    large?: boolean;
    /** Additional className */
    className?: string;
    /** Input props */
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    /** Separator characters (default: comma, enter) */
    separator?: string | RegExp;
}

/**
 * TagInput component for multi-value input.
 */
export const TagInput: React.FC<TagInputProps> = ({
    values,
    onChange,
    placeholder = "Add tags...",
    leftIcon,
    disabled = false,
    fill = false,
    tagIntent = Intent.NONE,
    large = false,
    className = "",
    inputProps = {},
    separator = /[,\n]/,
}) => {
    const [inputValue, setInputValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !values.includes(trimmed)) {
            onChange?.([...values, trimmed]);
        }
        setInputValue("");
    };

    const removeTag = (index: number) => {
        const newValues = values.filter((_, i) => i !== index);
        onChange?.(newValues);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && values.length > 0) {
            removeTag(values.length - 1);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (typeof separator === "string" ? val.includes(separator) : separator.test(val)) {
            const parts = val.split(separator);
            parts.forEach((part) => addTag(part));
        } else {
            setInputValue(val);
        }
    };

    const sizeClass = large ? "min-h-[44px] py-1.5" : "min-h-[36px] py-1";

    return (
        <div
            className={`flex flex-wrap items-center gap-1.5 rounded border border-border bg-input px-2 transition-colors focus-within:border-primary-500 ${sizeClass} ${fill ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
            onClick={() => inputRef.current?.focus()}
        >
            {leftIcon && <Icon icon={leftIcon} size={16} className="text-fg-tertiary" />}
            {values.map((value, index) => (
                <Tag
                    key={`${value}-${index}`}
                    intent={tagIntent}
                    onRemove={disabled ? undefined : () => removeTag(index)}
                    large={large}
                >
                    {value}
                </Tag>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={values.length === 0 ? placeholder : ""}
                disabled={disabled}
                className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-fg-tertiary disabled:cursor-not-allowed"
                {...inputProps}
            />
        </div>
    );
};

export default TagInput;

