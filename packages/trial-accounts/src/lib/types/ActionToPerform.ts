// lib/types/ActionToPerform.ts

import { SerializableParam, SerializableToken, AccessList } from "./EVMTypes";

export interface ActionToPerform {
    chain: ChainType;
    methodName: string;
    methodParams?: SerializableParam[]; // Updated type
    args?: SerializableToken[] | Record<string, any>; // Updated type
    gasLimit?: string; // For EVM, represented as a string
    value?: string; // For EVM, represented as a string
    chainId?: number; // For EVM, represented as a number
    maxFeePerGas?: string; // For EVM, represented as a string
    maxPriorityFeePerGas?: string; // For EVM, represented as a string
    accessList?: AccessList; // Updated type
    targetContractId: string; // For EVM, this would be the contract address
    attachedDepositNear?: string; // For NEAR, represented as a string
    gas?: string; // For NEAR, represented as a string
}

export type ChainType = "NEAR" | "EVM";
