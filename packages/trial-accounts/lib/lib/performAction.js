"use strict";
// lib/performAction.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSignatureFromResult = exports.generateActionArgs = void 0;
const evmUtils_1 = require("./evmUtils");
const ethers_1 = require("ethers");
const validityChecker_1 = require("./validityChecker");
const format_1 = require("near-api-js/lib/utils/format");
/**
 * Performs one or more actions by requesting signatures from the MPC.
 *
 * @param params - The parameters required to perform actions.
 * @returns A Promise that resolves to an array of signature arrays.
 */
async function generateActionArgs(params) {
    const { near, trialAccountInfo, actionsToPerform, evmProviderUrl } = params;
    const txnDatas = [];
    const txnArgs = [];
    for (const actionToPerform of actionsToPerform) {
        let chainId = actionToPerform.chainId || "NEAR";
        const trialAccountId = trialAccountInfo.accountIdByChainId[chainId];
        if (!trialAccountId) {
            throw new Error(`Trial account not activated for chain ${chainId}`);
        }
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
            txnDatas.push(txnData);
            txnArgs.push({
                contract_id: actionToPerform.targetContractId,
                method_name: actionToPerform.methodName,
                args: serializedArgs,
                gas: actionToPerform.gas,
                deposit: (0, format_1.parseNearAmount)(actionToPerform.attachedDepositNear),
                nonce: nonce.toString(),
                block_hash: blockHash,
            });
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
            txnDatas.push(txnData);
            txnArgs.push({
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
            });
        }
        else {
            throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
        }
    }
    return { txnDatas, txnArgs };
}
exports.generateActionArgs = generateActionArgs;
// Helper function to extract signature from the transaction result
function extractSignatureFromResult(result) {
    const sigRes = JSON.parse(Buffer.from(result.status.SuccessValue, "base64").toString());
    return sigRes;
}
exports.extractSignatureFromResult = extractSignatureFromResult;
