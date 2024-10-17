import { AccessList } from "./EVMTypes";
export interface ActionToPerform {
    chain: ChainType;
    methodName: string;
    args?: any[] | Record<string, any>;
    abi?: any[];
    gasLimit?: string;
    value?: string;
    chainId?: number;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    accessList?: AccessList;
    targetContractId: string;
    attachedDepositNear?: string;
    gas?: string;
}
export type ChainType = "NEAR" | "EVM";
