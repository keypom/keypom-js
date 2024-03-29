import { Account } from '@near-js/accounts';
import { BrowserLocalStorageKeyStore } from '@near-js/keystores-browser';
import { FinalExecutionOutcome } from '@near-js/types';
import { Near } from '@near-js/wallet-account';
import { InstantLinkWalletBehaviour, Transaction } from '@near-wallet-selector/core';
import BN from 'bn.js';
import { KeypomTrialModal } from '../modal/src';
import { InstantSignInSpecs, InternalInstantSignInSpecs, InternalTrialSignInSpecs, TrialSignInSpecs } from './types';
export declare class KeypomWallet implements InstantLinkWalletBehaviour {
    accountId?: string;
    secretKey?: string;
    moduleId?: string;
    signInContractId: string;
    near: Near;
    keyStore: BrowserLocalStorageKeyStore;
    trialAccountSpecs?: InternalTrialSignInSpecs;
    instantSignInSpecs?: InternalInstantSignInSpecs;
    modal?: KeypomTrialModal;
    constructor({ signInContractId, networkId, trialAccountSpecs, instantSignInSpecs, }: {
        signInContractId: string;
        networkId: string;
        trialAccountSpecs?: TrialSignInSpecs;
        instantSignInSpecs?: InstantSignInSpecs;
    });
    getContractId(): string;
    getAccountId(): string;
    isSignedIn(): Promise<boolean>;
    signInTrialAccount(accountId: any, secretKey: any): Promise<Account[]>;
    signInInstantAccount(accountId: any, secretKey: any, moduleId: any): Promise<Account[]>;
    signIn(): Promise<Account[]>;
    signOut(): Promise<void>;
    signAndSendTransaction(params: any): Promise<FinalExecutionOutcome>;
    signAndSendTransactions(params: {
        transactions: Transaction[];
    }): Promise<FinalExecutionOutcome[]>;
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
    private setSpecsFromKeypomParams;
}
