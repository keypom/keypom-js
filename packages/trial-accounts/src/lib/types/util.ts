// utils.ts

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
    return obj; // return if neither object nor array
}
