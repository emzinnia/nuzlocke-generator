import Dexie from "dexie";
// eslint-disable-next-line @typescript-eslint/no-require-imports
Dexie.dependencies.indexedDB = require("fake-indexeddb");
// eslint-disable-next-line @typescript-eslint/no-require-imports
Dexie.dependencies.IDBKeyRange = require("fake-indexeddb/lib/FDBKeyRange");

type TestGlobal = typeof globalThis & {
    requestAnimation: (cb: () => void) => ReturnType<typeof setTimeout>;
    features: Record<string, boolean>;
};

class InMemoryStorage implements Storage {
    private values = new Map<string, string>();

    get length() {
        return this.values.size;
    }

    clear() {
        this.values.clear();
    }

    getItem(key: string) {
        return this.values.get(key) ?? null;
    }

    key(index: number) {
        return Array.from(this.values.keys())[index] ?? null;
    }

    removeItem(key: string) {
        this.values.delete(key);
    }

    setItem(key: string, value: string) {
        this.values.set(key, value);
    }
}

const testGlobal = globalThis as TestGlobal;

if (typeof window !== "undefined") {
    const localStorage = new InMemoryStorage();

    Object.defineProperty(window, "localStorage", {
        configurable: true,
        value: localStorage,
    });
    Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: localStorage,
    });
}

testGlobal.requestAnimation = (cb) => setTimeout(cb, 0);

testGlobal.features = {
    fileUploads: true,
    themeEditing: true,
    multipleNuzlockes: true,
    copyingPokemon: true,
};
