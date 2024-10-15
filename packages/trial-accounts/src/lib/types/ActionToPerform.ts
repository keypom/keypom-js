// lib/types/ActionToPerform.ts

/**
 * Defines an action to be performed on a contract.
 */
export interface ActionToPerform {
    chain: ChainType;
    targetContractId: string;
    methodName: string;
    args: any;
    attachedDepositNear?: string; // For NEAR, represented as a string
    gas?: string; // For NEAR, represented as a string
    gasLimit?: string; // For EVM, represented as a string
    value?: string; // For EVM, represented as a string
}

export type ChainType = "NEAR" | "EVM";
