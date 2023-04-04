export declare const TRIAL_ERRORS: {
    EXIT_EXPECTED: string;
    INVALID_ACTION: string;
};
export declare const validateDesiredMethods: ({ methodData, trialAccountId }: {
    methodData: any;
    trialAccountId: any;
}) => Promise<boolean>;
export declare const wrapTxnParamsForTrial: (params: any, newParams?: {}) => {};
export declare const generateExecuteArgs: ({ desiredTxns }: {
    desiredTxns: any;
}) => {
    executeArgs: any;
    methodDataToValidate: any;
};
export declare const estimateTrialGas: ({ executeArgs }: {
    executeArgs: any;
}) => any;
