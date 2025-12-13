import { ChevronUp, ChevronDown } from "lucide-react";
import * as React from "react";

export interface BaseEditorState {
    isOpen: boolean;
}

export interface BaseEditorProps {
    name: string;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
}

export class BaseEditor extends React.Component<
    BaseEditorProps,
    BaseEditorState
> {
    public static defaultProps = {
        defaultOpen: true,
    };

    public state = {
        isOpen: this.props.defaultOpen ?? BaseEditor.defaultProps.defaultOpen,
    };

    private toggleEditor = () => {
        this.setState({ isOpen: !this.state.isOpen });
    };

    public render() {
        return (
            <div
                data-testid="base-editor"
                className={`${this.props.name.toLowerCase().replace(/\s/g, "-")}-editor base-editor`}
            >
                <h4
                    title={`${this.state.isOpen ? "Collapse" : "Open"} this editor.`}
                    className="font-bold flex content-center justify-between m-1 mb-2 cursor-pointer text-base"
                    onClick={this.toggleEditor}
                >
                    <span>
                        {this.props.name}
                    </span>
                    {this.state.isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </h4>
                {this.state.isOpen ? this.props.children : null}
            </div>
        );
    }
}
