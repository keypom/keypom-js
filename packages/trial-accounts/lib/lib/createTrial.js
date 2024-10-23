"use strict";
// lib/createTrial.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrial = void 0;
const types_1 = require("./types");
const near_1 = require("./networks/near");
/**
 * Creates a new trial on the trial contract.
 *
 * @param params - The parameters required to create a trial.
 * @returns A Promise that resolves to the trial ID.
 * @throws Will throw an error if the trial creation fails.
 */
async function createTrial(params) {
    const { signerAccount, trialContractId, trialData } = params;
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
    const result = await (0, near_1.sendTransaction)({
        signerAccount,
        receiverId: trialContractId,
        methodName: "create_trial",
        args: snakeCaseArgs,
        deposit: "1",
        gas: "300000000000000",
    });
    const trialId = result.status.SuccessValue
        ? parseInt(Buffer.from(result.status.SuccessValue, "base64").toString(), 10)
        : null;
    if (trialId === null) {
        throw new Error("Failed to create trial");
    }
    console.log(`Trial created with ID: ${trialId}`);
    return trialId;
}
exports.createTrial = createTrial;
