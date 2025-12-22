import { noop } from "./noop";

export class DeepSet<T> {
    private set: T[];
    public key: keyof T;

    public constructor(arr: T[] = [], key?: keyof T) {
        this.set = arr;
        this.key = key || ("name" as keyof T);
    }

    public add(item: T, key = this.key) {
        if (this.set.some((i) => i[key] === item[key])) {
            noop();
        } else {
            this.set.push(item);
        }
        return new DeepSet(this.set);
    }

    public overwrite(item: T, edits: Partial<T>, key = this.key) {
        const foundItem = this.set.find((i) => i[key] === item[key]);
        if (foundItem) {
            const newItem = { ...foundItem, ...edits };
            this.set.splice(this.set.indexOf(foundItem), 1, newItem);
            return new DeepSet(this.set);
        }
        return new DeepSet(this.set);
    }

    public delete(item: T, key = this.key) {
        this.set = this.set.filter((i) => i[key] !== item[key]);
    }

    public get(key: unknown) {
        return this.set.find((i) => i[this.key] === key);
    }

    public has(item: T, key = this.key) {
        return this.set.some((i) => i[key] === item[key]);
    }

    public toArray(): T[] {
        return this.set;
    }

    public static cheapCompare(o: any, i: any) {
        return JSON.stringify(o) === JSON.stringify(i);
    }
}
