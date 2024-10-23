// lib/createTrial.ts

import { toSnakeCase, TrialData } from "./types";
import { ExtEVMConstraints, NEARConstraints } from "./types/ChainConstraints";

/**
 * Generates the arguments for creating a trial.
 *
 * @param params - The parameters required to create a trial.
 * @returns A Record containing the arguments for creating a trial.
 */
export function getCreateTrialParams(
    trialData: TrialData
): Record<string, any> {
    // Type guard to check if value is ExtEVMConstraints
    const isExtEVMConstraints = (
        value: NEARConstraints | ExtEVMConstraints
    ): value is ExtEVMConstraints => {
        return (value as ExtEVMConstraints).chainId !== undefined;
    };

    // Transform constraintsByChainId to use chain ID directly if it's EVM
    const transformedConstraints = Object.entries(
        trialData.constraintsByChainId
    ).reduce((acc, [key, value]) => {
        if (key === "EVM" && isExtEVMConstraints(value)) {
            // Now TypeScript knows that value is ExtEVMConstraints
            const evmConstraints = value;
            acc[evmConstraints.chainId] = { ...evmConstraints };
            acc[evmConstraints.chainId].initialDeposit =
                acc[evmConstraints.chainId].initialDeposit.toString();
            // @ts-ignore
            delete acc[evmConstraints.chainId].chainId; // Remove chainId as it's now used as the key
        } else {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string | number, NEARConstraints | ExtEVMConstraints>);

    const { constraintsByChainId, ...restTrialData } = trialData;

    const snakeCaseArgs = toSnakeCase({
        ...restTrialData,
        chain_constraints: transformedConstraints, // Use transformed constraints here
    });
    return snakeCaseArgs;
}
