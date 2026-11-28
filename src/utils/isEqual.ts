/**
 * Performs a deep comparison between two values to determine if they are equivalent.
 * @param {*} value - The value to compare.
 * @param {*} other - The other value to compare.
 * @returns {boolean} Returns true if the values are equivalent, else false.
 */
export function isEqual(value, other) {
    // Check if the same object reference
    if (value === other) {
        return true;
    }

    // Check if either value is null or not an object
    if (
        value == null ||
        other == null ||
        (typeof value !== "object" && typeof other !== "object")
    ) {
        // Handle NaN case (NaN is the only value that is not equal to itself)
        return value !== value && other !== other;
    }

    // Get object constructor names
    const valueType = Object.prototype.toString.call(value);
    const otherType = Object.prototype.toString.call(other);

    // If types are different, objects are not equal
    if (valueType !== otherType) {
        return false;
    }

    // Handle arrays
    if (Array.isArray(value)) {
        if (value.length !== other.length) {
            return false;
        }

        for (let i = 0; i < value.length; i++) {
            if (!isEqual(value[i], other[i])) {
                return false;
            }
        }

        return true;
    }

    // Handle Date objects
    if (value instanceof Date) {
        return value.getTime() === other.getTime();
    }

    // Handle RegExp objects
    if (value instanceof RegExp) {
        return value.toString() === other.toString();
    }

    // Handle Maps
    if (value instanceof Map) {
        if (value.size !== other.size) {
            return false;
        }

        for (const [key, val] of value) {
            // Check if other has the key
            if (!other.has(key)) {
                return false;
            }

            // Check if the values are equal
            if (!isEqual(val, other.get(key))) {
                return false;
            }
        }

        return true;
    }

    // Handle Sets
    if (value instanceof Set) {
        if (value.size !== other.size) {
            return false;
        }

        // Convert Sets to arrays and compare them
        return isEqual([...value], [...other]);
    }

    // Handle plain objects
    const valueKeys = Object.keys(value);
    const otherKeys = Object.keys(other);

    if (valueKeys.length !== otherKeys.length) {
        return false;
    }

    // Check if all keys from value exist in other and have equal values
    for (const key of valueKeys) {
        if (
            !Object.prototype.hasOwnProperty.call(other, key) ||
            !isEqual(value[key], other[key])
        ) {
            return false;
        }
    }

    return true;
}
