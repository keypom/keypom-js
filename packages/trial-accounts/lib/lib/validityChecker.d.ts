import { ActionToPerform, TrialData, UsageStats } from "./types";
/**
 * Checks the validity of actions against trial data constraints.
 * @param actionsToPerform - The actions to validate.
 * @param trialData - The trial data containing constraints.
 * @param usageStats - Current usage statistics for the trial account.
 * @param currentTimestamp - The current timestamp in nanoseconds.
 * @throws Will throw an error if any action is invalid.
 */
export declare function checkActionValidity(actionsToPerform: ActionToPerform[], trialData: TrialData, usageStats: UsageStats, currentTimestamp: number): void;
