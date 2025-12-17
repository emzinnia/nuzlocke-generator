import * as React from "react";

import { BadgeInput } from "./BadgeInput";
import {
    Popover,
    PopoverInteractionKind,
    Position,
    Menu,
    Icon,
} from "@blueprintjs/core";
import { listOfTrainers } from "utils";
import { TrainerInfoEditField } from "./TrainerInfoEditField";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";
import { editTrainer } from "actions";

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

const SpanBlock = ({ text }: { text: string }) => (
    <span
        style={{
            background: "rgba(0, 0, 0, 0.1)",
            display: "inline-block",
            padding: "0 3px",
            margin: "2px",
            borderRadius: ".25rem",
        }}
    >
        {text}
    </span>
);

export function TrainerInfoEditor() {
    const trainer = useSelector<State, State["trainer"]>(
        (state) => state.trainer,
    );
    const dispatch = useDispatch();

    return (
        <div className="trainer-info-editor">
            <TrainerInfoEditField
                onEdit={(e) => dispatch(editTrainer({ name: e.target.value }))}
                value={trainer.name}
                label="Trainer Name"
                name="name"
                placeholder="Trainer Name"
            />
            <TrainerInfoEditField
                onEdit={(e) => dispatch(editTrainer({ id: e.target.value }))}
                value={trainer.id?.toString()}
                label="ID"
                name="id"
                placeholder="Trainer ID"
            />
            <TrainerInfoEditField
                onEdit={(e) => dispatch(editTrainer({ time: e.target.value }))}
                value={trainer.time}
                label="Time"
                name="time"
                placeholder="0:00"
            />
            <TrainerInfoEditField
                onEdit={(e) => dispatch(editTrainer({ money: e.target.value }))}
                value={trainer.money}
                label="Money"
                name="money"
                placeholder="$0"
            />
            <TrainerInfoEditField
                onEdit={(e) => dispatch(editTrainer({ title: e.target.value }))}
                value={trainer.title}
                label="Title"
                name="title"
                placeholder=""
            />
            <BadgeInput />
            <TrainerInfoEditField
                onEdit={(e) => dispatch(editTrainer({ image: e.target.value }))}
                value={trainer.image}
                label={
                    <Popover
                        minimal={true}
                        interactionKind={PopoverInteractionKind.HOVER}
                        position={Position.BOTTOM}
                        content={
                            <Menu style={{ width: "10rem" }}>
                                Type: image url. You can also use these keywords{" "}
                                {listOfTrainers.map((t) => (
                                    <SpanBlock key={t} text={capitalize(t)} />
                                ))}
                            </Menu>
                        }
                    >
                        <span>
                            Trainer Image <Icon style={{ verticalAlign: "top" }} size={12} icon="info-sign" />
                        </span>
                    </Popover>
                }
                name="image"
                placeholder="http://..."
            />
            <TrainerInfoEditField
                onEdit={(e) => dispatch(editTrainer({ notes: e.target.value }))}
                value={trainer.notes}
                label="Notes"
                name="notes"
                placeholder=""
            />
        </div>
    );
}
