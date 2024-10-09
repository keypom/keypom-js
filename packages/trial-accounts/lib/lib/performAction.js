"use strict";
// performAction.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.performActions = void 0;
const nearUtils_1 = require("./nearUtils");
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
    let signerAccount = await near.account(trialAccountId);
    const signatures = [];
    const nonces = [];
    const contractLogs = [];
    const provider = signerAccount.connection.provider;
    const block = await provider.block({ finality: "final" });
    const blockHash = block.header.hash;
    const accessKeys = await signerAccount.getAccessKeys();
    const accessKeyForSigning = accessKeys[0];
    let nonce = accessKeyForSigning.access_key.nonce;
    signerAccount = await near.account(trialContractId);
    for (const actionToPerform of actionsToPerform) {
        const { targetContractId, methodName, args, gas, attachedDepositNear } = actionToPerform;
        nonce = BigInt(nonce) + 1n;
        console.log(`Performing action: ${methodName} on contract: ${targetContractId}`);
        const serializedArgs = Array.from(Buffer.from(JSON.stringify(args)));
        // Call the perform_action method on the contract
        const result = await (0, nearUtils_1.sendTransaction)({
            signerAccount,
            receiverId: trialContractId,
            methodName: "perform_action",
            args: {
                chain: "NEAR",
                contract_id: targetContractId,
                method_name: methodName,
                args: serializedArgs,
                gas,
                deposit: (0, utils_1.parseNearAmount)(attachedDepositNear),
                nonce: nonce.toString(),
                block_hash: blockHash,
            },
            deposit: "0",
            gas,
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
    return { signatures, nonces, blockHash };
}
exports.performActions = performActions;
// Helper function to extract signature from the transaction result
function extractSignatureFromResult(result) {
    const sigRes = JSON.parse(Buffer.from(result.status.SuccessValue, "base64").toString());
    return sigRes;
}
