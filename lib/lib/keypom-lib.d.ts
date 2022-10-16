export function autoSignIn(): Promise<void>;
export function initConnection(network: any, logFn: any): void;
export function getAccount(): Promise<{
    accountId: any;
}>;
export function signIn(): Promise<nearAPI.Account>;
export function signOut(): void;
export function signAndSendTransactions(transactions: any): Promise<any>;
import * as nearAPI from "near-api-js";
