import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import { TrainerInfoEditField } from "./TrainerInfoEditField";
import { editTrainer } from "actions";

import {
    Popover,
    Menu,
    Button,
    Position,
    Checkbox,
    Dialog,
    Classes,
} from "components/ui/shims";
import { CheckpointsEditor } from "./CheckpointsEditor";
import { cx } from "emotion";
import { State } from "state";
import { Checkpoints } from "reducers/checkpoints";
import * as Styles from "./style";

export interface BadgeInputProps {
    checkpointsCleared?: Checkpoints;
    onChange?: (checkpoint: Checkpoints) => void;
}

export interface CheckpointsInputListProps {
    onChange: (checkpoints: Checkpoints) => void;
    checkpointsObtained: Checkpoints;
    toggle?: () => void;
    buttonText?: string;
}

export function CheckpointsInputList({
    onChange,
    checkpointsObtained,
    toggle,
    buttonText,
}: CheckpointsInputListProps) {
    const checkpoints = useSelector<State, State["checkpoints"]>(
        (state) => state?.checkpoints,
    );

    return (
        <Popover
            minimal={true}
            content={
                <Menu>
                    {checkpoints.length === 0 && (
                        <div style={{ width: "200px" }} className="p-2 text-sm">
                            Select a game or configure custom checkpoints to see
                            them here!
                        </div>
                    )}
                    {Array.isArray(checkpoints) &&
                        checkpoints?.map((badge) => (
                            <div key={badge.name} className="px-3 py-1">
                                <Checkbox
                                    onChange={(checked) => {
                                        if (
                                            !checked ||
                                            checkpointsObtained.some(
                                                (b) => b.name === badge.name,
                                            )
                                        ) {
                                            const badges =
                                                checkpointsObtained.filter(
                                                    (b) => b.name !== badge.name,
                                                );
                                            onChange(badges);
                                        } else {
                                            const badges = [
                                                ...checkpointsObtained,
                                                badge,
                                            ];
                                            onChange(badges);
                                        }
                                    }}
                                    checked={checkpointsObtained.some(
                                        (b) => b.name === badge.name,
                                    )}
                                    label={badge.name}
                                />
                            </div>
                        ))}
                    {toggle && (
                        <div className="px-3 py-1 border-t border-border">
                            <Button onClick={toggle} minimal>
                                Customize Checkpoints
                            </Button>
                        </div>
                    )}
                </Menu>
            }
            position="bottom"
        >
            <Button
                fill
                style={{
                    borderRadius: 0,
                }}
            >
                {buttonText ?? "Select Checkpoints"}
            </Button>
        </Popover>
    );
}

export function BadgeInput({ onChange, checkpointsCleared }: BadgeInputProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const checkpoints = useSelector<State, State["checkpoints"]>(
        (state) => state.checkpoints,
    );
    const trainer = useSelector<State, State["trainer"]>(
        (state) => state.trainer,
    );
    const style = useSelector<State, State["style"]>((state) => state.style);
    const onChangeInternal = (badges: Checkpoints) =>
        dispatch(editTrainer({ badges }));
    const onChangeUseable = onChange ?? onChangeInternal;
    const dispatch = useDispatch();

    const toggle = () => setIsOpen(!isOpen);

    const checkpointsObtained = checkpointsCleared ?? trainer.badges ?? [];
    return (
        <>
            <Dialog
                isOpen={isOpen}
                onClose={toggle}
                className={cx(style.editorDarkMode && "dark")}
                title="Checkpoints Editor"
                icon="edit"
            >
                <div
                    className={cx(
                        Classes.DIALOG_BODY,
                        Styles.checkpointsEditor,
                        "has-nice-scrollbars",
                    )}
                >
                    <CheckpointsEditor checkpoints={checkpoints} />
                </div>
            </Dialog>
            <TrainerInfoEditField
                data-testid="badge-input"
                label="Checkpoints"
                name="badges"
                placeholder="..."
                value={""}
                element={(inputProps) => (
                    <div>
                        <CheckpointsInputList
                            onChange={onChangeUseable}
                            toggle={toggle}
                            checkpointsObtained={checkpointsObtained}
                        />
                    </div>
                )}
            />
        </>
    );
}
