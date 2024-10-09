import { UsageConstraints, InteractionLimits, ExitConditions } from "./Constraints";
/**
 * Data required to create a trial.
 */
export interface TrialData {
    allowedMethods: string[];
    allowedContracts: string[];
    initialDeposit: string;
    maxGas?: string;
    maxDeposit?: string;
    usageConstraints?: UsageConstraints;
    interactionLimits?: InteractionLimits;
    exitConditions?: ExitConditions;
    expirationTime?: number;
    chainId: number;
    creatorAccountId?: string;
}
