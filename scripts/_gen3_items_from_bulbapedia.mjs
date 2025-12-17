/**
 * One-off generator for Gen 3 item ID -> item name mapping.
 *
 * Source: Bulbapedia "List of items by index number (GBA)".
 * We parse all tables on the page and extract rows that look like:
 *   [index number] [item name] ...
 *
 * Usage:
 *   node scripts/_gen3_items_from_bulbapedia.mjs > scripts/_gen3_items_map.ts.txt
 */
import * as cheerio from "cheerio";

const SOURCE_URL =
    "https://bulbapedia.bulbagarden.net/wiki/List_of_items_by_index_number_(GBA)";

function cleanText(s) {
    return String(s ?? "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function isNumericId(s) {
    return /^[0-9]+$/.test(s);
}

function escapeTsString(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const res = await fetch(SOURCE_URL, {
    headers: {
        // Bulbapedia sometimes returns different markup based on UA.
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html",
    },
});

if (!res.ok) {
    throw new Error(`Failed to fetch ${SOURCE_URL}: ${res.status} ${res.statusText}`);
}

const html = await res.text();
const $ = cheerio.load(html);

/** @type {Map<number, string|undefined>} */
const map = new Map();

// Bulbapedia uses multiple tables and some are navboxes/notes.
// We only want the item index tables which have headers: "#", "Hex", "Bag", "Item".
$("table").each((_i, table) => {
    const $table = $(table);
    const tableClass = cleanText($table.attr("class") || "");
    if (!tableClass.includes("sortable")) return;

    const $headerRow = $table.find("tr").first();
    const headers = $headerRow
        .find("th, td")
        .map((_j, el) => cleanText($(el).text()))
        .get();

    const idCol = headers.indexOf("#");
    const itemCol = headers.indexOf("Item");
    if (idCol === -1 || itemCol === -1) return;

    $table.find("tr").slice(1).each((_j, tr) => {
        const $cells = $(tr).find("th, td");
        if ($cells.length <= Math.max(idCol, itemCol)) return;

        const idText = cleanText($cells.eq(idCol).text());
        const nameText = cleanText($cells.eq(itemCol).text());

        if (!isNumericId(idText)) return;
        const id = Number(idText);
        if (!Number.isFinite(id)) return;
        if (!nameText) return;

        // Normalize some Bulbapedia quirks like footnote markers.
        const name = nameText
            .replace(/\[[0-9]+\]$/g, "")
            .replace(/\*+$/g, "")
            .trim();

        // Some indices are unused/placeholder; represent as undefined.
        if (
            name === "—" ||
            name === "-" ||
            name.toLowerCase() === "unknown" ||
            name === "???" ||
            name === "????"
        ) {
            if (!map.has(id)) map.set(id, undefined);
            return;
        }

        // In Gen 3 save data, item id 0 means "no item".
        if (id === 0 && name === "Nothing") {
            map.set(0, undefined);
            return;
        }

        if (!map.has(id)) {
            map.set(id, name);
            return;
        }

        const existing = map.get(id);
        if (existing == null) {
            map.set(id, name);
            return;
        }

        if (existing !== name) {
            // Keep the first but surface a warning for manual review.
            // eslint-disable-next-line no-console
            console.warn(
                `Duplicate id ${id}: existing="${existing}", new="${name}" (keeping existing)`,
            );
        }
    });
});

const ids = [...map.keys()].sort((a, b) => a - b);

// Emit a TS object literal suitable for pasting into src/parsers/utils/gen3.ts
console.log(
    `// Generated from: ${SOURCE_URL}\n// Generated at: ${new Date().toISOString()}\nexport const GEN_3_HELD_ITEM_MAP: Record<number, string | undefined> = {`,
);

for (const id of ids) {
    const name = map.get(id);
    if (name == null) {
        console.log(`    ${id}: undefined,`);
    } else {
        console.log(`    ${id}: "${escapeTsString(name)}",`);
    }
}

console.log("};");


