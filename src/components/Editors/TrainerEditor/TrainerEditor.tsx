/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
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
