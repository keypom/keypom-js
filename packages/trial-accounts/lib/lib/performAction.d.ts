import { ActionToPerform, MPCSignature, TrialAccountInfo } from "./types";
import { Near } from "@near-js/wallet-account";
export interface TransactionData {
    nonce: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasLimit?: string;
    blockHash?: string;
}
interface PerformActionsParams {
    near: Near;
    trialAccountInfo: TrialAccountInfo;
    actionsToPerform: ActionToPerform[];
    evmProviderUrl?: string;
}
/**
 * Performs one or more actions by requesting signatures from the MPC.
 *
 * @param params - The parameters required to perform actions.
 * @returns A Promise that resolves to an array of signature arrays.
 */
export declare function generateActionArgs(params: PerformActionsParams): Promise<{
    txnDatas: TransactionData[];
    txnArgs: any[];
}>;
export declare function extractSignatureFromResult(result: any): MPCSignature;
export {};
