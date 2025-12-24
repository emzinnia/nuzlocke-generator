# FORMES

Guidelines for unifying how Pokémon formes are represented, selected, and rendered in the app. The goal is to make complex cases (e.g., Zygarde’s 10%/50%/Complete/Mega chain) predictable across icons, sprites, type matching, and data entry.

## Current state (what exists today)
- **Data model:** `Pokemon.forme?: Forme` in `src/models/Pokemon.ts` with `Forme` enum (icons-oriented slugs) in `src/utils/Forme.ts`.
- **UI options:** `getAdditionalFormes(species)` hardcodes per-species selectable formes (e.g., Zygarde returns `["10%", "Complete"]`; 50% is omitted to avoid confusion). Used by `CurrentPokemonEdit` to build the Forme select.
- **Type overrides:** `matchSpeciesToTypes` applies forme-specific typing (Alolan/Galarian/Hisuian, Rotom appliances, Oricorio styles, Paldean Tauros variants, etc.).
- **Asset naming helpers:**
  - `addForme` builds local image slugs (e.g., `galarian-slowbro`, `zygarde-10`, `zygarde-complete`; note: 10% uses `-10`, Complete uses `-complete`).
  - `getIconFormeSuffix` builds icon filename suffixes (e.g., `-10-percent`, `-complete`; falls back to `Forme` enum values).
  - `getForme` builds Serebii sprite suffixes (covers only a subset: Alolan/Galarian/Gigantamax/etc.).
- **Rendering:** `PokemonImage` / `getPokemonImage` compose URLs from the above helpers; `PokemonIcon` uses `getIconFormeSuffix`; `getSpriteIcon` (deprecated) also uses `getForme`.
- **Parser quirks:** Gen 2 parser infers Unown forme from IVs; other parsers carry `forme` through but rely on the shared helpers for rendering.

## Pain points and inconsistencies
- Forme naming is not normalized: icons expect `-10-percent`, images expect `-10`, sprites expect `-10%` → the same Zygarde form can map to three different slugs.
- `Forme` enum is icon-focused; `getAdditionalFormes` and `matchSpeciesToTypes` use raw strings, so new formes must be added in multiple files by hand.
- `addForme` has spelling inconsistencies (e.g., `palden-aqua` vs `paldean-aqua`) and limited coverage (e.g., Primal, Shadow Rider/Ice Rider, many special caps, etc.).
- `getForme` covers only a few sprite suffixes; new regional formes silently fall back to the base sprite.
- Zygarde 50% is implicitly “Normal” in the enum but removed from the selectable list, which makes state transitions unclear; Mega/Complete relationships are not encoded anywhere.
- Hard-coded per-species lists prevent reuse for validation or typing; asset errors surface only at runtime (broken images).

## Alignment plan (single source of truth)
Create a central `formeConfig` describing each species’ formes and the slugs needed per surface:
```ts
type FormeSlug = {
  id: Forme | string;           // canonical key stored on Pokemon
  label: string;                // user-facing name
  iconSlug?: string;            // e.g., "-10-percent"
  imageSlug?: string;           // e.g., "-10" or "-complete"
  spriteSlug?: string;          // Serebii suffix, e.g., "-m", "-a", "-g"
  generations?: Generation[];   // availability gates
  types?: [Types, Types];       // override for matchSpeciesToTypes
  evolvesFromForme?: FormeSlug["id"]; // optional dependency for gating
};

type FormeConfig = Record<Species, FormeSlug[]>;
```

From this config, derive helpers:
- `getAvailableFormes(species, generation?, context?)` → replaces `getAdditionalFormes`.
- `getFormeAssetSlug(species, forme, surface: "icon" | "image" | "sprite")` → replaces `getIconFormeSuffix`, `addForme`, `getForme` special cases.
- `getFormeTypes(species, forme)` → feeds `matchSpeciesToTypes`.
- `normalizeFormeId(input)` → accepts user strings and returns a canonical id.

Implementation approach:
- Keep `Forme` enum for compatibility, but drive future additions from `formeConfig`; map enum members to config ids.
- Backfill config for all existing per-species overrides (Alolan/Galarian/Hisuian/Paldean, Rotom appliances, Oricorio styles, Gigantamax, Paldean Tauros, Calyrex riders, Ogerpon masks, etc.).
- Add tests that assert: (1) every config entry has slugs for each surface we support, (2) every selectable forme maps to a valid icon/image/sprite path, (3) type overrides exist where needed.

## Zygarde example (proposed)
- Default stored forme: `Normal` represents 50%.
- Config entries:
  - `10%` → icon `-10-percent`, image `-10`, sprite `-10` (or `-10-percent` if switching source), types unchanged.
  - `Complete` → icon `-complete`, image `-complete`, sprite `-complete`.
  - `Mega` (if we keep it) → gated via `evolvesFromForme: "Complete"` so UI can disable Mega until Complete is selected; slugs follow `-mega` across surfaces.
- UI uses `getAvailableFormes("Zygarde")` to show `["Normal (50%)", "10%", "Complete", "Mega"]` with an optional note that 50% is the default.
- Asset helpers ensure all three surfaces agree on slugs; adding a new sprite provider only requires updating the config mapper.

## Quick wins before full refactor
- Fix known slug typos (`palden-aqua` → `paldean-aqua`, ensure consistent 10%/Complete slugs).
- Add missing sprite suffix handling in `getForme` for regional formes already in `Forme`.
- Reintroduce `50%` as an explicit label in `getAdditionalFormes` (mapped to `Normal`) to reduce confusion in the UI.
- Add a small test suite around forme slug builders (icon/image/sprite) for a handful of tricky species: Zygarde, Rotom, Oricorio, Tauros (Paldean), Ogerpon, Toxtricity (nature-driven), Calyrex riders.

## Migration steps
1) Introduce `formeConfig` and adapter helpers; keep legacy helpers delegating to the new ones.
2) Update `CurrentPokemonEdit` to read options from `getAvailableFormes`.
3) Switch `getPokemonImage`/`PokemonIcon` to use `getFormeAssetSlug` instead of hand-coded string building.
4) Move forme type overrides into `formeConfig` and thin `matchSpeciesToTypes`.
5) Add tests for the adapters and a snapshot of generated asset URLs per surface.

