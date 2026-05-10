import * as React from "react";
import { useSelector } from "store/reactZustand";
import { State } from "state";
import { getContrastColor } from "utils";

export function TrainerNotes() {
    const style = useSelector<State, State["style"]>((state) => state.style);
    const trainer = useSelector<State, State["trainer"]>(
        (state) => state.trainer,
    );
    const bgColor = style ? style.bgColor : "#383840";

    return trainer && trainer.notes ? (
        <div
            style={{ color: getContrastColor(bgColor) }}
            className="result-notes"
        >
            {trainer.notes}
        </div>
    ) : null;
}
