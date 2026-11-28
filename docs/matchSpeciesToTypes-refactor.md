## Refactor Design Doc: `matchSpeciesToTypes`

### Context
`src/utils/formatters/matchSpeciesToTypes.ts` is currently a very large file (~2K lines) dominated by a giant `switch (species)` plus a smaller override layer (`handleSpeciesTypeEdgeCases`) for **forme- and generation-specific typing**.

This function is used broadly across the app (UI, parsers, fixtures). There are already a few key Jest assertions in `src/utils/__tests__/utils.test.ts` that cover core behavior and several tricky overrides (e.g. Gen1 Fairy retcon, Alolan/Galarian forms).

---

### Goals
- Make the implementation **data-driven** (easy to update) instead of “giant control flow”.
- Keep behavior **identical** (unless we explicitly decide to fix/expand correctness).
- Make it **easy to validate** completeness and avoid “oops” edits (duplicates, missing species).
- Reduce cognitive load: keep special rules explicit, keep base mapping as pure data.

---

### Non-goals (unless requested)
- Expanding forme coverage beyond what is currently implemented.
- Changing default behavior for unknown/missing mapping (currently falls back to Normal/Normal).
- Reworking `Types`, `Species`, `Forme`, or how the rest of the app requests typings.

---

### Current pain points
- **Maintenance cost**: adding or changing a species means editing a huge switch with lots of repetition.
- **Reviewability**: changes are hard to spot and easy to misplace.
- **Validation**: duplicates or unreachable cases are difficult to detect.
- **Extensibility**: special rules (forme/gen) are intermingled with base mappings.

---

### Requirements (must not change)
- **Signature** stays: `matchSpeciesToTypes(species, forme?, generation?) => [Types, Types]`
- **Override precedence** stays: forme/gen edge cases must override base typing.
  - Example: `matchSpeciesToTypes("Raichu", "Alolan")` must return Electric/Psychic even if base Raichu is Electric/Electric.
  - Example: `matchSpeciesToTypes("Clefairy", undefined, Generation.Gen1)` must return Normal/Normal (pre-fairy typing rules).
- **Fallback** stays: anything not found should fall back to `[Types.Normal, Types.Normal]` (matching current `default:` branch).

---

## Proposed architecture

### 1) Keep edge cases as explicit “rules”
Retain the override layer as an ordered list of rules (current `handleSpeciesTypeEdgeCases` is already close to this).

This layer should contain only logic that depends on:
- forme (Alolan/Galarian/Hisuian/Paldean, Rotom appliances, Castform weather, etc.)
- generation (Fairy retcon / historical type changes)
- other one-off exceptions

**Key property**: order matters; first match wins.

### 2) Replace the giant `switch` with a base lookup table
Move “base typing” into data:

- `BASE_SPECIES_TYPES: Record<Species, readonly [Types, Types]>`

Then `matchSpeciesToTypes` becomes:
1. apply overrides; if found, return
2. else return base lookup
3. else return fallback `[Normal, Normal]` (should never happen if base is complete, but preserves compatibility)

---

## Base mapping format options

### Option A: Group-based definitions (compact + readable)
Define groups by type-pair, and build the final map once:

- Pros:
  - Keeps the current “grouping ergonomics” you get from switch fallthrough cases.
  - Makes it easy to review at a glance (“these are all Water/Water”, etc.).
  - Enables straightforward duplicate detection when building the map.
- Cons:
  - A bit more scaffolding (builder + validation).
  - Completeness is enforced by tests/validation rather than a single `Record<Species,...>` literal (though we can still enforce a lot with typing).

### Option B: Flat record literal (max TS enforcement)
Define a direct map:

- Pros:
  - TypeScript can enforce keys/values very strongly (`satisfies Record<Species, ...>`).
  - Very direct; no builder needed.
- Cons:
  - Verbose (big object literal).
  - Less “grouped” readability.

---

## Safety and validation strategy

### Compile-time safety
Prefer:
- `const BASE_SPECIES_TYPES = { ... } satisfies Record<Species, readonly [Types, Types]>;`

This ensures:
- keys are valid `Species`
- values are valid `[Types, Types]`

### Runtime validation (dev/test only)
If we use group-based definitions, add a small validation helper that can:
- detect duplicate species assigned across groups
- optionally assert that all `listOfPokemon` entries are covered by base mapping

### Test safety net
We already have Jest tests that verify:
- several concrete known outputs
- all `listOfPokemon` return a tuple with length > 0 (lightweight sanity check)

We can optionally add:
- a test that fails if any species returns the fallback Normal/Normal unintentionally
- a test that asserts “no duplicates in group definitions”

---

## Migration plan (low-risk, efficient)

### Phase 0: Confirm scope
Confirm whether we want:
- **Behavior-preserving refactor only** (recommended default), or
- **Refactor + correctness improvements** (expand forme coverage, etc.)

### Phase 1: Introduce base mapping module
Create a new module, e.g.:
- `src/utils/formatters/speciesTypesBase.ts`

Export:
- `BASE_SPECIES_TYPES`

Update `matchSpeciesToTypes` to:
- call overrides first
- then lookup in `BASE_SPECIES_TYPES`
- then fallback

Keep `handleSpeciesTypeEdgeCases` in the same file for now.

### Phase 2: Populate the base mapping mechanically
To avoid hand-editing 2K lines, use a one-off script to transform the existing switch into:
- grouped definitions, or
- a flat record

Paste the generated output into `speciesTypesBase.ts`.

### Phase 3: Delete the switch
Once the base mapping is complete and tests pass, remove the old `switch` block entirely.

### Phase 4: Hardening (optional)
Add:
- duplicate detection test (if using groups)
- coverage test (every `Species` maps to a non-fallback result)

---

## Risks and mitigations
- **Missing a species**:
  - Mitigate with `Record<Species,...>` typing (best) or coverage tests.
- **Duplicate assignment** (group-based):
  - Mitigate with builder-time validation + Jest test.
- **Changed override precedence**:
  - Mitigate by keeping override logic first and preserving the existing rule order.
- **Bundle size/perf**:
  - Generally neutral; we’re swapping a big switch for a big data table.

---

## Action plan (next steps)
- Decide:
  - **Scope**: “behavior-preserving refactor” vs “refactor + correctness improvements”
  - **Data shape**: group-based vs flat-record mapping
- Implement:
  - add `src/utils/formatters/speciesTypesBase.ts`
  - rewrite `matchSpeciesToTypes` to use overrides + base lookup
  - generate and populate the mapping (script-assisted)
  - remove the old switch
  - run Jest tests and ensure no output changes


