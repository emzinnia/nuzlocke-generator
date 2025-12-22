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
 * Maps Intent to Tailwind color classes for backgrounds.
 */
export const intentToBgClass: Record<Intent, string> = {
    [Intent.NONE]: "bg-bg-tertiary hover:bg-slate-200 dark:hover:bg-slate-600",
    [Intent.PRIMARY]: "bg-primary-500 hover:bg-primary-600 text-white",
    [Intent.SUCCESS]: "bg-success-500 hover:bg-success-600 text-white",
    [Intent.WARNING]: "bg-warning-500 hover:bg-warning-600 text-white",
    [Intent.DANGER]: "bg-danger-500 hover:bg-danger-600 text-white",
};

/**
 * Maps Intent to Tailwind color classes for outlined/minimal variants.
 */
export const intentToOutlineClass: Record<Intent, string> = {
    [Intent.NONE]: "border-border text-fg-primary hover:bg-slate-100 dark:hover:bg-slate-700",
    [Intent.PRIMARY]: "border-primary-500 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30",
    [Intent.SUCCESS]: "border-success-500 text-success-600 hover:bg-success-50 dark:text-success-400 dark:hover:bg-success-900/30",
    [Intent.WARNING]: "border-warning-500 text-warning-600 hover:bg-warning-50 dark:text-warning-400 dark:hover:bg-warning-900/30",
    [Intent.DANGER]: "border-danger-500 text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/30",
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

