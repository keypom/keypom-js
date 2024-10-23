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
export declare function parseContractLog(log: string): any;
/**
 * Parses the Actions string from a contract log.
 * @param actionsStr - The Actions string to parse.
 * @returns An array of parsed action objects.
 */
export declare function parseActionsString(actionsStr: string): any[];
