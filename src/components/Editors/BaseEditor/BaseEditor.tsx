import { Icon, type IconName } from "components/ui";
import * as React from "react";

export interface BaseEditorState {
    isOpen: boolean;
}

export interface BaseEditorProps {
    name: string;
    icon?: IconName | string;
    defaultOpen?: boolean;
    children?: React.ReactNode;
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
                        {/* {this.props.icon && <Icon style={{
                            opacity: 0.7,
                            fontSize: '90%',
                            marginRight: '4px',
                        }} icon={this.props.icon} />} */}
                        {this.props.name}
                    </span>
                    <Icon
                        icon={this.state.isOpen ? "caret-up" : "caret-down"}
                    />
                </h4>
                {this.state.isOpen ? this.props.children : null}
            </div>
        );
    }
}
