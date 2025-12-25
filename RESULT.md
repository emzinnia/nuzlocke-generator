# Result Component Refactor Plan

## Goals
- Make Result output fully themeable with pure CSS so users can share drop-in themes.
- Remove layout-breaking inline styles and editor-driven dimensions that conflict with custom CSS.
- Provide a stable HTML/class/variable contract that theme authors can rely on.

## Current Pain Points
- Heavy inline styling on the main Result container (sizes, backgrounds, transitions, fonts) means theme CSS cannot reliably override layout or spacing.

```457:529:src/components/Features/Result/Result.tsx
            <div
                onWheel={onZoom}
                onMouseMove={onPan}
                onDoubleClick={resetPan}
                className="hide-scrollbars"
                style={{ 
                    flex: 1, 
                    minWidth: 0, 
                    overflowY: "scroll",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start"
                }}
            >
                ...
                    <div
                        ref={resultRef}
                        className={`result ng-container ${/* template + region */""}`}
                        style={{
                            fontFamily: style.usePokemonGBAFont ? "pokemon_font" : "inherit",
                            fontSize: style.usePokemonGBAFont ? "125%" : "100%",
                            margin: isDownloading ? "0" : "3rem 0",
                            backgroundColor: bgColor,
                            backgroundImage: `url(${style.backgroundImage})`,
                            backgroundRepeat: style.tileBackground ? "repeat" : "no-repeat",
                            border: "none",
                            height: style.useAutoHeight ? "auto" : `${style.resultHeight}px`,
                            minHeight: style.useAutoHeight ? "600px" : undefined,
                            transition: "transform 300ms ease-in-out",
                            transformOrigin: "center top",
                            width: `${style.resultWidth}px`,
                            zIndex: 1,
                            ...getScale(style, editor, panningCoordinates),
                        }}
                    >
```

- Theme injection is done by dumping `style.customCSS` into a `<style>` tag, but the underlying markup and classes are unstable and intermixed with emotion classes and inline styles, so custom CSS often loses specificity or is hard to target.

```476:510:src/components/Features/Result/Result.tsx
                <ErrorBoundary>
                    <style>
                        {`
                            .result {
                                --background-color: ${bgColor};
                                --accent-color: ${accentColor};
                                --header-color: ${topHeaderColor};
                            }
                        `}
                    </style>
                    <style>{style.customCSS}</style>
                    {isMobile() && editor.showResultInMobile && (
                        <Button
                            className={Styles.result_download}
                            icon="download"
```

- Editor options control hard pixel dimensions (e.g., `resultWidth`, `resultHeight`, `trainerWidth`, `trainerHeight`) that override CSS, causing custom themes to break when a user toggles editor settings.
- Template-specific CSS is spread across `Result.css` and `themes.css` with ad-hoc class names; there is no single contract for theme authors.
- Emotion CSS (`styles.ts`) mixes in more positional rules (e.g., mobile download button), adding another styling mechanism to work around.

## Target Architecture
- **Single styling mechanism:** Move all layout/presentation to plain CSS. Reserve JS for data flow and imperative behaviors (download, zoom/pan).
- **CSS variables as the only dynamic bridge:** Expose colors, spacing, and sizing as custom properties on the root `.result` element. JS sets variables; CSS consumes them.
- **Stable DOM + data attributes:** Use predictable class names and `data-*` attributes for template, orientation, and state (e.g., `data-template="generations"`, `data-orientation="vertical"`, `data-team-size="6"`). Avoid computed class strings where possible.
- **Theme surface definition:** Document a minimal, stable set of tokens and structural hooks so theme authors can rely on them without reading the React code.
- **Separation of concerns:** Keep Editor options limited to semantic choices (e.g., show rules, enable stats) and avoid pixel values. Where sizing must remain, route it through CSS variables so themes can override.

## Refactor Plan (sequenced)
1. **Define the public contract**
   - Enumerate the DOM structure and class/data attributes for Result, Trainer section, team/dead/boxed/champs containers, rules, stats, and notes.
   - Publish a token table: `--result-width`, `--result-height`, `--trainer-width`, `--trainer-height`, `--bg`, `--accent`, `--header`, `--font-family`, `--font-size`, spacing tokens, and breakpoint helpers.

2. **Establish a variables layer**
   - Add a small `result-variables.css` that declares defaults for all tokens.
   - In `Result.tsx`, set only CSS variables on the root node (via inline `style={{ "--result-width": "...px" }}`) instead of full style objects. Avoid non-variable inline declarations except where strictly necessary for behaviors (e.g., `transform` during zoom).

3. **Convert inline styles to classes**
   - Move container flex/layout styles, backgrounds, margins, and font sizing into CSS classes that consume variables.
   - Replace `Styles.result_mobile` and `Styles.result_download` (emotion) with plain class names in `Result.css`.
   - Move TrainerResult layout (badge wrapper sizing, column padding) into CSS and switch to class-based toggles driven by attributes (`data-orientation`).

4. **Normalize template hooks**
   - Replace string-concatenated template class names with `data-template` attributes and a small set of semantic classes (e.g., `.template--generations`).
   - Group template-specific rules into separate CSS files or sections with clear scopes and no inline JS fallbacks.

5. **Rationalize editor options**
   - Deprecate or gate pixel-dimension controls that override layout (result width/height, trainer width/height). If kept, funnel them into CSS variables so themes can override with higher specificity.
   - Provide a “Respect theme sizes” toggle that ignores editor layout overrides when a custom theme is active.

6. **Theme authoring guide**
   - Ship a reference theme showing variable usage and the DOM contract.
   - Add docs for composing and sharing themes: file structure, how to load CSS, and a checklist of tokens/hooks to target.

7. **Testing & regression safety**
   - Snapshot tests for critical layouts (default, compact, generations, vertical trainer) to catch DOM/class changes.
   - Visual regression (Playwright) for a small matrix: desktop/mobile, default + one template, theme override enabled.
   - Manual checklist for download flow, zoom/pan, and mobile overlay.

## CSS Strategy Details
- **Variables:** Set on `.result`:
  - Color: `--bg`, `--accent`, `--header`, `--text`, `--panel`, `--shadow`.
  - Typography: `--font-family`, `--font-size`, `--heading-size`, `--monospace` (if needed).
  - Layout: `--result-width`, `--result-height`, `--trainer-width`, `--trainer-height`, `--gap`, `--radius`, `--padding`.
  - Media helpers: `--mobile-scale`, `--download-button-offset`.
- **Attributes:** `data-template`, `data-orientation`, `data-team-size`, `data-show-rules`, `data-has-notes`, `data-mobile`.
- **Classes:** Keep concise, role-based names: `.result`, `.result__trainer`, `.result__team`, `.result__status`, `.result__rules`, `.result__notes`, `.result__download`.

## Editor & API Changes
- Map existing `style.*` fields to CSS variables; remove direct inline style usage.
- When a custom theme is present, prefer theme defaults and optionally disable conflicting editor sizing controls.
- Keep `style.customCSS` but document the official tokens and structure so authors use supported hooks instead of brittle selectors.

## Migration Steps
- Phase 1: Introduce variables layer and replace emotion classes with plain CSS; keep old inline styles behind a feature flag.
- Phase 2: Convert TrainerResult and status containers to class/attribute-driven layouts; delete redundant inline padding/margin logic.
- Phase 3: Remove deprecated editor dimension overrides; add “Respect theme sizes” toggle.
- Phase 4: Ship reference theme + docs; announce the new contract to theme authors.

## Risks & Mitigations
- **Theme breakage:** Ship a compatibility mode (fall back to old inline styles) for one release; add console warnings when legacy props are used.
- **Layout drift:** Add snapshot/visual tests and a DOM contract doc to prevent accidental class/attribute changes.
- **Mobile regressions:** Explicitly test `showResultInMobile` paths after removing emotion styles.

## Deliverables
- New CSS variable layer and class-based Result/Trainer styling.
- Cleaned `Result.tsx`/`TrainerResult.tsx` with minimal inline styles.
- Updated `Result.css`/`themes.css` with scoped, documented hooks.
- Theme authoring guide and compatibility notes.

