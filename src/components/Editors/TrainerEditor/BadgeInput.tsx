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
                        <div style={{ width: "200px" }}>
                            Select a game or configure custom checkpoints to see
                            them here!
                        </div>
                    )}
                    {Array.isArray(checkpoints) &&
                        checkpoints?.map((badge) => (
                            <Checkbox
                                onChange={(e: any) => {
                                    if (
                                        !e.target.checked ||
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
                                key={badge.name}
                                label={badge.name}
                            />
                        ))}
                    {toggle && (
                        <Button onClick={toggle} minimal>
                            Customize Checkpoints
                        </Button>
                    )}
                </Menu>
            }
            position={Position.BOTTOM}
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
                className={cx(Classes.DIALOG, {
                    [Classes.DARK]: style.editorDarkMode,
                })}
                canOutsideClickClose={false}
                title="Checkpoints Editor"
                icon="badge"
                style={{ width: "60rem" }}
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
