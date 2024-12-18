// lib/validityChecker.ts

import { ActionToPerform, TrialData, UsageStats } from "./types";
import { ExtEVMConstraints, NEARConstraints } from "./types/ChainConstraints";
import { TransactionData } from "./performAction";
import { parseNearAmount } from "near-api-js/lib/utils/format";

/**
 * Checks the validity of actions against trial data constraints.
 * @param actionsToPerform - The actions to validate.
 * @param trialData - The trial data containing constraints.
 * @param usageStats - Current usage statistics for the trial account.
 * @param currentTimestamp - The current timestamp in nanoseconds.
 * @throws Will throw an error if any action is invalid.
 */
export function checkActionValidity(
    actionsToPerform: ActionToPerform[],
    txnDatas: TransactionData[],
    trialData: TrialData,
    usageStats: UsageStats,
    currentTimestamp: number // in nanoseconds
): void {
    // Check if the trial has expired
    if (
        trialData.expirationTime &&
        currentTimestamp >= trialData.expirationTime
    ) {
        throw new Error("Trial period has expired");
    }

    const cumulativeUsageStats = { ...usageStats };

    let iterationCount = 0;
    for (const action of actionsToPerform) {
        const txnData = txnDatas[iterationCount];
        // Update total interactions
        cumulativeUsageStats.totalInteractions += 1;

        // Check transaction limit
        if (
            trialData.exitConditions &&
            trialData.exitConditions.transactionLimit
        ) {
            if (
                cumulativeUsageStats.totalInteractions >
                trialData.exitConditions.transactionLimit
            ) {
                throw new Error("Transaction limit reached");
            }
        }

        // Determine chain ID
        const chainId =
            action.chain === "NEAR" ? "NEAR" : action.chainId?.toString();
        if (!chainId) {
            throw new Error("Chain ID is missing for EVM action");
        }

        // Get constraints for the chain
        const constraints = trialData.constraintsByChainId[chainId];

        if (!constraints) {
            throw new Error(`No constraints defined for chain ${chainId}`);
        }

        // Now check action-specific constraints
        if (action.chain === "NEAR" && "allowedMethods" in constraints) {
            const nearConstraints = constraints as NEARConstraints;

            // Check if the method is allowed
            if (!nearConstraints.allowedMethods.includes(action.methodName)) {
                throw new Error(
                    `Method ${
                        action.methodName
                    } is not allowed on NEAR. Allowed methods: ${nearConstraints.allowedMethods.join()}`
                );
            }

            // Check if the contract is allowed
            if (
                !nearConstraints.allowedContracts.includes(
                    action.targetContractId
                )
            ) {
                throw new Error(
                    `Contract ${
                        action.targetContractId
                    } is not allowed on NEAR. Allowed contracts: ${nearConstraints.allowedContracts.join()}`
                );
            }

            // Check gas limit
            if (nearConstraints.maxGas && action.gas) {
                if (BigInt(action.gas) > BigInt(nearConstraints.maxGas)) {
                    throw new Error(
                        `Gas ${action.gas} exceeds maximum allowed ${nearConstraints.maxGas}`
                    );
                }
            }

            // Check deposit limit
            if (nearConstraints.maxDeposit && action.attachedDepositNear) {
                const actionDepositYocto = BigInt(
                    parseNearAmount(action.attachedDepositNear)!
                );
                if (actionDepositYocto > BigInt(nearConstraints.maxDeposit)) {
                    throw new Error(
                        `Deposit ${action.attachedDepositNear} exceeds maximum allowed ${nearConstraints.maxDeposit}`
                    );
                }
            }

            // Update usage statistics
            if (action.gas) {
                cumulativeUsageStats.gasUsed = (
                    BigInt(cumulativeUsageStats.gasUsed) + BigInt(action.gas)
                ).toString();
            }

            if (action.attachedDepositNear) {
                const actionDepositYocto = BigInt(
                    parseNearAmount(action.attachedDepositNear)!
                );
                cumulativeUsageStats.depositUsed = (
                    BigInt(cumulativeUsageStats.depositUsed) +
                    actionDepositYocto
                ).toString();
            }
        } else if (action.chain === "EVM" && "allowedMethods" in constraints) {
            const evmConstraints = constraints as ExtEVMConstraints;

            // Check if the method is allowed
            if (!evmConstraints.allowedMethods.includes(action.methodName)) {
                throw new Error(
                    `Method ${action.methodName} is not allowed on EVM. Allowed methods: ${evmConstraints.allowedMethods}`
                );
            }

            const isContractAllowed = !evmConstraints.allowedContracts.includes(
                action.targetContractId
            );
            if (!isContractAllowed) {
                throw new Error(
                    `Contract ${
                        action.targetContractId
                    } is not allowed on EVM. Allowed contracts: ${evmConstraints.allowedContracts.join()}`
                );
            }

            // Check gas limit
            if (evmConstraints.maxGas && txnData.gasLimit) {
                if (BigInt(txnData.gasLimit) > BigInt(evmConstraints.maxGas)) {
                    throw new Error(
                        `Gas limit ${txnData.gasLimit} exceeds maximum allowed ${evmConstraints.maxGas}`
                    );
                }
            }

            // Check value limit
            if (evmConstraints.maxValue && action.value) {
                if (BigInt(action.value) > BigInt(evmConstraints.maxValue)) {
                    throw new Error(
                        `Value ${action.value} exceeds maximum allowed ${evmConstraints.maxValue}`
                    );
                }
            }

            // Update usage statistics
            if (txnData.gasLimit) {
                cumulativeUsageStats.gasUsed = (
                    BigInt(cumulativeUsageStats.gasUsed) +
                    BigInt(txnData.gasLimit)
                ).toString();
            }

            if (action.value) {
                cumulativeUsageStats.depositUsed = (
                    BigInt(cumulativeUsageStats.depositUsed) +
                    BigInt(action.value)
                ).toString();
            }
        } else {
            throw new Error("Chain constraints mismatch or unsupported chain");
        }
        iterationCount += 1;
    }

    // After processing all actions, check if any usage constraints are exceeded
    if (trialData.usageConstraints) {
        const usageConstraints = trialData.usageConstraints;

        // Check maxTokenTransfer (assuming this refers to depositUsed)
        if (usageConstraints.maxTokenTransfer) {
            if (
                BigInt(cumulativeUsageStats.depositUsed) >
                BigInt(usageConstraints.maxTokenTransfer)
            ) {
                throw new Error("Deposit used exceeds maximum allowed");
            }
        }

        // Additional usage constraints can be added here
    }

    // Check interaction limits
    if (trialData.interactionLimits) {
        const interactionLimits = trialData.interactionLimits;

        // Check totalInteractions
        if (interactionLimits.totalInteractions) {
            if (
                cumulativeUsageStats.totalInteractions >
                interactionLimits.totalInteractions
            ) {
                throw new Error("Total interactions exceed maximum allowed");
            }
        }
    }

    // All checks passed
}
