/**
 * Defines an action to be performed on a contract.
 */
export interface ActionToPerform {
    targetContractId: string;
    methodName: string;
    args: any;
    attachedDepositNear: string; // Represented as a string to handle precise amounts
    gas: string; // Represented as a string to handle large numbers
}
