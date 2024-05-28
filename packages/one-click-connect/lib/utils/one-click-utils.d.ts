import { Account } from "@near-js/accounts";
import { Action, Transaction } from "@near-js/transactions";
import { Transaction as wsTransaction } from "@near-wallet-selector/core";
import { Action as wsAction } from "@near-wallet-selector/core";
export declare const ATTACHED_GAS_FROM_WALLET = 100000000000000;
export declare const key2str: (v: any) => any;
export declare const baseDecode: (value: string) => Uint8Array;
export declare const transformTransactions: (transactions: wsTransaction[], account: Account) => Promise<Transaction[]>;
export declare const createAction: (action: wsAction) => Action;
