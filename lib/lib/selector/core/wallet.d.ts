import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import BN from "bn.js";
import { Account } from "near-api-js";
import { BrowserLocalStorageKeyStore } from "near-api-js/lib/key_stores/browser_local_storage_key_store";
import { KeypomWalletProtocol } from "./types";
export declare class KeypomWallet implements KeypomWalletProtocol {
    readonly networkId: string;
    private readonly near;
    private readonly connection;
    private readonly desiredUrl;
    private accountId?;
    private secretKey?;
    private publicKey?;
    private keyPair?;
    constructor({ networkId, desiredUrl, keyStore, }: {
        networkId?: string | undefined;
        desiredUrl?: string | undefined;
        keyStore?: BrowserLocalStorageKeyStore | undefined;
    });
    transformTransactions: (txns: any) => Promise<any[]>;
    parseUrl: () => {
        trialAccountId: string;
        trialSecretKey: string;
    } | undefined;
    tryInitFromLocalStorage(data: any): boolean;
    assertSignedIn(): void;
    isSignedIn(): Promise<boolean>;
    verifyOwner(): Promise<void>;
    signOut(): Promise<void>;
    getAvailableBalance(id?: string): Promise<BN>;
    getAccounts(): Promise<Account[]>;
    getAccountId(): string;
    switchAccount(id: string): Promise<void>;
    signIn(): Promise<Account[]>;
    signAndSendTransaction(params: any): Promise<FinalExecutionOutcome>;
    signAndSendTransactions(params: any): Promise<FinalExecutionOutcome[]>;
}