// validityChecker.ts

import { ActionToPerform, TrialData } from "./types";
import { parseNearAmount } from "@near-js/utils";

/**
 * Checks the validity of actions against trial data constraints.
 * @param actionsToPerform - The actions to validate.
 * @param trialData - The trial data containing constraints.
 * @throws Will throw an error if any action is invalid.
 */
export function checkActionValidity(
  actionsToPerform: ActionToPerform[],
  trialData: TrialData,
): void {
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
    if (trialData.maxGas && parseInt(gas) > trialData.maxGas) {
      throw new Error(`Gas ${gas} exceeds maximum allowed ${trialData.maxGas}`);
    }

    // Check deposit limit
    if (
      trialData.maxDeposit &&
      BigInt(parseNearAmount(attachedDepositNear)!) >
        BigInt(trialData.maxDeposit)
    ) {
      throw new Error(
        `Deposit ${attachedDepositNear} exceeds maximum allowed ${trialData.maxDeposit}`,
      );
    }

    // Additional checks can be added here (e.g., usage constraints)
  }
}
