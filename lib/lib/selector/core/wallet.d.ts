import { FinalExecutionOutcome, InstantLinkWalletBehaviour } from "@near-wallet-selector/core";
import BN from "bn.js";
import { Account } from "near-api-js";
export declare class KeypomWallet implements InstantLinkWalletBehaviour {
    readonly networkId: string;
    readonly contractId: string;
    private readonly near;
    private readonly keyStore;
    private readonly desiredUrl;
    private readonly delimiter;
    private accountId?;
    private secretKey?;
    private publicKey?;
    private readonly modalOptions?;
    private modal?;
    constructor({ contractId, networkId, desiredUrl, delimiter, modalOptions }: {
        contractId: any;
        networkId: any;
        desiredUrl: any;
        delimiter: any;
        modalOptions: any;
    });
    getContractId(): string;
    getAccountId(): string;
    showModal: () => void;
    checkValidTrialInfo: () => boolean;
    private transformTransactions;
    parseUrl: () => {
        trialAccountId: string;
        trialSecretKey: string;
    } | undefined;
    private tryInitFromLocalStorage;
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
