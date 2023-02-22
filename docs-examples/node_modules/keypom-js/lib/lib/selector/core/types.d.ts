import { Action, InjectedWallet, SignInParams, Transaction, VerifiedOwner, VerifyOwnerParams, WalletBehaviourFactory } from "@near-wallet-selector/core";
import BN from "bn.js";
import { Account } from "near-api-js";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { KeypomWallet } from "./wallet";
export interface SignInOptions {
    contractId?: string;
    allowance?: string;
    methodNames?: string[];
}
export declare type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export interface SignAndSendTransactionsParams {
    transactions: Array<Optional<Transaction, "signerId">>;
}
interface SignAndSendTransactionParams {
    signerId?: string;
    receiverId?: string;
    actions: Array<Action>;
}
export interface KeypomWalletProtocol {
    networkId: string;
    signIn(params: SignInParams): Promise<Array<Account>>;
    signOut(): Promise<void>;
    getAccounts(): Promise<Array<Account>>;
    verifyOwner(params: VerifyOwnerParams): Promise<VerifiedOwner | void>;
    signAndSendTransaction(params: SignAndSendTransactionParams): Promise<FinalExecutionOutcome>;
    signAndSendTransactions(params: SignAndSendTransactionsParams): Promise<Array<FinalExecutionOutcome>>;
    switchAccount(id: string): Promise<void>;
    getAccountId(): string;
    isSignedIn: () => Promise<boolean>;
    getAvailableBalance: () => Promise<BN>;
}
export interface KeypomInitializeOptions {
    keypomWallet: KeypomWallet;
}
export type SelectorInit = WalletBehaviourFactory<KeypomWalletType, KeypomInitializeOptions>;
export type KeypomWalletType = InjectedWallet & Omit<Omit<KeypomWalletProtocol, "getAccounts">, "signIn">;
export {};
