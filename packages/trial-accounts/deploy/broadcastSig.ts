// src/main.ts

import { TrialAccountManager } from "../src/index";
import { readFromFile, writeToFile } from "./utils/fileOps";
import path from "path";
import fs from "fs";
import { logError, logInfo, logSuccess } from "./utils/logUtils";
import { initNear, isFinalExecutionOutcome } from "./utils/nearUtils";
import { FinalExecutionOutcome } from "@near-js/types";
import { TransactionResponse } from "ethers";
import { config as loadEnv } from "dotenv";

// Load environment variables from .env file
loadEnv();

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
    const { config, actionsToPerform } = await import(
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
        maxRetries: 5,
        initialDelayMs: 2000,
        backoffFactor: 2,
    });

    // read the signatures from the file
    const { trialId, trialKeys } = readFromFile(
        config.dataDir,
        "trialData.json"
    );
    const { signatures, nonces, blockHash } = readFromFile(
        config.dataDir,
        "signatures.json"
    );

    let results: Array<FinalExecutionOutcome | TransactionResponse> = [];
    for (const trialKey of trialKeys) {
        const trialAccountSecretKey = trialKey.trialAccountSecretKey;

        for (const action of actionsToPerform) {
            const providerUrl = `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
            const chainId = action.chainId.toString();
            const accountId = await trialManager.getTrialAccountIdForChain(
                trialAccountSecretKey,
                chainId
            );

            console.log("accountId", accountId);
            console.log("trialAccountSecretKey", trialAccountSecretKey);
            console.log("Signatures", signatures);
            console.log("Nonce", nonces);
            console.log("Block Hash", blockHash);

            trialManager.setTrialAccountCredentials(
                accountId,
                trialAccountSecretKey
            );

            results.push(
                await trialManager.broadcastTransaction({
                    actionToPerform: action,
                    providerUrl,
                    signerAccountId: accountId!,
                    chainId,
                    signatureResult: signatures[0],
                    nonce: nonces[0],
                    blockHash,
                })
            );
            logSuccess(`Actions performed successfully for ${accountId!}.`);
        }

        logSuccess(
            `${actionsToPerform.length} Action(s) performed successfully.`
        );

        for (const result of results) {
            if (isFinalExecutionOutcome(result)) {
                console.log(
                    // @ts-ignore
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