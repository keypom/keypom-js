import { Account } from "@near-js/accounts";
import { TrialKey } from "./types";
interface AddTrialAccountsParams {
    signerAccount: Account;
    contractAccountId: string;
    trialId: number;
    numberOfKeys: number;
}
/**
 * Adds trial accounts to the trial contract by generating key pairs and deriving MPC keys.
 *
 * @param params - The parameters required to add trial accounts.
 * @returns A Promise that resolves to an array of TrialKey objects.
 * @throws Will throw an error if adding trial keys fails.
 */
export declare function addTrialAccounts(params: AddTrialAccountsParams): Promise<TrialKey[]>;
export {};
