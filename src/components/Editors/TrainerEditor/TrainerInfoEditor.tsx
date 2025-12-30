import * as React from "react";

import { BadgeInput } from "./BadgeInput";
import { Input, Label } from "components/ui";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import { editTrainer } from "actions";

export function TrainerInfoEditor() {
    const trainer = useSelector<State, State["trainer"]>((state) => state.trainer);
    const dispatch = useDispatch();

    return (
        <div className="grid grid-cols-2 gap-1">
            <div className="col-span-2">
                <Label className="text-xs mb-1">Trainer Name</Label>
                <Input
                    value={trainer.name}
                    onChange={(e) => dispatch(editTrainer({ name: e.target.value }))}
                    placeholder="Trainer Name"
                    small
                    fill
                />
            </div>

            <div>
                <Label className="text-xs mb-1">ID</Label>
                <Input
                    value={trainer.id?.toString() ?? ""}
                    onChange={(e) => dispatch(editTrainer({ id: e.target.value }))}
                    placeholder="Trainer ID"
                    small
                    fill
                />
            </div>

            <div>
                <Label className="text-xs mb-1">Time</Label>
                <Input
                    value={trainer.time ?? ""}
                    onChange={(e) => dispatch(editTrainer({ time: e.target.value }))}
                    placeholder="0:00"
                    small
                    fill
                />
            </div>

            <div>
                <Label className="text-xs mb-1">Money</Label>
                <Input
                    value={trainer.money ?? ""}
                    onChange={(e) => dispatch(editTrainer({ money: e.target.value }))}
                    placeholder="$0"
                    small
                    fill
                />
            </div>

            <div>
                <Label className="text-xs mb-1">Title</Label>
                <Input
                    value={trainer.title ?? ""}
                    onChange={(e) => dispatch(editTrainer({ title: e.target.value }))}
                    placeholder="Title"
                    small
                    fill
                />
            </div>

            <div className="col-span-2">
                <Label className="text-xs mb-1">Image URL</Label>
                <Input
                    value={trainer.image ?? ""}
                    onChange={(e) => dispatch(editTrainer({ image: e.target.value }))}
                    placeholder="http://..."
                    small
                    fill
                />
            </div>

            <div className="col-span-2">
                <Label className="text-xs mb-1">Notes</Label>
                <Input
                    value={trainer.notes ?? ""}
                    onChange={(e) => dispatch(editTrainer({ notes: e.target.value }))}
                    placeholder="Notes"
                    small
                    fill
                />
            </div>

            <div className="col-span-2">
                <BadgeInput />
            </div>

        </div>
    );
}
