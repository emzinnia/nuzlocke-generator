/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-function-type */
import * as React from "react";
import { connect } from "react-redux";
import { HTMLSelect } from "components/ui/shims";

import { listOfThemes } from "utils";
import { editStyle } from "actions";

export interface ThemeSelectProps {
    theme: string;
    onChange?: Function;
}

export const ThemeSelectBase = ({ theme, onChange }) => (
    <HTMLSelect
        value={theme}
        onChange={(e) => onChange({ template: e.target.value })}
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
