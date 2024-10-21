"use strict";
// logUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareAndLog = exports.parseActionsString = exports.parseContractLog = exports.extractLogsFromResult = exports.logInfo = exports.logError = exports.logSuccess = exports.RED = void 0;
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
/**
 * Parses a single contract log into a structured object.
 * @param log - The log string to parse.
 * @returns A parsed log object or null if parsing fails.
 */
function parseContractLog(log) {
    const parsedData = {};
    // Remove any newlines and trim whitespace
    let content = log.replace(/\n/g, "").trim();
    // Regular expression to capture various fields from the log
    const regex = /Signer: AccountId\("(.+?)"\), Contract: AccountId\("(.+?)"\), Method: "(.+?)", Args: (\[.*?\]), Gas: NearGas \{ inner: ([0-9]+) \}, Deposit: U128\(([0-9]+)\), Public Key: PublicKey \{ data: (\[.*?\]) \}, MPC Key: PublicKey \{ data: (\[.*?\]) \}, MPC Account: AccountId\("(.+?)"\), Chain ID: (\d+), Nonce: U64\((\d+)\), Block Hash: Base58CryptoHash\((\[.*?\])\), Actions: (\[.*?\]), TxHash: (\[.*?\])$/;
    const match = content.match(regex);
    if (match) {
        parsedData["Signer"] = match[1];
        parsedData["Contract"] = match[2];
        parsedData["Method"] = match[3];
        parsedData["Args"] = JSON.parse(match[4]);
        parsedData["Gas"] = match[5];
        parsedData["Deposit"] = match[6];
        parsedData["Public Key"] = { data: JSON.parse(match[7]) };
        parsedData["MPC Key"] = { data: JSON.parse(match[8]) };
        parsedData["MPC Account"] = match[9];
        parsedData["Chain ID"] = match[10];
        parsedData["Nonce"] = match[11];
        parsedData["Block Hash"] = JSON.parse(match[12]);
        parsedData["Actions"] = parseActionsString(match[13]);
        parsedData["TxHash"] = JSON.parse(match[14]);
    }
    else {
        console.error("Failed to parse contract log:", log);
    }
    return parsedData;
}
exports.parseContractLog = parseContractLog;
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
/**
 * Compares two values and logs the result.
 * @param field - The name of the field being compared.
 * @param expected - The expected value.
 * @param actual - The actual value.
 * @param parseFunction - Optional function to parse or format values before comparison.
 */
function compareAndLog(field, expected, actual, parseFunction) {
    const formattedExpected = parseFunction
        ? parseFunction(expected)
        : expected;
    const formattedActual = parseFunction ? parseFunction(actual) : actual;
    const isMatch = JSON.stringify(formattedExpected) === JSON.stringify(formattedActual);
    if (isMatch) {
        logSuccess(`${field} match.`);
    }
    else {
        logError(`${field} mismatch!`);
        // Check if the expected and actual are arrays
        if (Array.isArray(formattedExpected) &&
            Array.isArray(formattedActual)) {
            console.log(`   Expected: ${formatArray(formattedExpected)}\n`);
            console.log(`   Actual:   ${formatArray(formattedActual)}\n`);
        }
        else {
            console.log(`   Expected: ${JSON.stringify(formattedExpected, null, 2)}`);
            console.log(`   Actual:   ${JSON.stringify(formattedActual, null, 2)}`);
        }
    }
}
exports.compareAndLog = compareAndLog;
/**
 * Formats an array of numbers into a multi-line, horizontally aligned string.
 * @param array - The array to format.
 * @param elementsPerLine - Number of elements per line.
 * @returns A formatted string representing the array.
 */
function formatArray(array, elementsPerLine = 10) {
    let formatted = "[";
    for (let i = 0; i < array.length; i++) {
        if (i % elementsPerLine === 0 && i !== 0) {
            formatted += "\n    ";
        }
        formatted += `${array[i]}, `;
    }
    // Remove the trailing comma and space, then close the bracket
    formatted = formatted.trim().slice(0, -1) + "]";
    return formatted;
}
