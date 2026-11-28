TECHDEBT

This document tracks the highest-impact technical debt in the **editor undo/redo history system** and proposes a concrete migration from today’s implementation to a **diff-based, checkpointed, performance-tested** history subsystem.

It is intentionally verbose and executable: it names the relevant files, calls out what is already implemented vs missing, and includes acceptance criteria and a test plan so we can refactor without regressions.

---

## Executive summary

The repo already has an `editorHistory` feature wired end-to-end:

- History tracking middleware computes state diffs and commits them **debounced (~300ms)**.
- UI can undo/redo and jump to any history point.
- Reducers support syncing from a history snapshot without resetting `editorHistory`.

However, **history storage is still snapshot-based** and uses `JSON.parse(JSON.stringify(...))` deep cloning. As sessions grow, this creates **multi‑MB memory usage**, **GC churn**, and **avoidable render/reducer work** during undo/redo (because undo/redo currently syncs *all* slices).

The goal is to migrate to:

- **Diff-based history entries** (store only patches + small metadata),
- **Targeted apply/revert** (touch only the slices that actually changed),
- **Periodic checkpoints** (bounded reconstruction time),
- **Instrumentation + regression tests** (prevent performance/memory backslides).

---

## Current implementation (ground truth)

### Where the logic lives

- `src/middleware/historyMiddleware.ts`
  - Computes diffs with `deep-diff` (`diff(lastCommittedState, newState)`).
  - Debounces commits with `lodash.debounce` at `HISTORY_DEBOUNCE_MS = 300`.
  - Excludes UI-only and history-management actions (including `SYNC_STATE_FROM_HISTORY` and `REPLACE_STATE`) to avoid circular updates.
  - Initializes history on `persist/REHYDRATE`.
- `src/reducers/editorHistory.ts`
  - Stores undo/redo timeline in `past/present/future`.
  - **Stores full snapshots** per entry: `HistoryEntry { previousState, nextState }`.
  - Deep clones snapshots via `JSON.parse(JSON.stringify(obj))`.
  - Caps history size via `MAX_HISTORY_LENGTH = 50`.
  - Resets history on `REPLACE_STATE`.
  - Supports `JUMP_TO_HISTORY_STATE` by rebuilding a full timeline and reconstructing past/future from states.
- `src/actions/updateEditorHistory.ts`
  - `UPDATE_EDITOR_HISTORY` action carries both `diff` and `newState`.
  - Comment says “Update history with a diff (not full state)” but reducer currently ignores diff for storage.
- `src/actions/syncStateFromHistory.ts`
  - `SYNC_STATE_FROM_HISTORY` is dispatched by the UI for undo/redo/jump to sync the entire reducer tree to a snapshot **without resetting** `editorHistory`.
- UI entry points
  - `src/components/Editors/Editor/EditorControls.tsx` dispatches undo/redo + `syncStateFromHistory(...)`.
  - `src/components/Editors/Editor/HistoryPanel.tsx` dispatches jump + `syncStateFromHistory(...)`.
- Persistence configuration
  - `src/store/index.ts` blacklists `editorHistory` from persistence, so history is currently **session-local** (good for memory; also means we can refactor without migration concerns for stored history state).

### What happens on an edit (today)

1. A user action updates the Redux state.
2. `historyMiddleware` runs after reducers, builds `newState = omit(["editorHistory"], fullState)`.
3. Middleware schedules a debounced commit; on flush it computes `changes = diff(lastCommittedState, newState)`.
4. Middleware dispatches `UPDATE_EDITOR_HISTORY(changes, newState)`.
5. `editorHistory` reducer deep-clones and stores *full* snapshots in `past/present`.

### What happens on undo/redo (today)

1. UI dispatches `UNDO_EDITOR_HISTORY` / `REDO_EDITOR_HISTORY`.
2. `editorHistory` reducer swaps `present` to the stored snapshot.
3. UI dispatches `SYNC_STATE_FROM_HISTORY(snapshot)` to sync the rest of the state tree.
4. Every slice reducer handles `SYNC_STATE_FROM_HISTORY` and returns the corresponding slice from `syncWith`.
5. `historyMiddleware` sees `SYNC_STATE_FROM_HISTORY`, cancels pending commits, and updates `lastCommittedState` to match the synced state.

This flow is correct and avoids infinite loops, but it is expensive because undo/redo currently:

- **Dispatches at least two actions** (UNDO/REDO + SYNC_STATE_FROM_HISTORY),
- **Touches every reducer slice**, even when only a small part of state changed.

---

## Why this is tech debt (symptoms & root causes)

### Symptoms

- **Memory growth**: storing `previousState` + `nextState` for each entry makes history size proportional to \(O(historyLength \times stateSize)\).
- **GC churn**: `JSON.parse(JSON.stringify(...))` allocates large intermediate strings/objects; repeated on every commit.
- **Undo/redo cost**: syncing the entire state tree on each undo/redo causes broad reducer work and likely broad re-rendering.
- **Mismatch between intent and implementation**: middleware computes diffs, action carries diffs, but reducer stores snapshots; doc comments suggest diff-based history, but runtime is snapshot-based.

### Root causes

- `editorHistory` prioritizes reliability by storing full snapshots instead of relying on invertible diffs.
- Diff application/reversion (`applyChange`/`revertChange`) is not yet used, so diffs are effectively “computed but thrown away”.
- No checkpoint/diff-chain strategy exists because we don’t yet store diff chains.
- No explicit perf or memory regression harness exists, so it’s hard to refactor safely.

---

## Target end-state (what “done” looks like)

### Architecture goals

- **Small history entries**: history is mostly diffs + metadata, not entire state clones.
- **Bounded reconstruction time**: periodic checkpoints avoid long diff chains.
- **Targeted undo/redo**: only update the slices that changed instead of syncing every reducer.
- **Robustness**: diff application/reversion produces byte-for-byte equivalent results to today’s snapshot-based behavior for supported actions.
- **Measured and tested**: perf/memory budgets and regression tests are part of the delivery.

### Proposed data model

Replace snapshot-based `HistoryEntry` with an entry that is diff-first:

- `HistoryEntry` fields (conceptual):
  - `forwardDiff: DiffEntry` (from state A -> state B)
  - `backwardDiff: DiffEntry` (optional; precomputed for fast undo, or derived if safe)
  - `changedTopLevelKeys: string[]` (or slice identifiers) for targeted reducer updates
  - `timestamp`, `sourceActionTypes[]` (optional debugging)
  - `checkpointId?` or `baseRevision?`

Checkpoints:

- Every N commits (e.g., 20) store a compact **checkpoint snapshot** (or a partial checkpoint for only changed slices) to bound reconstruction.

### Proposed update flows

#### History commit (forward)

- Keep middleware debouncing (already exists).
- Store `diff` and minimal metadata in history.
- Do not deep-clone entire state on each commit.

#### Undo/redo (targeted)

- Current: UI dispatches `UNDO_*` then `SYNC_STATE_FROM_HISTORY(snapshot)` which triggers all reducers.
- Target:
  - UI dispatches `UNDO_*` / `REDO_*`.
  - Instead of syncing the whole tree, dispatch an action like `APPLY_HISTORY_PATCH` that contains:
    - patch/diff to apply,
    - target slice keys,
    - maybe a “revision” for middleware to update `lastCommittedState` safely.
  - Reducers either:
    - apply patch only to their slice (ideal), or
    - a single reducer (or middleware) computes the new root state, but still avoids calling all reducers (requires store enhancer / replaceReducer strategy).

Notes:

- If targeted per-slice patching is too risky initially, an intermediate step is to keep syncing the whole tree but **compute new state via applying diffs** (no snapshot storage) and continue to dispatch `SYNC_STATE_FROM_HISTORY(newState)` until slice-level apply is ready. That still triggers all reducers but eliminates snapshot storage/clone churn first.

---

## Actionable checklist (updated to match current code)

### A) Storage: stop snapshotting
- [ ] **Switch `editorHistory` storage from `{previousState,nextState}` snapshots to diff-based entries**.
  - Current: `src/reducers/editorHistory.ts` stores full snapshots and clones via JSON stringify/parse.
  - Target: store `DiffEntry` (and optionally reverse diff) + minimal metadata.
- [ ] **Remove JSON stringify/parse cloning from history hot paths**.
  - If a clone is needed anywhere, use a safer/faster strategy (or rely on immutability guarantees).

### B) Debounce: validate + harden (already present)
- [ ] **Keep the existing ~300ms debounce** in `src/middleware/historyMiddleware.ts`, but harden edge cases:
  - Flush/cancel behavior on undo/redo/jump is already present; verify it covers all navigation paths.
  - Consider exposing a real `flushHistoryMiddleware()` or moving debounce ownership so we can flush before “save/export”.

Note: previous versions of this tech debt referenced an `UpdaterBase` class; this repo does not currently have `UpdaterBase`. The debounce is implemented in `src/middleware/historyMiddleware.ts` via `lodash.debounce`.

### C) Undo/redo: targeted application (avoid reducer tree churn)
- [ ] **Replace full-tree `SYNC_STATE_FROM_HISTORY` undo/redo with targeted patch apply/revert**.
  - Current: undo/redo culminates in `SYNC_STATE_FROM_HISTORY(snapshot)` handled by every reducer.
  - Target: apply diffs only to affected slices (or at least avoid cloning/serializing full state).
- [ ] If using `deep-diff` application:
  - Use `applyChange` for redo and `revertChange` for undo (or store both forward/backward diffs).
  - Ensure array changes, deletions, and nested changes are handled correctly.

### D) Checkpointing: bound reconstruction
- [ ] **Introduce periodic checkpoints** (e.g., every 20 commits).
  - Goal: reconstructing `present` from diffs is bounded and predictable.
  - Make checkpoint interval configurable and test it.

### E) Enablement & cleanup
- [ ] **Enable editor history by default** (if currently behind a flag) only after diff-history is stable.
- [ ] **Remove legacy snapshot-only code paths** once diff-based history passes tests and perf budgets.

### F) Regression tests & perf budgets
- [ ] **Add tests around undo/redo correctness** (including long sessions).
- [ ] **Add perf/memory checks** (at least coarse-grained) so history doesn’t regress.

---

## Migration roadmap (phased, low-risk)

### Phase 0: Instrumentation & guardrails (no behavior change)
- Add lightweight metrics:
  - history entry count,
  - approximate entry size (serialize diffs only, not full state),
  - commit frequency under typing.
- Add a debug-only logger or dev panel row (optional) to see history stats while editing.

**Exit criteria**: We can observe baseline memory/perf and have a way to detect regressions.

### Phase 1: Diff-first storage (keep existing undo/redo mechanism)
- Change `editorHistory` reducer to store diff entries instead of snapshots.
- Keep `SYNC_STATE_FROM_HISTORY`, but compute the synced state via applying diffs/checkpoints rather than reading stored snapshots.
- Keep `MAX_HISTORY_LENGTH` semantics (or revise).

**Exit criteria**: Memory usage drops materially for long sessions; undo/redo matches current behavior for all core editor actions.

### Phase 2: Checkpointing
- Add checkpoint snapshots every N commits.
- Implement reconstruction from nearest checkpoint + diff chain.

**Exit criteria**: Reconstruction time stays under budget even at max history length.

### Phase 3: Targeted slice updates
- Introduce targeted patch apply actions to update only reducers/slices that changed.
- Stop dispatching full-tree `SYNC_STATE_FROM_HISTORY` on undo/redo/jump.

**Exit criteria**: Undo/redo triggers significantly fewer reducer executions and fewer re-renders; correctness maintained.

### Phase 4: Cleanup
- Remove snapshot-based entry types.
- Remove now-unused fields (`newState` in `UPDATE_EDITOR_HISTORY` if no longer needed).
- Simplify middleware and reducer code paths; document invariants.

---

## Acceptance criteria (definition of done)

### Correctness
- Undo/redo returns the editor to exactly the same state as today for:
  - single-step edits,
  - rapid typing (debounced),
  - drag/drop style interactions,
  - “jump to history state” navigation,
  - redo after undo,
  - edit after undo clears future.
- Middleware never creates history entries for excluded UI-only actions.
- Undo/redo/jump never create new history entries (no circular updates).

### Performance
- History commit should not allocate full-state deep clones on every commit.
- Under rapid typing, history entries should be batched (debounce) and not exceed a reasonable rate (e.g., < 4 entries/sec).
- Undo/redo should be “instant enough” in UI (target budget: < 16ms per step in typical cases; < 50ms worst case at max history).

### Memory
- History memory should scale primarily with number of changes, not full state size.
- A long session (e.g., 30 minutes of edits) should not produce multi‑MB history snapshots (diff-only + checkpoints).

---

## Risks & mitigations

- **Diff invertibility**: not all diffs are trivially invertible (arrays, deletions, moves).
  - Mitigation: store both forward + backward diffs, or validate revert correctness with tests.
- **Mutable state assumptions**: if any slice mutates objects in place, diffs may be incorrect or patching may mutate shared references.
  - Mitigation: enforce immutability conventions; add dev-time deep-freeze in tests if feasible.
- **`JSON.stringify` clone removal**: removing cloning may expose accidental mutations.
  - Mitigation: replace with structural sharing or dev-only immutability checks rather than runtime cloning.
- **Checkpoint correctness**: mixing checkpoints and diffs can drift if any patch application is buggy.
  - Mitigation: property tests that reconstruct state from scratch vs checkpointed reconstruction and compare.
- **Action exclusion drift**: excluded actions set may go stale as new UI actions are added.
  - Mitigation: add tests asserting common UI actions are excluded; document rule-of-thumb for adding exclusions.

---

## Test plan (concrete)

### Unit tests (Jest)
- `editorHistory` reducer:
  - update adds entries, caps length, clears future on new edits
  - undo/redo transitions are correct
  - jump rebuilds timeline correctly
  - diff application/reconstruction correctness (once implemented)
- `historyMiddleware`:
  - debounces commits (use fake timers)
  - excluded actions do not create updates
  - undo/redo/jump cancels pending commits
  - `SYNC_STATE_FROM_HISTORY` updates the committed reference (no immediate new history entry)

### Integration tests (Redux store)
- Build a real store and dispatch common editor actions:
  - Verify present state after sequences of edits/undo/redo/jump.
  - Verify number of history entries under rapid sequences.

### Perf/regression harness
- Add a small benchmark-like test (even if coarse) that:
  - creates N edits,
  - measures time to commit,
  - measures time to undo N times,
  - asserts budgets don’t exceed a threshold (use generous thresholds in CI; tighten over time).

---

## Notes / open questions (decide intentionally)

- Should history store **only editor-relevant slices** rather than the entire state minus `editorHistory`?
  - Today: it tracks everything except `editorHistory`, which may include UI-ish state we don’t care about.
- Should `editorHistory` ever be persisted?
  - Today: blacklisted (not persisted). Keeping it session-local is probably correct.
- What is the desired max history length once entries are smaller?
  - Today: 50; with diffs + checkpoints we might increase safely.

---

## Additional considerations (adjacent debt to track)

- **Search system**: the new advanced search (parser/compiler, normalized cache, persisted terms) needs perf profiling under large teams and should guard against unbounded regex/wildcards; add timeout/guardrails and a fall-back when parsing fails. Maintain a stable public API for search helpers to avoid tight coupling to UI components.
- **Hotkey expansion**: recent hotkeys that click DOM buttons via `data-testid` are brittle; consider a central command bus or Redux actions instead of DOM querying so hotkeys work in non-DOM contexts and remain testable.
- **Image download path**: new download flows should funnel through the documented proxy/strategy (see `docs/DOWNLOADS.md`); add integration tests that mock the proxy and assert error-handling and retries.
- **Debug tools**: the debug panel now creates random boxes; ensure this stays dev-only (feature flag or `isLocal` guard) and cannot be triggered in production builds.
- **History exclusions drift**: as more UI actions (search, hotkeys, download) are added, revisit the middleware exclusion list so history doesn’t grow from UI-only actions.
- **E2E migration**: Cypress was removed in favor of Playwright scripts; ensure equivalent coverage exists for core flows (editor, imports/exports, downloads) and that CI is wired to run headed/traceful runs to diagnose flake.
- **Docs relocation**: key Markdown references (CSS, NAV, PERFORMANCE, SEARCH, TECHDEBT, HOTKEYS, DOWNLOADS) moved to `docs/`; update any in-app links or README pointers to avoid broken references.
- **Search storage**: localStorage persistence of search term may collide across tabs/sessions; consider namespacing by save ID or feature flagging persistence to avoid surprising cross-tab bleed-through.
- **Search cache invalidation**: normalization cache uses WeakMap keyed on Pokémon objects; if reducers replace array elements with new objects, cache churn is fine, but if objects are mutated in place, normalized fields can drift—add tests or explicit cache busting on edits.
- **Proxy/operator limits**: the image proxy should enforce payload/time limits and deny-list hosts to prevent SSRF; document ops runbooks (e.g., how to rotate allowlists, where logs are shipped).

