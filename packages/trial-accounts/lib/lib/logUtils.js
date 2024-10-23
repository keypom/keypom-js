"use strict";
// logUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseActionsString = exports.parseContractLog = exports.extractLogsFromResult = exports.logInfo = exports.logError = exports.logSuccess = exports.RED = void 0;
/**
 * ANSI escape codes for coloring console output.
 * These codes are widely supported in modern terminals.
 */
// Reset all attributes
const RESET = "\x1b[0m";
// Regular Colors
exports.RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const BLUE = "\x1b[34m";
/**
 * Logs a success message in green.
 * @param message - The message to log.
 */
function logSuccess(message) {
    console.log(`${GREEN}✅ ${message}${RESET}`);
}
exports.logSuccess = logSuccess;
/**
 * Logs an error message in red.
 * @param message - The message to log.
 */
function logError(message) {
    console.log(`${exports.RED}❌ ${message}${RESET}`);
}
exports.logError = logError;
/**
 * Logs an informational message in blue.
 * @param message - The message to log.
 */
function logInfo(message) {
    console.log(`${BLUE}${message}${RESET}`);
}
exports.logInfo = logInfo;
/**
 * Extracts logs from the transaction result.
 * @param result - The transaction result object.
 * @returns An array of log strings.
 */
function extractLogsFromResult(result) {
    const logs = [];
    for (const outcome of result.receipts_outcome) {
        logs.push(...outcome.outcome.logs);
    }
    return logs;
}
exports.extractLogsFromResult = extractLogsFromResult;
function parseContractLog(log) {
    const parsedData = {};
    // Split log into lines and trim each line
    const lines = log.split("\n").map((line) => line.trim());
    // Iterate over each line and parse key and value
    for (const line of lines) {
        // Skip empty lines
        if (!line)
            continue;
        // Split the line into key and value
        const [key, ...rest] = line.split(":");
        const value = rest.join(":").trim(); // In case the value contains ':'
        if (key && value !== undefined) {
            switch (key) {
                case "LOG_STR_CHAIN_ID":
                    parsedData["Chain ID"] = value;
                    break;
                case "LOG_STR_NONCE":
                    parsedData["Nonce"] = value;
                    break;
                case "LOG_STR_MAX_PRIORITY_FEE_PER_GAS":
                    parsedData["Max Priority Fee Per Gas"] = value;
                    break;
                case "LOG_STR_MAX_FEE_PER_GAS":
                    parsedData["Max Fee Per Gas"] = value;
                    break;
                case "LOG_STR_GAS_LIMIT":
                    parsedData["Gas Limit"] = value;
                    break;
                case "LOG_STR_CONTRACT":
                    parsedData["Contract Address"] = parseArrayValue(value);
                    break;
                case "LOG_STR_VALUE":
                    parsedData["Value"] = value;
                    break;
                case "LOG_STR_INPUT":
                    parsedData["Input Data"] = parseArrayValue(value);
                    break;
                case "LOG_STR_ACCESS_LIST":
                    parsedData["Access List"] = parseArrayValue(value);
                    break;
                case "LOG_STR_FUNCTION":
                    parsedData["Function"] = value;
                    break;
                case "LOG_STR_ABI_PARAMS":
                    parsedData["ABI Parameters"] = value;
                    break;
                case "LOG_STR_ABI_ARGS":
                    parsedData["ABI Args"] = value;
                    break;
                case "LOG_STR_HASH":
                    parsedData["Hashed Payload"] = parseArrayValue(value);
                    break;
                case "LOG_STR_TXN_BYTES":
                    parsedData["Txn Bytes"] = parseArrayValue(value);
                    break;
                default:
                    // Unknown key; you might want to handle this
                    break;
            }
        }
    }
    return parsedData;
}
exports.parseContractLog = parseContractLog;
// Helper function to parse array-like strings
function parseArrayValue(value) {
    // Remove brackets and any surrounding whitespace
    const trimmed = value.replace(/^\[|\]$/g, "").trim();
    if (!trimmed)
        return [];
    // Split by commas and parse each element to an integer
    return trimmed.split(",").map((s) => parseInt(s.trim(), 10));
}
/**
 * Parses the Actions string from a contract log.
 * @param actionsStr - The Actions string to parse.
 * @returns An array of parsed action objects.
 */
function parseActionsString(actionsStr) {
    const actions = [];
    const functionCallRegex = /FunctionCall\(FunctionCallAction \{ method_name: "(.*?)", args: (\[.*?\]), gas: U64\((\d+)\), deposit: U128\((\d+)\) \}\)/g;
    let match;
    while ((match = functionCallRegex.exec(actionsStr)) !== null) {
        actions.push({
            methodName: match[1],
            args: JSON.parse(match[2]),
            gas: match[3],
            deposit: match[4],
        });
    }
    return actions;
}
exports.parseActionsString = parseActionsString;
