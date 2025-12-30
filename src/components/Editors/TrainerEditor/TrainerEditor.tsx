import React from "react";
import { TrainerInfoEditor } from "./TrainerInfoEditor";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";

export function TrainerEditor() {
    return (
        <BaseEditor icon="person" name="Trainer">
            <TrainerInfoEditor />
        </BaseEditor>
    );
}
