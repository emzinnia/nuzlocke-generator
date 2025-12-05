import * as React from "react";
import { Trash2 } from "lucide-react";

import { accentedE } from "utils";
import { Alert, Checkbox, Icon, Tooltip } from "components/Common/ui";
import { deletePokemonFromRun } from "api/runs";

export interface DeletePokemonButtonProps {
    pokemonId?: string;
    runId?: string;
    pokemonList?: { id: string }[];
    onDeleted?: () => void;
    confirmation?: boolean;
}

export function DeletePokemonButton({
    pokemonId,
    runId,
    pokemonList,
    onDeleted,
    confirmation = true,
}: DeletePokemonButtonProps) {
    const [dialogOn, setDialogOn] = React.useState(false);
    const [skipConfirmation, setSkipConfirmation] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const shouldConfirm = confirmation && !skipConfirmation;

    const toggleDialog = React.useCallback(() => {
        setDialogOn((prev) => !prev);
    }, []);

    const handleDelete = React.useCallback(async () => {
        if (!pokemonId || !runId || !pokemonList) return;

        setIsDeleting(true);
        try {
            await deletePokemonFromRun(runId, pokemonId, pokemonList);
            onDeleted?.();
        } catch (error) {
            console.error("Failed to delete pokemon:", error);
        } finally {
            setIsDeleting(false);
            setDialogOn(false);
        }
    }, [pokemonId, runId, pokemonList, onDeleted]);

    const handleClick = React.useCallback(() => {
        if (!pokemonId || !runId || !pokemonList) return;

        if (shouldConfirm) {
            toggleDialog();
        } else {
            handleDelete();
        }
    }, [pokemonId, runId, pokemonList, shouldConfirm, toggleDialog, handleDelete]);

    if (!pokemonId || !runId || !pokemonList) return null;

    return (
        <div className="text-red-500 cursor-pointer">
            <Alert
                isOpen={dialogOn}
                onCancel={toggleDialog}
                onConfirm={handleDelete}
                confirmButtonText={isDeleting ? "Deleting..." : "Delete Pokemon"}
                cancelButtonText="Cancel"
                intent="danger"
            >
                <p>
                    This will delete the currently selected Pokemon. Are you
                    sure you want to do that?
                </p>

                <Checkbox
                    label="Don't Ask Me For Confirmation Again"
                    onChange={(checked) => setSkipConfirmation(checked)}
                />
            </Alert>
            <Tooltip content={`Delete Pok${accentedE}mon`} position="top">
                <Icon
                    icon={Trash2}
                    onClick={handleClick}
                    title="Delete Pokemon"
                />
            </Tooltip>
        </div>
    );
}