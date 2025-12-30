import * as React from "react";
import { useState } from "react";
import {
    Button,
    Dialog,
    DialogBody,
    Intent,
    TextArea,
    Input,
    Label,
    Classes,
    Divider,
    Spinner,
} from "components/ui/shims";
import { Icon, Select } from "components/ui";
import { connect } from "react-redux";
import { editRule, addRule, deleteRule, resetRules, setRules } from "actions";
import { showToast } from "components/Common/Shared/appToaster";

import { State } from "state";
import { nuzlockeRulesets, NuzlockeRuleset } from "utils/data";
import { feature } from "utils/feature";

export const presetRules: NuzlockeRuleset[] = nuzlockeRulesets;

export interface RulesEditorProps {
    rules: string[];
    editRule: editRule;
    addRule: addRule;
    deleteRule: deleteRule;
    resetRules: resetRules;
    setRules: setRules;
}

export function RulesEditor({
    rules,
    editRule,
    addRule,
    deleteRule,
    resetRules,
    setRules,
}: RulesEditorProps) {
    const [selectedRuleset, setSelectedRuleset] = useState("");
    const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
    const [suggestName, setSuggestName] = useState("");
    const [suggestDescription, setSuggestDescription] = useState("");
    const [isSending, setIsSending] = useState(false);

    const selectedRulesetData = presetRules.find((p) => p.name === selectedRuleset);

    const closeSuggestDialog = () => {
        setSuggestDialogOpen(false);
        setSuggestName("");
        setSuggestDescription("");
        setIsSending(false);
    };

    const submitRulesetSuggestion = () => {
        if (!suggestName.trim() || rules.length === 0) {
            return;
        }

        setIsSending(true);

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
                    setIsSending(false);
                    closeSuggestDialog();
                } else {
                    showToast({
                        message: "Submission failed. Please try again.",
                        intent: Intent.DANGER,
                    });
                }
                setIsSending(false);
            })
            .catch((err) => {
                showToast({
                    message: `Submission failed. Please try again. ${err}`,
                    intent: Intent.DANGER,
                });
                setIsSending(false);
            });
    };

    return (
        <>
            <div className="m-2">
                <div className="flex gap-2 items-center mb-3">
                    <Select
                        value={selectedRuleset}
                        onChange={(e) => setSelectedRuleset(e.target.value)}
                        className="flex-1"
                    >
                        <option value="">Select a ruleset...</option>
                        {presetRules.map((preset) => (
                            <option key={preset.name} value={preset.name}>
                                {preset.name}
                            </option>
                        ))}
                    </Select>
                    <Button
                        onClick={() => {
                            if (selectedRulesetData) {
                                setRules(selectedRulesetData.rules);
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
                    <div className="bg-black/5 dark:bg-white/5 rounded p-3 text-sm">
                        <em>{selectedRulesetData.description}</em>
                        <ul className="mt-2 pl-5 not-italic">
                            {selectedRulesetData.rules.map((rule, index) => (
                                <li className="my-1 text-[0.85rem] opacity-85" key={index}>
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <Divider style={{ margin: "1rem 0" }} />
            </div>

            <ul className="list-none m-2 p-0">
                {rules.map((rule, index) => (
                    <li
                        className="bg-black/5 dark:bg-white/5 rounded flex items-center justify-around my-1 min-h-8"
                        key={index}
                    >
                        <div className="p-1 text-center h-full w-6">{index + 1}</div>
                        <TextArea
                            value={rule}
                            fill
                            onChange={(e: any) => editRule(index, e.target.value)}
                            dir="auto"
                        />
                        <div
                            onClick={() => deleteRule(index)}
                            onKeyUp={() => deleteRule(index)}
                            role="none"
                            className="p-1 text-center h-full w-6 cursor-pointer"
                            title="Delete Rule"
                        >
                            <Icon className="cursor-pointer text-red-500" icon="trash" />
                        </div>
                    </li>
                ))}
            </ul>

            <Button onClick={() => addRule()} intent={Intent.PRIMARY}>
                Add Rule
            </Button>
            <Button className="ml-4" onClick={() => resetRules()} intent={Intent.WARNING}>
                Reset Rules
            </Button>

            {feature.rulesetSubmission && (
                <>
                    <Divider style={{ margin: "1rem 0" }} />
                    <div className="m-2 text-center">
                        <Button
                            icon="lightbulb"
                            onClick={() => setSuggestDialogOpen(true)}
                            minimal
                            small
                        >
                            Suggest as Community Ruleset
                        </Button>
                    </div>

                    <Dialog
                        isOpen={suggestDialogOpen}
                        onClose={closeSuggestDialog}
                        title="Suggest as Community Ruleset"
                        icon="lightbulb"
                    >
                        <div className={Classes.DIALOG_BODY}>
                            <p className="mb-4 text-[#5c7080] dark:text-[#a7b6c2]">
                                Share your custom ruleset with the community! If approved, it will
                                be added to the presets for everyone to use.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Label>
                                    Ruleset Name
                                    <Input
                                        type="text"
                                        placeholder="e.g., Ironmon Challenge"
                                        value={suggestName}
                                        onChange={(e) => setSuggestName(e.target.value)}
                                        fill
                                    />
                                </Label>
                                <Label>
                                    Description
                                    <TextArea
                                        placeholder="Brief description of this ruleset..."
                                        value={suggestDescription}
                                        onChange={(e) => setSuggestDescription(e.target.value)}
                                        fill
                                        rows={2}
                                    />
                                </Label>
                                <div className="bg-black/5 dark:bg-white/5 rounded p-3 text-sm max-h-[150px] overflow-y-auto">
                                    <strong>Rules to submit ({rules.length}):</strong>
                                    <ul className="mt-2 pl-5">
                                        {rules.map((rule, i) => (
                                            <li className="my-1 text-[0.85rem]" key={i}>
                                                {rule || <em>(empty rule)</em>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={Classes.DIALOG_FOOTER}>
                            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                                <Button onClick={closeSuggestDialog}>Cancel</Button>
                                <Button
                                    intent={Intent.PRIMARY}
                                    onClick={submitRulesetSuggestion}
                                    disabled={
                                        !suggestName.trim() || rules.length === 0 || isSending
                                    }
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
                </>
            )}
        </>
    );
}

export function RulesEditorDialogBase(
    props: RulesEditorProps & { onClose: any; isOpen: boolean; style: any },
) {
    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            className={`!pb-0 min-w-[500px] ${props.style.editorDarkMode ? Classes.DARK : ""}`}
            data-theme={props.style.editorDarkMode ? "dark" : "light"}
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
                    setRules={props.setRules}
                />
            </DialogBody>
        </Dialog>
    );
}

export const RulesEditorDialog = connect(
    (state: State) => ({
        rules: state.rules,
        style: state.style,
    }),
    { editRule, addRule, deleteRule, resetRules, setRules },
)(RulesEditorDialogBase as any);
