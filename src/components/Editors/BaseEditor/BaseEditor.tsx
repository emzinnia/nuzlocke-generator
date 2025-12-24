import { Icon, type IconName } from "components/ui";
import { setBaseEditorState } from "actions";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "state";

export interface BaseEditorProps {
    name: string;
    icon?: IconName | string;
    defaultOpen?: boolean;
    children?: React.ReactNode;
    id?: string;
}

const toSlug = (value: string) => value.toLowerCase().replace(/\s/g, "-");

export function BaseEditor({
    name,
    icon,
    defaultOpen = true,
    children,
    id,
}: BaseEditorProps) {
    const dispatch = useDispatch();
    const baseEditors = useSelector(
        (state: State) => state.editor.baseEditors ?? {},
    );

    const storageKey = React.useMemo(() => id ?? toSlug(name), [id, name]);
    const isOpen = baseEditors[storageKey] ?? defaultOpen;

    const toggleEditor = React.useCallback(() => {
        dispatch(setBaseEditorState(storageKey, !isOpen));
    }, [dispatch, storageKey, isOpen]);

    return (
        <div
            data-testid="base-editor"
            className={`${toSlug(name)}-editor p-1 bg-background-secondary rounded`}
        >
            <h4
                title={`${isOpen ? "Collapse" : "Open"} this editor.`}
                className="font-bold flex content-center justify-between m-1 mb-2 cursor-pointer text-base"
                onClick={toggleEditor}
            >
                <Icon icon={icon} />
                <span>
                    {name}
                </span>
                <Icon icon={isOpen ? "caret-up" : "caret-down"} />
            </h4>
            {isOpen ? children : null}
        </div>
    );
}
