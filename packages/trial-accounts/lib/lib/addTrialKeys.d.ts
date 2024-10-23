import { TrialKey } from "./types";
interface AddTrialAccountsParams {
    trialContractId: string;
    mpcContractId: string;
    numberOfKeys: number;
    viewFunction: any;
}
/**
 * Generates the trial key data needed to add trial accounts.
 *
 * @param params - The number of keys to generate.
 * @returns A Promise that resolves to an array of TrialKey objects.
 */
export declare function generateTrialKeys(params: AddTrialAccountsParams): Promise<TrialKey[]>;
export {};
