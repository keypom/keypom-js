"use strict";
// lib/performAction.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.performActions = void 0;
const near_1 = require("./networks/near");
const evmUtils_1 = require("./evmUtils");
const utils_1 = require("@near-js/utils");
const crypto_1 = require("@near-js/crypto");
const ethers_1 = require("ethers");
const logUtils_1 = require("./logUtils");
const validityChecker_1 = require("./validityChecker");
/**
 * Performs one or more actions by requesting signatures from the MPC.
 *
 * @param params - The parameters required to perform actions.
 * @returns A Promise that resolves to an array of signature arrays.
 */
async function performActions(params) {
    const { near, trialAccountSecretKey, trialContractId, trialAccountInfo, actionsToPerform, trialAccountId, evmProviderUrl, } = params;
    // Set the trial key in the keyStore
    const keyStore = near.connection.signer.keyStore;
    await keyStore.setKey(near.connection.networkId, trialContractId, crypto_1.KeyPair.fromString(trialAccountSecretKey));
    // set the signer to the trial contract to actually perform the call_*_contract methods using the proxy key
    const signerAccount = await near.account(trialContractId);
    const signatures = [];
    const txnDatas = [];
    const contractLogs = [];
    for (const actionToPerform of actionsToPerform) {
        if (actionToPerform.chain === "NEAR") {
            // Get the trial user's near account access key info to get the nonce
            let trialUserNearAccount = await near.account(trialAccountId);
            const accessKeys = await trialUserNearAccount.getAccessKeys();
            const accessKeyForSigning = accessKeys[0];
            // Transaction Data
            let nonce = accessKeyForSigning.access_key.nonce;
            const provider = trialUserNearAccount.connection.provider;
            const block = await provider.block({ finality: "final" });
            const blockHash = block.header.hash;
            nonce = BigInt(nonce) + 1n;
            const serializedArgs = Array.from(Buffer.from(JSON.stringify(actionToPerform.args)));
            const txnData = {
                nonce: nonce.toString(),
                blockHash,
            };
            // Check validity of actions
            (0, validityChecker_1.checkActionValidity)([actionToPerform], [txnData], trialAccountInfo.trialData, trialAccountInfo.usageStats, Date.now());
            // Call the perform_action method on the contract
            const result = await (0, near_1.sendTransaction)({
                signerAccount,
                receiverId: trialContractId,
                methodName: "call_near_contract",
                args: {
                    contract_id: actionToPerform.targetContractId,
                    method_name: actionToPerform.methodName,
                    args: serializedArgs,
                    gas: actionToPerform.gas,
                    deposit: (0, utils_1.parseNearAmount)(actionToPerform.attachedDepositNear),
                    nonce: nonce.toString(),
                    block_hash: blockHash,
                },
                deposit: "0",
                gas: "300000000000000",
            });
            // Extract the signature from the transaction result
            const sigRes = extractSignatureFromResult(result);
            console.log("Signature: ", sigRes);
            signatures.push(sigRes);
            txnDatas.push(txnData);
        }
        else if (actionToPerform.chain === "EVM") {
            if (!actionToPerform.chainId) {
                throw new Error("chainId is not defined for EVM actions");
            }
            if (!evmProviderUrl) {
                throw new Error("evmProvider needs to be passed in for EVM actions");
            }
            if (!actionToPerform.abi) {
                throw new Error("ABI is required for EVM actions");
            }
            try {
                // Use the utility function to encode method parameters
                const { methodParams, args } = (0, evmUtils_1.encodeMethodParams)(actionToPerform.methodName, actionToPerform.args, actionToPerform.abi);
                // Initialize provider
                const provider = new ethers_1.JsonRpcProvider(evmProviderUrl, actionToPerform.chainId);
                // Get the nonce
                const signer = new ethers_1.VoidSigner(trialAccountId, provider);
                const { nonce, gasLimit, maxFeePerGas, maxPriorityFeePerGas } = await (0, evmUtils_1.esimateGasParams)(provider, signer, actionToPerform);
                // Check validity of actions
                const txnData = {
                    nonce: nonce.toString(),
                    gasLimit: gasLimit.toString(),
                    maxFeePerGas: maxFeePerGas.toString(),
                    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
                };
                (0, validityChecker_1.checkActionValidity)([actionToPerform], [txnData], trialAccountInfo.trialData, trialAccountInfo.usageStats, Date.now());
                // Prepare the arguments as per the contract's expectations
                const result = await (0, near_1.sendTransaction)({
                    signerAccount,
                    receiverId: trialContractId,
                    methodName: "call_evm_contract",
                    args: {
                        contract_address: actionToPerform.targetContractId,
                        method_name: actionToPerform.methodName,
                        method_params: methodParams,
                        args: args,
                        gas_limit: txnData.gasLimit,
                        value: actionToPerform.value,
                        chain_id: actionToPerform.chainId,
                        nonce: txnData.nonce,
                        max_fee_per_gas: txnData.maxFeePerGas,
                        max_priority_fee_per_gas: txnData.maxPriorityFeePerGas,
                        access_list: actionToPerform.accessList,
                    },
                    deposit: "0",
                    gas: "300000000000000",
                });
                // Handle the result, extract signatures, etc.
                const sigRes = extractSignatureFromResult(result);
                signatures.push(sigRes);
                txnDatas.push(txnData);
                const logs = (0, logUtils_1.extractLogsFromResult)(result);
                // Find the specific log we're interested in
                const relevantLog = logs.find((log) => log.includes("LOG_STR_CHAIN_ID"));
                if (relevantLog) {
                    // Parse the log
                    const parsedLog = (0, logUtils_1.parseContractLog)(relevantLog);
                    contractLogs.push(parsedLog);
                }
                else {
                    console.error("Relevant log not found in the transaction result.");
                }
            }
            catch (e) {
                throw new Error(`Error while performing action: ${e}`);
            }
        }
        else {
            throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
        }
    }
    return { signatures, txnDatas, contractLogs };
}
exports.performActions = performActions;
// Helper function to extract signature from the transaction result
function extractSignatureFromResult(result) {
    const sigRes = JSON.parse(Buffer.from(result.status.SuccessValue, "base64").toString());
    return sigRes;
}
