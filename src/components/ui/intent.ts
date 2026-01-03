/**
 * Intent enum - matches Blueprint's Intent for easy migration.
 * Maps to semantic color tokens.
 */
export enum Intent {
    NONE = "none",
    PRIMARY = "primary",
    SUCCESS = "success",
    WARNING = "warning",
    DANGER = "danger",
}

/**
 * Maps Intent to Tailwind color classes for solid/filled buttons.
 * These are the main call-to-action buttons with full background color.
 */
export const intentToBgClass: Record<Intent, string> = {
    [Intent.NONE]: [
        "bg-slate-100 dark:bg-slate-700",
        "text-slate-900 dark:text-slate-100",
        "border border-slate-300 dark:border-slate-600",
        "hover:bg-slate-200 dark:hover:bg-slate-600",
        "active:bg-slate-300 dark:active:bg-slate-500",
    ].join(" "),
    [Intent.PRIMARY]: [
        "bg-primary-600 dark:bg-primary-500",
        "text-white",
        "border border-primary-700 dark:border-primary-600",
        "hover:bg-primary-700 dark:hover:bg-primary-600",
        "active:bg-primary-800 dark:active:bg-primary-700",
        "shadow-sm",
    ].join(" "),
    [Intent.SUCCESS]: [
        "bg-success-600 dark:bg-success-500",
        "text-white",
        "border border-success-700 dark:border-success-600",
        "hover:bg-success-700 dark:hover:bg-success-600",
        "active:bg-success-800 dark:active:bg-success-700",
        "shadow-sm",
    ].join(" "),
    [Intent.WARNING]: [
        "bg-warning-500 dark:bg-warning-400",
        "text-warning-900 dark:text-warning-900",
        "border border-warning-600 dark:border-warning-500",
        "hover:bg-warning-600 dark:hover:bg-warning-500",
        "active:bg-warning-700 dark:active:bg-warning-600",
        "shadow-sm",
    ].join(" "),
    [Intent.DANGER]: [
        "bg-danger-600 dark:bg-danger-500",
        "text-white",
        "border border-danger-700 dark:border-danger-600",
        "hover:bg-danger-700 dark:hover:bg-danger-600",
        "active:bg-danger-800 dark:active:bg-danger-700",
        "shadow-sm",
    ].join(" "),
};

/**
 * Maps Intent to Tailwind color classes for outlined buttons.
 * These have a visible border with transparent background that fills on hover.
 */
export const intentToOutlineClass: Record<Intent, string> = {
    [Intent.NONE]: [
        "bg-transparent",
        "text-slate-700 dark:text-slate-200",
        "border border-slate-300 dark:border-slate-600",
        "hover:bg-slate-100 dark:hover:bg-slate-700",
        "active:bg-slate-200 dark:active:bg-slate-600",
    ].join(" "),
    [Intent.PRIMARY]: [
        "bg-transparent",
        "text-primary-600 dark:text-primary-400",
        "border border-primary-500 dark:border-primary-400",
        "hover:bg-primary-50 dark:hover:bg-primary-900/30",
        "active:bg-primary-100 dark:active:bg-primary-900/50",
    ].join(" "),
    [Intent.SUCCESS]: [
        "bg-transparent",
        "text-success-600 dark:text-success-400",
        "border border-success-500 dark:border-success-400",
        "hover:bg-success-50 dark:hover:bg-success-900/30",
        "active:bg-success-100 dark:active:bg-success-900/50",
    ].join(" "),
    [Intent.WARNING]: [
        "bg-transparent",
        "text-warning-600 dark:text-warning-400",
        "border border-warning-500 dark:border-warning-400",
        "hover:bg-warning-50 dark:hover:bg-warning-900/30",
        "active:bg-warning-100 dark:active:bg-warning-900/50",
    ].join(" "),
    [Intent.DANGER]: [
        "bg-transparent",
        "text-danger-600 dark:text-danger-400",
        "border border-danger-500 dark:border-danger-400",
        "hover:bg-danger-50 dark:hover:bg-danger-900/30",
        "active:bg-danger-100 dark:active:bg-danger-900/50",
    ].join(" "),
};

/**
 * Maps Intent to Tailwind color classes for ghost/minimal buttons.
 * These have no border or background, just colored text with hover effect.
 */
export const intentToGhostClass: Record<Intent, string> = {
    [Intent.NONE]: [
        "bg-transparent",
        "text-slate-600 dark:text-slate-300",
        "hover:bg-slate-100 dark:hover:bg-slate-700/50",
        "active:bg-slate-200 dark:active:bg-slate-700",
    ].join(" "),
    [Intent.PRIMARY]: [
        "bg-transparent",
        "text-primary-600 dark:text-primary-400",
        "hover:bg-primary-50 dark:hover:bg-primary-900/30",
        "active:bg-primary-100 dark:active:bg-primary-900/50",
    ].join(" "),
    [Intent.SUCCESS]: [
        "bg-transparent",
        "text-success-600 dark:text-success-400",
        "hover:bg-success-50 dark:hover:bg-success-900/30",
        "active:bg-success-100 dark:active:bg-success-900/50",
    ].join(" "),
    [Intent.WARNING]: [
        "bg-transparent",
        "text-warning-600 dark:text-warning-400",
        "hover:bg-warning-50 dark:hover:bg-warning-900/30",
        "active:bg-warning-100 dark:active:bg-warning-900/50",
    ].join(" "),
    [Intent.DANGER]: [
        "bg-transparent",
        "text-danger-600 dark:text-danger-400",
        "hover:bg-danger-50 dark:hover:bg-danger-900/30",
        "active:bg-danger-100 dark:active:bg-danger-900/50",
    ].join(" "),
};

/**
 * Maps Intent to Tailwind color classes for link-style buttons.
 * These look like links with underline on hover.
 */
export const intentToLinkClass: Record<Intent, string> = {
    [Intent.NONE]: [
        "bg-transparent",
        "text-slate-600 dark:text-slate-300",
        "underline-offset-2",
        "hover:underline",
        "active:text-slate-800 dark:active:text-slate-100",
    ].join(" "),
    [Intent.PRIMARY]: [
        "bg-transparent",
        "text-primary-600 dark:text-primary-400",
        "underline-offset-2",
        "hover:underline",
        "active:text-primary-800 dark:active:text-primary-300",
    ].join(" "),
    [Intent.SUCCESS]: [
        "bg-transparent",
        "text-success-600 dark:text-success-400",
        "underline-offset-2",
        "hover:underline",
        "active:text-success-800 dark:active:text-success-300",
    ].join(" "),
    [Intent.WARNING]: [
        "bg-transparent",
        "text-warning-600 dark:text-warning-400",
        "underline-offset-2",
        "hover:underline",
        "active:text-warning-800 dark:active:text-warning-300",
    ].join(" "),
    [Intent.DANGER]: [
        "bg-transparent",
        "text-danger-600 dark:text-danger-400",
        "underline-offset-2",
        "hover:underline",
        "active:text-danger-800 dark:active:text-danger-300",
    ].join(" "),
};

/**
 * Maps Intent to Tailwind color classes for text color.
 */
export const intentToTextClass: Record<Intent, string> = {
    [Intent.NONE]: "text-fg-primary",
    [Intent.PRIMARY]: "text-primary-600 dark:text-primary-400",
    [Intent.SUCCESS]: "text-success-600 dark:text-success-400",
    [Intent.WARNING]: "text-warning-600 dark:text-warning-400",
    [Intent.DANGER]: "text-danger-600 dark:text-danger-400",
};

