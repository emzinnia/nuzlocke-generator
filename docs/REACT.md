# React Modernization Notes

Goal: highlight legacy React usage that could block or complicate a forward upgrade to React 19 and beyond, plus suggested upgrade paths.

## Highest-risk legacy APIs
- `UNSAFE_componentWillMount` and `UNSAFE_componentWillReceiveProps` are still in use and will be dropped from future concurrent builds. Replace them with constructors, `componentDidMount`, `componentDidUpdate`, or hook-based effects.
- Emotion's `injectGlobal` (from the legacy emotion package) is used for global styles. React 19-era tooling assumes `@emotion/react`'s `Global` component or CSS files instead.
- The app root is not wrapped in `React.StrictMode`, so unsafe lifecycles are not surfaced during development. Enabling StrictMode now will show double-invocation issues before upgrading React.

## File-by-file notes
- `src/components/Editors/PokemonEditor/CurrentPokemonEdit.tsx`
  - Uses `UNSAFE_componentWillMount` to seed local state from props and `UNSAFE_componentWillReceiveProps` to mirror prop changes into state. This pattern is unsafe with concurrent rendering and will be removed in React 19. Refactor to initialize state in the constructor (or via props + derived state) and sync changes with `componentDidUpdate` or a hook (`useEffect`) after converting to a function component.
- `src/components/Layout/TopBar/TopBar.tsx`
  - Calls `UNSAFE_componentWillMount` to mark releases as seen. Move this to the constructor or to `componentDidMount`/`useEffect`; avoid any state updates in `componentWillMount`.
- `src/components/Editors/ThemeEditor/ThemeEditor.tsx`
  - Uses `UNSAFE_componentWillMount` to populate `componentTree` state. Initialize state in the constructor or via class field default; if the data is static, set it as the initial state value.
- `src/components/Features/Result/Stats.tsx`
  - Copies filtered props into state in `componentDidMount`. In StrictMode (and React 19), effects/lifecycles can run twice in dev, so this duplicative work could cause flicker. Prefer deriving directly from props in render or memoizing via selectors/hooks.
- `src/components/Features/Hotkeys/Hotkeys.tsx`
  - Class component attaches document listeners in `componentDidMount` and manages a `Map` of handlers. Safe today, but easier to reason about and auto-clean with `useEffect` once converted to a function component.
- `src/components/Layout/App/App.tsx`
  - Class component toggles a `dark` class on `document.documentElement` in lifecycle methods. Works today, but moving to a root-level `useEffect` (and enabling StrictMode) will ensure updates stay in sync under concurrent rendering.
- `src/components/Pokemon/TeamPokemon/TeamPokemon.tsx`
  - Async `componentDidMount` that fetches sprite data and calls `setState`. When converting to hooks, add an abort guard to avoid setting state on unmounted renders (React 19 Suspense/tearing scenarios).
- `src/index.tsx`
  - Uses `injectGlobal` from emotion and renders with `createRoot` but without `React.StrictMode`. Replace `injectGlobal` with `<Global styles={...} />` from `@emotion/react` (or move global CSS to static files) and wrap the tree in `<StrictMode>` to surface unsafe patterns before upgrading.

## Broader modernization opportunities
- Numerous class components (`Editors`, `Result`, `Layout`, `Pokemon` views) still rely on legacy lifecycle APIs. Converting to function components with hooks will align the codebase with modern React patterns, simplify effects, and make future features (e.g., useEffect semantics, transition APIs) easier to adopt.
- Redux usage is `connect`-based; not deprecated, but migrating to hooks (`useSelector`, `useDispatch`) would reduce HOC nesting and ease Concurrent/StrictMode testing.
- Consider running the app under `React.StrictMode` in development to expose unexpected side effects, double-invoked effects, or state derivation issues ahead of a React 19 upgrade.

## Suggested upgrade sequence
1) Replace all `UNSAFE_*` lifecycle usage with safe alternatives, starting with `CurrentPokemonEdit`, `TopBar`, and `ThemeEditor`.
2) Introduce `React.StrictMode` at the root and fix any warnings surfaced (double-invoked effects, state derived from props, missing cleanups).
3) Swap `injectGlobal` for `@emotion/react`'s `Global` (or CSS) to align styling with maintained APIs.
4) Gradually convert high-touch class components to function components with hooks, adding effect cleanup (especially around DOM listeners and async calls).
5) Re-test under StrictMode and with concurrent features enabled to ensure compatibility before jumping to React 19.

