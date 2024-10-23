import { ActionToPerform, MPCSignature, TrialAccountInfo } from "./types";
import { KeyPairString } from "@near-js/crypto";
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
    trialAccountId: string;
    trialAccountSecretKey: KeyPairString;
    trialAccountInfo: TrialAccountInfo;
    trialContractId: string;
    actionsToPerform: ActionToPerform[];
    evmProviderUrl?: string;
}
/**
 * Performs one or more actions by requesting signatures from the MPC.
 *
 * @param params - The parameters required to perform actions.
 * @returns A Promise that resolves to an array of signature arrays.
 */
export declare function performActions(params: PerformActionsParams): Promise<{
    signatures: MPCSignature[];
    txnDatas: TransactionData[];
    contractLogs: string[];
}>;
export {};
