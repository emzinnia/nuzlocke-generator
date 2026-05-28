# Translations

Nuzlocke Generator is currently English-only. There is no maintained translation
catalog or locale switcher in the app today.

User-authored run content can still be written in any language. Nicknames,
rules, notes, custom locations, custom trainer text, and custom CSS are stored
with the run data and export/import with `nuzlocke.json`.

## Current Status

- App chrome, editor labels, menu items, toasts, and built-in rules are not
  localized yet.
- Pokemon, move, ability, type, location, and game names are stored as app data
  keys in many places, so translating them safely needs a shared lookup layer
  rather than ad hoc text replacement.
- Save-file parsing may preserve game text from non-English cartridges where
  the parser supports that game's character encoding, but that is separate from
  translating the app interface.

## Contribution Path

A translation implementation should start with one complete locale and a small
shared translation API before adding more languages. A good first PR would:

- add a locale setting with `en` as the default;
- move a small, user-visible surface such as top-level editor tabs or common
  buttons into a typed message catalog;
- include tests proving missing translations fall back to English;
- avoid changing saved run data formats unless a migration is included.

Please open an issue or PR with the target language and the first UI surface you
want to translate so the scope stays reviewable.
