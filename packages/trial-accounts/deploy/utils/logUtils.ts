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

/**
 * Parses a single client log into a structured object.
 * @param log - The log string to parse.
 * @returns A parsed log object or null if parsing fails.
 */
export function parseClientLog(log: string): any {
    const parsedData: any = {};

    // Remove any newlines and trim whitespace
    let content = log.replace(/\n/g, "").trim();

    // Regular expression to capture various fields from the log
    const regex =
        /Chain ID: (\d+)\s*Nonce: (\d+)\s*Max Priority Fee Per Gas: (\d+)\s*Max Fee Per Gas: (\d+)\s*Gas Limit: (\d+)\s*Contract Address: (.+?)\s*Value: (\d+)\s*Input Data: (\S+)\s*Access List: (\[.*?\]|\[\])\s*Hashed Payload: (\S+)/;

    const match = content.match(regex);

    if (match) {
        parsedData["Chain ID"] = match[1];
        parsedData["Nonce"] = match[2];
        parsedData["Max Priority Fee Per Gas"] = match[3];
        parsedData["Max Fee Per Gas"] = match[4];
        parsedData["Gas Limit"] = match[5];
        parsedData["Contract Address"] = match[6];
        parsedData["Value"] = match[7];
        parsedData["Input Data"] = match[8];
        parsedData["Access List"] = []; // Assuming empty array as per your log
        parsedData["Hashed Payload"] = match[10];
    } else {
        console.error("Failed to parse client log:", log);
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

/**
 * Compares two values and logs the result.
 * @param field - The name of the field being compared.
 * @param expected - The expected value.
 * @param actual - The actual value.
 * @param parseFunction - Optional function to parse or format values before comparison.
 */
export function compareAndLog<T>(
    field: string,
    expected: T,
    actual: T,
    parseFunction?: (value: T) => any
): void {
    const formattedExpected = parseFunction
        ? parseFunction(expected)
        : expected;
    const formattedActual = parseFunction ? parseFunction(actual) : actual;

    let isMatch = false;

    // Handle byte array comparison directly
    if (Array.isArray(formattedExpected) && Array.isArray(formattedActual)) {
        // Compare arrays as JSON
        isMatch =
            JSON.stringify(formattedExpected) ===
            JSON.stringify(formattedActual);
    } else if (
        typeof formattedExpected === "string" &&
        Array.isArray(formattedActual)
    ) {
        // Convert byte array to hex string for comparison with string
        const actualHex = "0x" + Buffer.from(formattedActual).toString("hex");
        isMatch = formattedExpected.toLowerCase() === actualHex.toLowerCase();
    } else if (
        Array.isArray(formattedExpected) &&
        typeof formattedActual === "string"
    ) {
        // Convert byte array to hex string for comparison with string
        const expectedHex =
            "0x" + Buffer.from(formattedExpected).toString("hex");
        isMatch = expectedHex.toLowerCase() === formattedActual.toLowerCase();
    } else {
        // Default comparison for non-array values
        isMatch =
            JSON.stringify(formattedExpected) ===
            JSON.stringify(formattedActual);
    }

    if (isMatch) {
        console.log(`✅ ${field} match.`);
    } else {
        console.error(`❌ ${field} mismatch!`);
        console.log(
            `   Expected: ${JSON.stringify(formattedExpected, null, 2)}`
        );
        console.log(`   Actual:   ${JSON.stringify(formattedActual, null, 2)}`);
    }
}
