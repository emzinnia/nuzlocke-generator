import * as React from "react";
import { Button, ButtonGroup, Slider } from "components/ui";
import { useSelector, useDispatch } from "react-redux";
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
    const dispatch = useDispatch();
    const onChange = useDebounceCallback(
        () => dispatch(editStyle({ zoomLevel })),
        300,
    );

    React.useEffect(() => {
        setZoomLevel(styleZoomLevel);
    }, [styleZoomLevel]);

    return (
        <div className={cx("style-edit", darkMode && "dark")}>
            <ButtonGroup className={cx(darkMode && "dark")}>
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
                        onChange={(value) => {
                            setZoomLevel(value);
                            onChange();
                        }}
                        value={zoomLevel}
                        min={0.2}
                        max={2}
                        step={0.1}
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
