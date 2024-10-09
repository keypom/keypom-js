import { TrialData } from "./TrialData";
/**
 * Usage statistics for the trial account.
 */
export interface UsageStats {
    interactionsPerDay: {
        [timestamp: number]: number;
    };
    totalInteractions: number;
    methodsCalled: {
        [methodName: string]: number;
    };
    contractsCalled: {
        [contractId: string]: number;
    };
    gasUsed: string;
    depositUsed: string;
}
/**
 * Represents usage stats and account information for a trial account.
 */
export interface TrialAccountInfo {
    trialId: number;
    trialData: TrialData;
    mpcKey: string;
    accountId: string | null;
    usageStats: UsageStats;
}
