import * as React from "react";
import { Popover } from "./Popover";

export type ColorFormat = "hex" | "hexa" | "rgb" | "rgba" | "hsl" | "hsla" | "oklch";

interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface HSLA {
    h: number;
    s: number;
    l: number;
    a: number;
}

interface OKLCH {
    l: number;
    c: number;
    h: number;
    a: number;
}

function parseColor(color: string): RGBA {
    if (!color) return { r: 0, g: 0, b: 0, a: 1 };

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { r: 0, g: 0, b: 0, a: 1 };

    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);

    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
}

function rgbaToHsla({ r, g, b, a }: RGBA): HSLA {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
        a,
    };
}

function hslaToRgba({ h, s, l, a }: HSLA): RGBA {
    h /= 360;
    s /= 100;
    l /= 100;

    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a,
    };
}

function rgbaToOklch({ r, g, b, a }: RGBA): OKLCH {
    r /= 255;
    g /= 255;
    b /= 255;

    const toLinear = (c: number) =>
        c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);

    const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

    const l__ = Math.cbrt(l_);
    const m__ = Math.cbrt(m_);
    const s__ = Math.cbrt(s_);

    const L = 0.2104542553 * l__ + 0.793617785 * m__ - 0.0040720468 * s__;
    const A = 1.9779984951 * l__ - 2.428592205 * m__ + 0.4505937099 * s__;
    const B = 0.0259040371 * l__ + 0.7827717662 * m__ - 0.808675766 * s__;

    const C = Math.sqrt(A * A + B * B);
    let H = (Math.atan2(B, A) * 180) / Math.PI;
    if (H < 0) H += 360;

    return {
        l: Math.round(L * 100) / 100,
        c: Math.round(C * 1000) / 1000,
        h: Math.round(H * 10) / 10,
        a,
    };
}

function formatColor(rgba: RGBA, format: ColorFormat): string {
    const { r, g, b, a } = rgba;

    switch (format) {
        case "hex":
            return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        case "hexa":
            return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
        case "rgb":
            return `rgb(${r}, ${g}, ${b})`;
        case "rgba":
            return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
        case "hsl": {
            const { h, s, l } = rgbaToHsla(rgba);
            return `hsl(${h}, ${s}%, ${l}%)`;
        }
        case "hsla": {
            const { h, s, l } = rgbaToHsla(rgba);
            return `hsla(${h}, ${s}%, ${l}%, ${a.toFixed(2)})`;
        }
        case "oklch": {
            const oklch = rgbaToOklch(rgba);
            return `oklch(${oklch.l} ${oklch.c} ${oklch.h} / ${a.toFixed(2)})`;
        }
        default:
            return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    }
}

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    gradient?: string;
}

const Slider = ({ label, value, min, max, step = 1, onChange, gradient }: SliderProps) => (
    <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 w-6">{label}</span>
        <div className="relative flex-1 h-3">
            {gradient && (
                <div
                    className="absolute inset-0 rounded"
                    style={{ background: gradient }}
                />
            )}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-400 rounded-full shadow pointer-events-none"
                style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 6px)` }}
            />
        </div>
        <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || min)}
            className="w-14 text-xs px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center"
        />
    </div>
);

export interface ModernColorPickerProps {
    value?: string;
    onChange: (value: string) => void;
    name: string;
    defaultFormat?: ColorFormat;
}

export function ModernColorPicker({
    value = "#000000",
    onChange,
    name,
    defaultFormat = "rgba",
}: ModernColorPickerProps) {
    const [rgba, setRgba] = React.useState<RGBA>(() => parseColor(value));
    const [format, setFormat] = React.useState<ColorFormat>(defaultFormat);
    const [inputValue, setInputValue] = React.useState(value);

    React.useEffect(() => {
        const parsed = parseColor(value);
        if (parsed.r !== rgba.r || parsed.g !== rgba.g || parsed.b !== rgba.b || parsed.a !== rgba.a) {
            setRgba(parsed);
            setInputValue(value);
        }
    }, [value]);

    const updateColor = React.useCallback(
        (newRgba: RGBA) => {
            setRgba(newRgba);
            const formatted = formatColor(newRgba, format);
            setInputValue(formatted);
            onChange(formatted);
        },
        [format, onChange]
    );

    const hsla = React.useMemo(() => rgbaToHsla(rgba), [rgba]);

    const handleHueChange = (h: number) => {
        const newRgba = hslaToRgba({ ...hsla, h });
        updateColor({ ...newRgba, a: rgba.a });
    };

    const handleSaturationChange = (s: number) => {
        const newRgba = hslaToRgba({ ...hsla, s });
        updateColor({ ...newRgba, a: rgba.a });
    };

    const handleLightnessChange = (l: number) => {
        const newRgba = hslaToRgba({ ...hsla, l });
        updateColor({ ...newRgba, a: rgba.a });
    };

    const handleAlphaChange = (a: number) => {
        updateColor({ ...rgba, a });
    };

    const handleRgbChange = (channel: "r" | "g" | "b", val: number) => {
        updateColor({ ...rgba, [channel]: Math.max(0, Math.min(255, val)) });
    };

    const handleFormatChange = (newFormat: ColorFormat) => {
        setFormat(newFormat);
        const formatted = formatColor(rgba, newFormat);
        setInputValue(formatted);
        onChange(formatted);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        const parsed = parseColor(val);
        if (parsed.r !== 0 || parsed.g !== 0 || parsed.b !== 0 || val.startsWith("#") || val.startsWith("rgb") || val.startsWith("hsl") || val.startsWith("oklch")) {
            setRgba(parsed);
            onChange(val);
        }
    };

    const hueGradient = "linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))";
    const satGradient = `linear-gradient(to right, hsl(${hsla.h}, 0%, ${hsla.l}%), hsl(${hsla.h}, 100%, ${hsla.l}%))`;
    const lightGradient = `linear-gradient(to right, hsl(${hsla.h}, ${hsla.s}%, 0%), hsl(${hsla.h}, ${hsla.s}%, 50%), hsl(${hsla.h}, ${hsla.s}%, 100%))`;
    const alphaGradient = `linear-gradient(to right, transparent, rgb(${rgba.r}, ${rgba.g}, ${rgba.b}))`;

    const colorFormats: { value: ColorFormat; label: string }[] = [
        { value: "hex", label: "HEX" },
        { value: "hexa", label: "HEXA" },
        { value: "rgb", label: "RGB" },
        { value: "rgba", label: "RGBA" },
        { value: "hsl", label: "HSL" },
        { value: "hsla", label: "HSLA" },
        { value: "oklch", label: "OKLCH" },
    ];

    const pickerContent = (
        <div className="p-3 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 space-y-3">
            <div
                className="w-full h-20 rounded border border-gray-200 dark:border-gray-700"
                style={{
                    background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, hsl(${hsla.h}, 100%, 50%))`,
                }}
            >
                <div
                    className="w-4 h-4 border-2 border-white rounded-full shadow cursor-pointer"
                    style={{
                        marginLeft: `calc(${hsla.s}% - 8px)`,
                        marginTop: `calc(${100 - hsla.l}% - 8px)`,
                        background: formatColor(rgba, "rgb"),
                    }}
                />
            </div>

            <div className="space-y-2">
                <Slider
                    label="H"
                    value={hsla.h}
                    min={0}
                    max={360}
                    onChange={handleHueChange}
                    gradient={hueGradient}
                />
                <Slider
                    label="S"
                    value={hsla.s}
                    min={0}
                    max={100}
                    onChange={handleSaturationChange}
                    gradient={satGradient}
                />
                <Slider
                    label="L"
                    value={hsla.l}
                    min={0}
                    max={100}
                    onChange={handleLightnessChange}
                    gradient={lightGradient}
                />
                <Slider
                    label="A"
                    value={rgba.a}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={handleAlphaChange}
                    gradient={alphaGradient}
                />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">RGB</div>
                <div className="flex gap-2">
                    {(["r", "g", "b"] as const).map((channel) => (
                        <div key={channel} className="flex-1">
                            <input
                                type="number"
                                min={0}
                                max={255}
                                value={rgba[channel]}
                                onChange={(e) => handleRgbChange(channel, parseInt(e.target.value) || 0)}
                                className="w-full text-xs px-1 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center"
                            />
                            <div className="text-center text-xs text-gray-400 uppercase">{channel}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Output Format</div>
                <div className="flex flex-wrap gap-1">
                    {colorFormats.map(({ value: fmt, label }) => (
                        <button
                            key={fmt}
                            type="button"
                            onClick={() => handleFormatChange(fmt)}
                            className={`px-2 py-0.5 text-xs rounded transition-colors ${
                                format === fmt
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-gray-200 dark:border-gray-700">
                <div
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                    style={{
                        background: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                        backgroundSize: "8px 8px",
                        backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                    }}
                >
                    <div
                        className="w-full h-full rounded"
                        style={{ background: formatColor(rgba, "rgba") }}
                    />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="flex-1 text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-mono"
                />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col">
            <Popover interactionKind="click" content={pickerContent}>
                <div className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="text"
                        name={name}
                        value={inputValue}
                        onChange={handleInputChange}
                        className="w-40 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                    <div
                        className="h-6 w-6 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                        style={{
                            background: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                            backgroundSize: "6px 6px",
                            backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px",
                        }}
                    >
                        <div
                            className="w-full h-full rounded"
                            style={{ background: formatColor(rgba, "rgba") }}
                        />
                    </div>
                </div>
            </Popover>
        </div>
    );
}

