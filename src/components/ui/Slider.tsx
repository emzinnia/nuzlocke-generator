/**
 * Slider Component
 *
 * A slider/range component built with native HTML and React.
 * Provides Blueprint-compatible API.
 */

import * as React from "react";

export interface SliderProps {
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Step size */
    stepSize?: number;
    /** Current value */
    value?: number;
    /** Change handler */
    onChange?: (value: number) => void;
    /** Release handler */
    onRelease?: (value: number) => void;
    /** Whether the slider is disabled */
    disabled?: boolean;
    /** Whether to show the label */
    labelRenderer?: boolean | ((value: number) => React.ReactNode);
    /** Whether to show label on change only */
    showTrackFill?: boolean;
    /** Whether the slider is vertical */
    vertical?: boolean;
    /** Intent for styling */
    intent?: "none" | "primary" | "success" | "warning" | "danger";
    /** Additional class name */
    className?: string;
}

export const Slider: React.FC<SliderProps> = ({
    min = 0,
    max = 100,
    stepSize = 1,
    value = 0,
    onChange,
    onRelease,
    disabled = false,
    labelRenderer = true,
    showTrackFill = true,
    vertical = false,
    intent = "primary",
    className = "",
}) => {
    const [internalValue, setInternalValue] = React.useState(value);
    const currentValue = value !== undefined ? value : internalValue;

    const percentage = ((currentValue - min) / (max - min)) * 100;

    const intentColors = {
        none: "bg-gray-500",
        primary: "bg-blue-500",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value);
        setInternalValue(newValue);
        onChange?.(newValue);
    };

    const handleMouseUp = () => {
        onRelease?.(currentValue);
    };

    const renderLabel = () => {
        if (!labelRenderer) return null;
        if (typeof labelRenderer === "function") {
            return labelRenderer(currentValue);
        }
        return currentValue;
    };

    return (
        <div
            className={`relative ${vertical ? "h-full w-8" : "w-full"} ${disabled ? "opacity-50" : ""} ${className}`}
        >
            <div className="relative flex items-center">
                {/* Track */}
                <div
                    className={`relative ${vertical ? "h-full w-1" : "h-1 w-full"} rounded-full bg-gray-200 dark:bg-gray-700`}
                >
                    {/* Fill */}
                    {showTrackFill && (
                        <div
                            className={`absolute rounded-full ${intentColors[intent]} ${
                                vertical ? "bottom-0 left-0 right-0" : "left-0 top-0 bottom-0"
                            }`}
                            style={vertical ? { height: `${percentage}%` } : { width: `${percentage}%` }}
                        />
                    )}
                </div>

                {/* Native range input (invisible, handles interaction) */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={stepSize}
                    value={currentValue}
                    onChange={handleChange}
                    onMouseUp={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                    disabled={disabled}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={currentValue}
                    aria-orientation={vertical ? "vertical" : "horizontal"}
                    className={`absolute inset-0 cursor-pointer appearance-none bg-transparent opacity-0 ${
                        vertical ? "h-full w-full" : "h-full w-full"
                    } ${disabled ? "cursor-not-allowed" : ""}`}
                    style={vertical ? { writingMode: "vertical-lr", direction: "rtl" } : {}}
                />

                {/* Thumb (visual only) */}
                <div
                    className={`absolute h-4 w-4 rounded-full border-2 border-white shadow ${intentColors[intent]} ${
                        disabled ? "" : "hover:scale-110"
                    } transition-transform`}
                    style={
                        vertical
                            ? { bottom: `calc(${percentage}% - 8px)`, left: "50%", transform: "translateX(-50%)" }
                            : { left: `calc(${percentage}% - 8px)`, top: "50%", transform: "translateY(-50%)" }
                    }
                />
            </div>

            {/* Label */}
            {labelRenderer && (
                <div
                    className="absolute text-xs text-gray-600 dark:text-gray-400"
                    style={
                        vertical
                            ? { bottom: `calc(${percentage}% - 8px)`, left: "100%", marginLeft: "8px" }
                            : { left: `calc(${percentage}% - 8px)`, top: "100%", marginTop: "8px" }
                    }
                >
                    {renderLabel()}
                </div>
            )}
        </div>
    );
};

export default Slider;
