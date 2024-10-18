// logUtils.ts

/**
 * ANSI escape codes for coloring console output.
 * These codes are widely supported in modern terminals.
 */

// Reset all attributes
const RESET = "\x1b[0m";

// Regular Colors
export const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const BLUE = "\x1b[34m";

/**
 * Logs a success message in green.
 * @param message - The message to log.
 */
export function logSuccess(message: string): void {
    console.log(`${GREEN}✅ ${message}${RESET}`);
}

/**
 * Logs an error message in red.
 * @param message - The message to log.
 */
export function logError(message: string): void {
    console.log(`${RED}❌ ${message}${RESET}`);
}

/**
 * Logs an informational message in blue.
 * @param message - The message to log.
 */
export function logInfo(message: string): void {
    console.log(`${BLUE}${message}${RESET}`);
}

/**
 * Extracts logs from the transaction result.
 * @param result - The transaction result object.
 * @returns An array of log strings.
 */
export function extractLogsFromResult(result: any): string[] {
    const logs: string[] = [];
    for (const outcome of result.receipts_outcome) {
        logs.push(...outcome.outcome.logs);
    }
    return logs;
}

export function parseContractLog(log: string): any {
    const parsedData: any = {};

    // Remove any newlines and trim whitespace
    let content = log.replace(/\n/g, "").trim();

    // Regular expression to capture the specific log variables
    const regex =
        /LOG_STR_CHAIN_ID: (\d+)\s*LOG_STR_NONCE: (\d+)\s*LOG_STR_MAX_PRIORITY_FEE_PER_GAS: (\d+)\s*LOG_STR_MAX_FEE_PER_GAS: (\d+)\s*LOG_STR_GAS_LIMIT: (\d+)\s*LOG_STR_CONTRACT: \[(.*?)\]\s*LOG_STR_VALUE: (\d+)\s*LOG_STR_INPUT: \[(.*?)\]\s*LOG_STR_ACCESS_LIST: \[.*?\]\s*LOG_STR_FUNCTION: (.*?)\s*LOG_STR_ABI_PARAMS: (.*?)\s*LOG_STR_ABI_ARGS: (.*?)\s*LOG_STR_HASH: \[(.*?)\]/;

    const match = content.match(regex);

    if (match) {
        parsedData["Chain ID"] = match[1];
        parsedData["Nonce"] = match[2];
        parsedData["Max Priority Fee Per Gas"] = match[3];
        parsedData["Max Fee Per Gas"] = match[4];
        parsedData["Gas Limit"] = match[5];

        // Parse Contract Address as an array of integers
        parsedData["Contract Address"] = match[6]
            .split(",")
            .map((value: string) => parseInt(value.trim(), 10));

        parsedData["Value"] = match[7];

        // Parse Input Data as an array of integers
        parsedData["Input Data"] = match[8]
            .split(",")
            .map((value: string) => parseInt(value.trim(), 10));

        // Parse Function
        parsedData["Function"] = match[9].trim();

        // Parse ABI Parameters
        parsedData["ABI Parameters"] = match[10].trim();

        // Parse ABI Args
        parsedData["ABI Args"] = match[11].trim();

        // Parse Hashed Payload as an array of integers
        parsedData["Hashed Payload"] = match[12]
            .split(",")
            .map((value: string) => parseInt(value.trim(), 10));
    } else {
        console.error("Failed to parse contract log:", log);
        return null;
    }

    return parsedData;
}

/**
 * Parses the Actions string from a contract log.
 * @param actionsStr - The Actions string to parse.
 * @returns An array of parsed action objects.
 */
export function parseActionsString(actionsStr: string): any[] {
    const actions: any[] = [];

    const functionCallRegex =
        /FunctionCall\(FunctionCallAction \{ method_name: "(.*?)", args: (\[.*?\]), gas: U64\((\d+)\), deposit: U128\((\d+)\) \}\)/g;

    let match: any;
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
