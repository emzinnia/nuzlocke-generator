import React, { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    separator?: string | RegExp;
}

export const TagInput: React.FC<TagInputProps> = ({
    values,
    onChange,
    placeholder = "Add tags...",
    disabled = false,
    className = "",
    separator = /[,\n]/,
}) => {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !values.includes(trimmed)) {
            onChange([...values, trimmed]);
        }
        setInputValue("");
    };

    const removeTag = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && values.length > 0) {
            removeTag(values.length - 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        const newTags = pastedText.split(separator).map((t) => t.trim()).filter(Boolean);
        const uniqueNewTags = newTags.filter((t) => !values.includes(t));
        if (uniqueNewTags.length > 0) {
            onChange([...values, ...uniqueNewTags]);
        }
    };

    return (
        <div
            onClick={() => inputRef.current?.focus()}
            className={`flex flex-wrap gap-1.5 p-2 min-h-[42px] border border-border bg-input rounded-md focus-within:ring-2 focus-within:ring-ring cursor-text ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${className}`}
        >
            {values.map((tag, index) => (
                <span
                    key={`${tag}-${index}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-sm bg-primary/10 text-primary rounded-md"
                >
                    {tag}
                    {!disabled && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(index);
                            }}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                            <X size={12} />
                        </button>
                    )}
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={() => inputValue && addTag(inputValue)}
                placeholder={values.length === 0 ? placeholder : ""}
                disabled={disabled}
                className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm text-foreground placeholder-muted-foreground"
            />
        </div>
    );
};

