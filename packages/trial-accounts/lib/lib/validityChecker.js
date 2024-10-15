"use strict";
// lib/validityChecker.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkActionValidity = void 0;
const utils_1 = require("@near-js/utils");
/**
 * Checks the validity of actions against trial data constraints.
 * @param actionsToPerform - The actions to validate.
 * @param trialData - The trial data containing constraints.
 * @throws Will throw an error if any action is invalid.
 */
function checkActionValidity(actionsToPerform, trialData) {
    const chainConstraints = trialData.chainConstraints;
    for (const action of actionsToPerform) {
        const { targetContractId, methodName } = action;
        if (action.chain === "NEAR" && chainConstraints.NEAR) {
            const constraints = chainConstraints.NEAR;
            // Check if the method is allowed
            if (!constraints.allowedMethods.includes(methodName)) {
                throw new Error(`Method ${methodName} is not allowed on NEAR`);
            }
            // Check if the contract is allowed
            if (!constraints.allowedContracts.includes(targetContractId)) {
                throw new Error(`Contract ${targetContractId} is not allowed on NEAR`);
            }
            // Check gas limit
            if (constraints.maxGas && action.gas) {
                if (BigInt(action.gas) > BigInt(constraints.maxGas)) {
                    throw new Error(`Gas ${action.gas} exceeds maximum allowed ${constraints.maxGas}`);
                }
            }
            // Check deposit limit
            if (constraints.maxDeposit && action.attachedDepositNear) {
                const actionDeposit = BigInt((0, utils_1.parseNearAmount)(action.attachedDepositNear));
                if (actionDeposit > BigInt(constraints.maxDeposit)) {
                    throw new Error(`Deposit ${action.attachedDepositNear} exceeds maximum allowed ${constraints.maxDeposit}`);
                }
            }
            // Additional checks for NEAR can be added here
        }
        else if (action.chain === "EVM" && chainConstraints.EVM) {
            const constraints = chainConstraints.EVM;
            // Check if the method is allowed
            if (!constraints.allowedMethods.includes(methodName)) {
                throw new Error(`Method ${methodName} is not allowed on EVM`);
            }
            // Check if the contract is allowed
            if (!constraints.allowedContracts.includes(targetContractId)) {
                throw new Error(`Contract ${targetContractId} is not allowed on EVM`);
            }
            // Check gas limit
            if (constraints.maxGas && action.gasLimit) {
                if (BigInt(action.gasLimit) > BigInt(constraints.maxGas)) {
                    throw new Error(`Gas limit ${action.gasLimit} exceeds maximum allowed ${constraints.maxGas}`);
                }
            }
            // Check value limit
            if (constraints.maxValue && action.value) {
                if (BigInt(action.value) > BigInt(constraints.maxValue)) {
                    throw new Error(`Value ${action.value} exceeds maximum allowed ${constraints.maxValue}`);
                }
            }
            // Additional checks for EVM can be added here
        }
        else {
            throw new Error("Chain constraints mismatch or unsupported chain");
        }
    }
}
exports.checkActionValidity = checkActionValidity;
