import { InstantLinkWalletBehaviour, NetworkId, Transaction } from "@near-wallet-selector/core";
import { KeypomWalletAccount } from "../utils/selector-utils";
export declare class KeypomWallet implements InstantLinkWalletBehaviour {
    networkId: NetworkId;
    accountId: string;
    walletId: string;
    baseUrl: string;
    nearConnection: any;
    contractId?: string;
    secretKey?: string;
    signedIn: boolean;
    constructor({ networkId, nearConnection, accountId, secretKey, walletId, baseUrl, }: {
        networkId: NetworkId;
        nearConnection: any;
        accountId: string;
        walletId: string;
        baseUrl: string;
        secretKey?: string;
    });
    getAccountId(): string;
    isSignedIn(): Promise<boolean>;
    getContractId(): string;
    setContractId(): Promise<string>;
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
