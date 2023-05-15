import { InstantSignInSpecs, TrialSignInSpecs } from '../core/types';
export declare const KEYPOM_LOCAL_STORAGE_KEY = "keypom-wallet-selector";
export declare const getLocalStorageKeypomEnv: () => string | null;
export declare const setLocalStorageKeypomEnv: (jsonData: any) => void;
export declare const getAccountFromMap: (secretKey: any) => Promise<any>;
export declare const addUserToMappingContract: (accountId: any, secretKey: any) => Promise<boolean>;
export declare const updateKeypomContractIfValid: (keypomContractId: any) => boolean;
export declare const parseTrialUrl: (trialSpecs: TrialSignInSpecs) => {
    accountId: string;
    secretKey: string;
} | undefined;
export declare const parseInstantSignInUrl: (instantSignInSpecs: InstantSignInSpecs) => {
    accountId: string;
    secretKey: string;
    moduleId: string;
} | undefined;
