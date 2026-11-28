import * as React from "react";
import { useDrag } from "react-dnd";
import { BoxMapping } from "parsers/utils/boxMappings";

export const SAVE_BOX_DRAG_TYPE = "SAVE_BOX";

export interface DraggableBoxProps {
    box: BoxMapping;
    isDarkMode: boolean;
}

export function DraggableBox({ box, isDarkMode }: DraggableBoxProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: SAVE_BOX_DRAG_TYPE,
        item: { key: box.key },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [box.key]);

    const displayName = box.name || `Box ${box.key}`;

    return (
        <div
            ref={drag}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem 0.75rem",
                margin: "0.25rem",
                borderRadius: "0.25rem",
                border: `2px solid ${isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)"}`,
                background: isDarkMode
                    ? "linear-gradient(135deg, #3a3f47 0%, #2d3138 100%)"
                    : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
                cursor: "grab",
                opacity: isDragging ? 0.5 : 1,
                fontSize: "0.85rem",
                fontWeight: 500,
                minWidth: "4rem",
                textAlign: "center",
                boxShadow: isDarkMode
                    ? "0 2px 4px rgba(0, 0, 0, 0.3)"
                    : "0 2px 4px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
            title={`Drag to change status for ${displayName}`}
        >
            {displayName}
        </div>
    );
}

