import { InternalOneClickSpecs } from "../core/types";
import { Action } from "@near-js/transactions";
export declare const KEYPOM_LOCAL_STORAGE_KEY = "keypom-one-click-connect-wallet";
export declare const getLocalStorageKeypomEnv: () => string | null;
export declare const setLocalStorageKeypomEnv: (jsonData: any) => void;
/**
 * Check if given access key allows the function call or method attempted in transaction
 * @param accessKey Array of \{access_key: AccessKey, public_key: PublicKey\} items
 * @param receiverId The NEAR account attempting to have access
 * @param actions The action(s) needed to be checked for access
 */
export declare const keyHasPermissionForTransaction: (accessKey: any, receiverId: string, actions: Action[]) => Promise<boolean>;
export declare const parseOneClickSignInFromUrl: (oneClickSpecs: InternalOneClickSpecs) => {
    accountId: string;
    secretKey: string;
    walletId: string;
} | null;
