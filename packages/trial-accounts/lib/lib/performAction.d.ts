import { ActionToPerform, MPCSignature } from "./types";
import { KeyPairString } from "@near-js/crypto";
import { Near } from "@near-js/wallet-account";
interface PerformActionsParams {
    near: Near;
    trialAccountId: string;
    trialAccountSecretKey: KeyPairString;
    trialContractId: string;
    actionsToPerform: ActionToPerform[];
}
/**
 * Performs one or more actions by requesting signatures from the MPC.
 *
 * @param params - The parameters required to perform actions.
 * @returns A Promise that resolves to an array of signature arrays.
 */
export declare function performActions(params: PerformActionsParams): Promise<{
    signatures: MPCSignature[];
    nonces: string[];
    blockHash: string;
}>;
export {};
