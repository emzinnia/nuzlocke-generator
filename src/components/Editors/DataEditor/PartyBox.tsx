import * as React from "react";

export interface PartyBoxProps {
    isDarkMode: boolean;
}

export function PartyBox({ isDarkMode }: PartyBoxProps) {
    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem 0.75rem",
                margin: "0.25rem",
                borderRadius: "0.25rem",
                border: `2px solid ${isDarkMode ? "#3dcc91" : "#0d8050"}`,
                background: isDarkMode
                    ? "linear-gradient(135deg, #1d7324 0%, #165a1c 100%)"
                    : "linear-gradient(135deg, #3dcc91 0%, #15b371 100%)",
                color: isDarkMode ? "#a7d5b8" : "#fff",
                cursor: "default",
                fontSize: "0.85rem",
                fontWeight: 600,
                minWidth: "4rem",
                textAlign: "center",
                boxShadow: isDarkMode
                    ? "0 2px 4px rgba(0, 0, 0, 0.3)"
                    : "0 2px 4px rgba(0, 0, 0, 0.15)",
            }}
            title="Party Pokémon from save file (always imported to Team)"
        >
            Party
        </div>
    );
}

