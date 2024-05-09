import { InternalInstantSignInSpecs, InternalTrialSignInSpecs } from "../core/types";
import { Action } from "@near-js/transactions";
export declare const KEYPOM_LOCAL_STORAGE_KEY = "keypom-wallet-selector";
export declare const getLocalStorageKeypomEnv: () => string | null;
export declare const setLocalStorageKeypomEnv: (jsonData: any) => void;
export declare const getAccountFromMap: (secretKey: any) => Promise<any>;
/**
 * Check if given access key allows the function call or method attempted in transaction
 * @param accessKey Array of \{access_key: AccessKey, public_key: PublicKey\} items
 * @param receiverId The NEAR account attempting to have access
 * @param actions The action(s) needed to be checked for access
 */
export declare const keyHasPermissionForTransaction: (accessKey: any, receiverId: string, actions: Action[]) => Promise<boolean>;
export declare const getCidFromUrl: () => string | null;
export declare const parseIPFSDataFromURL: () => Promise<any>;
export declare const addUserToMappingContract: (accountId: any, secretKey: any) => Promise<boolean>;
export declare const updateKeypomContractIfValid: (keypomContractId: any) => boolean;
export declare const parseTrialUrl: (trialSpecs: InternalTrialSignInSpecs) => {
    accountId: string;
    secretKey: string;
} | undefined;
export declare const parseInstantSignInUrl: (instantSignInSpecs: InternalInstantSignInSpecs) => {
    accountId: string;
    secretKey: string;
    moduleId: string;
} | undefined;
