/**
 * Internal UI Library
 *
 * Replaces BlueprintJS with Base UI primitives + Tailwind styling.
 * Components follow Blueprint API patterns for easier migration.
 */

// Core primitives
export { Button, type ButtonProps } from "./Button";
export { ButtonGroup, type ButtonGroupProps } from "./ButtonGroup";
export { Dialog, DialogBody, DialogFooter, type DialogProps } from "./Dialog";
export { Popover, type PopoverProps, type PopoverPosition } from "./Popover";
export { Tooltip, type TooltipProps, type TooltipPosition } from "./Tooltip";
export { Menu, MenuItem, MenuDivider, type MenuProps, type MenuItemProps } from "./Menu";

// Form controls
export { Input, type InputProps } from "./Input";
export { TextArea, type TextAreaProps } from "./TextArea";
export { NumericInput, type NumericInputProps } from "./NumericInput";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { Switch, type SwitchProps } from "./Switch";
export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from "./Radio";
export { Select, type SelectProps, type SelectOption } from "./Select";
export { Slider, type SliderProps } from "./Slider";
export { TagInput, Tag, type TagInputProps, type TagProps } from "./TagInput";

// Navigation & layout
export { Tabs, Tab, type TabsProps, type TabProps } from "./Tabs";
export { Card, type CardProps, type Elevation } from "./Card";

// Feedback
export { Spinner, type SpinnerProps } from "./Spinner";
export { Callout, type CalloutProps } from "./Callout";
export { Toast, Toaster, useToast, type ToastProps, type ToasterProps } from "./Toast";

// Icons
export { Icon, type IconProps, type IconName } from "./Icon";

// Intents (Blueprint compatibility)
export { Intent, intentToBgClass, intentToOutlineClass, intentToTextClass } from "./intent";

// Table components
export {
    Table,
    Column,
    Cell,
    EditableCell,
    JSONFormat,
    type TableProps,
    type CellRenderer,
} from "./Table";
