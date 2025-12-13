import * as React from "react";
import { Button, Popover, HTMLSelect } from "components/Common/ui";
import { toast } from "components/Common/ui/Toast";
import { Info } from "lucide-react";
import { State } from "state";
import { connect } from "react-redux";
import { addBox, AddBoxArgs } from "actions";
import { Autocomplete } from "components";
import { wallpapers } from "./Box";

export interface NewBox {
    name: string;
    background: string;
    inheritFrom?: string;
}

export interface BoxFormProps {
    boxes: State["box"];
    addBox: addBox;
    style: State["style"];
}

export interface BoxFormState {
    isBoxFormOpen: boolean;
    newBox: NewBox;
}

const baseBox = {
    name: "",
    background: "grass-meadow",
    inheritFrom: "Team",
};

export class BoxFormBase extends React.Component<BoxFormProps, BoxFormState> {
    public state = {
        isBoxFormOpen: false,
        newBox: baseBox,
    };

    private toggleBoxForm = (e) => {
        this.setState({ isBoxFormOpen: !this.state.isBoxFormOpen });
    };

    private confirmNewBox = (e) => {
        try {
            this.props.addBox(this.state.newBox as AddBoxArgs);
            this.setState({ newBox: baseBox });
        } catch (e) {
            toast.error("Cannot name a box the same as a current one.");
        }
    };

    private editFormInput = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            newBox: {
                ...this.state.newBox,
                [name]: value,
            },
        });
    };

    public render() {
        const { boxes } = this.props;
        const { isBoxFormOpen } = this.state;

        const inputStyle = {
            margin: "0 auto",
            marginTop: "0.25rem",
            display: "flex",
            alignItems: "baseline",
        };

        const labelStyle = {
            marginLeft: "1rem",
            marginRight: ".5rem",
            width: "8rem",
            display: "flex",
            alignItems: "center",
        };

        return (
            <>
                <Button
                    onClick={this.toggleBoxForm}
                    icon="plus"
                    small
                    style={{
                        margin: ".25rem",
                        height: "2rem",
                        width: "2rem",
                        float: "right",
                        marginTop: "-.75rem",
                        borderRadius: "50%",
                        transition: "200ms",
                        transform: isBoxFormOpen ? "rotate(135deg)" : undefined,
                    }}
                    intent="success"
                />
                <div style={{ clear: "both" }} />
                {isBoxFormOpen && (
                    <div
                        style={{
                            border: this.props.style.editorDarkMode
                                ? "1px solid #333"
                                : "1px solid #ddd",
                            borderRadius: ".25rem",
                            boxShadow: "rgba(0, 0, 0, 0.33)",
                            margin: ".25rem",
                            marginTop: "-1rem",
                            padding: "0.5rem",
                        }}
                    >
                        <div style={inputStyle}>
                            <label style={labelStyle} className="text-sm font-medium text-foreground">
                                Name
                            </label>
                            <input
                                required
                                className="px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                autoComplete="false"
                                onInput={this.editFormInput}
                                value={this.state.newBox.name}
                                name="name"
                                placeholder="Box Name"
                            />
                        </div>
                        <div style={inputStyle}>
                            <label style={labelStyle} className="text-sm font-medium text-foreground">
                                Background{" "}
                                <Popover
                                    minimal
                                    interactionKind="hover"
                                    content={
                                        <div
                                            style={{
                                                width: "160px",
                                                padding: "0.25rem",
                                            }}
                                        >
                                            Can be a URL or{" "}
                                            {wallpapers
                                                .map((w) => w.background)
                                                .join(", ")}
                                        </div>
                                    }
                                >
                                    <Info
                                        size={14}
                                        style={{ marginLeft: ".25rem" }}
                                    />
                                </Popover>
                            </label>
                            <input
                                className="px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                onInput={this.editFormInput}
                                value={this.state.newBox.background}
                                name="background"
                                placeholder="Box Background"
                            />
                        </div>

                        <div style={inputStyle}>
                            <label style={labelStyle} className="text-sm font-medium text-foreground">
                                Inherit From...
                            </label>
                            <HTMLSelect
                                onChange={this.editFormInput}
                                value={this.state.newBox.inheritFrom}
                                name="inheritFrom"
                                options={["Team", "Boxed", "Dead", "Champs"]}
                            />
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Button
                                onClick={this.toggleBoxForm}
                                intent="danger"
                                style={{ margin: "0 .5rem" }}
                                minimal
                            >
                                Cancel
                            </Button>
                            <Button
                                style={{ margin: "0 .5rem" }}
                                onClick={this.confirmNewBox}
                                intent="success"
                                disabled={!this.state.newBox.name}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export const BoxForm = connect(
    (state: State) => ({
        style: state.style,
    }),
    {
        addBox,
    },
)(BoxFormBase);
