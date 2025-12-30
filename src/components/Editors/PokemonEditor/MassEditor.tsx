import * as React from "react";
import { connect } from "react-redux";
import { Dialog, DialogBody, Classes } from "components/ui/shims";
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
                className={`wide-dialog ${this.props.style.editorDarkMode ? "dark" : ""}`}
                title="Mass Editor"
            >
                <DialogBody>
                    <ErrorBoundary>
                        <MassEditorTable />
                    </ErrorBoundary>
                </DialogBody>
            </Dialog>
        );
    }
}

export const MassEditor = connect((state: State) => ({
    style: state.style,
}))(MassEditorBase);

export { MassEditor as default };
