import * as React from "react";
import { State } from "state";
import { ChromePicker } from "react-color";
import { Popover } from "./Popover";

export const rgbaOrHex = (o: any) =>
    (o.rgb && o.rgb.a && o.rgb.a !== 1
        ? `rgba(${o.rgb.r}, ${o.rgb.g}, ${o.rgb.b}, ${o.rgb.a})`
        : o.hex) || o;

export interface ColorInputProps {
    value?: any;
    onChange: (e?: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    style?: State["style"];
    width?: string;
    onColorChange: (color: any) => void;
}

export function ColorInput({
    value,
    onChange,
    name,
    onColorChange,
}: ColorInputProps) {
    return (
        <div className="flex flex-col">
            <Popover
                interactionKind="click"
                content={
                    <ChromePicker
                        color={value}
                        onChangeComplete={onColorChange}
                    />
                }
            >
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        name={name}
                        value={rgbaOrHex(value)}
                        onChange={onChange}
                        className="w-36 rounded border-none px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div
                        className="h-5 w-5 ml-2 rounded-full border"
                        style={{
                            background: value,
                        }}
                    />
                </div>
            </Popover>
        </div>
    );
}
