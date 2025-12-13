import { Button, ButtonGroup, Dialog, DialogBody, DialogFooter } from "components/Common/ui";
import { css, cx } from "emotion";
import * as React from "react";

const hofImage = "/assets/hall-of-fame.png";

const styles = {
    hallOfFameDialog: css`
        padding: 0.25rem;
    `,
    hallOfFameImage: css`
        height: 10rem;
        display: block;
        margin: 1rem auto;
        margin-top: 0.5rem;
        image-rendering: pixelated;
    `,
    hallOfFameText: css``,
};

export interface HallOfFameDialogProps {
    isOpen: boolean;
    onClose: (e?: React.SyntheticEvent) => void;
    title: string;
    icon?: string | React.ReactNode;
}

export function HallOfFameDialog(props: HallOfFameDialogProps) {
    return (
        <Dialog {...props}>
            <DialogBody className={cx(styles.hallOfFameDialog)}>
                <img
                    alt="Hall of Fame"
                    className={styles.hallOfFameImage}
                    src={hofImage}
                />
                <p className={styles.hallOfFameText}>
                    Submitting to the Hall of Fame uploads your nuzlocke to a
                    persistent record.
                </p>
            </DialogBody>
            <DialogFooter>
                <Button
                    intent="danger"
                    minimal
                    onClick={props.onClose}
                >
                    Cancel
                </Button>
                <Button intent="success">
                    Submit to Hall of Fame
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
