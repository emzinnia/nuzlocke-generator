import React from "react";

interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    className?: string;
    showValue?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    className = "",
    showValue = false,
}) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative flex-1">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:bg-primary
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:shadow-md"
                    style={{
                        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--tw-gradient-from, #e5e7eb) ${percentage}%, var(--tw-gradient-from, #e5e7eb) 100%)`,
                    }}
                />
            </div>
            {showValue && (
                <span className="text-sm text-muted-foreground min-w-[3ch] text-right">
                    {value}
                </span>
            )}
        </div>
    );
};

