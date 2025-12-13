import * as React from "react";
import { useSelector } from "react-redux";
import { Alert } from "components/Common/ui";
import { State } from "state";

export type WarningText = { warningText?: string };

interface DeleteAlertProps {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    warningText?: string;
}

export function DeleteAlert({
    warningText = "This will permanently delete all your local storage data, with no way to retrieve it. Are you sure you want to do this?",
    isOpen,
    onCancel,
    onConfirm,
}: DeleteAlertProps) {
    const style = useSelector<State, State["style"]>((state) => state.style);

    return (
        <Alert
            isOpen={isOpen}
            onCancel={onCancel}
            onConfirm={onConfirm}
            cancelButtonText="Nevermind"
            confirmButtonText="Delete Anyway"
            intent="danger"
        >
            <div style={{ display: "flex" }}>
                <img
                    style={{ height: "10rem" }}
                    src={"/assets/img/trash.png"}
                    alt="Sad Trubbish"
                />
                <p style={{ fontSize: "1.2rem", padding: "1rem" }}>
                    {warningText}
                </p>
            </div>
        </Alert>
    );
}
