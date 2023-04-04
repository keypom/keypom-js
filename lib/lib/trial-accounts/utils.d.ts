export declare const TRIAL_ERRORS: {
    EXIT_EXPECTED: string;
    INVALID_ACTION: string;
};
export declare const validateDesiredMethods: ({ methodData, trialAccountId }: {
    methodData: {
        receiverId: string;
        methodName: string;
        deposit: string;
    }[];
    trialAccountId: string;
}) => Promise<boolean>;
export declare const wrapTxnParamsForTrial: (params: any, newParams?: {}) => {};
export declare const generateExecuteArgs: ({ desiredTxns }: {
    /** The transactions to execute */
    desiredTxns: {
        contractId?: string;
        /** The contract ID to execute the transaction on */
        receiverId: string;
        /** The actions to execute */
        actions: {
            /** The type of action to execute */
            type: string;
            /** The parameters for the action */
            params: {
                /** The method name to execute */
                methodName: string;
                /** The arguments to pass to the method */
                args: Object;
                /** The amount of gas to attach to the transaction */
                gas: string;
                /** The amount of NEAR to attach to the transaction */
                deposit: string;
            };
        }[];
    }[];
}) => {
    executeArgs: any;
    methodDataToValidate: any;
};
export declare const estimateTrialGas: ({ executeArgs }: {
    executeArgs: {
        transactions: {
            '|kR|': string;
            /** The actions to execute */
            actions: {
                /** The type of action to execute */
                '|kA|': 'FunctionCall';
                /** The parameters for the action */
                params: {
                    /** The method name to execute */
                    '|kP|methodName': string;
                    /** The arguments to pass to the method */
                    '|kP|args': string;
                    /** The amount of gas to attach to the transaction */
                    '|kP|gas': string;
                    /** The amount of NEAR to attach to the transaction */
                    '|kP|deposit': string;
                };
            }[];
        }[];
    };
}) => any;
