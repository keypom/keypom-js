"use strict";
// lib/createTrial.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreateTrialParams = void 0;
const types_1 = require("./types");
/**
 * Generates the arguments for creating a trial.
 *
 * @param params - The parameters required to create a trial.
 * @returns A Record containing the arguments for creating a trial.
 */
function getCreateTrialParams(trialData) {
    // Type guard to check if value is ExtEVMConstraints
    const isExtEVMConstraints = (value) => {
        return value.chainId !== undefined;
    };
    // Transform constraintsByChainId to use chain ID directly if it's EVM
    const transformedConstraints = Object.entries(trialData.constraintsByChainId).reduce((acc, [key, value]) => {
        if (key === "EVM" && isExtEVMConstraints(value)) {
            // Now TypeScript knows that value is ExtEVMConstraints
            const evmConstraints = value;
            acc[evmConstraints.chainId] = { ...evmConstraints };
            acc[evmConstraints.chainId].initialDeposit =
                acc[evmConstraints.chainId].initialDeposit.toString();
            // @ts-ignore
            delete acc[evmConstraints.chainId].chainId; // Remove chainId as it's now used as the key
        }
        else {
            acc[key] = value;
        }
        return acc;
    }, {});
    const { constraintsByChainId, ...restTrialData } = trialData;
    const snakeCaseArgs = (0, types_1.toSnakeCase)({
        ...restTrialData,
        chain_constraints: transformedConstraints, // Use transformed constraints here
    });
    return snakeCaseArgs;
}
exports.getCreateTrialParams = getCreateTrialParams;
