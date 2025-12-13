import * as React from "react";
import { State } from "state";
import { getListOfTypes, typeToColor, Types, getContrastColor } from "utils";
import { createCustomType, deleteCustomType, editCustomType } from "actions";
import { ColorInput, Button } from "components/Common/ui";
import { Trash2 } from "lucide-react";

export interface TypesEditorProps {
    customTypes: State["customTypes"];
    createCustomType: createCustomType;
    deleteCustomType: deleteCustomType;
    editCustomType: editCustomType;
}

export interface TypesEditorState {
    type: string;
    color: string;
}

const rgbaOrHex = (color: any) => {
    if (color?.rgb?.a !== 1) {
        const { r, g, b, a } = color.rgb;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return color.hex;
};

export class TypesEditor extends React.Component<
    TypesEditorProps,
    TypesEditorState
> {
    public state = {
        type: "",
        color: "#ffffff",
    };

    public render() {
        const { customTypes, createCustomType, deleteCustomType } = this.props;
        return (
            <div className="types-editor">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                        onChange={(e) =>
                            this.setState({ type: e.target.value })
                        }
                        style={{ margin: "4px" }}
                        value={this.state.type}
                        className="px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        type="text"
                        placeholder="Type Name"
                    />
                    <ColorInput
                        onChange={(e) => {
                            if (e?.target.value) {
                                this.setState({ color: e.target.value });
                            }
                        }}
                        value={this.state.color}
                        name="color"
                        onColorChange={(color) =>
                            this.setState({ color: rgbaOrHex(color) })
                        }
                    />
                    <Button
                        style={{ margin: "4px" }}
                        onClick={() => createCustomType(this.state)}
                    >
                        Add Type
                    </Button>
                </div>
                {customTypes.map((ct) => (
                    <div
                        style={{ display: "flex", alignItems: "center" }}
                        key={ct.id}
                    >
                        <TypeBlock
                            color={ct.color}
                            customTypes={customTypes}
                            type={ct.type}
                        />
                        <Trash2
                            size={16}
                            className="text-red-500 cursor-pointer"
                            onClick={(_e) => deleteCustomType(ct.id)}
                        />
                    </div>
                ))}
                {getListOfTypes(customTypes).map((t, i) => (
                    <TypeBlock key={i} customTypes={customTypes} type={t} />
                ))}
            </div>
        );
    }
}

export function TypeBlock({
    type,
    customTypes,
    color,
}: {
    type: string;
    customTypes: State["customTypes"];
    color?: string;
}) {
    return (
        <div
            style={{
                background:
                    color ||
                    typeToColor(type as Types, customTypes) ||
                    "transparent",
                color: getContrastColor(
                    color || typeToColor(type as Types, customTypes),
                ),
                padding: "0.25rem 0.5rem",
                margin: "0.25rem",
                borderRadius: "0.25rem",
                width: "10rem",
            }}
        >
            {type}
        </div>
    );
}
