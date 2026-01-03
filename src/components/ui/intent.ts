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
 *
 * Visual Design:
 * - NONE: Neutral gray for secondary actions
 * - PRIMARY: Blue for primary CTAs
 * - SUCCESS: Green for positive/confirm actions
 * - WARNING: Amber/yellow for caution actions
 * - DANGER: Red for destructive actions
 */
export const intentToBgClass: Record<Intent, string> = {
    [Intent.NONE]: [
        "bg-slate-100 dark:bg-slate-700",
        "text-slate-800 dark:text-slate-100",
        "border border-slate-300 dark:border-slate-500",
        "hover:bg-slate-200 dark:hover:bg-slate-600",
        "active:bg-slate-300 dark:active:bg-slate-500",
    ].join(" "),
    [Intent.PRIMARY]: [
        "bg-primary-600",
        "text-white",
        "border border-primary-600",
        "hover:bg-primary-700 hover:border-primary-700",
        "active:bg-primary-800 active:border-primary-800",
        "shadow-sm hover:shadow",
        "dark:bg-primary-500 dark:border-primary-500",
        "dark:hover:bg-primary-600 dark:hover:border-primary-600",
        "dark:active:bg-primary-700 dark:active:border-primary-700",
    ].join(" "),
    [Intent.SUCCESS]: [
        "bg-success-600",
        "text-white",
        "border border-success-600",
        "hover:bg-success-700 hover:border-success-700",
        "active:bg-success-800 active:border-success-800",
        "shadow-sm hover:shadow",
        "dark:bg-success-500 dark:border-success-500",
        "dark:hover:bg-success-600 dark:hover:border-success-600",
        "dark:active:bg-success-700 dark:active:border-success-700",
    ].join(" "),
    [Intent.WARNING]: [
        "bg-warning-500",
        "text-warning-950",
        "border border-warning-500",
        "hover:bg-warning-600 hover:border-warning-600",
        "active:bg-warning-700 active:border-warning-700",
        "shadow-sm hover:shadow",
        "dark:bg-warning-400 dark:border-warning-400 dark:text-warning-950",
        "dark:hover:bg-warning-500 dark:hover:border-warning-500",
        "dark:active:bg-warning-600 dark:active:border-warning-600",
    ].join(" "),
    [Intent.DANGER]: [
        "bg-danger-600",
        "text-white",
        "border border-danger-600",
        "hover:bg-danger-700 hover:border-danger-700",
        "active:bg-danger-800 active:border-danger-800",
        "shadow-sm hover:shadow",
        "dark:bg-danger-500 dark:border-danger-500",
        "dark:hover:bg-danger-600 dark:hover:border-danger-600",
        "dark:active:bg-danger-700 dark:active:border-danger-700",
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
        "border border-slate-300 dark:border-slate-500",
        "hover:bg-slate-50 dark:hover:bg-slate-800",
        "active:bg-slate-100 dark:active:bg-slate-700",
    ].join(" "),
    [Intent.PRIMARY]: [
        "bg-transparent",
        "text-primary-600 dark:text-primary-400",
        "border-2 border-primary-500 dark:border-primary-400",
        "hover:bg-primary-50 hover:border-primary-600 dark:hover:bg-primary-950 dark:hover:border-primary-300",
        "active:bg-primary-100 dark:active:bg-primary-900",
    ].join(" "),
    [Intent.SUCCESS]: [
        "bg-transparent",
        "text-success-600 dark:text-success-400",
        "border-2 border-success-500 dark:border-success-400",
        "hover:bg-success-50 hover:border-success-600 dark:hover:bg-success-950 dark:hover:border-success-300",
        "active:bg-success-100 dark:active:bg-success-900",
    ].join(" "),
    [Intent.WARNING]: [
        "bg-transparent",
        "text-warning-700 dark:text-warning-400",
        "border-2 border-warning-500 dark:border-warning-400",
        "hover:bg-warning-50 hover:border-warning-600 dark:hover:bg-warning-950 dark:hover:border-warning-300",
        "active:bg-warning-100 dark:active:bg-warning-900",
    ].join(" "),
    [Intent.DANGER]: [
        "bg-transparent",
        "text-danger-600 dark:text-danger-400",
        "border-2 border-danger-500 dark:border-danger-400",
        "hover:bg-danger-50 hover:border-danger-600 dark:hover:bg-danger-950 dark:hover:border-danger-300",
        "active:bg-danger-100 dark:active:bg-danger-900",
    ].join(" "),
};

/**
 * Maps Intent to Tailwind color classes for ghost/minimal buttons.
 * These have no border or background, just colored text with hover effect.
 * Ideal for secondary actions or icon-only buttons.
 */
export const intentToGhostClass: Record<Intent, string> = {
    [Intent.NONE]: [
        "bg-transparent",
        "text-slate-700 dark:text-slate-300",
        "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100",
        "active:bg-slate-200 dark:active:bg-slate-600",
    ].join(" "),
    [Intent.PRIMARY]: [
        "bg-transparent",
        "text-primary-600 dark:text-primary-400",
        "hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950 dark:hover:text-primary-300",
        "active:bg-primary-100 dark:active:bg-primary-900",
    ].join(" "),
    [Intent.SUCCESS]: [
        "bg-transparent",
        "text-success-600 dark:text-success-400",
        "hover:bg-success-50 hover:text-success-700 dark:hover:bg-success-950 dark:hover:text-success-300",
        "active:bg-success-100 dark:active:bg-success-900",
    ].join(" "),
    [Intent.WARNING]: [
        "bg-transparent",
        "text-warning-700 dark:text-warning-400",
        "hover:bg-warning-50 hover:text-warning-800 dark:hover:bg-warning-950 dark:hover:text-warning-300",
        "active:bg-warning-100 dark:active:bg-warning-900",
    ].join(" "),
    [Intent.DANGER]: [
        "bg-transparent",
        "text-danger-600 dark:text-danger-400",
        "hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-950 dark:hover:text-danger-300",
        "active:bg-danger-100 dark:active:bg-danger-900",
    ].join(" "),
};

/**
 * Maps Intent to Tailwind color classes for link-style buttons.
 * These look like links with underline on hover.
 * Ideal for inline actions or navigation-like buttons.
 */
export const intentToLinkClass: Record<Intent, string> = {
    [Intent.NONE]: [
        "bg-transparent p-0 h-auto",
        "text-slate-600 dark:text-slate-300",
        "underline-offset-4 decoration-slate-400 dark:decoration-slate-500",
        "hover:underline hover:text-slate-900 dark:hover:text-slate-100",
        "active:text-slate-800 dark:active:text-slate-200",
    ].join(" "),
    [Intent.PRIMARY]: [
        "bg-transparent p-0 h-auto",
        "text-primary-600 dark:text-primary-400",
        "underline-offset-4 decoration-primary-400 dark:decoration-primary-500",
        "hover:underline hover:text-primary-700 dark:hover:text-primary-300",
        "active:text-primary-800 dark:active:text-primary-200",
    ].join(" "),
    [Intent.SUCCESS]: [
        "bg-transparent p-0 h-auto",
        "text-success-600 dark:text-success-400",
        "underline-offset-4 decoration-success-400 dark:decoration-success-500",
        "hover:underline hover:text-success-700 dark:hover:text-success-300",
        "active:text-success-800 dark:active:text-success-200",
    ].join(" "),
    [Intent.WARNING]: [
        "bg-transparent p-0 h-auto",
        "text-warning-700 dark:text-warning-400",
        "underline-offset-4 decoration-warning-400 dark:decoration-warning-500",
        "hover:underline hover:text-warning-800 dark:hover:text-warning-300",
        "active:text-warning-900 dark:active:text-warning-200",
    ].join(" "),
    [Intent.DANGER]: [
        "bg-transparent p-0 h-auto",
        "text-danger-600 dark:text-danger-400",
        "underline-offset-4 decoration-danger-400 dark:decoration-danger-500",
        "hover:underline hover:text-danger-700 dark:hover:text-danger-300",
        "active:text-danger-800 dark:active:text-danger-200",
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

