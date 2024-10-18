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
import { logInfo } from "./logUtils";
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

interface BroadcastTransactionParams {
    nearConnection: Near;
    chainId: string;
    signerAccountId: string;
    actionToPerform: ActionToPerform;
    signatureResult: MPCSignature; // Signature result from the MPC
    nonce: string;
    blockHash: string;
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
        nonce,
        blockHash,
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
        const provider = signerAccount.connection.provider;

        const blockHashBytes = bs58.decode(blockHash);

        const actions: Action[] = [
            actionCreators.functionCall(
                methodName,
                serializedArgs,
                BigInt(gas!),
                BigInt(parseNearAmount(attachedDepositNear!)!)
            ),
        ];

        const mpcPubKey = PublicKey.fromString(mpcPublicKey);
        const transaction = createTransaction(
            signerAccountId,
            mpcPubKey,
            targetContractId,
            nonce,
            actions,
            blockHashBytes
        );

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
            nonce: parseInt(nonce, 10),
            gasLimit: BigInt(actionToPerform.gasLimit || "0"),
            maxFeePerGas: BigInt(actionToPerform.maxFeePerGas || "0"),
            maxPriorityFeePerGas: BigInt(actionToPerform.maxPriorityFeePerGas),
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
        clientLog["Nonce"] = parseInt(nonce, 10);
        clientLog["Max Priority Fee Per Gas"] = BigInt(
            actionToPerform.maxPriorityFeePerGas
        ).toString();
        clientLog["Max Fee Per Gas"] = BigInt(
            actionToPerform.maxFeePerGas
        ).toString();
        clientLog["Gas Limit"] = BigInt(
            actionToPerform.gasLimit || "0"
        ).toString();
        clientLog["Contract Address"] = actionToPerform.targetContractId;
        clientLog["Value"] = BigInt(actionToPerform.value || "0").toString();
        clientLog["Input Data"] = data;
        clientLog["Access List"] = actionToPerform.accessList || [];
        clientLog["Function"] = functionData;
        clientLog["ABI Parameters"] = contractInterface.getAbiCoder();
        clientLog["ABI Args"] = JSON.stringify(actionToPerform.args);
        clientLog["Hashed Payload"] = txHash;
        console.log(clientLog);
        console.log("Signature: ", signatureResult);

        const sig = {
            r:
                "0x" +
                signatureResult.big_r.affine_point.substring(2).toLowerCase(),
            s: "0x" + signatureResult.s.scalar.toLowerCase(),
            v: signatureResult.recovery_id,
        };
        const recoveryAddress = recoverAddress(payload, sig);

        // Send the signed transaction
        logInfo(`=== Sending EVM Transaction ===`);
        if (recoveryAddress !== signerAccountId) {
            console.log(
                `Recovery address ${recoveryAddress} does not match signer address ${signerAccountId}`
            );
        }

        logInfo(`Sending transaction from: ${recoveryAddress}`);
        let result;
        try {
            result = await provider.send("eth_sendRawTransaction", [
                tx.serialized,
            ]);
        } catch (e) {}
        return { result, clientLog };
    } else {
        throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
    }
}
