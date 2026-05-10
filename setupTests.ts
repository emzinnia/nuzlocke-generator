import Dexie from "dexie";
// eslint-disable-next-line @typescript-eslint/no-require-imports
Dexie.dependencies.indexedDB = require("fake-indexeddb");
// eslint-disable-next-line @typescript-eslint/no-require-imports
Dexie.dependencies.IDBKeyRange = require("fake-indexeddb/lib/FDBKeyRange");

type TestGlobal = typeof globalThis & {
    requestAnimation: (cb: () => void) => ReturnType<typeof setTimeout>;
    features: Record<string, boolean>;
};

const testGlobal = globalThis as TestGlobal;

testGlobal.requestAnimation = (cb) => setTimeout(cb, 0);

testGlobal.features = {
    fileUploads: true,
    themeEditing: true,
    multipleNuzlockes: true,
    copyingPokemon: true,
};
