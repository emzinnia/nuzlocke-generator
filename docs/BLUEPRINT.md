# Blueprint Decommission Checklist

Goal: remove all BlueprintJS dependencies and ship an internal UI library with equivalent components.

## VERY Important Notes
- [ ] Use tailwind for all Editor-facing elements -- remove @emotion and one-off css, use tailwind wherever possible.
- [ ] Do NOT touch the Result-based components (Result, TeamPokemon, etc). These components will all use CSS so that it can be easier for end-users to edit them.

## Foundations (build before swapping components)
- [ ] Design tokens: colors, spacing, radius, typography, elevation, focus ring, z-index, motion.
- [ ] Theme support: light/dark parity, no reliance on `.bp5-dark`.
- [ ] Icon strategy: internal SVG set and `<Icon>` wrapper; map legacy icon names to new glyphs.
- [ ] Layout primitives: Stack/Inline/Cluster helpers to replace ad-hoc `Classes.FILL/MINIMAL` spacing.
- [ ] Form field shell: label, helper text, error, required indicator, disabled/read-only states.

## Global teardown
- [ ] Drop `@blueprintjs/core`, `@blueprintjs/icons`, `@blueprintjs/select`, `@blueprintjs/table` from `package.json`/lockfiles.
- [ ] Remove global Blueprint CSS imports in `src/index.tsx` (`blueprint.css`, `blueprint-icons.css`, `table.css`, `blueprint-select.css`).
- [ ] Replace usages of Blueprint theme classes (`Classes.*`, `"bp5-dark"`) with internal tokens/utilities.
- [ ] Rewrite or delete `src/components/__tests__/blueprint-components.test.tsx` (and any Blueprint test harnesses).

## Components to replace with internal UI
### Overlays & feedback
- [ ] Dialog (incl. `DialogProps`), Alert, Drawer/DrawerSize, Callout, Toaster/OverlayToaster/Toast/ToastProps.
- [ ] Popover, PopoverInteractionKind, Tooltip, Position.
- [ ] Spinner, NonIdealState, H4.

### Buttons, menus, intents
- [ ] Button, ButtonGroup (incl. minimal/anchor variants), Intent tokens.
- [ ] Menu, MenuItem.

### Form and input controls
- [ ] InputGroup, TextArea, NumericInput.
- [ ] Checkbox, Switch, Radio, RadioGroup.
- [ ] HTMLSelect, TagInput, Tag.
- [ ] Slider.
- [ ] Classes helpers for form styling (e.g., `Classes.INPUT`, `Classes.FILL`, `Classes.CONTROL`).

### Navigation & surfaces
- [ ] Tabs, Tab.
- [ ] Card, Elevation.
- [ ] Tree, TreeNodeInfo.

### Data display & pickers
- [ ] `@blueprintjs/table`: Table, Column, Cell, EditableCell, JSONFormat.
- [ ] `@blueprintjs/select`: Select component (zoom selector in `Result`) and its CSS.
- [ ] Toast overlays and in-app toasters (`appToaster`) moved to internal implementation.

### Icons
- [ ] Icon, IconName and reliance on the Blueprint icon glyph set.

### Utility classes
- [ ] Classes constants (`DIALOG_BODY`, `DIALOG_FOOTER`, `MINIMAL`, `CHECKBOX`, etc.) replaced with internal classnames/styles.

## Feature touchpoints to audit (replace Blueprint usage)
- [ ] Global shell: `src/index.tsx` (CSS), `src/components/Layout/App/App.tsx`, `TopBar`, `DebugDialog`.
- [ ] Shared primitives: `appToaster`, `SuspenseBoundary`, `Skeletons`, `ShapeInput`, `ThemeSelect`, `ColorEdit`, `ImageUpload`, `ImagesDrawer`, `DexieImagePickerPopover`, `PokemonByFilter`, `PokemonImage`, `ReleaseDialog`.
- [ ] Features: `Result`/`Result2`, `Credits`, `Hotkeys`, `BugReporter`, `ThemeSelect`, `HotkeysEditor`.
- [ ] Pokemon UI: `AddPokemonButton`, `DeletePokemonButton`, `Box`, `BoxForm`, `TeamPokemon` friendship icon, `PokemonLocationChecklist`, `CurrentPokemon*` editors.
- [ ] Editors: `TypeMatchupDialog`, `TypeMatchupSummary`, `MoveEditor` (and `TypesEditor`), `GameEditor`, `DataEditor` (and `AdvancedImportOptions`), `RulesEditor`, `StyleEditor`, `ThemeEditor`, `TrainerEditor` (BadgeInput, CheckpointsEditor, TrainerInfoEditor), `StatsEditor`, `SavesEditor` (`NuzlockeSave`, `HallOfFameDialog`, `NuzlockeGameTags`), `Editor` shell (`EditorControls`, `HistoryPanel`), `PokemonEditor` suite, `MassEditor`/`MassEditorTable`.
- [ ] Tests/tools: `src/components/__tests__/blueprint-components.test.tsx` and any Blueprint harness.

## Migration plan (phased)
- [ ] Phase 0: land tokens + icon set + basic primitives (Button, Input, Popover, Dialog shell) behind an `internal-ui` package/alias.
- [ ] Phase 1: swap global CSS imports for internal base styles; add shims so legacy props keep working short-term.
- [ ] Phase 2: migrate high-usage primitives (Button, Dialog, Popover/Tooltip, Form fields); update callsites and remove `Classes.*`.
- [ ] Phase 3: replace data-heavy components (Table, Select) and toaster; delete Blueprint deps from `package.json`.
- [ ] Phase 4: cleanup: remove shims, dead CSS, and Blueprint-specific tests; add visual regression coverage for new UI.

## Acceptance, QA, and checks
- [ ] No remaining imports from `@blueprintjs/*` in `src/` and tests.
- [ ] Story/preview coverage for each internal component (happy, disabled, error, loading, focus-visible).
- [ ] A11y: keyboard focus traps for dialogs/drawers, ARIA labels for inputs/buttons, tooltip semantics, prefers-reduced-motion respected.
- [ ] Visual: light/dark parity and theming for all migrated surfaces; no Blueprint CSS in bundles (verify via built CSS search).
- [ ] Regression: core flows (editor, import/export, result view, hotkeys) exercised with internal components.

## Definition of done
- [ ] All checkboxes above are satisfied; Blueprint packages and CSS are removed.
- [ ] Internal UI components exist for every replaced Blueprint primitive; app compiles with no Blueprint imports.

