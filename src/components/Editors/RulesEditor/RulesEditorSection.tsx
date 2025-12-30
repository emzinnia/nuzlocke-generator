import * as React from "react";
import { connect } from "react-redux";
import { editRule, addRule, deleteRule, resetRules, setRules } from "actions";
import { RulesEditor, RulesEditorProps } from "./RulesEditor";
import { State } from "state";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";

function RulesEditorSectionBase(props: RulesEditorProps) {
    return (
        <BaseEditor icon="edit" name="Rules">
            <RulesEditor {...props} />
        </BaseEditor>
    );
}

export const RulesEditorSection = connect(
    (state: State) => ({
        rules: state.rules,
    }),
    { editRule, addRule, deleteRule, resetRules, setRules },
)(RulesEditorSectionBase);

