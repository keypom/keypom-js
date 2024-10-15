// lib/types/Constraints.ts

export type ChainConstraints = {
    NEAR?: NearConstraints;
    EVM?: EvmConstraints;
};

export interface NearConstraints {
    allowedMethods: string[];
    allowedContracts: string[];
    maxGas?: string; // Represented as a string
    maxDeposit?: string; // Represented as a string
}

export interface EvmConstraints {
    allowedMethods: string[];
    allowedContracts: string[]; // Ethereum addresses as strings
    maxGas?: string; // Represented as a string
    maxValue?: string; // Represented as a string
}
