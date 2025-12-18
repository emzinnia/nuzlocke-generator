## CSS and Styling Inventory

### Styling approaches in use
- Blueprint styles are pulled in globally from `@blueprintjs/*` within `src/index.tsx`.
- Normalize is applied via `normalize.css/normalize.css` in `src/index.tsx`.
- Emotion v8 (classic API: `css`, `cx`, `injectGlobal`) is used for CSS-in-JS across the app.
- A custom font stylesheet is linked in `index.html` via `./assets/pokemon-font.css`.

### Components importing standalone CSS (non-Blueprint)
- `src/components/Layout/App/App.tsx` → `app.css` (app shell & layout).
- `src/components/Editors/Editor/Editor.tsx` → `editor.css` (editor layout wrapper).
- `src/components/Editors/RulesEditor/RulesEditor.tsx` → `RulesEditor.css` (rules editor UI).
- `src/components/Common/Shared/Autocomplete.tsx` → `Autocomplete.css` (dropdown list and input states).
- `src/components/Features/Result/Result.tsx` → `Result.css`, `themes.css` (result rendering; considered result-oriented and excluded from migration checklist below).

### Components using CSS-in-JS (Emotion v8)
- Global: `src/index.tsx` (`injectGlobal` for base resets/utilities).
- Layout: `src/components/Layout/TopBar/TopBar.tsx`.
- Shared: `src/components/Common/Shared/ImagesDrawer.tsx`, `ReleaseDialog.tsx`, `Autocomplete.tsx` (mix of CSS file + Emotion), `ColorEdit.tsx`, `styles/index.ts`.
- Editor shell: `src/components/Editors/Editor/Editor.tsx`, `Editor/styles.ts`, `Editor/HistoryPanel.tsx`.
- Editors: `components/Editors/DataEditor/DataEditor.tsx`, `MoveEditor/MoveEditor.tsx`, `PokemonEditor/PokemonEditor.tsx`, `PokemonEditor/PokemonLocationChecklist.tsx`, `PokemonEditor/CurrentPokemonInput.tsx`, `PokemonEditor/CurrentPokemonEdit.tsx`, `PokemonEditor/CurrentPokemonLayoutItem.tsx`, `PokemonEditor/styles.ts`, `TrainerEditor/CheckpointsEditor.tsx`, `TrainerEditor/BadgeInput.tsx`, `TrainerEditor/style.ts`, `ThemeEditor/ThemeEditor.tsx`, `ThemeEditor/CSSUnitInput.tsx`, `ThemeEditor/styles.ts`, `StyleEditor/StyleEditor.tsx`, `StyleEditor/ZoomLevel.tsx`, `StyleEditor/styles.ts`, `StatsEditor/StatsEditor.tsx`, `SavesEditor/HallOfFameDialog.tsx`.
- Pokemon display: `components/Pokemon/TeamPokemon/TeamPokemon.tsx`, `TeamPokemon/TeamPokemon2.tsx`, `TeamPokemon/PokemonPokeball.tsx`, `TeamPokemon/PokemonItem.tsx`, `TeamPokemon/Showdown.tsx`, `Pokemon/ChampsPokemon/ChampsPokemon.tsx`, `Pokemon/BoxedPokemon/BoxedPokemon.tsx`.
- Result-related: `components/Features/Result/Result.tsx`, `Result2.tsx`, `Result/styles.ts`, `Result/TrainerResult.tsx`, `Result/TypeMatchupDialog.styles.ts`.
- Other features: `components/Features/BugReporter/BugReporter.tsx`, `Features/Credits/Credits.tsx`, `components/Editors/PokemonEditor/styles.ts` (used by multiple sub-editors), `components/Common/Shared/Autocomplete.tsx` (Emotion selectors for invisible text).

### Migration checklist (non-Result components → Emotion)
- [ ] Convert `src/components/Layout/App/App.tsx` + `app.css` to Emotion-based styles (e.g., move layout classes into `injectGlobal` or component-scoped `css` blocks).
- [ ] Convert `src/components/Editors/Editor/Editor.tsx` + `editor.css` to Emotion (align with existing `editorStyles` usage).
- [ ] Convert `src/components/Editors/RulesEditor/RulesEditor.tsx` + `RulesEditor.css` to Emotion styles.
- [ ] Convert `src/components/Common/Shared/Autocomplete.tsx` + `Autocomplete.css` to Emotion (it already uses `css`/`cx`; move remaining class rules).

