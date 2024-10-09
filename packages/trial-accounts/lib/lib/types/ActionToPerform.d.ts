/**
 * Defines an action to be performed on a contract.
 */
export interface ActionToPerform {
    targetContractId: string;
    methodName: string;
    args: any;
    attachedDepositNear: string;
    gas: string;
}
