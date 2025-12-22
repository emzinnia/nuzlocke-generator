import * as React from "react";
import { Dialog, Tooltip, Icon, Button, Checkbox, Intent } from "components/ui";
import { css } from "emotion";

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

export class DeletePokemonButtonBase extends React.Component<
    DeletePokemonButtonProps,
    { dialogOn: boolean }
> {
    public constructor(props: DeletePokemonButtonProps) {
        super(props);
        this.state = {
            dialogOn: false,
        };
        this.toggleDialog = this.toggleDialog.bind(this);
    }

    private toggleDialog() {
        this.setState({
            dialogOn: !this.state.dialogOn,
        });
    }

    public render() {
        console.log(this.props.id);
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
    (state: Pick<State, keyof State>) => ({
        confirmation: state.confirmation,
    }),
    {
        deletePokemon,
        modifyDeletionConfirmation,
    },
)(DeletePokemonButtonBase);
