import * as React from "react";
import * as Styles from "components/Editors/StyleEditor/styles";
import { cx } from "emotion";
import { connect } from "react-redux";
import { classWithDarkTheme } from "utils";
import { State } from "state";
import { ChromePicker } from "react-color";
import { Popover, PopoverInteractionKind, Classes } from "@blueprintjs/core";

type RgbColor = {
    r: number;
    g: number;
    b: number;
    a?: number;
};

export type ColorValue =
    | string
    | RgbColor
    | {
          hex: string;
          rgb: RgbColor;
      };

export const rgbaOrHex = (o: ColorValue): string => {
    if (typeof o === "string") {
        return o;
    }

    if ("rgb" in o) {
        return o.rgb.a && o.rgb.a !== 1
            ? `rgba(${o.rgb.r}, ${o.rgb.g}, ${o.rgb.b}, ${o.rgb.a})`
            : o.hex;
    }

    return `rgba(${o.r}, ${o.g}, ${o.b}, ${o.a ?? 1})`;
};

export interface ColorEditProps {
    value?: ColorValue;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    style?: State["style"];
    width?: string;
    onColorChange: (color: ColorValue) => void;
}

export class ColorEditBase extends React.Component<
    ColorEditProps,
    { showChromePicker: boolean }
> {
    public state = {
        showChromePicker: false,
    };

    public render() {
        const {
            value,
            onChange,
            name,
            style,
            width: _width,
            onColorChange,
        } = this.props;
        return (
            <div className={cx(Styles.colorEditWrapper)}>
                {/*<input
                    name={name}
                    onChange={onChange}
                    className={cx(Styles.colorInput)}
                    type='color'
                    value={value}
                />*/}
                <Popover
                    interactionKind={PopoverInteractionKind.CLICK}
                    content={
                        <ChromePicker
                            color={value}
                            onChangeComplete={(color) => {
                                onColorChange(color);
                            }}
                        />
                    }
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                            style={{ border: "none" }}
                            onChange={onChange}
                            type="text"
                            className={cx(
                                Classes.INPUT,
                                classWithDarkTheme(
                                    Styles,
                                    "colorTextInput",
                                    style?.editorDarkMode,
                                ),
                            )}
                            name={name}
                            value={rgbaOrHex(value ?? "")}
                            onFocus={(_e) =>
                                this.setState({ showChromePicker: true })
                            }
                            onBlur={(_e) =>
                                this.setState({ showChromePicker: false })
                            }
                        />
                        <div
                            style={{
                                height: "1rem",
                                width: "1rem",
                                marginLeft: ".5rem",
                                background: rgbaOrHex(value ?? ""),
                                borderRadius: "50%",
                            }}
                        />
                    </div>
                </Popover>
            </div>
        );
    }
}

export const ColorEdit = connect(
    (state: State) => ({ style: state.style }),
    null,
)(ColorEditBase);
