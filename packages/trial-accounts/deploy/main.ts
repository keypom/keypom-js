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
import { parseContractLog } from "../src/lib/logUtils";

// Load environment variables from .env file
loadEnv();

// @ts-ignore
async function test() {
    const log = `LOG_STR_CHAIN_ID: 84532
            LOG_STR_NONCE: 1
            LOG_STR_MAX_PRIORITY_FEE_PER_GAS: 2000000000
            LOG_STR_MAX_FEE_PER_GAS: 20000000000
            LOG_STR_GAS_LIMIT: 100000
            LOG_STR_CONTRACT: [206, 180, 12, 233, 151, 159, 47, 4, 64, 49, 117, 156, 202, 90, 62, 44, 63, 192, 76, 66]
            LOG_STR_VALUE: 0
            LOG_STR_INPUT: [189, 241, 178, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 206, 180, 12, 233, 151, 159, 47, 4, 64, 49, 117, 156, 202, 90, 62, 44, 63, 192, 76, 66, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            LOG_STR_ACCESS_LIST: []
            LOG_STR_FUNCTION: Function { name: "multiAddressLazyMint", inputs: [Param { name: "addresses", kind: Array(Address), internal_type: None }, Param { name: "seriesIds", kind: Uint(256), internal_type: None }, Param { name: "data", kind: Bytes, internal_type: None }], outputs: [], constant: Some(false), state_mutability: NonPayable }
            LOG_STR_ABI_PARAMS: [Param { name: "addresses", kind: Array(Address), internal_type: None }, Param { name: "seriesIds", kind: Uint(256), internal_type: None }, Param { name: "data", kind: Bytes, internal_type: None }]
            LOG_STR_ABI_ARGS: [Array([Address(0xceb40ce9979f2f044031759cca5a3e2c3fc04c42)]), Uint(1), Bytes([])]
            LOG_STR_HASH: [14, 160, 2, 118, 47, 29, 140, 231, 5, 11, 191, 84, 128, 142, 141, 160, 9, 148, 10, 251, 72, 19, 16, 254, 100, 172, 119, 233, 116, 136, 141, 229]`;

    const foo = parseContractLog(log);
    console.log(foo);
}

// @ts-ignore
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
                    value: parseEther("0.00004"),
                });

                accountId = evmAddress;
            } else if (action.chain === "NEAR") {
                accountId = `${Date.now().toString()}-trial-account-${iter}.testnet`;
                chainId = "NEAR";
            }

            // Set trial account credentials
            trialManager.setTrialAccountCredentials(
                accountId!,
                trialKey.trialAccountSecretKey
            );
            logInfo(`Activating trial account: ${accountId!}`);
            await trialManager.activateTrialAccounts(accountId!, chainId!);
            logSuccess(`Trial account ${accountId!} activated.`);

            logInfo(
                `Requesting signature for method ${action.methodName} on contract ${action.targetContractId}`
            );

            const providerUrl = `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
            const { signatures, nonces, blockHash, contractLogs } =
                await trialManager.performActions([action], providerUrl);

            const dataToWrite = {
                signatures,
                nonces,
                blockHash,
            };
            writeToFile(dataToWrite, config.dataDir, "signatures.json");
            writeToFile(contractLogs[0], config.dataDir, "contractLogs.json");

            const { result, clientLog } =
                await trialManager.broadcastTransaction({
                    actionToPerform: action,
                    providerUrl,
                    signerAccountId: accountId!,
                    chainId: chainId!,
                    signatureResult: signatures[0],
                    nonce: nonces[0],
                    blockHash,
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
                console.log(`https://sepolia.etherscan.io/tx/${result}`);
            }
        }

        iter += 1;
    }

    logSuccess("Trial data written to file.");
}

main().catch((error) => {
    logError("Error in deploy: " + error);
});
