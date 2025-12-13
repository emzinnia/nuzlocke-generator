import React from "react";
import { Settings, RotateCcw } from "lucide-react";
import { Dialog, DialogBody, DialogFooter } from "./Dialog";
import { Button } from "./Button";
import { useHotkeysStore, formatHotkey, type HotkeyBinding, type HotkeyAction } from "hooks/useHotkeys";

type SettingsCategoryId = "general" | "theming" | "hotkeys" | "rules" | "saves" | "plugins" | "beta";

type SettingsState = {
    autosave: boolean;
    encounterReminders: boolean;
    patchToast: boolean;
    theme: "system" | "light" | "dark";
};

type ToggleSetting = {
    id: string;
    label: string;
    description?: string;
    type: "toggle";
    stateKey: Extract<keyof SettingsState, "autosave" | "encounterReminders" | "patchToast">;
};

type SelectSetting<Option extends string> = {
    id: string;
    label: string;
    description?: string;
    type: "select";
    stateKey: Extract<keyof SettingsState, "theme">;
    options: { label: string; value: Option }[];
};

type SettingDefinition = ToggleSetting | SelectSetting<SettingsState["theme"]>;

type SettingsCategory = {
    id: SettingsCategoryId;
    label: string;
    settings: SettingDefinition[];
};

const settingsCategories: SettingsCategory[] = [
    {
        id: "general",
        label: "General",
        settings: [
            {
                id: "autosave",
                label: "Autosave every 5 minutes",
                type: "toggle",
                stateKey: "autosave",
            },
            {
                id: "encounterReminders",
                label: "Encounter reminders",
                type: "toggle",
                stateKey: "encounterReminders",
            },
            {
                id: "patchToast",
                label: "Patch success toast",
                type: "toggle",
                stateKey: "patchToast",
            },
        ],
    },
    {
        id: "theming",
        label: "Theming",
        settings: [
            {
                id: "theme",
                label: "Theme",
                type: "select",
                stateKey: "theme",
                options: [
                    { label: "System", value: "system" },
                    { label: "Light", value: "light" },
                    { label: "Dark", value: "dark" },
                ],
            },
        ],
    },
    { id: "hotkeys", label: "Hotkeys", settings: [] },
    { id: "rules", label: "Rules", settings: [] },
    { id: "saves", label: "Saves", settings: [] },
    { id: "plugins", label: "Plugins", settings: [] },
    { id: "beta", label: "Beta", settings: [] },
];

interface HotkeyInputProps {
    binding: HotkeyBinding;
    onUpdate: (key: string, modifiers: HotkeyBinding['modifiers']) => void;
}

const HotkeyInput: React.FC<HotkeyInputProps> = ({ binding, onUpdate }) => {
    const [isRecording, setIsRecording] = React.useState(false);
    const inputRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (!isRecording) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (e.key === 'Escape') {
                setIsRecording(false);
                return;
            }
            
            if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
                return;
            }

            onUpdate(e.key, {
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                meta: e.metaKey,
            });
            setIsRecording(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isRecording, onUpdate]);

    return (
        <button
            ref={inputRef}
            type="button"
            onClick={() => setIsRecording(true)}
            onBlur={() => setIsRecording(false)}
            className={`px-3 py-1.5 text-sm font-mono rounded border transition-colors min-w-[100px] text-center ${
                isRecording
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted hover:bg-accent'
            }`}
        >
            {isRecording ? 'Press keys...' : formatHotkey(binding)}
        </button>
    );
};

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
    const [activeCategory, setActiveCategory] = React.useState<SettingsCategoryId>("general");
    const [settings, setSettings] = React.useState<SettingsState>({
        autosave: true,
        encounterReminders: true,
        patchToast: false,
        theme: "system",
    });

    React.useEffect(() => {
        if (isOpen) {
            setActiveCategory("general");
        }
    }, [isOpen]);

    const handleToggle = (stateKey: ToggleSetting["stateKey"]) => {
        setSettings((prev) => ({
            ...prev,
            [stateKey]: !prev[stateKey],
        }));
    };

    const handleSelect = (stateKey: SelectSetting<SettingsState["theme"]>["stateKey"], value: SettingsState["theme"]) => {
        setSettings((prev) => ({
            ...prev,
            [stateKey]: value,
        }));
    };

    const renderSettingControl = (setting: SettingDefinition) => {
        if (setting.type === "toggle") {
            return (
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={settings[setting.stateKey]}
                        onChange={() => handleToggle(setting.stateKey)}
                    />
                    {setting.label}
                </label>
            );
        }

        return (
            <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{setting.label}</p>
                <div className="flex items-center text-sm">
                    {setting.options.map((option) => (
                        <label key={option.value} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name={setting.id}
                                value={option.value}
                                checked={settings[setting.stateKey] === option.value}
                                onChange={() => handleSelect(setting.stateKey, option.value)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    const hotkeyBindings = useHotkeysStore((state) => state.bindings);
    const updateBinding = useHotkeysStore((state) => state.updateBinding);
    const resetToDefaults = useHotkeysStore((state) => state.resetToDefaults);

    const renderHotkeysContent = () => {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Click on a shortcut to change it. Press Escape to cancel.
                    </p>
                    <Button
                        variant="ghost"
                        onClick={resetToDefaults}
                        className="text-xs px-2 py-1 h-auto gap-1"
                    >
                        <RotateCcw size={12} />
                        Reset
                    </Button>
                </div>
                <div className="space-y-2">
                    {hotkeyBindings.map((binding) => (
                        <div
                            key={binding.action}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                            <span className="text-sm">{binding.label}</span>
                            <HotkeyInput
                                binding={binding}
                                onUpdate={(key, modifiers) => updateBinding(binding.action, key, modifiers)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSettingsContent = () => {
        if (activeCategory === "hotkeys") {
            return renderHotkeysContent();
        }

        const category = settingsCategories.find((item) => item.id === activeCategory);

        if (!category) {
            return <div className="text-sm text-muted-foreground">Settings are unavailable.</div>;
        }

        if (category.settings.length === 0) {
            return (
                <div className="text-sm text-muted-foreground">
                    {`${category.label} settings are coming soon.`}
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {category.settings.map((setting) => (
                    <div key={setting.id} className="space-y-1">
                        {renderSettingControl(setting)}
                        {setting.description && (
                            <p className="text-xs text-muted-foreground">{setting.description}</p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Settings"
            icon={<Settings size={18} />}
            className="max-w-3xl w-full"
        >
            <DialogBody className="flex flex-row items-start">
                <div className="border border-border rounded-md p-2 space-y-1 bg-muted/40">
                    {settingsCategories.map((category) => {
                        const isActive = category.id === activeCategory;
                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setActiveCategory(category.id)}
                                className={`w-full text-left px-2.5 py-2 text-sm rounded-md transition-colors border ${
                                    isActive
                                        ? "bg-accent text-accent-foreground border-border font-medium"
                                        : "border-transparent hover:bg-muted"
                                }`}
                            >
                                {category.label}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-3 p-4 w-full text-sm">{renderSettingsContent()}</div>
            </DialogBody>
            <DialogFooter>
                <Button
                    onClick={onClose}
                    variant="secondary"
                    className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
                >
                    Close
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

