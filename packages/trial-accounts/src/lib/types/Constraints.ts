// lib/types/Constraints.ts

/**
 * Specifies usage constraints like max contracts and methods.
 */
export interface UsageConstraints {
    maxContracts?: number;
    maxMethods?: number;
    maxTokenTransfer?: string; // U128 represented as a string
    rateLimitPerMinute?: number;
    blacklistedAddresses: string[]; // Use string to represent addresses for both NEAR and EVM
}

/**
 * Defines interaction limits for trial accounts.
 */
export interface InteractionLimits {
    maxInteractionsPerDay?: number;
    totalInteractions?: number;
}

/**
 * Represents a function success condition based on output.
 */
export interface FunctionSuccessCondition {
    contractId: string;
    methodName: string;
    expectedReturn: string;
}

/**
 * Conditions under which the trial account will exit.
 */
export interface ExitConditions {
    transactionLimit?: number;
    successCondition?: FunctionSuccessCondition;
    timeLimit?: number; // Timestamp in nanoseconds
}

/**
 * Enum representing chain constraints.
 */
export interface ChainConstraints {
    NEAR?: NearConstraints;
    EVM?: EvmConstraints;
}

/**
 * Constraints specific to NEAR.
 */
export interface NearConstraints {
    allowedMethods: string[];
    allowedContracts: string[];
    maxGas?: string; // Represented as a string
    maxDeposit?: string; // Represented as a string
}

/**
 * Constraints specific to EVM.
 */
export interface EvmConstraints {
    allowedMethods: string[]; // Function signatures or names
    allowedContracts: string[]; // Ethereum addresses as strings
    maxGas?: string; // Represented as a string
    maxValue?: string; // Represented as a string
}
