import * as React from "react";
import { Trash2 } from "lucide-react";

import { deletePokemon, modifyDeletionConfirmation } from "actions";
import { accentedE } from "utils";
import { Alert, Checkbox, Icon, Tooltip } from "components/Common/ui";

export interface DeletePokemonButtonProps {
    id?: string;
    confirmation: boolean;
    modifyDeletionConfirmation: modifyDeletionConfirmation;
    deletePokemon: deletePokemon;
}

export function DeletePokemonButton(props: DeletePokemonButtonProps) {
    const [dialogOn, setDialogOn] = React.useState(false);

    const toggleDialog = React.useCallback(() => {
        setDialogOn((prev) => !prev);
    }, []);

    return (
        <div className="text-red-500 cursor-pointer">
            <Alert
                isOpen={dialogOn && props.confirmation}
                onCancel={toggleDialog}
                onConfirm={() => {
                    if (props.id) {
                        props.deletePokemon(props.id);
                    }
                    toggleDialog();
                }}
                confirmButtonText="Delete Pokemon"
                cancelButtonText="Cancel"
                intent="danger"
            >
                <p>
                    This will delete the currently selected Pokemon. Are you
                    sure you want to do that?
                </p>

                <Checkbox
                    label="Don't Ask Me For Confirmation Again"
                    onChange={(checked) =>
                        props.modifyDeletionConfirmation &&
                        props.modifyDeletionConfirmation(!checked)
                    }
                />
            </Alert>
            <Tooltip content={`Delete Pok${accentedE}mon`} position="top">
                <Icon
                    icon={Trash2}
                    onClick={() => {
                        if (props.confirmation) {
                            toggleDialog();
                        } else if (props.deletePokemon && props.id) {
                            props.deletePokemon(props.id);
                        }
                    }}
                    title="Delete Pokemon"
                />
            </Tooltip>
        </div>
    );
}