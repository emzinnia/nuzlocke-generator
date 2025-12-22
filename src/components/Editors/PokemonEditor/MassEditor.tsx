/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { connect } from "react-redux";
import { Dialog, Classes } from "components/ui/shims";
import { State } from "state";
import { ErrorBoundary } from "components";
import { MassEditorTable } from "./MassEditorTable";

export interface MassEditorProps {
    isOpen: boolean;
    toggleDialog?: (e?: any) => void;
    style: State["style"];
}

export class MassEditorBase extends React.Component<MassEditorProps> {
    public render() {
        return (
            <Dialog
                icon="edit"
                isOpen={this.props.isOpen}
                onClose={this.props.toggleDialog}
                className={`wide-dialog ${this.props.style.editorDarkMode ? Classes.DARK : ""}`}
                title="Mass Editor"
            >
                <div className={Classes.DIALOG_BODY}>
                    <ErrorBoundary>
                        <MassEditorTable />
                    </ErrorBoundary>
                </div>
            </Dialog>
        );
    }
}

export const MassEditor = connect((state: State) => ({
    style: state.style,
}))(MassEditorBase);

export { MassEditor as default };
