import { AccountIdByChainId, UsageStats } from "./TrialAccountInfo";
/**
 * Associates a public key with its usage stats and trial ID.
 */
export interface KeyUsage {
    trialId: number;
    mpcKey: string;
    accountId: AccountIdByChainId;
    usageStats: UsageStats;
}
/**
 * Structure representing a key with both a public key and MPC key.
 */
export interface KeyWithMPC {
    publicKey: string;
    mpcKey: string;
}
