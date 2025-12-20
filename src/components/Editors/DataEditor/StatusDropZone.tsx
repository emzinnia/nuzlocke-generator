import * as React from "react";
import { useDrop } from "react-dnd";
import { BoxMapping } from "parsers/utils/boxMappings";
import { DraggableBox, SAVE_BOX_DRAG_TYPE } from "./DraggableBox";
import { PartyBox } from "./PartyBox";

export interface StatusDropZoneProps {
    statusName: string;
    boxes: BoxMapping[];
    isDarkMode: boolean;
    onDrop: (boxKey: number, newStatus: string) => void;
    showPartyBox?: boolean;
}

export function StatusDropZone({
    statusName,
    boxes,
    isDarkMode,
    onDrop,
    showPartyBox = false,
}: StatusDropZoneProps) {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: SAVE_BOX_DRAG_TYPE,
        drop: (item: { key: number }) => {
            onDrop(item.key, statusName);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [statusName, onDrop]);

    const isActive = isOver && canDrop;

    return (
        <div
            ref={drop}
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                borderRadius: "0.375rem",
                border: `2px ${isActive ? "solid" : "dashed"} ${
                    isActive
                        ? isDarkMode ? "#48aff0" : "#137cbd"
                        : isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)"
                }`,
                background: isActive
                    ? isDarkMode
                        ? "rgba(72, 175, 240, 0.15)"
                        : "rgba(19, 124, 189, 0.1)"
                    : isDarkMode
                        ? "rgba(255, 255, 255, 0.03)"
                        : "rgba(0, 0, 0, 0.02)",
                minHeight: "3.5rem",
                transition: "border-color 0.15s ease, background 0.15s ease",
            }}
        >
            <div
                style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    minWidth: "5rem",
                    color: isDarkMode ? "#bfccd6" : "#5c7080",
                }}
            >
                {statusName}
            </div>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    flex: 1,
                    minHeight: "2rem",
                }}
            >
                {showPartyBox && <PartyBox isDarkMode={isDarkMode} />}
                {boxes.length === 0 && !showPartyBox ? (
                    <span
                        style={{
                            color: isDarkMode ? "#5c7080" : "#a7b6c2",
                            fontStyle: "italic",
                            fontSize: "0.85rem",
                        }}
                    >
                        Drop boxes here
                    </span>
                ) : (
                    boxes.map((box) => (
                        <DraggableBox
                            key={box.key}
                            box={box}
                            isDarkMode={isDarkMode}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

