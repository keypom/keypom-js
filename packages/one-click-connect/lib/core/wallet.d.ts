import * as nearAPI from "near-api-js";
import { InstantLinkWalletBehaviour, NetworkId, Transaction } from "@near-wallet-selector/core";
import { KeypomWalletAccount } from "../utils/selector-utils";
export declare class KeypomWallet implements InstantLinkWalletBehaviour {
    networkId: NetworkId;
    accountId: string;
    walletId: string;
    baseUrl: string;
    nearConnection: nearAPI.Near;
    keyStore: nearAPI.keyStores.BrowserLocalStorageKeyStore;
    contractId: string;
    secretKey?: string;
    signedIn: boolean;
    walletUrl?: string;
    sendLak: boolean;
    methodNames: string[];
    allowance: string;
    constructor({ networkId, nearConnection, keyStore, accountId, secretKey, walletId, baseUrl, contractId, walletUrl, sendLak, methodNames, allowance }: {
        networkId: NetworkId;
        nearConnection: any;
        keyStore: nearAPI.keyStores.BrowserLocalStorageKeyStore;
        accountId: string;
        secretKey?: string;
        walletId: string;
        baseUrl: string;
        contractId: string;
        walletUrl?: string;
        sendLak?: boolean;
        methodNames?: string[];
        allowance?: string;
    });
    getAccountId(): string;
    isSignedIn(): Promise<boolean>;
    getContractId(): string;
    getNearConnection(): nearAPI.Near;
    setContractId(contractId?: string): Promise<string>;
    signIn(): Promise<KeypomWalletAccount[]>;
    signOut(): Promise<void>;
    signAndSendTransaction(params: any): Promise<any>;
    signAndSendTransactions(params: {
        transactions: Transaction[];
    }): Promise<any>;
    verifyOwner(): Promise<void>;
    getAvailableBalance(id?: string): Promise<bigint>;
    getAccounts(): Promise<KeypomWalletAccount[]>;
    switchAccount(id: string): Promise<void>;
    private internalSignIn;
}
