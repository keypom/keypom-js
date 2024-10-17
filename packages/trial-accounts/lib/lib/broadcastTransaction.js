"use strict";
// lib/broadcastTransaction.ts
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
const ethers_1 = require("ethers");
/**
 * Broadcasts a signed transaction to the NEAR or EVM network.
 *
 * @param params - The parameters required to broadcast the transaction.
 * @returns A Promise that resolves when the transaction is broadcasted.
 * @throws Will throw an error if broadcasting fails.
 */
async function broadcastTransaction(params) {
    const { signerAccount, actionToPerform, signatureResult, nonce, blockHash, mpcPublicKey, } = params;
    if (actionToPerform.chain === "NEAR") {
        const { targetContractId, methodName, args, gas, attachedDepositNear } = actionToPerform;
        const serializedArgs = new Uint8Array(Buffer.from(JSON.stringify(args)));
        const provider = signerAccount.connection.provider;
        const blockHashBytes = bs58_1.default.decode(blockHash);
        const actions = [
            transactions_1.actionCreators.functionCall(methodName, serializedArgs, BigInt(gas), BigInt((0, utils_1.parseNearAmount)(attachedDepositNear))),
        ];
        const mpcPubKey = crypto_1.PublicKey.fromString(mpcPublicKey);
        const signerAccountId = signerAccount.accountId;
        const transaction = (0, transactions_1.createTransaction)(signerAccountId, mpcPubKey, targetContractId, nonce, actions, blockHashBytes);
        // Hash the transaction to get the message to sign
        const serializedTx = transaction.encode();
        const txHash = (0, cryptoUtils_1.hashTransaction)(serializedTx);
        console.log(`=== Message to sign: ${txHash} ===`);
        // Create the signature
        let r = signatureResult.big_r.affine_point;
        let s = signatureResult.s.scalar;
        const signature = (0, cryptoUtils_1.createSignature)(r, s);
        const signedTransaction = new transactions_1.SignedTransaction({
            transaction,
            signature,
        });
        // Send the signed transaction
        (0, logUtils_1.logInfo)(`=== Sending NEAR Transaction ===`);
        return await provider.sendTransaction(signedTransaction);
    }
    else if (actionToPerform.chain === "EVM") {
        // Implement logic to broadcast EVM transactions using ethers.js
        const provider = new ethers_1.ethers.JsonRpcProvider( /* RPC URL */);
        const wallet = new ethers_1.ethers.Wallet(mpcPublicKey, provider);
        console.log(`wallet: ${wallet.address}`);
        // Send the signed transaction
        (0, logUtils_1.logInfo)(`=== Sending EVM Transaction ===`);
        return await provider.broadcastTransaction("");
    }
    else {
        throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
    }
}
exports.broadcastTransaction = broadcastTransaction;
