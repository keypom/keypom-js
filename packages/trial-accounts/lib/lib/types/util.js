"use strict";
// utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSnakeCase = exports.convertKeysToCamelCase = exports.snakeToCamel = void 0;
// Utility to convert a string from snake_case to camelCase
function snakeToCamel(str) {
    return str.replace(/(_\w)/g, (m) => m[1].toUpperCase());
}
exports.snakeToCamel = snakeToCamel;
// Recursive function to convert all keys of an object from snake_case to camelCase
function convertKeysToCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map((item) => convertKeysToCamelCase(item));
    }
    else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelCaseKey = snakeToCamel(key);
            result[camelCaseKey] = convertKeysToCamelCase(obj[key]);
            return result;
        }, {});
    }
    return obj; // return if neither object nor array
}
exports.convertKeysToCamelCase = convertKeysToCamelCase;
/**
 * Converts an object's keys from camelCase to snake_case recursively.
 *
 * @param obj - The object to be converted.
 * @returns The new object with snake_case keys.
 */
function toSnakeCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map((item) => toSnakeCase(item));
    }
    else if (obj && typeof obj === "object" && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            acc[snakeKey] = toSnakeCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}
exports.toSnakeCase = toSnakeCase;
