import { KeyPairString } from "@near-js/crypto";
import { Near } from "@near-js/wallet-account";
interface ActivateTrialAccountsParams {
    near: Near;
    trialContractId: string;
    trialAccountIds: string[];
    trialAccountSecretKeys: KeyPairString[];
}
/**
 * Activates trial accounts on the trial contract.
 *
 * @param params - The parameters required to activate trial accounts.
 * @returns A Promise that resolves when all accounts are activated.
 * @throws Will throw an error if activation of any trial account fails.
 */
export declare function activateTrialAccounts(params: ActivateTrialAccountsParams): Promise<void>;
export {};
