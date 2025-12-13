export const Classes = {
    DARK: "dark",
    LABEL: "text-sm font-medium text-foreground",
    INPUT: "px-2 py-1.5 text-sm border border-border bg-input text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring",
    FILL: "w-full",
    INLINE: "inline-flex items-center gap-2",
    MINIMAL: "bg-transparent border-transparent hover:bg-muted",
    DISABLED: "opacity-50 cursor-not-allowed",
    TEXT_MUTED: "text-muted-foreground",
    CONTROL: "flex items-center gap-2 cursor-pointer",
    CHECKBOX: "",
    CONTROL_INDICATOR: "w-4 h-4 border border-border rounded bg-input",
    BUTTON: "inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-border bg-card hover:bg-muted cursor-pointer transition-colors",
    DIALOG: "fixed inset-0 z-50 flex items-center justify-center",
    DIALOG_BODY: "px-5 py-4 overflow-y-auto flex-1",
    DIALOG_FOOTER: "px-5 py-4 border-t border-border flex justify-end gap-3",
    FILE_INPUT: "block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer",
} as const;

export type Intent = "primary" | "success" | "warning" | "danger" | "none";

export const Position = {
    TOP: "top" as const,
    TOP_LEFT: "top-start" as const,
    TOP_RIGHT: "top-end" as const,
    BOTTOM: "bottom" as const,
    BOTTOM_LEFT: "bottom-start" as const,
    BOTTOM_RIGHT: "bottom-end" as const,
    LEFT: "left" as const,
    RIGHT: "right" as const,
};

export const PopoverInteractionKind = {
    HOVER: "hover" as const,
    CLICK: "click" as const,
    CLICK_TARGET_ONLY: "click-target-only" as const,
};

