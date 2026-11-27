import * as React from "react";
import { fireEvent, render, screen } from "utils/testUtils";
import { vi } from "vitest";
import { styleDefaults } from "utils/styleDefaults";
import { StatsEditorBase } from "../StatsEditor";
import { State } from "state";

const renderEditor = (stats: State["stats"]) => {
    const props = {
        pokemon: [],
        style: {
            ...styleDefaults,
            displayStats: true,
        },
        stats,
        editStyle: vi.fn(),
        addStat: vi.fn(),
        editStat: vi.fn(),
        deleteStat: vi.fn(),
    };

    render(<StatsEditorBase {...props} />);

    return props;
};

describe("StatsEditorBase", () => {
    it("edits blank imported custom stats as controlled inputs", () => {
        const props = renderEditor([{ id: "a-1", key: undefined, value: "" }]);

        fireEvent.change(screen.getByLabelText("custom stat label"), {
            target: { value: "Attempts" },
        });
        fireEvent.change(screen.getByLabelText("custom stat value"), {
            target: { value: "3" },
        });

        expect(props.editStat).toHaveBeenCalledWith("a-1", "Attempts", "");
        expect(props.editStat).toHaveBeenCalledWith("a-1", "", "3");
    });

    it("sorts custom stats for display without mutating the stats prop", () => {
        const stats = [
            { id: "b-stat", key: "Second", value: "2" },
            { id: "a-stat", key: "First", value: "1" },
        ];

        renderEditor(stats);

        expect(
            (screen.getAllByLabelText("custom stat label")[0] as HTMLInputElement)
                .value,
        ).toBe("First");
        expect(stats.map((stat) => stat.id)).toEqual(["b-stat", "a-stat"]);
    });
});
