import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { SignAndSendTransactionParams, Transaction } from "@near-wallet-selector/core/lib/wallet";
import { SignAndSendTransactionOptions } from "near-api-js/lib/account";
import { NearKeyPair, EstimatorParams, ExecuteParams, FTTransferCallParams, NFTTransferCallParams } from "./types";
export declare const ATTACHED_GAS_FROM_WALLET: number;
export declare const snakeToCamel: (s: any) => any;
export declare const key2str: (v: any) => any;
export declare const genKey: (rootKey: string, meta: string, nonce: number) => Promise<NearKeyPair>;
export declare const hasDeposit: ({ accountId, transactions, }: {
    accountId: any;
    transactions: any;
}) => void;
export declare const execute: ({ transactions, account, wallet, fundingAccount, }: ExecuteParams) => Promise<void | FinalExecutionOutcome[] | Array<void | FinalExecutionOutcome>>;
export declare const ftTransferCall: ({ account, contractId, args, returnTransaction, }: FTTransferCallParams) => Promise<void | FinalExecutionOutcome[]> | Transaction;
export declare const nftTransferCall: ({ account, contractId, receiverId, tokenIds, msg, returnTransactions, }: NFTTransferCallParams) => Promise<Array<void | FinalExecutionOutcome[]> | Transaction[]>;
export declare const parseFTAmount: (amt: string, decimals: number) => string;
export declare const transformTransactions: (transactions: SignAndSendTransactionParams[]) => SignAndSendTransactionOptions[];
export declare const getStorageBase: ({ nftData, fcData }: {
    nftData: any;
    fcData: any;
}) => string | null;
export declare const estimateRequiredDeposit: ({ near, depositPerUse, numKeys, usesPerKey, attachedGas, storage, keyStorage, fcData, ftData, }: EstimatorParams) => Promise<string>;
