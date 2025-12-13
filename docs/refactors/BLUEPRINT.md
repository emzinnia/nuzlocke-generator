# Blueprint.js Migration - Complete

## Overview

This document describes the complete migration from Blueprint.js to a custom Tailwind-based component library. The migration has been completed successfully with all Blueprint dependencies removed.

## What Was Removed

| Package | Version | Status |
|---------|---------|--------|
| @blueprintjs/core | 5.19.0 | Removed |
| @blueprintjs/icons | 5.9.0 | Removed |
| @blueprintjs/select | 5.3.20 | Removed |
| @blueprintjs/table | 5.3.14 | Removed |

## Custom Component Library

All Blueprint components have been replaced with custom Tailwind-based implementations located in `src/components/Common/ui/`.

### Component Mapping

| Blueprint Component | Custom Component | Location |
|---------------------|------------------|----------|
| Button | Button | `ui/Button.tsx` |
| ButtonGroup | ButtonGroup | `ui/ButtonGroup.tsx` |
| Dialog | Dialog, DialogBody, DialogFooter | `ui/Dialog.tsx` |
| Alert | Alert | `ui/Alert.tsx` |
| Menu, MenuItem | Menu, MenuItem | `ui/Menu.tsx` |
| ContextMenu | ContextMenu | `ui/ContextMenu.tsx` |
| Popover | Popover | `ui/Popover.tsx` |
| Tooltip | Tooltip | `ui/Tooltip.tsx` |
| Checkbox | Checkbox | `ui/Checkbox.tsx` |
| Switch | Switch | `ui/Switch.tsx` |
| HTMLSelect | HTMLSelect, Select | `ui/HTMLSelect.tsx`, `ui/Select.tsx` |
| TagInput | TagInput | `ui/TagInput.tsx` |
| TextArea | TextArea | `ui/TextArea.tsx` |
| Slider | Slider | `ui/Slider.tsx` |
| Toaster/Toast | ToastProvider, useToast, toast | `ui/Toast.tsx` |
| Spinner | Spinner | `ui/Spinner.tsx` |
| Tag | Tag | `ui/Tag.tsx` |
| Drawer | Drawer | `ui/Drawer.tsx` |
| Icon | Icon | `ui/Icon.tsx` |
| Classes.* | Classes | `ui/classNames.ts` |
| Intent | Intent type | `ui/classNames.ts` |
| Position | Position | `ui/classNames.ts` |
| PopoverInteractionKind | PopoverInteractionKind | `ui/classNames.ts` |

### Icon Mapping

Blueprint icons have been replaced with Lucide React icons. The mapping is defined in `ui/Button.tsx`:

```typescript
const iconMap: Record<string, LucideIcon> = {
    add: Plus,
    download: Download,
    undo: Undo2,
    redo: Redo2,
    menu: Menu,
    cross: X,
    "eye-open": Eye,
    flash: Sun,
    moon: Moon,
    star: Star,
    minimize: Minimize2,
    maximize: Maximize2,
    trash: Trash2,
    duplicate: Copy,
    search: Search,
    "symbol-triangle-up": ChevronUp,
    "symbol-triangle-down": ChevronDown,
    upload: Upload,
    heart: Heart,
    "heart-broken": HeartCrack,
    cog: Settings,
    info: Info,
    warning: AlertTriangle,
    tick: Check,
    edit: Pencil,
    media: Image,
    "floppy-disk": Save,
    "folder-open": FolderOpen,
    plus: Plus,
    list: Menu,
    "info-sign": Info,
    "swap-horizontal": ArrowLeftRight,
    clipboard: Copy,
    crown: Crown,
    more: MoreVertical,
    "zoom-in": ZoomIn,
    "zoom-out": ZoomOut,
    "grid-view": LayoutGrid,
    link: Link,
};
```

### Intent Mapping

Blueprint's `Intent` enum has been replaced with variant props:

| Blueprint Intent | Custom Variant |
|------------------|----------------|
| Intent.NONE | `intent="none"` or `variant="secondary"` |
| Intent.PRIMARY | `intent="primary"` |
| Intent.SUCCESS | `intent="success"` |
| Intent.WARNING | `intent="warning"` |
| Intent.DANGER | `intent="danger"` |

### Classes Constants

Blueprint's `Classes` object is now available from `ui/classNames.ts`:

```typescript
import { Classes } from "components/Common/ui";

// Usage remains the same
className={Classes.INPUT}
className={Classes.LABEL}
```

## Benefits

1. **Bundle Size Reduction**: Blueprint core alone was ~500KB. The custom library uses only Tailwind utility classes.

2. **Consistency**: All components now follow the same Tailwind-based theming system with CSS variables.

3. **Dark Mode**: Unified dark mode support via Tailwind's `dark:` variants and the existing theme system.

4. **Customization**: Full control over component styling without fighting Blueprint's opinionated CSS.

5. **Maintainability**: No external UI library dependencies to update or worry about breaking changes.

## Usage

Import components from the UI library:

```typescript
import { 
    Button, 
    Dialog, 
    Popover, 
    Switch,
    useToast,
    Classes 
} from "components/Common/ui";
```

## Toast System

The toast system requires wrapping your app with `ToastProvider`:

```tsx
import { ToastProvider } from "components/Common/ui";

function App() {
    return (
        <ToastProvider>
            <YourApp />
        </ToastProvider>
    );
}
```

Then use the `useToast` hook or the global `toast` object:

```tsx
import { useToast, toast } from "components/Common/ui";

function MyComponent() {
    const toast = useToast();
    
    const handleClick = () => {
        toast.success("Operation completed!");
        toast.error("Something went wrong");
    };
}

// Or use the global toast (after ToastProvider is mounted)
toast.info("Hello world");
```

## Future Improvements

- Consider adding animation support via Framer Motion or CSS animations
- Add more specialized form components as needed
- Implement keyboard navigation for complex components (Menu, Select)

