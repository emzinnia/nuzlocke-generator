## 1) Gen 3 `.sav` file layout (Flash save)

### Overall file map (128 KiB)

Gen 3 saves are typically **0x20000 bytes** and are split like this:

* `0x000000..0x00DFFF` (0xE000 bytes): **Game save A**
* `0x00E000..0x01BFFF` (0xE000 bytes): **Game save B**
* `0x01C000..0x01DFFF` (0x2000 bytes): **Hall of Fame**
* `0x01E000..0x01EFFF` (0x1000 bytes): **Mystery Gift / e-Reader**
* `0x01F000..0x01FFFF` (0x1000 bytes): **Recorded Battle** ([Bulbapedia][1])

Gen 3 keeps **two** main save blocks (A/B): the newest is used; if it fails validation, the older one is used; if both fail you get a “new game” situation. ([Bulbapedia][1])

### Save block → 14 “sections” of 4 KiB

Each game save block (A or B) contains **14 sections**, each **0x1000 bytes (4 KiB)**. ([Bulbapedia][1])

Each 0x1000-byte section is:

* `0x0000..0x0FF3` (0xFF4 = 3968 bytes): data payload
* `0x0FF4..0x0FF5`: section ID (u16)
* `0x0FF6..0x0FF7`: checksum (u16)
* `0x0FF8..0x0FFB`: signature (u32)
* `0x0FFC..0x0FFF`: save index (u32) ([Bulbapedia][1])

#### Signature (“magic”)

The signature is the constant **`0x08012025`** (little-endian bytes `25 20 01 08`). If it doesn’t match, the section (and thus the block) is treated invalid. ([Bulbapedia][1])

#### Section IDs + checksum lengths

You don’t checksum the whole 0xFF4 for every section; the “active bytes” depend on the **section ID**:

| Section ID | Checksum byte length | Meaning       |
| ---------: | -------------------: | ------------- |
|          0 |                 3884 | Trainer info  |
|          1 |                 3968 | Team / items  |
|          2 |                 3968 | Game state    |
|          3 |                 3968 | Misc data     |
|          4 |                 3848 | Rival info    |
|       5–12 |                 3968 | PC buffer A–H |
|         13 |                 2000 | PC buffer I   |

This table (including the “rotating order” behavior) is spelled out directly. ([Bulbapedia][1])

#### Section checksum algorithm (critical for validation/writing)

For each section, the checksum is computed like this:

1. start a 32-bit accumulator at 0
2. read 4 bytes at a time (little-endian u32) across the section’s “checksum length” and add into the accumulator
3. fold the 32-bit sum into 16 bits by adding upper 16 to lower 16
4. that 16-bit result is the checksum ([Bulbapedia][1])

### Choosing the “current” save block

All 14 sections in a block should share the same save index (it increments on each save). The current save is the block with the higher save index, as long as its sections validate. ([Bulbapedia][1])

### PC storage is “striped” across sections 5–13

The **PC buffer** is contiguous *when reconstructed*:

* section 5 contributes bytes 0..3967
* section 6 contributes bytes 3968..7935
* …
* section 12 contributes bytes 27776..31743
* section 13 contributes bytes 31744..(31744+2000-1)

Total PC buffer bytes = `3968*8 + 2000 = 33744`. ([Bulbapedia][1])

Inside that reconstructed PC buffer:

* `0x0000` (4 bytes): current PC box (0 = Box 1, …, 13 = Box 14)
* `0x0004` (33600 bytes): **420 Pokémon records**, **80 bytes each** (PC format)
* `0x8344` (126 bytes): box names
* `0x83C2` (14 bytes): box wallpapers ([Bulbapedia][1])

---

## 2) Party/PC Pokémon record formats (the famous Gen 3 “encrypted substructs”)

### Party Pokémon = 100 bytes, PC Pokémon = first 80 bytes of that

Bulbapedia gives the full **100-byte** layout and notes that PC storage uses only the **first 80 bytes** (everything up through the encrypted 48-byte “data” field). ([Bulbapedia][2])

#### 100-byte party structure (offsets)

Key fields (all little-endian):

* `0x00` u32: **personality value**
* `0x04` u32: **OT ID** (Trainer ID + Secret ID packed)
* `0x08` 10 bytes: nickname (Gen 3 charset)
* `0x12` u8: language
* `0x13` u8: misc flags
* `0x14` 7 bytes: OT name (Gen 3 charset)
* `0x1B` u8: markings
* `0x1C` u16: **checksum** (validates decrypted substruct data)
* `0x1E` u16: unknown/padding
* `0x20` 48 bytes: **encrypted substructures**
* `0x50` u32: status condition
* `0x54` u8: level
* `0x55` u8: mail ID
* `0x56` u16: current HP
* `0x58..0x62` u16s: stats (HP, Atk, Def, Spd, SpA, SpD) ([Bulbapedia][2])

### The 48-byte encrypted “data” is 4×12-byte substructures

Gen 3 packs real Pokémon identity data into four 12-byte substructures:

* Growth
* Attacks
* EVs & Condition
* Misc

…and **shuffles their order** based on `(personality % 24)`. The order table is explicitly listed (e.g., GAEM, GAME, …). ([Bulbapedia][3])

### Decryption key and process

**Key:** `key = OT_ID XOR personality` (32-bit)

**Decrypt:** XOR each 4-byte word (u32) of the 48-byte region with `key`. ([Bulbapedia][3])

### Pokémon checksum (the “Bad Egg” guard)

The stored checksum (`0x1C`) is computed by summing the **unencrypted** 48 bytes “one word at a time” and truncating to 16 bits; if it doesn’t match, the Pokémon is treated as a Bad Egg. ([Bulbapedia][2])

*(In practice you’ll usually implement this as sum of 16-bit little-endian words across the 48 bytes, `& 0xFFFF`.)*

### Substructure field meanings (what’s in each 12 bytes)

The substructure layout is given as a combined table; highlights:

**Growth (12 bytes)**

* species (u16), held item (u16), experience (u32)
* PP bonuses (u8), friendship (u8), unused (2 bytes)

**Attacks (12 bytes)**

* moves 1–4 (u16×4)
* PP 1–4 (u8×4)

**EVs & Condition (12 bytes)**

* EVs: HP/Atk/Def/Spd/SpA/SpD (u8×6)
* Contest stats: cool/beauty/cute/smart/tough/feel (u8×6)

**Misc (12 bytes)**

* Pokérus status (u8)
* met location (u8)
* origins info (u16)
* IV/Egg/Ability bitfield (u32)
* ribbons/obedience bitfield (u32) ([Bulbapedia][3])

Bitfield details that matter a lot:

* **PP bonuses:** 2 bits per move (0–3) ([Bulbapedia][3])
* **Pokérus byte:** low nibble = days remaining, high nibble = strain ([Bulbapedia][3])
* **IV/Egg/Ability u32:** 5 bits per IV (30 bits), bit 30 = egg flag, bit 31 = ability slot ([Bulbapedia][3])

---

## 3) Strings / text encoding (Gen 3 charset)

Gen 3 uses a proprietary 1-byte character table; fixed-size strings are terminated with **0xFF** and then padded (often with 0x00). ([Bulbapedia][1])

A verifiable hex→text table (FR/LG page, but used as a practical Latin mapping reference) shows:

* `0xBB..0xD4` = `A..Z`
* `0xD5..0xEE` = `a..z`
* `0xA1..0xAA` = `0..9`
  …and various punctuation. ([datacrystal.tcrf.net][4])

---

## 4) TypeScript (Node.js) reference implementation

This is a **read/verify** path that:

* selects the active save block (A or B),
* validates signatures + section checksums,
* rebuilds the PC buffer,
* parses player name + party Pokémon,
* decrypts Pokémon substructures and returns a structured object.

```ts
// gen3-save.ts
import { readFile } from "node:fs/promises";

const SAVE_SIZE = 0x20000;
const BLOCK_SIZE = 0xE000;
const SECTION_SIZE = 0x1000;
const SECTION_DATA_SIZE = 0x0ff4;

const SECTION_SIGNATURE = 0x08012025;

// From the Gen 3 section ID table (checksum length depends on section ID).
const SECTION_CHECK_BYTES: Record<number, number> = {
  0: 3884,
  1: 3968,
  2: 3968,
  3: 3968,
  4: 3848,
  5: 3968,
  6: 3968,
  7: 3968,
  8: 3968,
  9: 3968,
  10: 3968,
  11: 3968,
  12: 3968,
  13: 2000,
};

type Gen3Variant = "RSE" | "FRLG";

type SaveSection = {
  id: number;
  checksum: number;
  signature: number;
  saveIndex: number;
  data: Buffer; // 0xFF4 bytes
};

type ParsedPokemon = {
  personality: number;
  otId: number;
  nickname: string;
  otName: string;
  language: number;
  markings: number;
  checksumStored: number;
  checksumComputed: number;
  isChecksumValid: boolean;

  // canonical (unshuffled) decoded fields:
  growth: {
    species: number;
    heldItem: number;
    experience: number;
    ppBonuses: number;
    friendship: number;
  };
  attacks: {
    moves: [number, number, number, number];
    pp: [number, number, number, number];
  };
  evs: {
    hp: number; atk: number; def: number; spd: number; spa: number; spd2: number;
    cool: number; beauty: number; cute: number; smart: number; tough: number; feel: number;
  };
  misc: {
    pokerus: { strain: number; days: number };
    metLocation: number;
    origins: { metLevel: number; game: number; ball: number; otGender: number };
    ivs: { hp: number; atk: number; def: number; spd: number; spa: number; spd2: number };
    isEgg: boolean;
    abilitySlot: 0 | 1;
    ribbonsObedience: number;
  };

  // party-only fields (undefined if parsing a PC box mon)
  party?: {
    statusCondition: number;
    level: number;
    currentHp: number;
    totalHp: number;
    atk: number;
    def: number;
    spd: number;
    spa: number;
    spd2: number;
  };
};

type ParsedSave = {
  activeBlock: "A" | "B";
  saveIndex: number;
  playerName: string;
  playerGender: number;
  trainerId: number; // full u32 (TID+SID packed)
  partySize: number;
  party: ParsedPokemon[];
  pc?: {
    currentBox: number;
    // You could parse 420 slots; omitted by default for speed.
  };
};

function checksumSectionData(data: Buffer, bytesToProcess: number): number {
  let sum = 0 >>> 0;
  for (let i = 0; i < bytesToProcess; i += 4) {
    sum = (sum + data.readUInt32LE(i)) >>> 0;
  }
  const folded = (((sum >>> 16) + (sum & 0xffff)) & 0xffff) >>> 0;
  return folded;
}

function decodeGen3String(bytes: Buffer): string {
  // Minimal Latin table (enough for most English saves).
  // Unknown bytes become "?" so you notice gaps.
  const map = new Map<number, string>();

  // digits 0-9: 0xA1..0xAA
  for (let i = 0; i <= 9; i++) map.set(0xa1 + i, String(i));

  // A-Z: 0xBB..0xD4
  for (let i = 0; i < 26; i++) map.set(0xbb + i, String.fromCharCode(0x41 + i));

  // a-z: 0xD5..0xEE
  for (let i = 0; i < 26; i++) map.set(0xd5 + i, String.fromCharCode(0x61 + i));

  // A few common punctuation based on the published hex table
  map.set(0xab, "!");
  map.set(0xae, "-");
  map.set(0xb8, ",");
  map.set(0xba, "/");
  map.set(0xf0, ":");

  let out = "";
  for (const b of bytes) {
    if (b === 0xff) break;     // terminator
    if (b === 0x00) continue;  // padding
    out += map.get(b) ?? "?";
  }
  return out;
}

// Personality % 24 order table.
const SUBSTRUCT_ORDERS: string[] = [
  "GAEM","GAME","GEAM","GEMA","GMAE","GMEA",
  "AGEM","AGME","AEGM","AEMG","AMGE","AMEG",
  "EGAM","EGMA","EAGM","EAMG","EMGA","EMAG",
  "MGAE","MGEA","MAGE","MAEG","MEGA","MEAG",
];

function sumPokemonSubstructsChecksum(decrypted48: Buffer): number {
  // Sum 16-bit words across 48 bytes, truncate to 16 bits.
  let sum = 0;
  for (let i = 0; i < 48; i += 2) sum = (sum + decrypted48.readUInt16LE(i)) & 0xffff;
  return sum;
}

function parsePokemonAt(buf: Buffer, offset: number, isParty: boolean): ParsedPokemon {
  const personality = buf.readUInt32LE(offset + 0x00);
  const otId = buf.readUInt32LE(offset + 0x04);

  const nicknameRaw = buf.subarray(offset + 0x08, offset + 0x08 + 10);
  const language = buf.readUInt8(offset + 0x12);
  const otNameRaw = buf.subarray(offset + 0x14, offset + 0x14 + 7);
  const markings = buf.readUInt8(offset + 0x1b);

  const checksumStored = buf.readUInt16LE(offset + 0x1c);

  const key = (personality ^ otId) >>> 0;

  const encrypted = buf.subarray(offset + 0x20, offset + 0x20 + 48);
  const decrypted = Buffer.alloc(48);
  for (let i = 0; i < 48; i += 4) {
    const v = encrypted.readUInt32LE(i) ^ key;
    decrypted.writeUInt32LE(v >>> 0, i);
  }

  const checksumComputed = sumPokemonSubstructsChecksum(decrypted);
  const isChecksumValid = checksumComputed === checksumStored;

  // Split into 4×12 chunks in the stored (shuffled) order, then assign by letter.
  const order = SUBSTRUCT_ORDERS[personality % 24];
  const chunks = [0, 1, 2, 3].map(i => decrypted.subarray(i * 12, i * 12 + 12));

  const byLetter: Record<"G"|"A"|"E"|"M", Buffer> = { G: Buffer.alloc(12), A: Buffer.alloc(12), E: Buffer.alloc(12), M: Buffer.alloc(12) };
  for (let i = 0; i < 4; i++) {
    const letter = order[i] as "G"|"A"|"E"|"M";
    byLetter[letter] = chunks[i];
  }

  // Growth (G)
  const G = byLetter.G;
  const species = G.readUInt16LE(0);
  const heldItem = G.readUInt16LE(2);
  const experience = G.readUInt32LE(4);
  const ppBonuses = G.readUInt8(8);
  const friendship = G.readUInt8(9);

  // Attacks (A)
  const A = byLetter.A;
  const moves: [number, number, number, number] = [
    A.readUInt16LE(0),
    A.readUInt16LE(2),
    A.readUInt16LE(4),
    A.readUInt16LE(6),
  ];
  const pp: [number, number, number, number] = [
    A.readUInt8(8),
    A.readUInt8(9),
    A.readUInt8(10),
    A.readUInt8(11),
  ];

  // EVs & Condition (E)
  const E = byLetter.E;
  const evHp = E.readUInt8(0);
  const evAtk = E.readUInt8(1);
  const evDef = E.readUInt8(2);
  const evSpd = E.readUInt8(3);
  const evSpA = E.readUInt8(4);
  const evSpD = E.readUInt8(5);
  const cool = E.readUInt8(6);
  const beauty = E.readUInt8(7);
  const cute = E.readUInt8(8);
  const smart = E.readUInt8(9);
  const tough = E.readUInt8(10);
  const feel = E.readUInt8(11);

  // Misc (M)
  const M = byLetter.M;
  const pokerusByte = M.readUInt8(0);
  const metLocation = M.readUInt8(1);
  const originsInfo = M.readUInt16LE(2);
  const ivEggAbility = M.readUInt32LE(4);
  const ribbonsObedience = M.readUInt32LE(8);

  const pokerus = {
    days: pokerusByte & 0x0f,
    strain: (pokerusByte >>> 4) & 0x0f,
  };

  const origins = {
    metLevel: originsInfo & 0x7f,
    game: (originsInfo >>> 7) & 0x0f,
    ball: (originsInfo >>> 11) & 0x0f,
    otGender: (originsInfo >>> 15) & 0x01,
  };

  const ivs = {
    hp: (ivEggAbility >>> 0) & 0x1f,
    atk: (ivEggAbility >>> 5) & 0x1f,
    def: (ivEggAbility >>> 10) & 0x1f,
    spd: (ivEggAbility >>> 15) & 0x1f,
    spa: (ivEggAbility >>> 20) & 0x1f,
    spd2: (ivEggAbility >>> 25) & 0x1f,
  };
  const isEgg = ((ivEggAbility >>> 30) & 0x01) === 1;
  const abilitySlot = (((ivEggAbility >>> 31) & 0x01) as 0 | 1);

  const out: ParsedPokemon = {
    personality,
    otId,
    nickname: decodeGen3String(nicknameRaw),
    otName: decodeGen3String(otNameRaw),
    language,
    markings,
    checksumStored,
    checksumComputed,
    isChecksumValid,
    growth: { species, heldItem, experience, ppBonuses, friendship },
    attacks: { moves, pp },
    evs: {
      hp: evHp, atk: evAtk, def: evDef, spd: evSpd, spa: evSpA, spd2: evSpD,
      cool, beauty, cute, smart, tough, feel,
    },
    misc: { pokerus, metLocation, origins, ivs, isEgg, abilitySlot, ribbonsObedience },
  };

  if (isParty) {
    out.party = {
      statusCondition: buf.readUInt32LE(offset + 0x50),
      level: buf.readUInt8(offset + 0x54),
      currentHp: buf.readUInt16LE(offset + 0x56),
      totalHp: buf.readUInt16LE(offset + 0x58),
      atk: buf.readUInt16LE(offset + 0x5a),
      def: buf.readUInt16LE(offset + 0x5c),
      spd: buf.readUInt16LE(offset + 0x5e),
      spa: buf.readUInt16LE(offset + 0x60),
      spd2: buf.readUInt16LE(offset + 0x62),
    };
  }

  return out;
}

function readSaveSections(save: Buffer, blockOffset: number): SaveSection[] {
  const sections: SaveSection[] = [];
  for (let i = 0; i < 14; i++) {
    const base = blockOffset + i * SECTION_SIZE;

    const data = save.subarray(base, base + SECTION_DATA_SIZE);
    const id = save.readUInt16LE(base + 0x0ff4);
    const checksum = save.readUInt16LE(base + 0x0ff6);
    const signature = save.readUInt32LE(base + 0x0ff8);
    const saveIndex = save.readUInt32LE(base + 0x0ffc);

    sections.push({ id, checksum, signature, saveIndex, data: Buffer.from(data) });
  }
  return sections;
}

function validateAndIndexBlock(sections: SaveSection[]) {
  const byId = new Map<number, SaveSection>();
  let expectedSaveIndex: number | undefined;

  for (const s of sections) {
    if (!(s.id in SECTION_CHECK_BYTES)) return { ok: false as const };
    if (s.signature !== SECTION_SIGNATURE) return { ok: false as const };
    if (byId.has(s.id)) return { ok: false as const }; // must be present exactly once

    const bytes = SECTION_CHECK_BYTES[s.id];
    const computed = checksumSectionData(s.data, bytes);
    if (computed !== s.checksum) return { ok: false as const };

    if (expectedSaveIndex === undefined) expectedSaveIndex = s.saveIndex;
    if (s.saveIndex !== expectedSaveIndex) return { ok: false as const };

    byId.set(s.id, s);
  }

  if (byId.size !== 14) return { ok: false as const };
  return { ok: true as const, saveIndex: expectedSaveIndex!, byId };
}

function buildPcBuffer(byId: Map<number, SaveSection>): Buffer {
  const parts: Buffer[] = [];
  for (let id = 5; id <= 12; id++) parts.push(byId.get(id)!.data);     // 8 * 3968
  parts.push(byId.get(13)!.data.subarray(0, 2000));                    // + 2000
  return Buffer.concat(parts);
}

function readParty(byId: Map<number, SaveSection>, variant: Gen3Variant) {
  const s1 = byId.get(1)!.data;

  const teamSizeOffset = variant === "FRLG" ? 0x0034 : 0x0234;
  const teamListOffset = variant === "FRLG" ? 0x0038 : 0x0238;

  const partySize =
    variant === "FRLG"
      ? s1.readUInt8(teamSizeOffset)
      : (s1.readUInt32LE(teamSizeOffset) & 0xff);

  const party: ParsedPokemon[] = [];
  for (let i = 0; i < 6; i++) {
    const monOffset = teamListOffset + i * 100;
    party.push(parsePokemonAt(s1, monOffset, true));
  }

  return { partySize, party };
}

function readTrainerInfo(byId: Map<number, SaveSection>) {
  const s0 = byId.get(0)!.data;
  const playerName = decodeGen3String(s0.subarray(0x0000, 0x0000 + 7));
  const playerGender = s0.readUInt8(0x0008);
  const trainerId = s0.readUInt32LE(0x000a);
  return { playerName, playerGender, trainerId };
}

export async function parseGen3SaveFile(path: string, variant: Gen3Variant): Promise<ParsedSave> {
  const save = await readFile(path);
  if (save.length !== SAVE_SIZE) {
    throw new Error(`Expected 0x${SAVE_SIZE.toString(16)} bytes, got 0x${save.length.toString(16)} bytes`);
  }

  const a = validateAndIndexBlock(readSaveSections(save, 0x000000));
  const b = validateAndIndexBlock(readSaveSections(save, 0x00e000));

  if (!a.ok && !b.ok) throw new Error("Both save blocks failed validation (signature/checksum/index).");

  let active: { label: "A" | "B"; saveIndex: number; byId: Map<number, SaveSection> };
  if (a.ok && b.ok) active = a.saveIndex > b.saveIndex ? { label: "A", saveIndex: a.saveIndex, byId: a.byId } : { label: "B", saveIndex: b.saveIndex, byId: b.byId };
  else if (a.ok) active = { label: "A", saveIndex: a.saveIndex, byId: a.byId };
  else active = { label: "B", saveIndex: b.saveIndex, byId: (b as any).byId };

  const trainer = readTrainerInfo(active.byId);
  const { partySize, party } = readParty(active.byId, variant);

  const pcBuf = buildPcBuffer(active.byId);
  const currentBox = pcBuf.readUInt32LE(0x0000);

  return {
    activeBlock: active.label,
    saveIndex: active.saveIndex,
    ...trainer,
    partySize,
    party,
    pc: { currentBox },
  };
}

// Example CLI usage:
if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  const variant = (process.argv[3] as Gen3Variant) ?? "RSE";
  if (!file) {
    console.error("Usage: node gen3-save.ts <path.sav> [RSE|FRLG]");
    process.exit(1);
  }
  parseGen3SaveFile(file, variant).then(s => {
    console.log({
      activeBlock: s.activeBlock,
      saveIndex: s.saveIndex,
      playerName: s.playerName,
      partySize: s.partySize,
      partySpecies: s.party.slice(0, s.partySize).map(p => p.growth.species),
      currentPcBox: s.pc?.currentBox,
    });
  });
}
```

### What this code is *explicitly* aligned to (so you can verify in hex)

* Save file offsets, block sizes, and section footer layout ([Bulbapedia][1])
* Section ID → checksum byte lengths and the checksum fold algorithm ([Bulbapedia][1])
* Party/items section offsets for team size + team list, and the fact party uses full 100 bytes per mon ([Bulbapedia][1])
* PC buffer reconstruction rules and the 420×80-byte box record format ([Bulbapedia][1])
* Pokémon 100-byte structure offsets + the “PC uses only first 80 bytes” rule ([Bulbapedia][2])
* Substructure order by `personality % 24` + decryption key and XOR-by-u32 rule ([Bulbapedia][3])
* IV/egg/ability bit layout, Pokérus nibble semantics, PP bonus bit packing ([Bulbapedia][3])
* Basic Latin character table mapping (for readable nicknames/OT names) ([datacrystal.tcrf.net][4])

---

[1]: https://bulbapedia.bulbagarden.net/wiki/Save_data_structure_%28Generation_III%29 "Save data structure (Generation III) - Bulbapedia, the community-driven Pokémon encyclopedia"
[2]: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_structure_%28Generation_III%29 "Pokémon data structure (Generation III) - Bulbapedia, the community-driven Pokémon encyclopedia"
[3]: https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_data_substructures_%28Generation_III%29 "Pokémon data substructures (Generation III) - Bulbapedia, the community-driven Pokémon encyclopedia"
[4]: https://datacrystal.tcrf.net/wiki/Pok%C3%A9mon_3rd_Generation/Pok%C3%A9mon_FireRed_and_LeafGreen/TBL "Pokémon 3rd Generation/Pokémon FireRed and LeafGreen/TBL - Data Crystal"
