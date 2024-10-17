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
    Interface,
    JsonRpcProvider,
    recoverAddress,
    Transaction,
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
): Promise<TransactionResponse | FinalExecutionOutcome> {
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
        return await provider.sendTransaction(signedTransaction);
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
        const data = contractInterface.encodeFunctionData(
            actionToPerform.methodName,
            actionToPerform.args as any[]
        );

        // Construct transaction data
        const transactionData = {
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
        const hexPayload = ethers.keccak256(
            ethers.getBytes(tx.unsignedSerialized)
        );
        const serializedTxHash = Buffer.from(hexPayload.substring(2), "hex");

        const signature = ethers.Signature.from({
            r:
                "0x" +
                Buffer.from(
                    signatureResult.big_r.affine_point.substring(2),
                    "hex"
                ).toString("hex"),
            s:
                "0x" +
                Buffer.from(signatureResult.s.scalar, "hex").toString("hex"),
            v: signatureResult.recovery_id + (parseInt(chainId) * 2 + 35),
        });

        // Sign the transaction
        tx.signature = signature;

        // Get the serialized transaction
        const serializedTx = tx.serialized;

        // Send the signed transaction
        logInfo(`=== Sending EVM Transaction ===`);
        const recoveryAddress = recoverAddress(serializedTxHash, signature);
        if (recoveryAddress !== signerAccountId) {
            throw new Error(
                `Recovery address ${recoveryAddress} does not match signer address ${signerAccountId}`
            );
        }

        logInfo(`Sending transaction from: ${recoveryAddress}`);
        return await provider.send("eth_sendRawTransaction", [serializedTx]);
    } else {
        throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
    }
}
