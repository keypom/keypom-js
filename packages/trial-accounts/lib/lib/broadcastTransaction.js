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
        const transaction = (0, transactions_1.createTransaction)(signerAccount.accountId, crypto_1.PublicKey.fromString(mpcPublicKey), // Use MPC public key
        targetContractId, nonce, actions, blockHashBytes);
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
        try {
            const result = await provider.sendTransaction(signedTransaction);
            console.log("Transaction Result:", result);
        }
        catch (error) {
            console.error("Error sending NEAR transaction:", error);
        }
    }
    else if (actionToPerform.chain === "EVM") {
        // Implement logic to broadcast EVM transactions using ethers.js
        const provider = new ethers_1.ethers.JsonRpcProvider( /* RPC URL */);
        const wallet = new ethers_1.ethers.Wallet(mpcPublicKey, provider);
        const tx = {
            to: actionToPerform.targetContractId,
            data: actionToPerform.args.data,
            gasLimit: actionToPerform.gasLimit,
            value: actionToPerform.value || "0",
            nonce: parseInt(nonce),
            chainId: actionToPerform.args.chainId,
            maxFeePerGas: actionToPerform.args.maxFeePerGas,
            maxPriorityFeePerGas: actionToPerform.args.maxPriorityFeePerGas,
            type: 2, // EIP-1559 transaction
        };
        // Sign the transaction with the signature from MPC
        const signedTx = await wallet.signTransaction(tx);
        // Send the signed transaction
        (0, logUtils_1.logInfo)(`=== Sending EVM Transaction ===`);
        try {
            const txResponse = await provider.broadcastTransaction(signedTx);
            console.log("Transaction Result:", txResponse);
        }
        catch (error) {
            console.error("Error sending EVM transaction:", error);
        }
    }
    else {
        throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
    }
}
exports.broadcastTransaction = broadcastTransaction;
