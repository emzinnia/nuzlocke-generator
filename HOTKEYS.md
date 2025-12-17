## HOTKEYS

This document tracks **(1) where hotkeys are currently implemented**, **(2) which hotkeys are currently active**, and **(3) a backlog of additional hotkeys** we should add for power users.

### Notation
- **Mod** = `Ctrl` on Windows/Linux, `⌘` on macOS
- When we say “global”, we mean “works anywhere in the app unless focus is inside a text input”.

---

## Current hotkey plumbing (where listeners exist)

- [x] **Global hotkeys (keyup-based, ignores inputs)** via `components/Features/Hotkeys/Hotkeys.tsx` (mounted in `components/Layout/App/App.tsx`)
  - Notes:
    - Only `keyup` is used for actions (keydown handler is currently a no-op).
    - Hotkeys are ignored when typing in `input`, `textarea`, `select`, or `contenteditable` (see `isTextInput`).
    - Remapping currently stores only `e.key` (single key) via `HotkeysEditor`, so **modifiers / key chords are not supported** for remappable hotkeys.

- [x] **Undo/Redo keyboard shortcuts (keydown-based)** via `components/Editors/Editor/EditorControls.tsx` using `useEvent("keydown", ...)`
  - Scope: editor history actions (undo/redo stacks)

- [x] **Hotkey capture (keydown-based)** via `components/Editors/HotkeysEditor/HotkeysEditor.tsx`
  - Captures the next pressed key for remapping; `Escape` cancels capture.

- [x] **Autocomplete keyboard navigation (keydown-based)** via `components/Common/Shared/Autocomplete.tsx`
  - Arrow keys / Enter / Esc / Tab behaviors (see checklist below).

- [x] **Keyboard-accessible “Hide area” interaction** via `components/Editors/PokemonEditor/PokemonLocationChecklist.tsx` (`onKeyDown` on the hide icon container)

---

## Current active hotkeys (keyboard)

### Editor history
- [x] **Undo**: `Mod+Z` (implemented in `EditorControls.tsx`)
- [x] **Redo**: `Mod+Y` (implemented in `EditorControls.tsx`)
- [ ] **Redo (common alternative)**: `Mod+Shift+Z` (recommended default; currently not handled)
- [ ] **Fix conflict/overlap**: ensure `Mod+Z` does not trigger both undo and redo (handlers must be mutually exclusive)

### Global Pokémon navigation & editing (remappable single-key hotkeys)
Defined in `utils/data/listOfHotkeys.ts` and executed by `Features/Hotkeys/Hotkeys.tsx` on `keyup`.

- [x] **Previous Pokémon**: `j`
- [x] **Next Pokémon**: `k`
- [x] **Move Pokémon left**: `Shift+J` (reported as `J`)
- [x] **Move Pokémon right**: `Shift+K` (reported as `K`)
- [x] **Move Pokémon up (previous status)**: `u`
- [x] **Move Pokémon down (next status)**: `d`
- [x] **Add new Pokémon**: `n`
- [x] **Toggle Type Matchups**: `t`
- [x] **Manual save**: `s`
- [x] **Delete Pokémon**: `Backspace`
- [x] **Create new Nuzlocke**: `Shift+N` (reported as `N`)

### Global hotkeys (feature-flagged)
In `utils/data/listOfHotkeys.ts` behind `feature.newHotkeys`.

- [x] **Toggle editor**: `m` (only when `feature.newHotkeys` is enabled)
- [x] **Toggle image uploader**: `Shift+I` (reported as `I`) (only when `feature.newHotkeys` is enabled)

### Autocomplete input behavior (keyboard)
Implemented in `components/Common/Shared/Autocomplete.tsx`:

- [x] **Move selection up**: `ArrowUp`
- [x] **Move selection down**: `ArrowDown`
- [x] **Commit selection**: `Enter`
- [x] **Close list**: `Escape`
- [x] **Close list**: `Tab`

### Hotkey editor (during key capture)
Implemented in `components/Editors/HotkeysEditor/HotkeysEditor.tsx`:

- [x] **Cancel capture**: `Escape`
- [x] **Set binding**: “press any key” (stores `e.key` only)

---

## Current active “hotkeys” (mouse + modifier)
These are listed in `utils/data/listOfHotkeys.ts` and implemented in the Result view (`components/Features/Result/Result.tsx`):

- [x] **Zoom result**: `Shift + Mouse Wheel` (code zooms; list currently says “Scroll image result”)
- [x] **Pan result**: Drag with left mouse button (mousemove while `buttons === 1`)
- [x] **Reset pan/zoom**: Double-click

---

## Additional hotkeys we should add (backlog)

### Cross-app power-user essentials (global)
- [ ] **Command palette**: `Mod+K`
  - Search actions: “Add Pokémon”, “Download image”, “Toggle dark mode”, “Open Type Matchups”, etc.
- [ ] **Show hotkeys cheat sheet overlay**: `?` (or `Shift+/`)
  - Should list current bindings, including custom remaps.
- [ ] **Focus global search (Pokémon search box)**: `/`
- [ ] **Close dialogs / overlays**: `Escape` (ensure consistent everywhere, including custom overlays)
- [ ] **Confirm primary action in dialogs**: `Enter` (when safe)
- [ ] **Cancel secondary action in dialogs**: `Escape`

### Editor chrome / layout
- [ ] **Toggle editor minimize**: `m` (consider making this default even without `feature.newHotkeys`)
- [ ] **Toggle dark mode**: `Mod+Shift+D` (or `d` if we keep globals single-key and non-remappable)
- [ ] **Download image**: `Mod+Shift+S` (avoid colliding with browser Save)
- [ ] **Toggle “Result v2” (debug)**: unbound (optional; only in debug builds)

### Panel navigation (jump between editors)
Provide fast switching between editor sections.
- [ ] **Go to Saves**: `Alt+1`
- [ ] **Go to Game**: `Alt+2`
- [ ] **Go to Data**: `Alt+3`
- [ ] **Go to Trainer**: `Alt+4`
- [ ] **Go to Pokémon**: `Alt+5`
- [ ] **Go to Style**: `Alt+6`
- [ ] **Go to Stats**: `Alt+7`
- [ ] **Go to Hotkeys**: `Alt+8`
- [ ] **Go to Bug Reporter**: `Alt+9`
- [ ] **Go to Credits**: `Alt+0`
- [ ] **Collapse/expand current editor panel**: `Space` (when panel header focused)

### Pokémon editor: selection, editing, and speed
- [ ] **Select next/prev Pokémon**: keep `j/k`, add arrow alternatives (`ArrowLeft` / `ArrowRight`) for non-vim users
- [ ] **Move Pokémon between boxes**: `[` / `]` or `Shift+ArrowUp/Down` (status up/down)
- [ ] **Duplicate Pokémon**: `Mod+D` (or single key `c` if staying in single-key land)
- [ ] **Open “More” menu for current Pokémon**: `.` (period) or `Alt+Enter`
- [ ] **Edit moves**: `e` (when Pokémon section focused)
- [ ] **Increment/decrement level**: `+` / `-` (or `Alt+ArrowUp/Down`)
- [ ] **Quick-focus fields**:
  - [ ] Species: `g s`
  - [ ] Nickname: `g n`
  - [ ] Met location: `g m`
  - [ ] Ability: `g a`
  - [ ] Notes: `g o`
  (These require adding **chord support**; see system improvements below.)

### Result view: precise control (keyboard + mouse)
- [ ] **Zoom in/out**: `+` / `-`
- [ ] **Reset zoom/pan**: `0` (and/or keep double-click)
- [ ] **Pan with keyboard**: `ArrowKeys` (with `Shift` for faster pan)
- [ ] **Toggle “show result on mobile” / overlay**: `Mod+Shift+M` (if applicable)
- [ ] **Open Type Matchups**: `t` (or `Mod+T` to avoid collisions)

### Data / Saves / Import-Export
- [ ] **New Nuzlocke**: `Mod+Shift+N` (keep `Shift+N` if desired, but avoid accidental triggers)
- [ ] **Force save**: `Mod+S` (intercept and prevent browser Save)
- [ ] **Export data**: `Mod+E`
- [ ] **Import data**: `Mod+I`
- [ ] **Import from save file**: `Mod+O`
- [ ] **Clear all data (dangerous)**: require chord + confirmation (e.g., `Mod+Shift+Backspace` then confirm)

### Location checklist
- [ ] **Hide highlighted area**: `Enter` / `Space` (only; avoid firing on every keydown)
- [ ] **Next/prev area**: `j/k` when checklist focused (or `ArrowUp/Down`)
- [ ] **Toggle “Exclude Gifts”**: `x`
- [ ] **Focus “Filter by Game”**: `f`

---

## Hotkey system improvements (recommended for “broad hotkey support”)

- [ ] **Support modifier combos in remapping** (store a normalized string like `mod+shift+k`, not just `e.key`)
- [ ] **Support chords / sequences** (e.g., `g s` for “go to Species”)
- [ ] **Hotkey scopes** (global vs “when Pokémon section focused” vs “when dialog open”)
- [ ] **Conflict detection UI** in Hotkeys editor (warn when two actions share a binding in the same scope)
- [ ] **Discoverability**
  - [ ] Show hotkeys in tooltips and/or next to button labels where space allows
  - [ ] Add a searchable “Hotkeys” section in command palette / help overlay
- [ ] **Consistency**
  - [ ] Standardize on `keydown` vs `keyup` per interaction type (navigation feels better on `keydown`)
  - [ ] Ensure we never break typing in inputs/textareas (current global guard is good; extend it)

---

## QA checklist (when adding new hotkeys)
- [ ] Works on macOS and Windows/Linux (`⌘` vs `Ctrl`)
- [ ] Doesn’t trigger when typing in inputs/textareas
- [ ] Doesn’t collide with browser/system defaults unless intentionally intercepted
- [ ] Has a visible affordance (tooltip / cheat sheet / command palette entry)
- [ ] Covered by at least one unit/integration test where practical


