import * as React from "react";
import { cx } from "emotion";
import {
    Classes,
    Button,
    Icon,
    Intent,
    Popover,
    PopoverInteractionKind,
} from "@blueprintjs/core";
import { classWithDarkTheme, feature, Styles } from "utils";
import * as styles from "./style";
import { connect } from "react-redux";
import { Badge } from "models";
import { getAllBadges } from "utils";
import { State } from "state";
import { Checkpoints } from "reducers/checkpoints";
import {
    addCustomCheckpoint,
    editCheckpoint,
    deleteCheckpoint,
    reorderCheckpoints,
} from "actions";
import { ImageUpload } from "components/Common/Shared/ImageUpload";

export interface CheckpointsSelectProps {
    checkpoint: Badge;
    onEdit: (img, name) => void;
}

export interface CheckpointsSelectState {
    showOptions: boolean;
}

const checkpointImageURL = (name) =>
    name.startsWith("http") || name.startsWith("data")
        ? name
        : `/img/checkpoints/${name}.png`;

export class CheckpointsSelect extends React.Component<
    CheckpointsSelectProps,
    CheckpointsSelectState
> {
    private renderOptions(checkpoint) {
        const { name, image } = checkpoint;

        const isImageUnique = getAllBadges()
            .map((badge) => badge.image)
            .includes(image);

        return (
            <div
                className="has-nice-scrollbars"
                style={{ padding: "1rem", height: "400px", overflowY: "auto" }}
            >
                {getAllBadges().map((badge, key) => {
                    return (
                        <Button
                            onClick={(e) =>
                                this.props.onEdit({ image: badge.image }, name)
                            }
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
                    );
                })}
            </div>
        );
    }

    public render() {
        const { checkpoint } = this.props;
        return (
            <>
                <Popover
                    minimal
                    interactionKind={PopoverInteractionKind.CLICK}
                    content={this.renderOptions(checkpoint)}
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
            </>
        );
    }
}

export interface CheckpointsEditorProps {
    checkpoints: Checkpoints;
    style: Styles;
    addCheckpoint: addCustomCheckpoint;
    editCheckpoint: editCheckpoint;
    deleteCheckpoint: deleteCheckpoint;
    reorderCheckpoints: reorderCheckpoints;
}

export interface CheckpointsEditorState {
    badgeNumber: number;
}

export class CheckpointsEditorBase extends React.Component<
    CheckpointsEditorProps,
    CheckpointsEditorState
> {
    public state = { badgeNumber: 0 };

    private addCheckpoint = (e: any) => {
        this.setState(
            {
                badgeNumber: this.state.badgeNumber + 1,
            },
            () => {
                this.props.addCheckpoint({
                    name: `Custom Badge ${this.state.badgeNumber}`,
                    image: "unknown",
                });
            },
        );
    };

    private renderCheckpoints(checkpoints: Checkpoints) {
        return (
            checkpoints &&
            checkpoints.map((checkpoint, key) => {
                return (
                    <li
                        key={key}
                        className={cx(
                            classWithDarkTheme(
                                styles,
                                "checkpointsItem",
                                this.props.style.editorDarkMode,
                            ),
                        )}
                    >
                        {/* <Icon icon='drag-handle-vertical' /> */}
                        <div className={cx(styles.checkpointName)}>
                            <img
                                className={cx(styles.checkpointImage())}
                                alt={checkpoint.name}
                                src={checkpointImageURL(checkpoint?.image)}
                            />
                            <input
                                onChange={(e) =>
                                    this.props.editCheckpoint(
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
                            onEdit={(i, n) => this.props.editCheckpoint(i, n)}
                            checkpoint={checkpoint}
                        />
                        <div className={Classes.INPUT_GROUP}>
                            <Icon icon={"link"} />
                            <input
                                className={Classes.INPUT}
                                placeholder="https://..."
                                value={checkpoint.image}
                                type="text"
                                onChange={(e) =>
                                    this.props.editCheckpoint(
                                        { image: e.target.value },
                                        checkpoint.name,
                                    )
                                }
                            />
                        </div>
                        <div
                            className={cx(styles.checkpointImageUploadWrapper)}
                        >
                            {feature.imageUploads && (
                                <ImageUpload
                                    onSuccess={(image) => {
                                        const request = window.indexedDB.open(
                                            "NuzlockeGenerator",
                                            3,
                                        );
                                        this.props.editCheckpoint(
                                            { image },
                                            checkpoint.name,
                                        );
                                    }}
                                />
                            )}
                        </div>
                        <Icon
                            style={{ cursor: "pointer" }}
                            onClick={(e) =>
                                this.props.deleteCheckpoint(checkpoint.name)
                            }
                            className={cx(styles.checkpointDelete)}
                            icon="trash"
                        />
                    </li>
                );
            })
        );
    }

    public render() {
        return (
            <div
                className={cx(styles.checkpointsEditor, "has-nice-scrollbars")}
            >
                <ul
                    className={cx(
                        styles.checkpointsList,
                        "has-nice-scrollbars",
                    )}
                >
                    {this.renderCheckpoints(this.props.checkpoints)}
                </ul>
                <div className={cx(styles.checkpointButtons)}>
                    <Button
                        onClick={this.addCheckpoint}
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
}

export const CheckpointsEditor = connect(
    (state: Pick<State, keyof State>) => ({
        style: state.style,
    }),
    {
        addCheckpoint: addCustomCheckpoint,
        editCheckpoint,
        deleteCheckpoint,
        reorderCheckpoints,
    },
)(CheckpointsEditorBase);
