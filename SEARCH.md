# Search (Advanced + Performant) — Implementation Plan

> **Implementation Status: ✅ Complete (Phase 1-3)**
>
> The search engine is now implemented in `src/utils/search/` with:
> - Tokenizer, Parser, Compiler, and Normalization utilities
> - Full integration with PokemonEditor → Box → PokemonByFilter
> - Comprehensive test suite (39 tests)
>
> Remaining work: Phase 4 (UX polish) and Phase 5 (perf hardening) are optional future enhancements.

---

This document describes a comprehensive plan for implementing **fast, advanced search** across Pokémon in the app (starting with the Pokémon Editor "Search…" bar).

Today, the Pokémon Editor search term is passed into each box and used primarily for **highlighting** matching Pokémon, not filtering. The goal of this plan is to implement a real search system that:

- Filters results as you type (and can still optionally highlight)
- Supports **advanced query syntax** (field filters, wildcards, negation, boolean logic, grouping)
- Remains **performant** even as teams/boxes grow and the UI rerenders frequently

---

## Goals

- **Prefix search by default**: searching `Br` matches Pokémon where `species` or `nickname` starts with `br` (case-insensitive), e.g. **Bruxish**, **Breloom**, nickname **Breem**.
- **Attribute search**: `species:Feebas`, `type:dark`, `gender:f`, `nickname:f*l`, etc.
- **Negative search**: `!species:Bulbasaur` excludes Bulbasaur.
- **Composable queries**: multiple terms combine (default AND), with optional OR and grouping.
- **Fast**: avoid repeated per-box/per-render O(N) work. Compile once, evaluate once, reuse across boxes.
- **Predictable + debuggable**: clear rules, good error messages, and a “search help” cheat sheet.

Non-goals (initially):

- Full-text fuzzy ranking across a remote Pokédex database
- Server-side search
- Complex phonetic matching

---

## Data model (what we can search)

From `src/models/Pokemon.ts`, each Pokémon has (among others): `species`, `nickname`, `gender`, `types`, `moves`, `item`, `ability`, `nature`, `level`, `status` (box name), `shiny`, `forme`, `gameOfOrigin`, `egg`, `hidden`, `alpha`, `teraType`, `notes`, etc.

This plan assumes the initial search target is **the in-memory Pokémon list** already present in state.

---

## UX behavior (what the user experiences)

### Default behavior

- **Free text term** (no `field:` prefix):
  - Matches if **species OR nickname** starts with the term.
  - Case-insensitive.
  - Example: `Br` matches `Bruxish`, `Breloom`, nickname `Breem`.

Why “starts with” by default?

- It matches user expectation for fast narrowing and supports the example `Br` behavior directly.
- It’s cheap: `startsWith` on normalized strings.

### Multiple terms

- Space-separated terms are **AND** by default:
  - `Br f` means: (species/nickname starts with `Br`) AND (gender equals `f` OR nickname/species starts with `f`, depending on how we treat bare tokens—see “Semantics” below).
  - For clarity, we should strongly encourage **field syntax** for non-name attributes: `Br gender:f`.

### Results presentation

- **Filtering**: by default, non-matching Pokémon are hidden (preferred).
- **Optional highlighting**: optionally keep current “green highlight” behavior as an additional cue:
  - If filter mode is on, highlight can indicate *which* ones matched.
  - If filter mode is off (a toggle), highlight-only can remain available.

### Error feedback

If the query is invalid (e.g. unmatched quote or unknown field):

- Show a small inline error under the search bar: “Unknown field `typoe:`. Did you mean `type:`?”
- Fall back to a safe behavior (either: treat whole input as plain text, or treat as no matches—prefer plain text fallback to avoid “everything disappears” surprises).

### Discoverability

- Add a small “?” icon or `⌘/` / `Ctrl+/` shortcut to open a **Search Help** popover containing:
  - Field list
  - Examples
  - Operators

---

## Query language (syntax)

### Core building blocks

- **Term**: a token that matches something.
- **Field filter**: `field:value`
- **Negation**: `!term` or `-term`
- **Wildcards**:
  - `*` matches “any characters” (including empty)
  - `?` matches “one character”
  - Example: `nickname:f*l` matches `fal`, `fuel`, `f___l` (case-insensitive)

### Examples

- **Prefix search**:
  - `Br`
  - `bre` (matches Breloom, nickname Breem, etc.)
- **Field equals / field match**:
  - `species:Feebas`
  - `type:dark`
  - `gender:f`
  - `status:Dead` (box/status)
- **Wildcards**:
  - `nickname:f*l`
  - `move:"ice beam"` (quoted values)
- **Negation**:
  - `!species:Bulbasaur`
  - `!type:grass`
- **AND (default)**:
  - `type:dark gender:f`
- **OR**:
  - `type:dark OR type:ghost`
  - `type:dark | type:ghost`
- **Grouping**:
  - `(type:dark | type:ghost) gender:f !status:Dead`

---

## Semantics (how terms match)

### Normalization

All comparisons should be performed on **normalized values**:

- `trim()`
- case-insensitive (typically via `toLowerCase()`)
- collapse internal whitespace for human-entered fields (moves/items): e.g. `"Ice  Beam"` → `"ice beam"`

### Field match types (recommended defaults)

Different fields should have different matching rules:

- **`species` / `nickname`**:
  - Default: **prefix** match unless wildcards are present
  - With wildcards: wildcard match
  - Optional later: `~` fuzzy operator
- **`type` / `teraType`**:
  - Exact match against either slot (types is `[Types, Types]`)
  - Accept aliases: `dark`, `Dark`, `DARK`
- **`gender`**:
  - Exact match (`f`, `m`, optionally `u` / unknown)
- **`moves`**:
  - Exact or substring depending on preference; recommended:
    - If value has wildcard: wildcard match against any move string
    - Else: substring match (because users often remember partial move names)
- **`status`** (box):
  - Exact match to box name (Team/Boxed/Dead/Champs/custom boxes)
- **booleans** (`shiny`, `egg`, `hidden`, `alpha`, `mvp`, `gift`):
  - Accept `true/false`, `yes/no`, `1/0`
- **numbers** (`level`, `metLevel`):
  - Support comparisons: `level>=20`, `level:20` (equals), `level:10..20` (range)
- **strings** (`item`, `ability`, `nature`, `gameOfOrigin`, `forme`, `notes`):
  - Substring match by default (unless we want strict exactness; decide per field)

### Bare terms (no `field:`)

Recommended: bare terms only search **name-like fields**:

- `species` prefix OR `nickname` prefix (and optionally `forme` exact)

Avoid having bare terms match everything (moves/items/etc.) initially, because:

- It becomes hard to predict why something matched.
- It can be slower and more “noisy” than desired.

If we want “search everywhere” later, add an explicit field:

- `any:...` (searches species/nickname/item/moves/notes, etc.)

---

## Field dictionary (names + aliases)

### Canonical fields

- `species`
- `nickname` (alias: `name`)
- `type` (alias: `types`)
- `tera` (alias: `teraType`)
- `gender` (alias: `sex`)
- `move` (alias: `moves`)
- `item`
- `ability`
- `nature`
- `level`
- `status` (alias: `box`)
- `forme` (alias: `form`)
- `game` (alias: `gameOfOrigin`)
- `shiny`
- `egg`
- `hidden`
- `alpha`
- `mvp`
- `gift`
- `notes`

Note: keep the “user-facing” fields stable, even if internal model keys change.

---

## Parser + AST (advanced syntax without perf cliffs)

### Why an AST?

We want to:

- Provide precise syntax (negation, OR, grouping, comparisons)
- Give good errors (“missing closing quote”, “unknown operator”)
- Compile once into an efficient predicate function

### Proposed grammar (high level)

- **Tokens**:
  - identifiers: `species`, `type`, `gender`
  - operators: `:`, `!`, `-`, `(`, `)`, `|`, `OR`, `AND`
  - comparators: `=`, `!=`, `>`, `>=`, `<`, `<=`
  - range operator: `..`
  - quoted strings: `"ice beam"`
  - bare strings: `Br`, `f*l`

- **Expressions**:
  - `Expr := OrExpr`
  - `OrExpr := AndExpr ( ( '|' | 'OR' ) AndExpr )*`
  - `AndExpr := UnaryExpr ( ( 'AND' )? UnaryExpr )*` (implicit AND via whitespace)
  - `UnaryExpr := ( '!' | '-' )? Primary`
  - `Primary := Group | FieldFilter | BareTerm`
  - `Group := '(' Expr ')'`
  - `FieldFilter := Field ( ':' Value | Comparator Value | ':' Range )`
  - `Range := Number '..' Number`

### Output

Parser returns:

- `ast`: a structured representation of the query
- `errors`: array of { message, startIndex, endIndex }
- `warnings`: e.g. unknown field suggestions

---

## Compilation step (turn AST into a fast matcher)

### Compile-to-predicate

Convert AST to a function:

- `predicate(pokemon: Pokemon, normalized: NormalizedPokemon): boolean`

Where `normalized` is precomputed for speed (see below).

Compilation should:

- Escape user input safely before building any RegExp
- Prefer `startsWith` / `includes` for common cases
- Only use RegExp when wildcards are present (or when explicitly requested)

### Wildcard implementation

Implement wildcard matching without catastrophic regex:

- Convert pattern to a safe regex:
  - Escape all regex metacharacters in user string
  - Replace escaped `\*` with `.*` and escaped `\?` with `.`
  - Anchor behavior:
    - For fields like `nickname/species`, consider anchoring to start unless user prefixes with `*`:
      - `Br*` -> `^br.*`
      - `*oom` -> `.*oom` (suffix match)
- Add max-length guardrails if needed (avoid extremely long patterns).

---

## Performance plan

### Key idea: “compile once, evaluate once, reuse everywhere”

Right now, each box renders and then checks matches per Pokémon repeatedly. With advanced search, we should:

- Compile query string → predicate **once**
- Evaluate predicate against each Pokémon **once per query** (not once per box)
- Store results as a `Set<id>` (or `Map<id, MatchInfo>`)
- Each box then filters by `status` and checks membership in the set

This ensures the work is O(N) per keystroke, not O(N × boxes).

### Normalized cache

Create a normalized representation per Pokémon id:

- `speciesLower`
- `nicknameLower`
- `typesLowerSet` (or both types lower)
- `movesLower[]`
- `itemLower`, `abilityLower`, etc.

Update strategy:

- Recompute normalized data only when Pokémon changes (by id).
- If state updates replace the whole team array frequently, keep a memoized map keyed by Pokémon id + a cheap “version” (or shallow compare of relevant fields).

### Debounce

Debounce input updates slightly (e.g. 50–150ms) to reduce needless recomputation while typing quickly, without feeling laggy.

### Optional: inverted indexes (later)

If the dataset grows to thousands and we want near-instant results:

- Build inverted index maps for discrete fields:
  - `type -> Set<id>`
  - `gender -> Set<id>`
  - `status -> Set<id>`
  - `shiny -> Set<id>`
- Evaluate query by set operations (intersection/union/difference) instead of scanning all Pokémon.

Start with scan + memoization first; add indexes if performance demands it.

---

## Integration plan (step-by-step)

### Phase 0 — Document + align on behavior

- Lock down:
  - Default matching (prefix for species/nickname)
  - Field list and aliases
  - Wildcard rules
  - Error behavior

### Phase 1 — Implement “search engine” utilities

Add a new module (suggested):

- `src/utils/search/`
  - `tokenize.ts`
  - `parse.ts`
  - `compile.ts`
  - `types.ts`
  - `normalize.ts`

Deliverables:

- `parseQuery(input) -> { ast, errors, warnings }`
- `compileQuery(ast) -> predicate`
- `buildNormalizedPokemon(pokemon) -> NormalizedPokemon`

### Phase 2 — Wire into Pokémon Editor (filtering)

Goal: Search bar actually **filters** Pokémon shown in boxes.

Implementation approach:

- In `PokemonEditor`, compute a `matchedIds` Set once from `team` + `searchTerm`.
- Pass `matchedIds` down into `BoxesComponent` / `Box`.
- In the Pokémon rendering component, filter icons:
  - If query is empty: show all
  - Else: show only Pokémon whose id is in `matchedIds`

Keep highlight behavior as optional:

- If filtering is on, highlight is redundant but can remain for “match confidence”.

### Phase 3 — Advanced syntax support (fields, negation, wildcards)

Incrementally add:

- `field:value`
- `!field:value`
- Wildcards in value
- Quoted values
- OR operator and grouping
- Comparators for numeric fields

### Phase 4 — UX polish

- Search help popover (cheat sheet + examples)
- Inline error messages + suggestions
- Optional autocomplete:
  - Field name suggestions after typing `sp...`
  - Value suggestions for discrete fields (types, gender, status)
- “Clear search” button

### Phase 5 — Perf hardening

- Debounce
- Memoize compilation and evaluation
- Add inverted indexes if needed
- Add lightweight profiling hooks (dev-only):
  - time spent compiling
  - time spent evaluating

---

## Test plan

### Unit tests (parser + compiler)

Create tests covering:

- Prefix matching:
  - `Br` matches `Bruxish`, `Breloom`, nickname `Breem`
- Field filters:
  - `species:Feebas`
  - `type:dark` matches if either type is Dark
  - `gender:f` matches only female
- Wildcards:
  - `nickname:f*l` matches `Feral`, `Fool`, etc.
- Negation:
  - `!species:Bulbasaur` excludes Bulbasaur
- OR / grouping:
  - `(type:dark | type:ghost) gender:f`
- Numbers:
  - `level>=20`, `level:10..20`
- Quoted values:
  - `move:"ice beam"`
- Error cases:
  - `species:"Feebas` (unterminated quote)
  - `typoe:dark` (unknown field suggestion)

### Component tests

- Pokémon Editor:
  - typing `Br` hides non-matching Pokémon
  - clearing query restores all
  - invalid query shows error but remains usable

### Cypress e2e

- Ensure search works end-to-end in the real UI:
  - `Br` filters as expected
  - `type:dark` filters
  - `!species:Bulbasaur` excludes

---

## Open questions (decisions to make)

- **Should bare terms search only species/nickname, or include items/moves/notes too?**
  - Recommended: species/nickname only (predictable).
  - Decision: species/nickname only
- **Should `species:Feebas` be exact or prefix by default?**
  - Recommended: exact unless wildcard is used (predictable), but allow a dedicated operator if we want prefix: `species^:Fee` or `species:Fee*`.
  - Decision: prefix by default but there can be an exact key `species
- **How should multiple bare terms behave?**
  - Option A: treat each bare token as prefix against species/nickname (AND across tokens)
  - Option B: treat the whole string as a single prefix phrase
  - Recommended: A (more flexible)
- **Should the search apply across all boxes or only the current box?**
  - Current search is global; keep global.
- **What’s the desired behavior for “no matches”?**
  - Hide all Pokémon but show a small “No matches” hint.

---

## Quick reference (cheat sheet)

- **Name prefix**: `Br`
- **Species**: `species:Feebas`
- **Nickname**: `nickname:Breem` or `name:Breem`
- **Type**: `type:dark`
- **Gender**: `gender:f`
- **Wildcard**: `nickname:f*l`
- **Not**: `!species:Bulbasaur`
- **OR**: `type:dark | type:ghost`
- **Group**: `(type:dark | type:ghost) gender:f`
- **Level**: `level>=20`, `level:10..20`


