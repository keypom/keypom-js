import { readFromFile } from "./utils/fileOps";
import { compareAndLog } from "./utils/logUtils";

/**
 * Compares contract logs with client logs and logs the results.
 */
function compareLogs() {
    console.log("Starting log comparison...\n");
    const dataDir = "./data";

    // Read the contract logs
    const contractLog = readFromFile(dataDir, "contractLogs.json");

    // Read the client logs
    const clientLog = readFromFile(dataDir, "clientLog.json");

    console.log("Comparing Chain ID...");
    compareAndLog(
        "Chain ID",
        contractLog["Chain ID"].toString(),
        clientLog["Chain ID"].toString()
    );

    console.log("\nComparing Nonce...");
    compareAndLog(
        "Nonce",
        contractLog["Nonce"].toString(),
        clientLog["Nonce"].toString()
    );

    console.log("\nComparing Max Priority Fee Per Gas...");
    compareAndLog(
        "Max Priority Fee Per Gas",
        contractLog["Max Priority Fee Per Gas"],
        clientLog["Max Priority Fee Per Gas"]
    );

    console.log("\nComparing Max Fee Per Gas...");
    compareAndLog(
        "Max Fee Per Gas",
        contractLog["Max Fee Per Gas"],
        clientLog["Max Fee Per Gas"]
    );

    console.log("\nComparing Gas Limit...");
    compareAndLog(
        "Gas Limit",
        contractLog["Gas Limit"],
        clientLog["Gas Limit"]
    );

    console.log("\nComparing Contract Address...");
    compareAndLog(
        "Contract Address",
        contractLog["Contract Address"],
        clientLog["Contract Address"],
        (value) => {
            // Convert byte array to hex string if necessary
            if (Array.isArray(value)) {
                return "0x" + Buffer.from(value).toString("hex");
            }
            return value.toLowerCase();
        }
    );

    console.log("\nComparing Value...");
    compareAndLog("Value", contractLog["Value"], clientLog["Value"]);

    console.log("\nComparing Input Data...");
    compareAndLog(
        "Input Data",
        contractLog["Input Data"],
        clientLog["Input Data"]
    );

    console.log("\nComparing Hashed Payload...");
    compareAndLog(
        "Hashed Payload",
        contractLog["Hashed Payload"],
        clientLog["Hashed Payload"]
    );

    console.log("\nLog comparison complete.");
}

// Run the comparison
compareLogs();
