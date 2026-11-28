# Pokémon Gen 4 (.sav) Save Data Structures — Summary Guide (D/P, Pt, HG/SS)

This document summarizes the **save-file layout**, **block locations**, **field maps**, and **parsing workflow** for Generation IV Nintendo DS mainline games:

- **Diamond / Pearl (D/P)**
- **Platinum (Pt)**
- **HeartGold / SoulSilver (HG/SS)**

It is oriented toward writing parsers/editors (e.g., Node/TypeScript), and focuses on what you need to **locate**, **validate**, and **decode** data safely.

---

## 1) Top-level file layout (block pairs)

Gen 4 `.sav` files are structured as **two block pairs**: one is the **current** save and one is a **backup**. Each pair contains:

- a **General (“small”) block**
- a **Storage (“big”) block**

In **Diamond/Pearl**, there is also a separate **Hall of Fame** block per pair.  
Sources: Bulbapedia overview and Project Pokémon D/P structure.  
- https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)  
- https://projectpokemon.org/home/docs/gen-4/dp-save-structure-r74/

### 1.1 Block pair locations (game-version differences)

**Bulbapedia** provides the canonical block boundaries for Gen 4:  
https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)

| Game | Pair #1 General (small) | Pair #1 Storage (big) | Pair #2 offset |
|---|---:|---:|---:|
| Diamond/Pearl | `0x00000 .. 0x0C0FF` | `0x0C100 .. 0x1E2DF` | `+ 0x40000` |
| Platinum | `0x00000 .. 0x0CF2B` | `0x0CF2C .. 0x1F10F` | `+ 0x40000` |
| HeartGold/SoulSilver | `0x00000 .. 0x0F6FF` | `0x0F700 .. 0x21A10` | `+ 0x40000` |

**Diamond/Pearl only (Hall of Fame):**  
Project Pokémon notes HoF blocks begin at `0x20000` (pair #1) and `0x60000` (pair #2), and have their own footer format.  
https://projectpokemon.org/home/docs/gen-4/dp-save-structure-r74/

---

## 2) Footers and integrity (checksums, “which block is current”)

### 2.1 Common footer (small + big blocks)

Both **general (small)** and **storage (big)** blocks end with a **20-byte footer** (`0x14`). Bulbapedia describes this footer and the fact the checksum is computed over the **whole block excluding the footer**:  
https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)

Footer schema (Bulbapedia):

| Footer offset | Meaning |
|---:|---|
| `0x00..0x03` | Link value (connects small ↔ big) |
| `0x04..0x07` | Save number |
| `0x08..0x0B` | Block size |
| `0x0C..0x11` | Runtime fields (`K`, `T`) |
| `0x12..0x13` | Block checksum |

### 2.2 Project Pokémon (D/P) footer semantics (save-count linking)

Project Pokémon gives a more specific D/P interpretation:

- `0x00..0x03`: **storage block save count**
- `0x04..0x07`: **general block save count**
- `0x12..0x13`: checksum  
https://projectpokemon.org/home/docs/gen-4/dp-save-structure-r74/

### 2.3 Block checksum algorithm (CRC-16-CCITT)

Bulbapedia explicitly states Gen 4 uses **CRC-16-CCITT** for block checksums.  
https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)

Project Pokémon provides implementation guidance and seek offsets used in D/P and Pt when computing block checksums.  
https://projectpokemon.org/home/docs/gen-4/pok%C3%A9mon-nds-save-file-checksum-r79/

### 2.4 Selecting the “current” blocks (important behavior)

You should not assume pair #1 is current. The game:

1. Compares **general block save counts**
2. Chooses the general block with the higher count (if checksum valid)
3. Chooses the storage block by **storage save count**, then validates it is linked to the selected general block  
Project Pokémon details this load procedure for D/P.  
https://projectpokemon.org/home/docs/gen-4/dp-save-structure-r74/

---

## 3) Storage (PC boxes) layout and parsing notes

### 3.1 Shared constraints

Across D/P/Pt/HGSS:
- **18 boxes**
- **30 slots per box**
- each stored “boxed Pokémon” record is **136 bytes**  
Sources: Bulbapedia Storage block and Pokémon structure docs.  
- https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)  
- https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)

### 3.2 D/P/Pt storage block map (relative to start of BIG block)

From Bulbapedia:  
https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)

| Offset | Length | Type | Meaning |
|---:|---:|---|---|
| `0x00` | 4 | `u32` | last selected box index (`0` = Box 1) |
| `0x04` | 73,440 | `box[18]` | box Pokémon blob (`18 * 30 * 136`) |
| `0x11EE4` | 720 | `string[18]` | box names (Gen 4 u16 encoding) |
| `0x121B4` | 18 | `u8[18]` | box wallpapers |
| `0x121C6` | 20 | footer | block footer |

### 3.3 HGSS storage block map (relative to start of BIG block)

Bulbapedia notes HGSS **pads each box** to `0x1000` bytes and leaves additional unused bytes near the end of the storage block:  
https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)

Project Pokémon confirms the padding behavior as “16 bytes of space between boxes.”  
https://projectpokemon.org/home/docs/gen-4/hgss-save-structure-r76/

| Offset | Length | Type | Meaning |
|---:|---:|---|---|
| `0x00` | 73,728 | `box[18]` | 18 boxes, each `0x1000` bytes (4080 bytes Pokémon + 16 padding) |
| `0x12000` | 4 | `u32` | last selected box index |
| `0x12004` | 4 | `u32` | total Pokémon stored (may not be set reliably) |
| `0x12008` | 720 | `string[18]` | box names (Gen 4 u16 encoding) |
| `0x122D8` | 18 | `u8[18]` | box wallpapers |
| `0x122EA` | 22 | unused | padding/unused region |
| `0x122FE` | 20 | footer | block footer |

**Practical HGSS box iteration rule**

For box index `b ∈ [0..17]` and slot index `s ∈ [0..29]`:
- base offset = `b * 0x1000 + s * 136`
- ignore the last `0x10` bytes of each box (padding)

(Bulbapedia and Project Pokémon descriptions align on the 16-byte spacing.)  
- https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)  
- https://projectpokemon.org/home/docs/gen-4/hgss-save-structure-r76/

---

## 4) General (small) block: key field map (high-value offsets)

The small block is large; most editors only need a subset of stable offsets.  
The following offsets come from Bulbapedia’s “General (small) block” table (and Project Pokémon’s Platinum offsets line up for key trainer fields).  
- https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)  
- https://projectpokemon.org/home/docs/gen-4/platinum-save-structure-r81/

| Offset | Type | Meaning |
|---:|---|---|
| `0x68` | `string (u16[8])` | trainer name (Gen 4 encoding) |
| `0x78` | `u16` | trainer ID (TID) |
| `0x7A` | `u16` | secret ID (SID) |
| `0x7C` | `u32` | money (cap 999,999) |
| `0x80` | `u8` | gender |
| `0x81` | `u8` | cartridge locale (language/region code) |
| `0x9C` | `u8` | number of party Pokémon |
| `0xA0..` | `pkmn[6]` | party Pokémon (each includes battle stats) |

**Party Pokémon size note**

Bulbapedia explicitly notes party Pokémon include **an extra 100 bytes of battle stats** beyond the boxed structure.  
https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)

Project Pokémon’s “PKM Structure” page provides concrete save locations and sizes for party vs PC Pokémon (useful for sanity checks).  
https://projectpokemon.org/home/docs/gen-4/pkm-structure-r65/

---

## 5) Pokémon (PK4) parsing: boxed vs party

### 5.1 Sizes and where they appear

- **Boxed Pokémon:** 136 bytes (PC storage)  
- **Party Pokémon:** boxed structure + appended battle stats region  
Sources: Bulbapedia Pokémon data structure and the save structure’s party note.  
- https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)  
- https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)

### 5.2 Boxed Pokémon: decrypt + unshuffle pipeline

Bulbapedia describes the full PK4 format:

1) **Unencrypted header** includes personality value (PID) and checksum  
2) The 128-byte payload is split into **four 32-byte blocks (A/B/C/D)** and shuffled based on PID  
3) The shuffled payload is **encrypted** using a checksum-seeded PRNG

Reference:  
https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)

#### Integrity (PK4 checksum)

Bulbapedia checksum definition:

- Split decrypted data `0x08..0x87` into 16-bit words
- Sum all words
- Truncate to 16 bits  
https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)

#### Block shuffling

Shift value:

`((pv & 0x3E000) >> 0xD) % 24`

Bulbapedia includes the 24-entry block-order table for mapping shift→(ABCD permutation).  
https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)

#### Encryption (LCG parameters)

Bulbapedia specifies the PRNG:

- seed: `X[0] = checksum`
- advance: `X[n+1] = 0x41C64E6D * X[n] + 0x6073`
- XOR: `D[n] = D[n] XOR (X[n+1] >> 16)` for each 16-bit word  
https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)

### 5.3 Party battle stats region (important difference)

Bulbapedia: Party battle stats are encrypted similarly, **but**
- seed is **PID**, not checksum
- bytes are **not shuffled**  
https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)

---

## 6) Language handling (save-level vs Pokémon-level)

Gen 4 has two separate “language” layers you must not conflate:

### 6.1 Save-level language / locale (cartridge locale)

The general (small) block has a “**Cartridge Locale**” byte at `0x81`.  
Bulbapedia documents this in the small-block table and provides example codes (e.g., Japan vs Western English).  
https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)

Project Pokémon’s Platinum page similarly documents a “Country of Origin” at `0x81` with a concrete code list (including Korean).  
https://projectpokemon.org/home/docs/gen-4/platinum-save-structure-r81/

### 6.2 Pokémon-level “Language of origin” (per Pokémon)

Bulbapedia’s PK4 field map includes **Language of origin** at offset `0x17` within the encrypted block A.  
It also lists the numeric codes used for Japanese/English/French/Italian/German/Spanish/Korean.  
https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)

### 6.3 Text encoding (names, box names, OT names, nicknames)

Bulbapedia states Gen 4 uses a shared **two-byte character set** for all languages and stores DS text values **little-endian**.  
https://bulbapedia.bulbagarden.net/wiki/Character_encoding_(Generation_IV)

Important interoperability note:

- Except for **Korean** language games, Gen 4 language versions can trade/battle with each other; names are displayed identically regardless of the game language.  
https://bulbapedia.bulbagarden.net/wiki/Character_encoding_(Generation_IV)

### 6.4 European “language selection” behavior (practical consequence)

Bulbapedia’s Options page notes that in European releases, the **language-selection menu** differs across two European SKUs (one bundle includes English/German/French; the other includes English/Spanish/Italian).  
This matters if you’re trying to infer UI-language behavior from region alone.  
https://bulbapedia.bulbagarden.net/wiki/Options

---

## 7) Field maps reference (what to keep nearby)

For implementation work, keep these pages open:

- Save blocks, storage block, footers, block boundaries:  
  https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_(Generation_IV)

- PK4 structure, checksum, shuffling, encryption, battle stats, language:  
  https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_(Generation_IV)

- Gen 4 text encoding / character table:  
  https://bulbapedia.bulbagarden.net/wiki/Character_encoding_(Generation_IV)

- D/P save loading rules + footers + HoF existence:  
  https://projectpokemon.org/home/docs/gen-4/dp-save-structure-r74/

- HGSS storage spacing/padding confirmation + additional offsets:  
  https://projectpokemon.org/home/docs/gen-4/hgss-save-structure-r76/

- Block checksum tooling/offset examples (CRC-16-CCITT usage):  
  https://projectpokemon.org/home/docs/gen-4/pok%C3%A9mon-nds-save-file-checksum-r79/

---

## 8) Parsing checklist (read-only parser)

Use this as a safe, deterministic workflow.

### 8.1 File identification and block selection

- [ ] Read the entire `.sav` into a byte buffer.
- [ ] Identify game family by validating the **block boundary ranges** (D/P vs Pt vs HGSS).  
      (Use the table in section 1.1; Bulbapedia lists exact end offsets.)
- [ ] Enumerate both block pairs: base `0x00000` and base `0x40000`.
- [ ] For each candidate general/storage block:
  - [ ] Extract its footer (last `0x14` bytes).
  - [ ] Recompute CRC-16-CCITT over the block **excluding** the footer; reject if mismatch.  
        (Bulbapedia + Project Pokémon checksum guidance.)
- [ ] Choose the “current” blocks:
  - [ ] Prefer higher **general save count**, then select a **storage block** that links to it (Project Pokémon D/P procedure).

### 8.2 Storage parsing

- [ ] Use game-specific storage map:
  - [ ] D/P/Pt: box blob starts at `big+0x04`, contiguous `18*30*136`
  - [ ] HGSS: `18` boxes of `0x1000`, each box contains `30*136` data + `0x10` padding
- [ ] Parse box names/wallpapers using the documented offsets.
- [ ] Treat “empty slot” as **all `0x00` or all `0xFF`** only after confirming in practice; otherwise rely on:
  - [ ] PK4 checksum validity post-decrypt
  - [ ] species ID sanity checks (nonzero, within expected range)

### 8.3 Pokémon (PK4) parsing

For each 136-byte record:

- [ ] Read PID and checksum from unencrypted header.
- [ ] Decrypt the 128-byte payload using the checksum-seeded LCG XOR.
- [ ] Verify PK4 checksum (sum of u16 words over `0x08..0x87`, trunc to 16 bits).
- [ ] Compute shuffle index from PID, unshuffle blocks using the Bulbapedia permutation table.
- [ ] Read fields from the now-decrypted, unshuffled structure (species, OT IDs, moves, IV bitfield, met data, etc.).
- [ ] Capture **Language of origin** (per-Pokémon) and store it separately from save-level locale.

### 8.4 Language and text

- [ ] Decode all u16 strings using the Gen 4 character table and little-endian u16 units.
- [ ] Track:
  - [ ] save-level locale (`small+0x81`)
  - [ ] Pokémon language-of-origin (`pk4+0x17` in decrypted payload)
- [ ] Be careful with cross-language saves (Korean interop exception, EU language selection variants).

---

## Appendix A — Quick “what lives where” (absolute offsets)

These offsets are commonly used as sanity checks and are widely referenced:

- Party Pokémon (pair #1): `0x00098` (size 236 each)  
- Party Pokémon (pair #2): `0x40098`  
- PC Pokémon start (pair #1): `0x0C104`  
- PC Pokémon start (pair #2): `0x4C104`  
Project Pokémon “PKM Structure” location section:  
https://projectpokemon.org/home/docs/gen-4/pkm-structure-r65/

(These are particularly useful when validating you’ve identified the right big/small blocks and are reading the correct pair.)

---
