// lib/types/TrialData.ts

import {
    UsageConstraints,
    InteractionLimits,
    ExitConditions,
} from "./Constraints";

import { ExtEVMConstraints, NEARConstraints } from "./ChainConstraints";

/**
 * Data required to create a trial.
 */
export interface TrialData {
    constraintsByChainId: {
        NEAR?: NEARConstraints;
        EVM?: ExtEVMConstraints;
    };
    usageConstraints: UsageConstraints | null;
    interactionLimits: InteractionLimits | null;
    exitConditions: ExitConditions | null;
    expirationTime: number | null;
    initialDeposit: string;
    creatorAccountId?: string;
}
