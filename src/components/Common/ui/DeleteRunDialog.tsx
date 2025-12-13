import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogBody, DialogFooter } from "./Dialog";
import { Button } from "./Button";
import { Input } from "./Input";

interface DeleteRunDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    runName: string;
    isDeleting?: boolean;
}

export const DeleteRunDialog: React.FC<DeleteRunDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    runName,
    isDeleting = false,
}) => {
    const [confirmText, setConfirmText] = useState("");
    const isConfirmValid = confirmText === "DELETE";

    useEffect(() => {
        if (!isOpen) {
            setConfirmText("");
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isConfirmValid && !isDeleting) {
            onConfirm();
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Nuzlocke Run"
            icon={<AlertTriangle className="text-red-500" size={20} />}
        >
            <form onSubmit={handleSubmit}>
                <DialogBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                This action cannot be undone.
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                This will permanently delete{" "}
                                <span className="font-semibold text-foreground">
                                    {runName}
                                </span>{" "}
                                and all of its data, including all Pokémon, progress, and settings.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="delete-confirm"
                                className="text-sm text-muted-foreground"
                            >
                                Type{" "}
                                <span className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                                    DELETE
                                </span>{" "}
                                to confirm:
                            </label>
                            <Input
                                id="delete-confirm"
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="DELETE"
                                autoComplete="off"
                                autoFocus
                                className="font-mono"
                            />
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isConfirmValid || isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <svg
                                    className="animate-spin w-4 h-4"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <span>Deleting...</span>
                            </>
                        ) : (
                            "Delete Run"
                        )}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
};

