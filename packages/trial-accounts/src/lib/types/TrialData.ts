// lib/types/TrialData.ts

import {
    UsageConstraints,
    InteractionLimits,
    ExitConditions,
    ChainConstraints,
} from "./Constraints";

/**
 * Data required to create a trial.
 */
export interface TrialData {
    chainConstraints: ChainConstraints;
    usageConstraints?: UsageConstraints;
    interactionLimits?: InteractionLimits;
    exitConditions?: ExitConditions;
    expirationTime?: number; // Timestamp in nanoseconds
    initialDeposit: string; // NEAR amount represented as a string
    chainId: number;
    creatorAccountId?: string; // Added to match Rust struct
}
