/**
 * Defines an action to be performed on a contract.
 */
export interface ActionToPerform {
    chain: ChainType;
    targetContractId: string;
    methodName: string;
    args: any;
    attachedDepositNear?: string;
    gas?: string;
    gasLimit?: string;
    value?: string;
}
export type ChainType = "NEAR" | "EVM";
