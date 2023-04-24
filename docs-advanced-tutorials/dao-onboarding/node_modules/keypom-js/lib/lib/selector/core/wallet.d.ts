import { FinalExecutionOutcome, InstantLinkWalletBehaviour } from "@near-wallet-selector/core";
import BN from "bn.js";
import { Account } from "near-api-js";
export declare class KeypomWallet implements InstantLinkWalletBehaviour {
    readonly networkId: string;
    readonly signInContractId: string;
    private readonly near;
    private readonly keyStore;
    private readonly desiredUrl;
    private readonly delimiter;
    private trialAccountId?;
    private secretKey?;
    private publicKey?;
    private modal;
    constructor({ signInContractId, networkId, desiredUrl, delimiter, modalOptions }: {
        signInContractId: any;
        networkId: any;
        desiredUrl: any;
        delimiter: any;
        modalOptions: any;
    });
    getContractId(): string;
    getAccountId(): string;
    showModal: (modalType?: {
        id: string;
    }) => void;
    checkValidTrialInfo: () => boolean;
    private transformTransactions;
    private internalSignIn;
    private canExitTrial;
    private validateTransactions;
    parseUrl: () => {
        accountId: string;
        secretKey: string;
    } | undefined;
    private assertSignedIn;
    isSignedIn(): Promise<boolean>;
    verifyOwner(): Promise<void>;
    signOut(): Promise<void>;
    getAvailableBalance(id?: string): Promise<BN>;
    getAccounts(): Promise<Account[]>;
    switchAccount(id: string): Promise<void>;
    signIn(): Promise<Account[]>;
    signAndSendTransaction(params: any): Promise<FinalExecutionOutcome>;
    signAndSendTransactions(params: any): Promise<FinalExecutionOutcome[]>;
}
