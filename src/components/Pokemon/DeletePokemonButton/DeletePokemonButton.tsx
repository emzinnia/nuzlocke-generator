import * as React from "react";
import { Dialog, Tooltip, Icon, Button, Checkbox, Intent } from "components/ui";
import { css } from "emotion";

import { accentedE } from "utils";
import { connect } from "react-redux";
import { deletePokemon, modifyDeletionConfirmation } from "actions";
import { State } from "state";

const DeletePokemonButtonContainer = css`
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    z-index: 2;
`;

export interface DeletePokemonButtonProps {
    id?: string;
    confirmation?: boolean;
    deletePokemon?: deletePokemon;
    modifyDeletionConfirmation?: modifyDeletionConfirmation;
}

export interface DeletePokemonButtonState {
    dialogOn: boolean;
}

export class DeletePokemonButtonBase extends React.Component<
    DeletePokemonButtonProps,
    DeletePokemonButtonState
> {
    public static defaultProps = {
        confirmation: true,
    };

    public state = { dialogOn: false };

    public toggleDialog = () => {
        this.setState({ dialogOn: !this.state.dialogOn });
    };

    public render() {
        return (
            <div className={DeletePokemonButtonContainer}>
                <Dialog
                    isOpen={this.state.dialogOn && this.props.confirmation}
                    onClose={this.toggleDialog}
                    title="Delete Pokemon"
                    icon={<Icon icon="trash" />}
                    footer={
                        <>
                            <Button onClick={this.toggleDialog}>Cancel</Button>
                            <Button
                                intent={Intent.DANGER}
                                onClick={(_e) => {
                                    if (this.props.id) {
                                        this.props.deletePokemon(this.props.id);
                                    }
                                    this.toggleDialog();
                                }}
                            >
                                Delete Pokemon
                            </Button>
                        </>
                    }
                >
                    <p>
                        This will delete the currently selected Pokemon. Are you
                        sure you want to do that?
                    </p>

                    <Checkbox
                        onChange={(checked) =>
                            this.props.modifyDeletionConfirmation &&
                            this.props.modifyDeletionConfirmation(!checked)
                        }
                        label="Don't Ask Me For Confirmation Again"
                    />
                </Dialog>
                <Tooltip
                    content={`Delete Pok${accentedE}mon`}
                    position="top"
                >
                    <span
                        onClick={(_e) => {
                            if (this.props.confirmation) {
                                this.toggleDialog();
                            } else {
                                if (this.props.deletePokemon && this.props.id) {
                                    this.props.deletePokemon(this.props.id);
                                }
                            }
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <Icon
                            icon="trash"
                            aria-label="Delete Pokemon"
                        />
                    </span>
                </Tooltip>
            </div>
        );
    }
}

export const DeletePokemonButton = connect(
    (state: State) => ({
        confirmation: state.confirmDeletion,
    }),
    {
        deletePokemon,
        modifyDeletionConfirmation,
    },
)(DeletePokemonButtonBase);
