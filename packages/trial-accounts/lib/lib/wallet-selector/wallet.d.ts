import { FinalExecutionOutcome, InstantLinkWalletBehaviour, Transaction, VerifiedOwner, VerifyOwnerParams } from "@near-wallet-selector/core";
import { TrialAccountManager } from "../TrialAccountManager";
import { KeyPairString } from "near-api-js/lib/utils";
export declare class KeypomTrialSelector implements InstantLinkWalletBehaviour {
    networkId: string;
    trialAccountSecretKey: KeyPairString;
    trialAccountId: string;
    trialManager: TrialAccountManager;
    constructor({ networkId, trialAccountSecretKey, trialAccountId, }: {
        networkId: string;
        trialAccountSecretKey: KeyPairString;
        trialAccountId: string;
    });
    verifyOwner(params: VerifyOwnerParams): Promise<void | VerifiedOwner>;
    getContractId(): string;
    getAccountId(): string;
    isSignedIn(): boolean;
    signAndSendTransaction(params: any): Promise<any>;
    signAndSendTransactions(params: {
        transactions: Transaction[];
    }): Promise<FinalExecutionOutcome[]>;
    signIn(): Promise<{
        accountId: string;
    }[]>;
    signOut(): Promise<void>;
    getAvailableBalance(): Promise<bigint>;
    getAccounts(): Promise<{
        accountId: string;
    }[]>;
    switchAccount(id: string): Promise<void>;
}
