import {
    UsageConstraints,
    InteractionLimits,
    ExitConditions,
} from "./Constraints";

/**
 * Data required to create a trial.
 */
export interface TrialData {
    allowedMethods: string[];
    allowedContracts: string[];
    initialDeposit: string; // NEAR amount represented as a string
    maxGas?: string; // Represented as a string to handle large numbers
    maxDeposit?: string; // U128 represented as a string
    usageConstraints?: UsageConstraints;
    interactionLimits?: InteractionLimits;
    exitConditions?: ExitConditions;
    expirationTime?: number; // timestamp in nanoseconds
    chainId: number;
    creatorAccountId?: string; // Added to match Rust struct
}
