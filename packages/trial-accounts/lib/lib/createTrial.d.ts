import { Account } from "@near-js/accounts";
import { TrialData } from "./types";
interface CreateTrialParams {
    signerAccount: Account;
    trialContractId: string;
    trialData: TrialData;
}
/**
 * Creates a new trial on the trial contract.
 *
 * @param params - The parameters required to create a trial.
 * @returns A Promise that resolves to the trial ID.
 * @throws Will throw an error if the trial creation fails.
 */
export declare function createTrial(params: CreateTrialParams): Promise<number>;
export {};
