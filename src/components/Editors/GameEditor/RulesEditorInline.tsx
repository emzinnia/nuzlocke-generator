import { connect } from "react-redux";
import { editRule, addRule, deleteRule, resetRules, setRules } from "actions";
import { RulesEditor } from "components/Editors/RulesEditor/RulesEditor";
import { State } from "state";

export const RulesEditorInline = connect(
    (state: State) => ({
        rules: state.rules,
    }),
    { editRule, addRule, deleteRule, resetRules, setRules },
)(RulesEditor);

