import * as React from "react";
import {
    Alert,
    Intent,
    Icon,
    Popover,
    Position,
    PopoverInteractionKind,
    Classes,
} from "@blueprintjs/core";
import { cx, css } from "emotion";

import { deletePokemon, modifyDeletionConfirmation } from "actions";
import { connect } from "react-redux";
import { accentedE } from "utils";
import { State } from "state";

export interface DeletePokemonButtonProps {
    id?: string;
    confirmation: boolean;
    modifyDeletionConfirmation: modifyDeletionConfirmation;
    deletePokemon: deletePokemon;
}

export const DeletePokemonButtonContainer = css`
    color: red;
    cursor: pointer;
`;

export function DeletePokemonButtonBase(props: DeletePokemonButtonProps) {
    const [dialogOn, setDialogOn] = React.useState(false);

    const toggleDialog = React.useCallback(() => {
        setDialogOn((prev) => !prev);
    }, []);

    console.log(props.id);
    return (
        <div className={DeletePokemonButtonContainer}>
            <Alert
                icon="trash"
                isOpen={dialogOn && props.confirmation}
                onCancel={toggleDialog}
                onConfirm={(_e) => {
                    if (props.id) {
                        props.deletePokemon(props.id);
                    }
                    toggleDialog();
                }}
                confirmButtonText="Delete Pokemon"
                cancelButtonText="Cancel"
                intent={Intent.DANGER}
            >
                <p>
                    This will delete the currently selected Pokemon. Are you
                    sure you want to do that?
                </p>

                <label className={cx(Classes.CONTROL, Classes.CHECKBOX)}>
                    <input
                        onChange={(event) =>
                            props.modifyDeletionConfirmation &&
                            props.modifyDeletionConfirmation(
                                !event.target.checked,
                            )
                        }
                        type="checkbox"
                    />
                    <span className={Classes.CONTROL_INDICATOR} />
                    Don&apos;t Ask Me For Confirmation Again
                </label>
            </Alert>
            <Popover
                interactionKind={PopoverInteractionKind.HOVER}
                position={Position.TOP}
                content={
                    <div
                        style={{ padding: "1rem" }}
                    >{`Delete Pok${accentedE}mon`}</div>
                }
            >
                <Icon
                    onClick={(_e) => {
                        if (props.confirmation) {
                            toggleDialog();
                        } else {
                            if (props.deletePokemon && props.id) {
                                props.deletePokemon(props.id);
                            }
                        }
                    }}
                    icon="trash"
                    title="Delete Pokemon"
                />
            </Popover>
        </div>
    );
}

export const DeletePokemonButton = connect(
    (state: Pick<State, keyof State>) => ({
        confirmation: state.confirmation,
    }),
    {
        deletePokemon,
        modifyDeletionConfirmation,
    },
)(DeletePokemonButtonBase);
