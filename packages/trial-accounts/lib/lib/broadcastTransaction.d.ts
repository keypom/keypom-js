import { Account } from "@near-js/accounts";
import { ActionToPerform, MPCSignature } from "./types";
interface BroadcastTransactionParams {
    signerAccount: Account;
    actionToPerform: ActionToPerform;
    signatureResult: MPCSignature;
    nonce: string;
    blockHash: string;
    mpcPublicKey: string;
    trialAccountPublicKey: string;
}
/**
 * Broadcasts a signed transaction to the NEAR network.
 *
 * @param params - The parameters required to broadcast the transaction.
 * @returns A Promise that resolves when the transaction is broadcasted.
 * @throws Will throw an error if broadcasting fails.
 */
export declare function broadcastTransaction(params: BroadcastTransactionParams): Promise<void>;
export {};
