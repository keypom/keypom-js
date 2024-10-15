import { UsageConstraints, InteractionLimits, ExitConditions, ChainConstraints } from "./Constraints";
/**
 * Data required to create a trial.
 */
export interface TrialData {
    chainConstraints: ChainConstraints;
    usageConstraints?: UsageConstraints;
    interactionLimits?: InteractionLimits;
    exitConditions?: ExitConditions;
    expirationTime?: number;
    initialDeposit: string;
    chainId: number;
    creatorAccountId?: string;
}
