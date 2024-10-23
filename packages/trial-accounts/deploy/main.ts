// src/main.ts

import { ActionToPerform, TrialAccountManager, TrialData } from "../src/index";
import { writeToFile } from "./utils/fileOps";
import path from "path";
import fs from "fs";
import { logError, logInfo, logSuccess } from "./utils/logUtils";
import { initNear, isFinalExecutionOutcome } from "./utils/nearUtils";
import { FinalExecutionOutcome } from "@near-js/types";
import { TransactionResponse } from "ethers";
import { config as loadEnv } from "dotenv";
import { getSponsorEVMWallet } from "./utils/evmUtils";
import { Config } from "./configs/type";
import { NetworkId } from "@near-wallet-selector/core";

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
    const {
        config,
        trialData,
        actionsToPerform,
    }: {
        config: Config;
        trialData: TrialData;
        actionsToPerform: ActionToPerform[];
    } = await import(`./configs/${configName}`);

    // Initialize NEAR connection
    logInfo("Initializing NEAR connection...");
    const near = await initNear(config);
    const signingAccount = await near.account(config.signerAccountId);

    // Create TrialAccountManager instance
    const trialManager = new TrialAccountManager({
        trialContractId: config.trialContractId,
        mpcContractId: config.mpcContractId,
        networkId: config.networkId as NetworkId,
        maxRetries: 5,
        initialDelayMs: 2000,
        backoffFactor: 2,
    });
    // Create a trial
    logInfo("Creating a trial...");
    const trialId = await trialManager.createTrial({
        trialData,
        signingAccount,
    });
    logSuccess(`Trial created with ID: ${trialId}`);

    // Add trial accounts
    logInfo("Adding trial accounts...");
    const trialKeys = await trialManager.addTrialAccounts({
        trialId,
        signingAccount,
        numberOfKeys: config.numberOfKeys,
    });
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
                chainId = action.chainId!.toString();
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
                    value: trialData.constraintsByChainId.EVM?.initialDeposit,
                });

                accountId = evmAddress;
            } else if (action.chain === "NEAR") {
                accountId = `${Date.now().toString()}-trial-account-${iter}.testnet`;
                chainId = "NEAR";
            }

            logInfo(`Activating trial account: ${accountId!}`);
            await trialManager.activateTrialAccounts({
                trialAccountSecretKey: trialKey.trialAccountSecretKey,
                newAccountId: accountId!,
                chainId,
            });
            logSuccess(`Trial account ${accountId!} activated.`);

            logInfo(
                `Requesting signature for method ${action.methodName} on contract ${action.targetContractId}`
            );

            const providerUrl = `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
            const { signatures, txnDatas, contractLogs } =
                await trialManager.performActions({
                    trialAccountSecretKey: trialKey.trialAccountSecretKey,
                    actionsToPerform: [action],
                    evmProviderUrl: providerUrl,
                });

            const dataToWrite = {
                signatures,
                txnDatas,
            };
            console.log("Data to write:", dataToWrite);
            writeToFile(dataToWrite, config.dataDir, "signatures.json");
            if (contractLogs) {
                writeToFile(
                    contractLogs[0],
                    config.dataDir,
                    "contractLogs.json"
                );
            }

            const { result, clientLog } =
                await trialManager.broadcastTransaction({
                    trialAccountSecretKey: trialKey.trialAccountSecretKey,
                    actionToPerform: action,
                    providerUrl,
                    signatureResult: signatures[0],
                    txnData: txnDatas[0],
                });

            writeToFile(clientLog, config.dataDir, "clientLog.json");
            results.push(result);
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
            } else {
                console.log(`https://sepolia.basescan.org/tx/${result}`);
            }
        }

        iter += 1;
    }

    logSuccess("Trial data written to file.");
}

main().catch((error) => {
    logError("Error in deploy: " + error);
});
