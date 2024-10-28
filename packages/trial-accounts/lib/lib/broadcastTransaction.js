"use strict";
// lib/broadcastTransaction.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastTransaction = void 0;
const bs58_1 = __importDefault(require("bs58"));
const cryptoUtils_1 = require("./cryptoUtils");
const logUtils_1 = require("./logUtils");
const ethers_1 = require("ethers");
const transaction_1 = require("near-api-js/lib/transaction");
const format_1 = require("near-api-js/lib/utils/format");
const utils_1 = require("near-api-js/lib/utils");
/**
 * Broadcasts a signed transaction to the NEAR or EVM network.
 *
 * @param params - The parameters required to broadcast the transaction.
 * @returns A Promise that resolves when the transaction is broadcasted.
 * @throws Will throw an error if broadcasting fails.
 */
async function broadcastTransaction(params) {
    const { nearConnection, signerAccountId, actionToPerform, signatureResult, providerUrl, chainId, txnData, mpcPublicKey, } = params;
    if (actionToPerform.chain === "NEAR") {
        if (signatureResult instanceof Uint8Array) {
            throw new Error("Signature result must be a string");
        }
        const { targetContractId, methodName, args, gas, attachedDepositNear } = actionToPerform;
        const serializedArgs = new Uint8Array(Buffer.from(JSON.stringify(args)));
        const signerAccount = await nearConnection.account(signerAccountId);
        const provider = signerAccount.connection.provider;
        const blockHashBytes = bs58_1.default.decode(txnData.blockHash);
        const actions = [
            (0, transaction_1.functionCall)(methodName, serializedArgs, BigInt(gas), BigInt((0, format_1.parseNearAmount)(attachedDepositNear))),
        ];
        const mpcPubKey = utils_1.PublicKey.fromString(mpcPublicKey);
        const transaction = (0, transaction_1.createTransaction)(signerAccountId, mpcPubKey, targetContractId, txnData.nonce, actions, blockHashBytes);
        // Create the signature
        let r = signatureResult.big_r.affine_point;
        let s = signatureResult.s.scalar;
        const signature = (0, cryptoUtils_1.createSignature)(r, s);
        const signedTransaction = new transaction_1.SignedTransaction({
            transaction,
            signature,
        });
        // Send the signed transaction
        (0, logUtils_1.logInfo)(`=== Sending NEAR Transaction ===`);
        const result = await provider.sendTransaction(signedTransaction);
        return { result, clientLog: "" };
    }
    else if (actionToPerform.chain === "EVM") {
        if (!providerUrl) {
            throw new Error("providerUrl is required for EVM transactions");
        }
        // Initialize provider
        const provider = new ethers_1.JsonRpcProvider(providerUrl, parseInt(chainId, 10));
        // Encode function call data
        const contractInterface = new ethers_1.Interface(actionToPerform.abi);
        const functionData = contractInterface.getFunction(actionToPerform.methodName, actionToPerform.args);
        const data = contractInterface.encodeFunctionData(actionToPerform.methodName, actionToPerform.args);
        // Construct transaction data
        const transactionData = {
            nonce: parseInt(txnData.nonce, 10),
            gasLimit: BigInt(txnData.gasLimit),
            maxFeePerGas: BigInt(txnData.maxFeePerGas),
            maxPriorityFeePerGas: BigInt(txnData.maxPriorityFeePerGas),
            to: actionToPerform.targetContractId,
            data: data,
            value: BigInt(actionToPerform.value || "0"),
            chainId: parseInt(chainId, 10),
            type: 2,
            accessList: actionToPerform.accessList || [],
        };
        // Create Transaction object
        const tx = ethers_1.Transaction.from(transactionData);
        // Get the serialized transaction
        const unsignedTx = tx.unsignedSerialized;
        const txHash = ethers_1.ethers.keccak256(unsignedTx);
        const payload = (0, ethers_1.getBytes)(txHash);
        // Log transaction information
        const clientLog = {};
        clientLog["Chain ID"] = parseInt(chainId, 10);
        clientLog["Nonce"] = parseInt(txnData.nonce, 10);
        clientLog["Max Priority Fee Per Gas"] = BigInt(txnData.maxPriorityFeePerGas).toString();
        clientLog["Max Fee Per Gas"] = BigInt(txnData.maxFeePerGas).toString();
        clientLog["Gas Limit"] = BigInt(txnData.gasLimit || "0").toString();
        // Convert the contract address, input data, and hashed payload to arrays of numbers
        clientLog["Contract Address"] = hexStringToNumberArray(actionToPerform.targetContractId);
        clientLog["Value"] = BigInt(actionToPerform.value || "0").toString();
        clientLog["Input Data"] = hexStringToNumberArray(data);
        clientLog["Access List"] = actionToPerform.accessList || [];
        clientLog["Function"] = functionData; // This will stay as an object
        clientLog["ABI Parameters"] = contractInterface.getAbiCoder();
        clientLog["ABI Args"] = JSON.stringify(actionToPerform.args);
        clientLog["Hashed Payload"] = hexStringToNumberArray(txHash);
        clientLog["TXN Bytes"] = hexStringToNumberArray(unsignedTx);
        const sig = ethers_1.ethers.Signature.from({
            r: "0x" +
                signatureResult.big_r.affine_point.substring(2).toLowerCase(),
            s: "0x" + signatureResult.s.scalar.toLowerCase(),
            v: signatureResult.recovery_id,
        });
        tx.signature = sig;
        const recoveryAddress = (0, ethers_1.recoverAddress)(payload, sig);
        // Send the signed transaction
        (0, logUtils_1.logInfo)(`=== Sending EVM Transaction ===`);
        if (recoveryAddress.toLowerCase() !== signerAccountId.toLowerCase()) {
            throw new Error(`Recovery address ${recoveryAddress} does not match signer address ${signerAccountId}`);
        }
        else {
            (0, logUtils_1.logSuccess)(`Recovery address ${recoveryAddress} matches signer address ${signerAccountId}`);
        }
        (0, logUtils_1.logInfo)(`Sending transaction from: ${recoveryAddress}`);
        const result = await provider.send("eth_sendRawTransaction", [
            tx.serialized,
        ]);
        return { result, clientLog };
    }
    else {
        throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
    }
}
exports.broadcastTransaction = broadcastTransaction;
// Helper function to convert hex string (e.g. "0x...") to an array of numbers
function hexStringToNumberArray(hexString) {
    if (hexString.startsWith("0x")) {
        hexString = hexString.slice(2);
    }
    const bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    return bytes;
}
