// lib/broadcastTransaction.ts

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
import { logInfo } from "./logUtils";
import { ethers, TransactionResponse } from "ethers";
import { FinalExecutionOutcome } from "@near-js/types";

interface BroadcastTransactionParams {
    signerAccount: Account;
    actionToPerform: ActionToPerform;
    signatureResult: MPCSignature; // Signature result from the MPC
    nonce: string;
    blockHash: string;
    mpcPublicKey: string;
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
        signerAccount,
        actionToPerform,
        signatureResult,
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
        const signerAccountId = signerAccount.accountId;
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
        // Implement logic to broadcast EVM transactions using ethers.js
        const provider = new ethers.JsonRpcProvider(/* RPC URL */);
        const wallet = new ethers.Wallet(mpcPublicKey, provider);
        console.log(`wallet: ${wallet.address}`);

        // Send the signed transaction
        logInfo(`=== Sending EVM Transaction ===`);
        return await provider.broadcastTransaction("");
    } else {
        throw new Error(`Unsupported chain type: ${actionToPerform.chain}`);
    }
}
