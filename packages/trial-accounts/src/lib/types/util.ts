// lib/types/util.ts

// Utility to convert a string from snake_case to camelCase
export function snakeToCamel(str: string): string {
    return str.replace(/(_\w)/g, (m) => m[1].toUpperCase());
}

// Recursive function to convert all keys of an object from snake_case to camelCase
export function convertKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map((item) => convertKeysToCamelCase(item));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result: any, key: string) => {
            const camelCaseKey = snakeToCamel(key);
            result[camelCaseKey] = convertKeysToCamelCase(obj[key]);
            return result;
        }, {});
    }
    return obj; // Return if neither object nor array
}

/**
 * Converts an object's keys from camelCase to snake_case recursively,
 * but keeps all-uppercase keys unchanged.
 *
 * @param obj - The object to be converted.
 * @returns The new object with snake_case keys.
 */
export function toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map((item) => toSnakeCase(item));
    } else if (obj && typeof obj === "object" && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc: any, key: string) => {
            // Check if the key is all uppercase
            const snakeKey = /^[A-Z0-9_]+$/.test(key)
                ? key
                : key.replace(/([A-Z])/g, "_$1").toLowerCase();
            acc[snakeKey] = toSnakeCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}
