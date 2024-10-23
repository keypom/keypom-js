import { AccessList } from "./EVMTypes";
export interface ActionToPerform {
    chain: ChainType;
    methodName: string;
    args?: any[] | Record<string, any>;
    abi?: any[];
    value?: string;
    chainId?: number;
    accessList?: AccessList;
    targetContractId: string;
    attachedDepositNear?: string;
    gas?: string;
}
export type ChainType = "NEAR" | "EVM";
