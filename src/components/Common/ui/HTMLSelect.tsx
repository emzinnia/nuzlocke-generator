import React from "react";

export interface HTMLSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options?: readonly { value: string; label: string }[] | readonly string[];
    fill?: boolean;
}

export const HTMLSelect: React.FC<HTMLSelectProps> = ({
    options,
    fill = false,
    className = "",
    children,
    ...props
}) => {
    return (
        <select
            {...props}
            className={`px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
                fill ? "w-full" : ""
            } ${className}`}
        >
            {options
                ? options.map((option) => {
                      const value = typeof option === "string" ? option : option.value;
                      const label = typeof option === "string" ? option : option.label;
                      return (
                          <option key={value} value={value}>
                              {label}
                          </option>
                      );
                  })
                : children}
        </select>
    );
};

