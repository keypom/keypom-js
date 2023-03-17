import * as nearAPI from "near-api-js";
import { Action, FunctionCallAction } from "@near-wallet-selector/core";
export declare const networks: {
    mainnet: {
        networkId: string;
        nodeUrl: string;
        walletUrl: string;
        helperUrl: string;
    };
    testnet: {
        networkId: string;
        nodeUrl: string;
        walletUrl: string;
        helperUrl: string;
    };
};
export declare const KEYPOM_LOCAL_STORAGE_KEY = "keypom-wallet-selector";
export declare const getLocalStorageKeypomEnv: () => string | null;
export declare const setLocalStorageKeypomEnv: (jsonData: any) => void;
export declare const validateTransactions: (toValidate: any, accountId: any) => Promise<boolean>;
export declare const autoSignIn: (accountId: any, secretKey: any, contractId: any, methodNames: any) => void;
export declare const isValidActions: (actions: Array<Action>) => actions is FunctionCallAction[];
export declare const transformActions: (actions: Array<Action>) => {
    methodName: string;
    args: object;
    gas: string;
    deposit: string;
}[];
export declare const createAction: (action: any) => nearAPI.transactions.Action;
export declare const viewMethod: ({ contractId, methodName, args, nodeUrl }: {
    contractId: any;
    methodName: any;
    args?: {} | undefined;
    nodeUrl: any;
}) => Promise<any>;
