// broadcastTransaction.ts

import { Account } from "@near-js/accounts";
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

interface BroadcastTransactionParams {
    signerAccount: Account;
    actionToPerform: ActionToPerform;
    signatureResult: MPCSignature; // Signature result from the MPC
    nonce: string;
    blockHash: string;
    mpcPublicKey: string; // Add this parameter
}

/**
 * Broadcasts a signed transaction to the NEAR network.
 *
 * @param params - The parameters required to broadcast the transaction.
 * @returns A Promise that resolves when the transaction is broadcasted.
 * @throws Will throw an error if broadcasting fails.
 */

export async function broadcastTransaction(
    params: BroadcastTransactionParams
): Promise<void> {
    const {
        signerAccount,
        actionToPerform,
        signatureResult,
        nonce,
        blockHash,
        mpcPublicKey,
    } = params;

    const { targetContractId, methodName, args, gas, attachedDepositNear } =
        actionToPerform;

    const serializedArgs = new Uint8Array(Buffer.from(JSON.stringify(args)));

    const provider = signerAccount.connection.provider;

    const blockHashBytes = bs58.decode(blockHash);

    const accessKeys = await signerAccount.getAccessKeys();
    const accessKeyForSigning = accessKeys.find(
        (key) => key.public_key === mpcPublicKey
    );

    if (!accessKeyForSigning) {
        throw new Error(
            `No access key found for signing with MPC public key ${mpcPublicKey}`
        );
    }

    logSuccess(
        `User has correct MPC access key on their account: ${
            accessKeyForSigning!.public_key
        }`
    );

    const actions: Action[] = [
        actionCreators.functionCall(
            methodName,
            serializedArgs,
            BigInt(gas),
            BigInt(parseNearAmount(attachedDepositNear)!)
        ),
    ];

    // Collect the broadcast logs into an object

    // Create the transaction
    const transaction = createTransaction(
        signerAccount.accountId,
        PublicKey.fromString(mpcPublicKey), // Use MPC public key
        targetContractId,
        nonce,
        actions,
        blockHashBytes
    );

    // Hash the transaction to get the message to sign
    const serializedTx = transaction.encode();
    const txHash = hashTransaction(serializedTx);

    // Log transaction hash
    logInfo(`=== Transaction Details ===`);
    console.log("Transaction Hash:", Buffer.from(txHash).toString("hex"));

    let r = signatureResult.big_r.affine_point;
    let s = signatureResult.s.scalar;

    const signature = createSignature(r, s);

    const signedTransaction = new SignedTransaction({
        transaction,
        signature,
    });

    // Send the signed transaction
    logInfo(`=== Sending Transaction ===`);
    try {
        const result = await provider.sendTransaction(signedTransaction);
        console.log("Transaction Result:", result);
    } catch (error) {
        console.error("Error sending transaction:", error);
    }
}
