"use strict";
// broadcastTransaction.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastTransaction = void 0;
const transactions_1 = require("@near-js/transactions");
const utils_1 = require("@near-js/utils");
const crypto_1 = require("@near-js/crypto");
const bs58_1 = __importDefault(require("bs58"));
const cryptoUtils_1 = require("./cryptoUtils");
const logUtils_1 = require("./logUtils");
/**
 * Broadcasts a signed transaction to the NEAR network.
 *
 * @param params - The parameters required to broadcast the transaction.
 * @returns A Promise that resolves when the transaction is broadcasted.
 * @throws Will throw an error if broadcasting fails.
 */
async function broadcastTransaction(params) {
    const { signerAccount, actionToPerform, signatureResult, nonce, blockHash, mpcPublicKey, } = params;
    const { targetContractId, methodName, args, gas, attachedDepositNear } = actionToPerform;
    const serializedArgs = new Uint8Array(Buffer.from(JSON.stringify(args)));
    const provider = signerAccount.connection.provider;
    const blockHashBytes = bs58_1.default.decode(blockHash);
    const accessKeys = await signerAccount.getAccessKeys();
    const accessKeyForSigning = accessKeys.find((key) => key.public_key === mpcPublicKey);
    if (!accessKeyForSigning) {
        throw new Error(`No access key found for signing with MPC public key ${mpcPublicKey}`);
    }
    (0, logUtils_1.logSuccess)(`User has correct MPC access key on their account: ${accessKeyForSigning.public_key}`);
    const actions = [
        transactions_1.actionCreators.functionCall(methodName, serializedArgs, BigInt(gas), BigInt((0, utils_1.parseNearAmount)(attachedDepositNear))),
    ];
    // Collect the broadcast logs into an object
    // Create the transaction
    const transaction = (0, transactions_1.createTransaction)(signerAccount.accountId, crypto_1.PublicKey.fromString(mpcPublicKey), // Use MPC public key
    targetContractId, nonce, actions, blockHashBytes);
    // Hash the transaction to get the message to sign
    const serializedTx = transaction.encode();
    const txHash = (0, cryptoUtils_1.hashTransaction)(serializedTx);
    // Log transaction hash
    (0, logUtils_1.logInfo)(`=== Transaction Details ===`);
    console.log("Transaction Hash:", Buffer.from(txHash).toString("hex"));
    let r = signatureResult.big_r.affine_point;
    let s = signatureResult.s.scalar;
    const signature = (0, cryptoUtils_1.createSignature)(r, s);
    const signedTransaction = new transactions_1.SignedTransaction({
        transaction,
        signature,
    });
    // Send the signed transaction
    (0, logUtils_1.logInfo)(`=== Sending Transaction ===`);
    try {
        const result = await provider.sendTransaction(signedTransaction);
        console.log("Transaction Result:", result);
    }
    catch (error) {
        console.error("Error sending transaction:", error);
    }
}
exports.broadcastTransaction = broadcastTransaction;
