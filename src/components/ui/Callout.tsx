import * as React from "react";
import { Icon, type IconName } from "./Icon";
import { Intent } from "./intent";
import { Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

export interface CalloutProps {
    /** Callout title */
    title?: React.ReactNode;
    /** Callout content */
    children: React.ReactNode;
    /** Intent for styling */
    intent?: Intent;
    /** Icon (auto-determined by intent if not provided) */
    icon?: IconName | string | React.ReactNode;
    /** Minimal style (no background) */
    minimal?: boolean;
    /** Additional className */
    className?: string;
}

/**
 * Callout component for important messages.
 */
export const Callout: React.FC<CalloutProps> = ({
    title,
    children,
    intent = Intent.NONE,
    icon,
    minimal = false,
    className = "",
}) => {
    // Default icons for each intent
    const defaultIcons: Record<Intent, React.ReactNode> = {
        [Intent.NONE]: <Info size={20} />,
        [Intent.PRIMARY]: <Info size={20} />,
        [Intent.SUCCESS]: <CheckCircle size={20} />,
        [Intent.WARNING]: <AlertTriangle size={20} />,
        [Intent.DANGER]: <AlertCircle size={20} />,
    };

    const bgClasses = {
        [Intent.NONE]: "bg-slate-100 dark:bg-slate-800",
        [Intent.PRIMARY]: "bg-primary-50 dark:bg-primary-900/30",
        [Intent.SUCCESS]: "bg-success-50 dark:bg-success-900/30",
        [Intent.WARNING]: "bg-warning-50 dark:bg-warning-900/30",
        [Intent.DANGER]: "bg-danger-50 dark:bg-danger-900/30",
    };

    const borderClasses = {
        [Intent.NONE]: "border-slate-200 dark:border-slate-700",
        [Intent.PRIMARY]: "border-primary-200 dark:border-primary-800",
        [Intent.SUCCESS]: "border-success-200 dark:border-success-800",
        [Intent.WARNING]: "border-warning-200 dark:border-warning-800",
        [Intent.DANGER]: "border-danger-200 dark:border-danger-800",
    };

    const textClasses = {
        [Intent.NONE]: "text-fg-primary",
        [Intent.PRIMARY]: "text-primary-700 dark:text-primary-300",
        [Intent.SUCCESS]: "text-success-700 dark:text-success-300",
        [Intent.WARNING]: "text-warning-700 dark:text-warning-300",
        [Intent.DANGER]: "text-danger-700 dark:text-danger-300",
    };

    const resolvedIcon =
        icon === undefined
            ? defaultIcons[intent]
            : typeof icon === "string"
              ? <Icon icon={icon} size={20} />
              : icon;

    return (
        <div
            className={`flex gap-3 rounded-lg border p-4 ${minimal ? "bg-transparent border-transparent" : `${bgClasses[intent]} ${borderClasses[intent]}`} ${className}`}
        >
            {resolvedIcon && (
                <span className={`flex-shrink-0 ${textClasses[intent]}`}>{resolvedIcon}</span>
            )}
            <div className="flex-1">
                {title && (
                    <h4 className={`mb-1 font-semibold ${textClasses[intent]}`}>{title}</h4>
                )}
                <div className={`text-sm ${textClasses[intent]}`}>{children}</div>
            </div>
        </div>
    );
};

export default Callout;

