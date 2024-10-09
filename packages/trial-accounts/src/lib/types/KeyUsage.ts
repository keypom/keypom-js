import { UsageStats } from "./TrialAccountInfo";

/**
 * Associates a public key with its usage stats and trial ID.
 */
export interface KeyUsage {
    trialId: number;
    mpcKey: string; // PublicKey represented as a string
    accountId: string | null;
    usageStats: UsageStats;
}

/**
 * Structure representing a key with both a public key and MPC key.
 */
export interface KeyWithMPC {
    publicKey: string; // PublicKey represented as a string
    mpcKey: string; // MPC PublicKey represented as a string
}
