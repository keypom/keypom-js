import { Transaction } from "@near-wallet-selector/core";
export declare const TRIAL_ERRORS: {
    EXIT_EXPECTED: string;
    INVALID_ACTION: string;
    INSUFFICIENT_BALANCE: string;
};
export declare const validateDesiredMethods: ({ methodData, trialAccountId, }: {
    methodData: {
        receiverId: string;
        methodName: string;
        deposit: string;
    }[];
    trialAccountId: string;
}) => Promise<boolean>;
export declare const wrapTxnParamsForTrial: (params: any, newParams?: {}) => {};
export declare const generateExecuteArgs: ({ desiredTxns, }: {
    /** The transactions to execute */
    desiredTxns: Transaction[];
}) => {
    totalAttachedYocto: any;
    totalGasForTxns: any;
    executeArgs: any;
    methodDataToValidate: any;
};
export declare const estimateTrialGas: ({ executeArgs, }: {
    executeArgs: {
        transactions: {
            "|kR|": string;
            /** The actions to execute */
            actions: {
                /** The type of action to execute */
                "|kA|": "FunctionCall";
                /** The parameters for the action */
                params: {
                    /** The method name to execute */
                    "|kP|methodName": string;
                    /** The arguments to pass to the method */
                    "|kP|args": string;
                    /** The amount of gas to attach to the transaction */
                    "|kP|gas": string;
                    /** The amount of NEAR to attach to the transaction */
                    "|kP|deposit": string;
                };
            }[];
        }[];
    };
}) => any;
export declare const isUnclaimedTrialDrop: ({ keypomContractId, secretKey }: {
    keypomContractId: any;
    secretKey: any;
}) => Promise<boolean>;
export declare const hasEnoughBalance: ({ trialAccountId, totalGasForTxns, totalAttachedYocto, }: {
    trialAccountId: string;
    totalGasForTxns: string;
    totalAttachedYocto: string;
}) => Promise<any>;
