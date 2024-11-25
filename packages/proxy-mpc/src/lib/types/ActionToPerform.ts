// lib/types/ActionToPerform.ts

import { AccessList } from "./EVMTypes";

export interface ActionToPerform {
    chain: ChainType;
    methodName: string;
    args?: any[] | Record<string, any>; // Simplify args input
    abi?: any[]; // Optionally provide ABI
    value?: string; // For EVM, represented as a string
    chainId?: number; // For EVM, represented as a number
    accessList?: AccessList; // Updated type
    targetContractId: string; // For EVM, this would be the contract address
    attachedDepositNear?: string; // For NEAR, represented as a string
    gas?: string; // For NEAR, represented as a string
}

export type ChainType = "NEAR" | "EVM";
