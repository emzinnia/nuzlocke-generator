import * as React from "react";
import { TrainerInfoEditor } from "./TrainerInfoEditor";
import { BaseEditor } from "components/Editors/BaseEditor/BaseEditor";

export class TrainerEditor extends React.Component<{}, {}> {
    public render() {
        return (
            <BaseEditor icon="person" name="Trainer">
                <TrainerInfoEditor />
            </BaseEditor>
        );
    }
}
