import { ActionToPerform, MPCSignature } from "./types";
import { TransactionResponse } from "ethers";
import { Near } from "near-api-js";
import { TransactionData } from "./performAction";
import { FinalExecutionOutcome } from "@near-wallet-selector/core";
interface BroadcastTransactionParams {
    nearConnection: Near;
    chainId: string;
    signerAccountId: string;
    actionToPerform: ActionToPerform;
    signatureResult: MPCSignature;
    txnData: TransactionData;
    mpcPublicKey: string;
    providerUrl?: string;
}
/**
 * Broadcasts a signed transaction to the NEAR or EVM network.
 *
 * @param params - The parameters required to broadcast the transaction.
 * @returns A Promise that resolves when the transaction is broadcasted.
 * @throws Will throw an error if broadcasting fails.
 */
export declare function broadcastTransaction(params: BroadcastTransactionParams): Promise<{
    result: TransactionResponse | FinalExecutionOutcome;
    clientLog: any;
}>;
export {};
