import * as React from "react";
import { useSelector } from "react-redux";
import { Alert, Intent, AlertProps, Classes } from "components/ui/shims";
import { State } from "state";

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
            className="max-w-[600px]"
            intent={Intent.DANGER}
            {...props}
        >
            <div className="flex">
                <img
                    className="h-[10rem]"
                    src={"./assets/img/trash.png"}
                    alt="Sad Trubbish"
                />
                <p className="text-lg p-4">
                    {warningText}
                </p>
            </div>
        </Alert>
    );
}
