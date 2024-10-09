import { TrialData } from "./TrialData";

/**
 * Usage statistics for the trial account.
 */
export interface UsageStats {
    interactionsPerDay: { [timestamp: number]: number }; // Day timestamp to interaction count
    totalInteractions: number;
    methodsCalled: { [methodName: string]: number }; // method_name to count
    contractsCalled: { [contractId: string]: number }; // contract_id to count
    gasUsed: string; // Represented as a string to handle large numbers
    depositUsed: string; // Represented as a string to handle large amounts
}

/**
 * Represents usage stats and account information for a trial account.
 */
export interface TrialAccountInfo {
    trialId: number;
    trialData: TrialData;
    mpcKey: string; // Corresponds to the public key in the Rust implementation
    accountId: string | null;
    usageStats: UsageStats;
}
