import * as React from "react";
import { Button, Dialog, DialogBody, TextArea } from "components/Common/ui";
import { Trash2 } from "lucide-react";
import { connect } from "react-redux";
import { editRule, addRule, deleteRule, resetRules } from "actions";

import "./RulesEditor.css";
import { State } from "state";

export interface RulesEditorProps {
    rules: string[];
    editRule: editRule;
    addRule: addRule;
    deleteRule: deleteRule;
    resetRules: resetRules;
}

export class RulesEditor extends React.Component<RulesEditorProps> {
    public renderRules() {
        return this.props.rules.map((rule, index) => (
            <li className="rules-list-item" key={index}>
                <div className="rule-no">{index + 1}</div>
                <TextArea
                    defaultValue={rule}
                    fill
                    onChange={(e: any) =>
                        this.props.editRule(index, e.target.value)
                    }
                    dir="auto"
                />
                <div
                    onClick={() => this.props.deleteRule(index)}
                    onKeyPress={() => this.props.deleteRule(index)}
                    role="none"
                    className="rule-delete"
                    title="Delete Rule"
                >
                    <Trash2
                        size={16}
                        className="text-red-500 cursor-pointer"
                    />
                </div>
            </li>
        ));
    }

    public renderButtons() {
        return (
            <>
                <Button
                    onClick={(_) => this.props.addRule()}
                    intent="primary"
                >
                    Add Rule
                </Button>
                <Button
                    style={{ marginLeft: "1rem" }}
                    onClick={() => {
                        this.props.resetRules();
                        this.forceUpdate();
                    }}
                    intent="warning"
                >
                    Reset Rules
                </Button>
            </>
        );
    }

    public render() {
        return (
            <>
                <ul
                    style={{
                        listStyleType: "none",
                        margin: ".5rem",
                        padding: "0",
                    }}
                >
                    {this.renderRules()}
                </ul>
                {this.renderButtons()}
            </>
        );
    }
}

export const RulesEditorDialogBase = (
    props: RulesEditorProps & { onClose: any; isOpen: boolean; style: any },
) => {
    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            className={`rules-editor-dialog ${props.style.editorDarkMode ? "dark" : ""}`}
            title="Rules Editor"
            icon="edit"
        >
            <DialogBody>
                <RulesEditor
                    rules={props.rules}
                    editRule={props.editRule}
                    addRule={props.addRule}
                    deleteRule={props.deleteRule}
                    resetRules={props.resetRules}
                />
            </DialogBody>
        </Dialog>
    );
};

export const RulesEditorDialog = connect(
    (state: State) => ({
        rules: state.rules,
        style: state.style,
    }),
    { editRule, addRule, deleteRule, resetRules },
)(RulesEditorDialogBase as any);
