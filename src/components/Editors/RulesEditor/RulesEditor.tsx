import * as React from "react";
import {
    Button,
    Dialog,
    Intent,
    TextArea,
    Icon,
    Classes,
    HTMLSelect,
    Divider,
    Spinner,
} from "@blueprintjs/core";
import { connect } from "react-redux";
import { editRule, addRule, deleteRule, resetRules, setRules } from "actions";
import { showToast } from "components/Common/Shared/appToaster";

import "./RulesEditor.css";
import { State } from "state";
import { nuzlockeRulesets, NuzlockeRuleset } from "utils/data";

export const presetRules: NuzlockeRuleset[] = nuzlockeRulesets;

export interface RulesEditorProps {
    rules: string[];
    editRule: editRule;
    addRule: addRule;
    deleteRule: deleteRule;
    resetRules: resetRules;
    setRules: setRules;
}

export interface RulesEditorState {
    selectedRuleset: string;
    suggestDialogOpen: boolean;
    suggestName: string;
    suggestDescription: string;
    isSending: boolean;
}

export class RulesEditor extends React.Component<RulesEditorProps, RulesEditorState> {
    constructor(props: RulesEditorProps) {
        super(props);
        this.state = {
            selectedRuleset: "",
            suggestDialogOpen: false,
            suggestName: "",
            suggestDescription: "",
            isSending: false,
        };
    }

    public renderRulesets() {
        const { selectedRuleset } = this.state;
        const selectedRulesetData = presetRules.find((p) => p.name === selectedRuleset);

        return (
            <div className="preset-rules-section">
                <div className="preset-rules-header">
                    <strong>Rulesets</strong>
                </div>
                <div className="preset-rules-controls">
                    <HTMLSelect
                        value={selectedRuleset}
                        onChange={(e) => this.setState({ selectedRuleset: e.target.value })}
                        className="preset-select"
                    >
                        <option value="">Select a ruleset...</option>
                        {presetRules.map((preset) => (
                            <option key={preset.name} value={preset.name}>
                                {preset.name}
                            </option>
                        ))}
                    </HTMLSelect>
                    <Button
                        onClick={() => {
                            if (selectedRulesetData) {
                                this.props.setRules(selectedRulesetData.rules);
                                this.forceUpdate();
                            }
                        }}
                        intent={Intent.SUCCESS}
                        disabled={!selectedRuleset}
                        icon="tick"
                    >
                        Apply Ruleset
                    </Button>
                </div>
                {selectedRulesetData && (
                    <div className="preset-description">
                        <em>{selectedRulesetData.description}</em>
                        <ul className="preset-preview">
                            {selectedRulesetData.rules.map((rule, index) => (
                                <li key={index}>{rule}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <Divider style={{ margin: "1rem 0" }} />
            </div>
        );
    }

    public renderRules() {
        return this.props.rules.map((rule, index) => (
            <li className="rules-list-item" key={index}>
                <div className="rule-no">{index + 1}</div>
                <TextArea
                    defaultValue={rule}
                    className={Classes.FILL}
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
                    <Icon
                        intent={Intent.DANGER}
                        style={{ cursor: "pointer" }}
                        icon={"trash"}
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
                    intent={Intent.PRIMARY}
                >
                    Add Rule
                </Button>
                <Button
                    style={{ marginLeft: "1rem" }}
                    onClick={() => {
                        this.props.resetRules();
                        this.forceUpdate();
                    }}
                    intent={Intent.WARNING}
                >
                    Reset Rules
                </Button>
            </>
        );
    }

    private openSuggestDialog = () => {
        this.setState({ suggestDialogOpen: true });
    };

    private closeSuggestDialog = () => {
        this.setState({
            suggestDialogOpen: false,
            suggestName: "",
            suggestDescription: "",
            isSending: false,
        });
    };

    private submitRulesetSuggestion = () => {
        const { suggestName, suggestDescription } = this.state;
        const { rules } = this.props;

        if (!suggestName.trim() || rules.length === 0) {
            return;
        }

        this.setState({ isSending: true });

        const url = `${window.location.origin}/suggest-ruleset`;

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors",
            body: JSON.stringify({
                name: suggestName.trim(),
                description: suggestDescription.trim(),
                rules: rules,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.status === 200 || res.status === 201) {
                    showToast({
                        message: "Ruleset suggestion submitted! Thank you for contributing.",
                        intent: Intent.SUCCESS,
                    });
                    this.setState({ isSending: false }, this.closeSuggestDialog);
                } else {
                    showToast({
                        message: "Submission failed. Please try again.",
                        intent: Intent.DANGER,
                    });
                }
                this.setState({ isSending: false });
            })
            .catch((err) => {
                showToast({
                    message: `Submission failed. Please try again. ${err}`,
                    intent: Intent.DANGER,
                });
                this.setState({ isSending: false });
            });
    };

    public renderSuggestDialog() {
        const { suggestDialogOpen, suggestName, suggestDescription, isSending } = this.state;
        const { rules } = this.props;

        return (
            <Dialog
                isOpen={suggestDialogOpen}
                onClose={this.closeSuggestDialog}
                title="Suggest as Community Ruleset"
                icon="lightbulb"
            >
                <div className={Classes.DIALOG_BODY}>
                    <p className="suggest-dialog-intro">
                        Share your custom ruleset with the community! If approved, it will be added
                        to the presets for everyone to use.
                    </p>
                    <div className="suggest-form">
                        <label className={Classes.LABEL}>
                            Ruleset Name
                            <input
                                className={Classes.INPUT}
                                type="text"
                                placeholder="e.g., Ironmon Challenge"
                                value={suggestName}
                                onChange={(e) => this.setState({ suggestName: e.target.value })}
                                style={{ width: "100%" }}
                            />
                        </label>
                        <label className={Classes.LABEL}>
                            Description
                            <TextArea
                                placeholder="Brief description of this ruleset..."
                                value={suggestDescription}
                                onChange={(e) =>
                                    this.setState({ suggestDescription: e.target.value })
                                }
                                style={{ width: "100%" }}
                                rows={2}
                            />
                        </label>
                        <div className="suggest-preview">
                            <strong>Rules to submit ({rules.length}):</strong>
                            <ul>
                                {rules.map((rule, i) => (
                                    <li key={i}>{rule || <em>(empty rule)</em>}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button onClick={this.closeSuggestDialog}>Cancel</Button>
                        <Button
                            intent={Intent.PRIMARY}
                            onClick={this.submitRulesetSuggestion}
                            disabled={!suggestName.trim() || rules.length === 0 || isSending}
                        >
                            {isSending ? (
                                <>
                                    <Spinner size={16} /> Submitting...
                                </>
                            ) : (
                                "Submit Suggestion"
                            )}
                        </Button>
                    </div>
                </div>
            </Dialog>
        );
    }

    public render() {
        return (
            <>
                {this.renderRulesets()}
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
                <Divider style={{ margin: "1rem 0" }} />
                <div className="suggest-ruleset-section">
                    <Button
                        icon="lightbulb"
                        onClick={this.openSuggestDialog}
                        minimal
                        small
                    >
                        Suggest as Community Ruleset
                    </Button>
                </div>
                {this.renderSuggestDialog()}
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
            className={`rules-editor-dialog ${props.style.editorDarkMode ? Classes.DARK : ""}`}
            title="Rules Editor"
            icon="edit"
        >
            <div className={Classes.DIALOG_BODY}>
                <RulesEditor
                    rules={props.rules}
                    editRule={props.editRule}
                    addRule={props.addRule}
                    deleteRule={props.deleteRule}
                    resetRules={props.resetRules}
                    setRules={props.setRules}
                />
            </div>
        </Dialog>
    );
};

export const RulesEditorDialog = connect(
    (state: State) => ({
        rules: state.rules,
        style: state.style,
    }),
    { editRule, addRule, deleteRule, resetRules, setRules },
)(RulesEditorDialogBase as any);
