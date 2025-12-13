import * as React from "react";
import { connect } from "react-redux";
import { HTMLSelect } from "components/Common/ui";

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
        options={listOfThemes}
    />
);

export const ThemeSelect = connect(null, { onChange: editStyle })(
    ThemeSelectBase,
);
