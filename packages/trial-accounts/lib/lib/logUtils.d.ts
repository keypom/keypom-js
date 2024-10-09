export declare const RED = "\u001B[31m";
/**
 * Logs a success message in green.
 * @param message - The message to log.
 */
export declare function logSuccess(message: string): void;
/**
 * Logs an error message in red.
 * @param message - The message to log.
 */
export declare function logError(message: string): void;
/**
 * Logs an informational message in blue.
 * @param message - The message to log.
 */
export declare function logInfo(message: string): void;
/**
 * Extracts logs from the transaction result.
 * @param result - The transaction result object.
 * @returns An array of log strings.
 */
export declare function extractLogsFromResult(result: any): string[];
/**
 * Parses a single contract log into a structured object.
 * @param log - The log string to parse.
 * @returns A parsed log object or null if parsing fails.
 */
export declare function parseContractLog(log: string): any;
/**
 * Parses the Actions string from a contract log.
 * @param actionsStr - The Actions string to parse.
 * @returns An array of parsed action objects.
 */
export declare function parseActionsString(actionsStr: string): any[];
/**
 * Compares two values and logs the result.
 * @param field - The name of the field being compared.
 * @param expected - The expected value.
 * @param actual - The actual value.
 * @param parseFunction - Optional function to parse or format values before comparison.
 */
export declare function compareAndLog<T>(field: string, expected: T, actual: T, parseFunction?: (value: T) => any): void;
