// src/main.ts

import { TrialAccountManager } from "../src/index";
import { writeToFile } from "./utils/fileOps";
import path from "path";
import fs from "fs";
import { logError, logInfo, logSuccess } from "./utils/logUtils";
import { initNear, isFinalExecutionOutcome } from "./utils/nearUtils";
import { FinalExecutionOutcome } from "@near-js/types";
import { parseEther, TransactionResponse } from "ethers";
import { config as loadEnv } from "dotenv";
import { getSponsorEVMWallet } from "./utils/evmUtils";

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
        maxRetries: 5,
        initialDelayMs: 2000,
        backoffFactor: 2,
    });
    // Create a trial
    logInfo("Creating a trial...");
    const trialId = await trialManager.createTrial(trialData);
    logSuccess(`Trial created with ID: ${trialId}`);

    // Add trial accounts
    logInfo("Adding trial accounts...");
    const trialKeys = await trialManager.addTrialAccounts(config.numberOfKeys);
    logSuccess(`Added ${trialKeys.length} trial accounts.`);

    // Prepare trial data to write to file
    const trialDataToWrite = {
        trialId,
        trialContractId: config.trialContractId,
        trialKeys,
    };

    // Write trial data to a file
    writeToFile(trialDataToWrite, config.dataDir, "trialData.json");

    let iter = 0;
    let results: Array<FinalExecutionOutcome | TransactionResponse> = [];
    for (const trialKey of trialKeys) {
        for (const action of actionsToPerform) {
            let chainId: string | undefined = undefined;
            let accountId: string | undefined = undefined;

            if (action.chain === "EVM") {
                chainId = action.chainId;
                // get the derived EVM address from the derivation path
                const evmAddress = await trialManager.deriveEthAddress(
                    trialKey.trialAccountSecretKey
                );

                // Ensure the environment variables are defined
                if (
                    !process.env.EVM_PRIVATE_KEY ||
                    !process.env.ALCHEMY_API_KEY
                ) {
                    throw new Error(
                        "EVM_PRIVATE_KEY or ALCHEMY_API_KEY is not defined in the environment variables"
                    );
                }

                const providerUrl = `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
                const sponsorWallet = getSponsorEVMWallet(
                    process.env.EVM_PRIVATE_KEY!,
                    providerUrl,
                    chainId!
                );

                await sponsorWallet.sendTransaction({
                    to: evmAddress,
                    value: parseEther("0.0004"),
                });

                // Set trial account credentials
                trialManager.setTrialAccountCredentials(
                    evmAddress,
                    trialKey.trialAccountSecretKey
                );
                accountId = evmAddress;
            } else if (action.chain === "NEAR") {
                accountId = `${Date.now().toString()}-trial-account-${iter}.testnet`;
                chainId = "NEAR";
            }

            logInfo(`Activating trial account: ${accountId!}`);
            await trialManager.activateTrialAccounts(accountId!, chainId!);
            logSuccess(`Trial account ${accountId!} activated.`);

            logInfo(
                `Requesting signature for method ${action.methodName} on contract ${action.targetContractId}`
            );

            const providerUrl = `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
            const { signatures, nonces, blockHash } =
                await trialManager.performActions([action], providerUrl);

            const dataToWrite = {
                signatures,
                nonces,
                blockHash,
            };

            writeToFile(dataToWrite, config.dataDir, "signatures.json");

            results.push(
                await trialManager.broadcastTransaction({
                    actionToPerform: action,
                    providerUrl,
                    signerAccountId: accountId!,
                    chainId: chainId!,
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

        iter += 1;
    }

    logSuccess("Trial data written to file.");
}

main().catch((error) => {
    logError("Error in deploy: " + error);
});
