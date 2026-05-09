import * as React from "react";
import { connect } from "react-redux";
import { HTMLSelect } from "@blueprintjs/core";

import { listOfThemes } from "utils";
import { editStyle } from "actions";

export interface ThemeSelectProps {
    theme: string;
    onChange?: (style: { template: string }) => void;
}

export const ThemeSelectBase = ({ theme, onChange }: ThemeSelectProps) => (
    <HTMLSelect
        value={theme}
        onChange={(e) => onChange?.({ template: e.target.value })}
    >
        {listOfThemes.map((o) => (
            <option key={o} value={o}>
                {o}
            </option>
        ))}
    </HTMLSelect>
);

export const ThemeSelect = connect(null, { onChange: editStyle })(
    ThemeSelectBase,
);
