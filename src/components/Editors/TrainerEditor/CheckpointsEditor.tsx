import * as React from "react";
import { cx } from "emotion";
import {
    Classes,
    Button,
    Intent,
    Popover,
    PopoverInteractionKind,
} from "components/ui/shims";
import { Icon } from "components/ui";
import { classWithDarkTheme, feature } from "utils";
import * as styles from "./style";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "models";
import { getAllBadges } from "utils";
import { State } from "state";
import { Checkpoints } from "reducers/checkpoints";
import {
    addCustomCheckpoint,
    editCheckpoint,
    deleteCheckpoint,
} from "actions";
import { ImageUpload } from "components/Common/Shared/ImageUpload";

export interface CheckpointsSelectProps {
    checkpoint: Badge;
    onEdit: (img: { image: string }, name: string) => void;
}

const checkpointImageURL = (name: string) =>
    name.startsWith("http") || name.startsWith("data")
        ? name
        : `./img/checkpoints/${name}.png`;

export function CheckpointsSelect({ checkpoint, onEdit }: CheckpointsSelectProps) {
    const renderOptions = () => {
        const { name } = checkpoint;

        return (
            <div
                className="has-nice-scrollbars"
                style={{ padding: "1rem", height: "400px", overflowY: "auto" }}
            >
                {getAllBadges().map((badge, key) => (
                    <Button
                        onClick={() => onEdit({ image: badge.image }, name)}
                        key={key}
                        name={badge.name}
                        style={{ display: "block" }}
                        className={Classes.MINIMAL}
                    >
                        <img
                            className={cx(styles.checkpointImage(1))}
                            alt={badge.name}
                            src={checkpointImageURL(badge?.image)}
                        />{" "}
                        {badge.name}
                    </Button>
                ))}
            </div>
        );
    };

    return (
        <Popover
            minimal
            interactionKind={PopoverInteractionKind.CLICK}
            content={renderOptions()}
        >
            <div
                className={cx(
                    styles.checkpointSelect,
                    Classes.SELECT,
                    Classes.BUTTON,
                    "has-nice-scrollbars",
                )}
            >
                <div>
                    <img
                        className={cx(styles.checkpointImage(1))}
                        alt={checkpoint.name}
                        src={checkpointImageURL(checkpoint?.image)}
                    />{" "}
                    {checkpoint.name}
                </div>
            </div>
        </Popover>
    );
}

export interface CheckpointsEditorProps {
    checkpoints: Checkpoints;
}

export function CheckpointsEditor({ checkpoints }: CheckpointsEditorProps) {
    const [badgeNumber, setBadgeNumber] = React.useState(0);
    const dispatch = useDispatch();
    const style = useSelector((state: State) => state.style);

    const handleAddCheckpoint = () => {
        const newBadgeNumber = badgeNumber + 1;
        setBadgeNumber(newBadgeNumber);
        dispatch(
            addCustomCheckpoint({
                name: `Custom Badge ${newBadgeNumber}`,
                image: "unknown",
            }),
        );
    };

    const handleEditCheckpoint = (
        update: Partial<Badge>,
        checkpointName: string,
    ) => {
        dispatch(editCheckpoint(update, checkpointName));
    };

    const handleDeleteCheckpoint = (checkpointName: string) => {
        dispatch(deleteCheckpoint(checkpointName));
    };

    const renderCheckpoints = () => {
        if (!checkpoints) return null;

        return checkpoints.map((checkpoint, key) => (
            <li
                key={key}
                className={cx(
                    classWithDarkTheme(
                        styles,
                        "checkpointsItem",
                        style.editorDarkMode,
                    ),
                )}
            >
                <div className={cx(styles.checkpointName)}>
                    <img
                        className={cx(styles.checkpointImage())}
                        alt={checkpoint.name}
                        src={checkpointImageURL(checkpoint?.image)}
                    />
                    <input
                        onChange={(e) =>
                            handleEditCheckpoint(
                                { name: e.target.value },
                                checkpoint.name,
                            )
                        }
                        className={Classes.INPUT}
                        type="text"
                        value={checkpoint.name}
                    />
                </div>
                <CheckpointsSelect
                    onEdit={(i, n) => handleEditCheckpoint(i, n)}
                    checkpoint={checkpoint}
                />
                <div className={Classes.INPUT_GROUP}>
                    <Icon icon="link" />
                    <input
                        className={Classes.INPUT}
                        placeholder="https://..."
                        value={checkpoint.image}
                        type="text"
                        onChange={(e) =>
                            handleEditCheckpoint(
                                { image: e.target.value },
                                checkpoint.name,
                            )
                        }
                    />
                </div>
                <div className={cx(styles.checkpointImageUploadWrapper)}>
                    {feature.imageUploads && (
                        <ImageUpload
                            onSuccess={(image) => {
                                window.indexedDB.open("NuzlockeGenerator", 3);
                                handleEditCheckpoint({ image }, checkpoint.name);
                            }}
                        />
                    )}
                </div>
                <button
                    type="button"
                    style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}
                    onClick={() => handleDeleteCheckpoint(checkpoint.name)}
                >
                    <Icon
                        className={cx(styles.checkpointDelete)}
                        icon="trash"
                    />
                </button>
            </li>
        ));
    };

    return (
        <div className={cx(styles.checkpointsEditor, "has-nice-scrollbars")}>
            <ul className={cx(styles.checkpointsList, "has-nice-scrollbars")}>
                {renderCheckpoints()}
            </ul>
            <div className={cx(styles.checkpointButtons)}>
                <Button
                    onClick={handleAddCheckpoint}
                    icon="plus"
                    intent={Intent.SUCCESS}
                >
                    {" "}
                    Add Checkpoint
                </Button>
            </div>
        </div>
    );
}
