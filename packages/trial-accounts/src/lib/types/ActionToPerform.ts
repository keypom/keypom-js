// lib/types/ActionToPerform.ts

/**
 * Defines an action to be performed on a contract.
 */
export interface ActionToPerform {
    chain: ChainType;
    methodName: string;
    methodParams: any;
    args: any;
    gasLimit?: string; // For EVM, represented as a string
    value?: string; // For EVM, represented as a string
    chainId?: number; // For EVM represented as a number
    maxFeePerGas?: string; // For EVM, represented as a string
    maxPriorityFeePerGas?: string; // For EVM, represented as a string
    accessList?: AccessList;
    targetContractId: string;
    attachedDepositNear?: string; // For NEAR, represented as a string
    gas?: string; // For NEAR, represented as a string
}

export type ChainType = "NEAR" | "EVM";
