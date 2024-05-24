import * as nearAPI from "near-api-js";
import { Action, Network, NetworkId } from "@near-wallet-selector/core";
import { OneClickParams } from "../core/types";
export declare const ONE_CLICK_URL_REGEX: RegExp;
export declare const KEYPOM_LOCAL_STORAGE_KEY = "keypom-one-click-connect-wallet";
export declare const NO_CONTRACT_ID = "no-contract";
export interface KeypomWalletAccount {
    accountId: string;
    walletId: string;
    publicKey?: string;
}
export declare const getLocalStorageKeypomEnv: () => string | null;
export declare const setLocalStorageKeypomEnv: (jsonData: any) => void;
export declare const getLocalStoragePendingKey: (near: nearAPI.Near) => Promise<any>;
export declare const setLocalStoragePendingKey: (jsonData: any) => void;
export declare const areParamsCorrect: (params: OneClickParams) => boolean;
export declare const tryGetAccountData: ({ urlPattern, networkId, nearConnection, }: {
    urlPattern: string;
    networkId: string;
    nearConnection: nearAPI.Near;
}) => {
    accountId: string;
    secretKey?: string | undefined;
    walletId: string;
    baseUrl: string;
} | null;
/**
 * Check if given access key allows the function call or method attempted in transaction
 * @param accessKey Array of \{access_key: AccessKey, public_key: PublicKey\} items
 * @param receiverId The NEAR account attempting to have access
 * @param actions The action(s) needed to be checked for access
 */
export declare const keyHasPermissionForTransaction: (accessKey: any, receiverId: string, actions: Action[]) => Promise<boolean>;
export declare const parseOneClickSignInFromUrl: ({ baseUrl, delimiter, }: {
    baseUrl: string;
    delimiter: string;
}) => {
    accountId: string;
    secretKey?: string | undefined;
    walletId: string;
    baseUrl: string;
} | null;
export declare const getNetworkPreset: (networkId: NetworkId) => Network;
export declare const getPubFromSecret: (secretKey: string) => string;
