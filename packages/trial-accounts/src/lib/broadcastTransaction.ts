// lib/broadcastTransaction.ts

import {
    Action,
    actionCreators,
    createTransaction,
    SignedTransaction,
} from "@near-js/transactions";
import { parseNearAmount } from "@near-js/utils";
import { PublicKey } from "@near-js/crypto";
import bs58 from "bs58";
import { createSignature, hashTransaction } from "./cryptoUtils";
import { ActionToPerform, MPCSignature } from "./types";
import { logInfo, logSuccess } from "./logUtils";
import {
    ethers,
    getBytes,
    Interface,
    JsonRpcProvider,
    recoverAddress,
    Transaction,
    TransactionLike,
    TransactionResponse,
} from "ethers";
import { FinalExecutionOutcome } from "@near-js/types";
import { Near } from "@near-js/wallet-account";
import { TransactionData } from "./performAction";

interface BroadcastTransactionParams {
    nearConnection: Near;
    chainId: string;
    signerAccountId: string;
    actionToPerform: ActionToPerform;
    signatureResult: MPCSignature; // Signature result from the MPC
    txnData: TransactionData;
    mpcPublicKey: string;

    // EVM Specific
    providerUrl?: string;
}

/**
 * Broadcasts a signed transaction to the NEAR or EVM network.
 *
 * @param params - The parameters required to broadcast the transaction.
 * @returns A Promise that resolves when the transaction is broadcasted.
 * @throws Will throw an error if broadcasting fails.
 */
export async function broadcastTransaction(
    params: BroadcastTransactionParams
): Promise<{
    result: TransactionResponse | FinalExecutionOutcome;
    clientLog: any;
}> {
    const {
        nearConnection,
        signerAccountId,
        actionToPerform,
        signatureResult,
        providerUrl,
        chainId,
        txnData,
        mpcPublicKey,
    } = params;

    if (actionToPerform.chain === "NEAR") {
        if (signatureResult instanceof Uint8Array) {
            throw new Error("Signature result must be a string");
        }

        const { targetContractId, methodName, args, gas, attachedDepositNear } =
            actionToPerform;

        const serializedArgs = new Uint8Array(
            Buffer.from(JSON.stringify(args))
        );

        const signerAccount = await nearConnection.account(signerAccountId);
        console.log("Signer Account", signerAccount);
        const provider = signerAccount.connection.provider;

        const blockHashBytes = bs58.decode(txnData.blockHash!);

        const actions: Action[] = [
            actionCreators.functionCall(
                methodName,
                serializedArgs,
                BigInt(gas!),
                BigInt(parseNearAmount(attachedDepositNear!)!)
            ),
        ];
        console.log("Actions", actions);

        const mpcPubKey = PublicKey.fromString(mpcPublicKey);
        const transaction = createTransaction(
            signerAccountId,
            mpcPubKey,
            targetContractId,
            txnData.nonce,
            actions,
            blockHashBytes
        );
        console.log("Transaction", transaction);

        // Hash the transaction to get the message to sign
        const serializedTx = transaction.encode();
        const txHash = hashTransaction(serializedTx);
        console.log(`=== Message to sign: ${txHash} ===`);

        // Create the signature
        let r = signatureResult.big_r.affine_point;
        let s = signatureResult.s.scalar;

        const signature = createSignature(r, s);

        const signedTransaction = new SignedTransaction({
            transaction,
            signature,
        });

        // Send the signed transaction
        logInfo(`=== Sending NEAR Transaction ===`);
        const result = await provider.sendTransaction(signedTransaction);
        return { result, clientLog: "" };
    } else if (actionToPerform.chain === "EVM") {
        if (!providerUrl) {
            throw new Error("providerUrl is required for EVM transactions");
        }

        // Initialize provider
        const provider = new JsonRpcProvider(
            providerUrl,
            parseInt(chainId, 10)
        );

        // Encode function call data
        const contractInterface = new Interface(actionToPerform.abi);
        const functionData = contractInterface.getFunction(
            actionToPerform.methodName,
            actionToPerform.args as any[]
        );
        const data = contractInterface.encodeFunctionData(
            actionToPerform.methodName,
            actionToPerform.args as any[]
        );

        // Construct transaction data
        const transactionData: TransactionLike<string> = {
            nonce: parseInt(txnData.nonce, 10),
            gasLimit: BigInt(txnData.gasLimit),
            maxFeePerGas: BigInt(txnData.maxFeePerGas),
            maxPriorityFeePerGas: BigInt(txnData.maxPriorityFeePerGas),
            to: actionToPerform.targetContractId,
            data: data,
            value: BigInt(actionToPerform.value || "0"),
            chainId: parseInt(chainId, 10),
            type: 2, // EIP-1559 transaction
            accessList: actionToPerform.accessList || [],
        };

        // Create Transaction object
        const tx = Transaction.from(transactionData);

        // Get the serialized transaction
        const unsignedTx = tx.unsignedSerialized;
        const txHash = ethers.keccak256(unsignedTx);

        const payload = getBytes(txHash);

        // Log transaction information
        const clientLog = {};
        clientLog["Chain ID"] = parseInt(chainId, 10);
        clientLog["Nonce"] = parseInt(txnData.nonce, 10);
        clientLog["Max Priority Fee Per Gas"] = BigInt(
            txnData.maxPriorityFeePerGas
        ).toString();
        clientLog["Max Fee Per Gas"] = BigInt(txnData.maxFeePerGas).toString();
        clientLog["Gas Limit"] = BigInt(txnData.gasLimit || "0").toString();

        // Convert the contract address, input data, and hashed payload to arrays of numbers
        clientLog["Contract Address"] = hexStringToNumberArray(
            actionToPerform.targetContractId
        );
        clientLog["Value"] = BigInt(actionToPerform.value || "0").toString();
        clientLog["Input Data"] = hexStringToNumberArray(data);
        clientLog["Access List"] = actionToPerform.accessList || [];
        clientLog["Function"] = functionData; // This will stay as an object
        clientLog["ABI Parameters"] = contractInterface.getAbiCoder();
        clientLog["ABI Args"] = JSON.stringify(actionToPerform.args);
        clientLog["Hashed Payload"] = hexStringToNumberArray(txHash);
        clientLog["TXN Bytes"] = hexStringToNumberArray(unsignedTx);

        const sig = ethers.Signature.from({
            r:
                "0x" +
                signatureResult.big_r.affine_point.substring(2).toLowerCase(),
            s: "0x" + signatureResult.s.scalar.toLowerCase(),
            v: signatureResult.recovery_id,
        });
        tx.signature = sig;
        const recoveryAddress = recoverAddress(payload, sig);

        // Send the signed transaction
        logInfo(`=== Sending EVM Transaction ===`);
        if (recoveryAddress.toLowerCase() !== signerAccountId.toLowerCase()) {
            throw new Error(
                `Recovery address ${recoveryAddress} does not match signer address ${signerAccountId}`
            );
        } else {
            logSuccess(
                `Recovery address ${recoveryAddress} matches signer address ${signerAccountId}`
            );
        }

        logInfo(`Sending transaction from: ${recoveryAddress}`);
        const result = await provider.send("eth_sendRawTransaction", [
            tx.serialized,
        ]);
        return { result, clientLog };
    } else {
        throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
    }
}

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
