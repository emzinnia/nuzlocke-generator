import * as React from "react";
import { useSelector } from "react-redux";
import { Alert, Intent, AlertProps, Classes } from "components/ui/shims";
import { State } from "state";

// @TODO add back trubbish
export type WarningText = { warningText?: string };
export function DeleteAlert({
    warningText = "This will permanently delete all your local storage data, with no way to retrieve it. Are you sure you want to do this?",
    ...props
}: AlertProps & WarningText) {
    const style = useSelector<State, State["style"]>((state) => state.style);

    return (
        <Alert
            cancelButtonText="Nevermind"
            confirmButtonText="Delete Anyway"
            className={style.editorDarkMode ? Classes.DARK : ""}
            style={{ maxWidth: "600px" }}
            intent={Intent.DANGER}
            {...props}
        >
            <div style={{ display: "flex" }}>
                <img
                    style={{ height: "10rem" }}
                    src={"./assets/img/trash.png"}
                    alt="Sad Trubbish"
                />
                <p style={{ fontSize: "1.2rem", padding: "1rem" }}>
                    {warningText}
                </p>
            </div>
        </Alert>
    );
}
