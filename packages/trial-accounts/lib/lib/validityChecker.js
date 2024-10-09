"use strict";
// validityChecker.ts
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
    for (const action of actionsToPerform) {
        const { targetContractId, methodName, gas, attachedDepositNear } = action;
        // Check if the method is allowed
        if (!trialData.allowedMethods.includes(methodName)) {
            throw new Error(`Method ${methodName} is not allowed`);
        }
        // Check if the contract is allowed
        if (!trialData.allowedContracts.includes(targetContractId)) {
            throw new Error(`Contract ${targetContractId} is not allowed`);
        }
        // Check gas limit
        if (trialData.maxGas && parseInt(gas) > parseInt(trialData.maxGas)) {
            throw new Error(`Gas ${gas} exceeds maximum allowed ${trialData.maxGas}`);
        }
        // Check deposit limit
        if (trialData.maxDeposit &&
            BigInt((0, utils_1.parseNearAmount)(attachedDepositNear)) >
                BigInt(trialData.maxDeposit)) {
            throw new Error(`Deposit ${attachedDepositNear} exceeds maximum allowed ${trialData.maxDeposit}`);
        }
        // Additional checks can be added here (e.g., usage constraints)
    }
}
exports.checkActionValidity = checkActionValidity;
