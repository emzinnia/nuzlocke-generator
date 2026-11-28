import * as React from "react";
import { NuzlockeSave } from "./NuzlockeSave";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";

export function NuzlockeSaveControls() {
    return (
        <BaseEditor name="Saves" icon="floppy-disk">
            <NuzlockeSave />
        </BaseEditor>
    );
}
