"use strict";
// lib/performAction.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.performActions = void 0;
const near_1 = require("./networks/near");
const utils_1 = require("@near-js/utils");
const crypto_1 = require("@near-js/crypto");
const logUtils_1 = require("./logUtils");
/**
 * Performs one or more actions by requesting signatures from the MPC.
 *
 * @param params - The parameters required to perform actions.
 * @returns A Promise that resolves to an array of signature arrays.
 */
async function performActions(params) {
    const { near, trialAccountId, trialAccountSecretKey, trialContractId, actionsToPerform, } = params;
    // Set the trial key in the keyStore
    const keyStore = near.connection.signer.keyStore;
    await keyStore.setKey(near.connection.networkId, trialContractId, crypto_1.KeyPair.fromString(trialAccountSecretKey));
    let signerAccount = await near.account(trialContractId);
    const signatures = [];
    const nonces = [];
    const contractLogs = [];
    const provider = signerAccount.connection.provider;
    const block = await provider.block({ finality: "final" });
    const blockHash = block.header.hash;
    const accessKeys = await signerAccount.getAccessKeys();
    const accessKeyForSigning = accessKeys[0];
    let nonce = accessKeyForSigning.access_key.nonce;
    for (const actionToPerform of actionsToPerform) {
        nonce = BigInt(nonce) + 1n;
        console.log(`Performing action: ${actionToPerform.methodName} on contract: ${actionToPerform.targetContractId}`);
        if (actionToPerform.chain === "NEAR") {
            const serializedArgs = Array.from(Buffer.from(JSON.stringify(actionToPerform.args)));
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
                    signing_key: accessKeyForSigning.public_key,
                    mpc_account_id: trialAccountId,
                    nonce: nonce.toString(),
                    block_hash: blockHash,
                },
                deposit: "0",
                gas: "300000000000000",
            });
            // Extract logs from the transaction result
            const logs = (0, logUtils_1.extractLogsFromResult)(result);
            // Find the specific log we're interested in
            const relevantLog = logs.find((log) => log.startsWith("Signer:"));
            if (relevantLog) {
                // Parse the log
                const parsedLog = (0, logUtils_1.parseContractLog)(relevantLog);
                contractLogs.push(parsedLog);
            }
            else {
                console.error("Relevant log not found in the transaction result.");
            }
            // Extract the signature from the transaction result
            const sigRes = extractSignatureFromResult(result);
            signatures.push(sigRes);
            nonces.push(nonce.toString());
        }
        else if (actionToPerform.chain === "EVM") {
            // Implement logic for EVM actions
            // Prepare the arguments as per the contract's expectations
            const result = await (0, near_1.sendTransaction)({
                signerAccount,
                receiverId: trialContractId,
                methodName: "call_evm_contract",
                args: {
                    contract_address: actionToPerform.targetContractId,
                    method_name: actionToPerform.methodName,
                    method_params: actionToPerform.args.methodParams,
                    args: actionToPerform.args.args,
                    gas_limit: actionToPerform.gasLimit,
                    value: actionToPerform.value,
                    chain_id: actionToPerform.args.chainId,
                    nonce: nonce.toString(),
                    max_fee_per_gas: actionToPerform.args.maxFeePerGas,
                    max_priority_fee_per_gas: actionToPerform.args.maxPriorityFeePerGas,
                    access_list: actionToPerform.args.accessList,
                },
                deposit: "0",
                gas: "300000000000000",
            });
            // Handle the result, extract signatures, etc.
            const sigRes = extractSignatureFromResult(result);
            signatures.push(sigRes);
            nonces.push(nonce.toString());
        }
        else {
            throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
        }
    }
    return { signatures, nonces, blockHash };
}
exports.performActions = performActions;
// Helper function to extract signature from the transaction result
function extractSignatureFromResult(result) {
    const sigRes = JSON.parse(Buffer.from(result.status.SuccessValue, "base64").toString());
    return sigRes;
}
