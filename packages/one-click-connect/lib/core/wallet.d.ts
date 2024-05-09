import { Account } from "@near-js/accounts";
import { BrowserLocalStorageKeyStore } from "@near-js/keystores-browser";
import { FinalExecutionOutcome } from "@near-js/types";
import { Near } from "@near-js/wallet-account";
import { InstantLinkWalletBehaviour, Transaction } from "@near-wallet-selector/core";
import { InternalOneClickSpecs } from "./types";
export declare class KeypomWallet implements InstantLinkWalletBehaviour {
    accountId?: string;
    secretKey?: string;
    moduleId?: string;
    signInContractId: string;
    near: Near;
    keyStore: BrowserLocalStorageKeyStore;
    oneClickConnectSpecs?: InternalOneClickSpecs;
    constructor({ signInContractId, networkId, url, }: {
        signInContractId: string;
        networkId: string;
        url: string;
    });
    getContractId(): string;
    getAccountId(): string;
    isSignedIn(): Promise<boolean>;
    signInInstantAccount(accountId: string, secretKey: string, moduleId: string): Promise<Account[]>;
    checkValidOneClickParams: () => boolean;
    signIn(): Promise<Account[]>;
    signOut(): Promise<void>;
    signAndSendTransaction(params: any): Promise<FinalExecutionOutcome>;
    signAndSendTransactions(params: {
        transactions: Transaction[];
    }): Promise<import("@near-wallet-selector/core").FinalExecutionOutcome[]>;
    verifyOwner(): Promise<void>;
    getAvailableBalance(id?: string): Promise<bigint>;
    getAccounts(): Promise<Account[]>;
    switchAccount(id: string): Promise<void>;
    private internalSignIn;
    private assertSignedIn;
    private setSpecsFromKeypomParams;
}
