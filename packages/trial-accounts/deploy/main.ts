// src/main.ts

import { TrialAccountManager } from "../src/index";
import { writeToFile } from "./utils/fileOps";
import path from "path";
import fs from "fs";
import { logError, logInfo, logSuccess } from "./utils/logUtils";
import { initNear, isFinalExecutionOutcome } from "./utils/nearUtils";
import { FinalExecutionOutcome } from "@near-js/types";
import { TransactionResponse } from "ethers";

async function main() {
    // Parse config name from command line arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
        logError("Please provide a config name.");
        process.exit(1);
    }
    const configName = args[0];
    logInfo(`Using config: ${configName}`);

    // Load the appropriate config
    const configPath = path.join(__dirname, "configs", `${configName}.ts`);
    if (!fs.existsSync(configPath)) {
        logError(`Config file not found: ${configPath}`);
        process.exit(1);
    }
    const { config, trialData, actionsToPerform } = await import(
        `./configs/${configName}`
    );

    // Initialize NEAR connection
    logInfo("Initializing NEAR connection...");
    const near = await initNear(config);
    const signerAccount = await near.account(config.signerAccountId);

    // Create TrialAccountManager instance
    const trialManager = new TrialAccountManager({
        trialContractId: config.trialContractId,
        mpcContractId: config.mpcContractId,
        signerAccount,
        near,
    });
    // Create a trial
    logInfo("Creating a trial...");
    const trialId = await trialManager.createTrial(trialData);
    logSuccess(`Trial created with ID: ${trialId}`);

    // Add trial accounts
    logInfo("Adding trial accounts...");
    const trialKeys = await trialManager.addTrialAccounts(config.numberOfKeys);
    logSuccess(`Added ${trialKeys.length} trial accounts.`);

    // Activate trial accounts and perform actions
    for (const trialKey of trialKeys) {
        // Set trial account credentials
        trialManager.setTrialAccountCredentials(
            trialKey.trialAccountId,
            trialKey.trialAccountSecretKey
        );

        // Activate trial account
        logInfo(`Activating trial account: ${trialKey.trialAccountId}`);
        await trialManager.activateTrialAccounts(trialKey.trialAccountId);
        logSuccess(`Trial account activated: ${trialKey.trialAccountId}`);

        // Perform actions
        logInfo(`Performing actions for account: ${trialKey.trialAccountId}`);
        const { signatures, nonces, blockHash } =
            await trialManager.performActions(actionsToPerform);

        let results: Array<FinalExecutionOutcome | TransactionResponse> = [];
        for (let i = 0; i < signatures.length; i++) {
            const signature = signatures[i];
            const nonce = nonces[i];
            const action = actionsToPerform[i];

            results.push(
                await trialManager.broadcastTransaction({
                    actionToPerform: action,
                    signatureResult: signature,
                    nonce,
                    blockHash,
                })
            );
        }

        logSuccess(
            `Actions performed successfully for ${trialKey.trialAccountId}`
        );
        for (const result of results) {
            if (isFinalExecutionOutcome(result)) {
                console.log(
                    `https://testnet.nearblocks.io/txns/${result.transaction.hash}#execution`
                );
            }
        }
    }

    // Prepare trial data to write to file
    const trialDataToWrite = {
        trialId,
        trialContractId: config.trialContractId,
        trialKeys,
    };

    // Write trial data to a file
    writeToFile(trialDataToWrite, config.dataDir, "trialData.json");
    logSuccess("Trial data written to file.");
}

main().catch((error) => {
    logError("Error in deploy: " + error);
});
