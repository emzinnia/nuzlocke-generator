import * as React from "react";
import { Button, ButtonGroup, Slider, Classes } from "@blueprintjs/core";
import { useSelector, useDispatch } from "store/reactZustand";
import { State } from "state";
import { editStyle } from "actions";
import { editorModeSelector } from "selectors";
import { cx } from "emotion";
import { useDebounceCallback } from "@react-hook/debounce";

const zoomLevelSelector = (state) => state.style.zoomLevel;

export function ZoomLevel() {
    const [zoomLevel, setZoomLevel] = React.useState(1);
    const styleZoomLevel = useSelector<State, number>(zoomLevelSelector);
    const darkMode = useSelector(editorModeSelector);
    const onChange = useDebounceCallback(
        () => dispatch(editStyle({ zoomLevel })),
        300,
    );
    const dispatch = useDispatch();

    React.useEffect(() => {
        setZoomLevel(styleZoomLevel);
    }, [styleZoomLevel]);

    //const setZoomLevel = (zoomLevel: number) => dispatch(editStyle({ zoomLevel }));

    return (
        <div className={cx("style-edit", darkMode && Classes.DARK)}>
            <ButtonGroup className={cx(darkMode && Classes.DARK)}>
                <Button
                    icon="zoom-out"
                    onClick={() => {
                        const newZoomLevel =
                            zoomLevel - 0.1 <= 0 ? 0 : zoomLevel - 0.1;
                        setZoomLevel(newZoomLevel);
                    }}
                />{" "}
                <Button style={{ padding: "0 1.25rem" }}>
                    <Slider
                        onRelease={(value) => setZoomLevel(value)}
                        onChange={onChange}
                        value={zoomLevel}
                        min={0.2}
                        max={2}
                        stepSize={0.1}
                    />
                </Button>
                <Button
                    icon="zoom-in"
                    onClick={() => {
                        const newZoomLevel =
                            zoomLevel + 0.1 >= 2 ? 2 : zoomLevel + 0.1;
                        setZoomLevel(newZoomLevel);
                    }}
                />
            </ButtonGroup>
        </div>
    );
}
