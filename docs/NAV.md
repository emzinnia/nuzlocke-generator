# Navigation & UI Composition Improvements

This document outlines ways to make navigation clearer and UI composition more intentional across the Nuzlocke Generator. It focuses on discoverability, spatial consistency, and keyboard-first workflows.

## Current shape (quick read)
- Single-page shell renders `Hotkeys`, `Editor`, `Result`/`Result2`, and `ImagesDrawer` together, with a dark-mode toggle on the `<html>` root (see `src/components/Layout/App/App.tsx`).
- `TopBar` hosts several global actions (minimize editor, download image, dark mode, release notes) plus a mobile-only menu toggle (see `src/components/Layout/TopBar/TopBar.tsx`).
- Editor surfaces box search, mass editor, and box/grid controls inline within the Pokémon Editor header.
- Overlays (Release dialog, ImagesDrawer, Debug dialog) stack on top of the main canvas and borrow state from Redux slices.

## Observed issues/opportunities
- Global vs. local actions are mixed in the same bar; hierarchy and grouping are unclear.
- Navigation between “editing” and “results” is implicit; both render simultaneously, making it hard to understand which area is primary—especially on mobile where result toggling is hidden behind a menu.
- Search/filter, download, and theme controls move or wrap in narrow viewports, increasing cognitive load.
- Overlays and drawers don’t share a unified entry point; users must remember hotkeys or scattered buttons.
- Layout primitives exist (`Layout` component) but aren’t used to enforce consistent spacing, stacking, and responsive breakpoints.

## Principles to guide changes
- **Separation of concerns:** Distinguish global navigation (app-level destinations), workspace controls (contextual actions for the current surface), and per-entity actions.
- **Predictable placement:** Keep primary actions in fixed, predictable regions (e.g., left rail or top bar), and secondary actions near their subject.
- **Progressive disclosure:** Show common actions by default; tuck advanced toggles into a stable menu/drawer, not transient popovers.
- **Keyboard parity:** Every visible action should have a hotkey and a discoverable label or hint.
- **Responsive symmetry:** The same mental model should apply on desktop and mobile; changes in layout should not change control locations semantically.

## Recommended navigation model
1) **Global shell**
   - Persistent header with brand/title, connection/status indicator, and a compact set of global toggles (theme, help/shortcuts, release notes).
   - Primary navigation as either tabs or a left rail with clear destinations:
     - `Editor` (roster, boxes, mass edit)
     - `Results` (export/preview)
     - `Assets` (images drawer)
     - `Settings` (theme, hotkeys, ruleset presets)
   - Keep destructive or global actions (download, reset, import/export) grouped and labeled.

2) **Workspace header (context bar)**
   - Lives inside each destination and owns contextual controls: search, filters, add Pokémon, mass editor toggle, box-level options.
   - Make search sticky within the editor workspace and keep filters next to it; surface parse errors/warnings inline (already exposed via `SearchFeedback`).
   - Provide view toggles (grid/list/compact) local to the workspace, not the global bar.

3) **Secondary surfaces**
   - Standardize entry points for drawers/modals (ImagesDrawer, Release dialog, Debug) into a single “More” menu or right-rail icons with consistent placement and hotkeys.
   - For mobile, mirror these in a bottom sheet nav or a single overflow menu instead of multiple buttons.

## UI composition improvements
- **Use layout primitives deliberately:** Adopt the `Layout` component (flex + spacing enums) for top bars and toolbars to ensure consistent spacing and alignment across Editor, Result, and drawers.
- **Toolbar grouping:** Group buttons by intent (visibility, export, appearance, info). Example groups:
  - View: minimize/maximize editor, toggle result pane (desktop), mobile “View Result”.
  - Appearance: dark/light, theme density.
  - Export/Share: download image, copy/share link.
  - Help/Meta: release notes, hotkeys reference.
- **Search lane:** Keep the Pokémon search bar anchored to the right of the editor header with a consistent width; on mobile, expand it to a full-width row below the header to preserve hit targets.
- **Stateful tabs within Editor:** Add intra-editor tabs (e.g., Team, Boxes, Mass Editor, Rules) instead of relying on scattered buttons, so users understand scope and can return to prior context.
- **Overlays:** Converge drawers/modals to a shared overlay system (consistent padding, z-index, and close affordances). Provide keyboard hints in their headers.
- **Empty/loading states:** Add explicit empty-state cards for boxes/search results and skeletons for lazy-loaded panels to reduce jumps during suspense loading.

## Responsive/mobile considerations
- Collapse the global header into a two-row structure on mobile: row 1 for brand + overflow, row 2 for primary nav tabs/chips. Keep the “View Result” toggle adjacent to Editor/Result tabs instead of floating buttons.
- Use bottom-anchored action row for frequent actions (add Pokémon, search, filters) to reduce reach.
- Ensure hotkey-driven actions have touch equivalents surfaced in the same positions.

## Phased implementation plan
**Phase 0: Audit (1–2 days)**
- Map every global and contextual action to its owning surface; decide what belongs to global nav vs. workspace headers.
- Inventory overlays/drawers and their triggers; define z-index and close patterns.

**Phase 1: Shell + grouping (2–3 days)**
- Refactor `TopBar` into: brand + nav, grouped action clusters, overflow menu; remove contextual controls from the global bar.
- Introduce a global “Help & Shortcuts” entry that links to hotkeys, release notes, and search syntax.

**Phase 2: Workspace headers (3–4 days)**
- Create an Editor workspace header component using `Layout` primitives: search, filters, add/mass-edit buttons, view toggles.
- Add intra-editor tabs (Team, Boxes, Rules, Settings) with retained state per tab.

**Phase 3: Navigation & overlays (3–5 days)**
- Add primary nav (tabs/rail) between Editor, Result, Assets, Settings; gate Result behind the same nav on mobile instead of a floating button.
- Normalize drawers/modals under a shared overlay component; add keyboard hints and consistent close affordances.

**Phase 4: Polish & responsiveness (ongoing)**
- Tune breakpoints for toolbar wrapping, enlarge tap targets, and add sticky search/filter row on small screens.
- Add empty/loading states and subtle transitions to reduce layout jump.

## Success metrics
- Task time to “add and place a Pokémon” on desktop/mobile.
- Click/hotkey count to download/export after edits.
- Error rate for search queries (parse errors vs. fallback matches).
- Rage clicks or rapid toggles on mobile nav (proxy for discoverability).

---
These changes aim to make the app’s hierarchy obvious, keep actions where users expect them, and align keyboard-first power use with a clear visual model. Small grouping and layout fixes can ship quickly while larger nav/tab work is staged.

