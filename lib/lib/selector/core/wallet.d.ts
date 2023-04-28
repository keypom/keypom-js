import { FinalExecutionOutcome, InstantLinkWalletBehaviour } from "@near-wallet-selector/core";
import BN from "bn.js";
import { Account, Near } from "near-api-js";
import { BrowserLocalStorageKeyStore } from "near-api-js/lib/key_stores/browser_local_storage_key_store";
import { KeypomTrialModal } from "../modal/src";
export declare class KeypomWallet implements InstantLinkWalletBehaviour {
    networkId: string;
    signInContractId: string;
    near: Near;
    keyStore: BrowserLocalStorageKeyStore;
    trialBaseUrl: string;
    trialSplitDelim: string;
    trialAccountId?: string;
    trialSecretKey?: string;
    modal: KeypomTrialModal;
    isMappingTxn: boolean;
    constructor({ signInContractId, networkId, trialBaseUrl, trialSplitDelim, modalOptions }: {
        signInContractId: any;
        networkId: any;
        trialBaseUrl: any;
        trialSplitDelim: any;
        modalOptions: any;
    });
    getContractId(): string;
    getAccountId(): string;
    isSignedIn(): Promise<boolean>;
    signIn(): Promise<Account[]>;
    signOut(): Promise<void>;
    signAndSendTransaction(params: any): Promise<FinalExecutionOutcome>;
    signAndSendTransactions(params: any): Promise<FinalExecutionOutcome[]>;
    private parseUrl;
    showModal: (modalType?: {
        id: string;
    }) => void;
    checkValidTrialInfo: () => boolean;
    verifyOwner(): Promise<void>;
    getAvailableBalance(id?: string): Promise<BN>;
    getAccounts(): Promise<Account[]>;
    switchAccount(id: string): Promise<void>;
    private internalSignIn;
    private assertSignedIn;
}
