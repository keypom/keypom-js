import { Transaction } from '@near-wallet-selector/core';
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account, Connection, Near } from "near-api-js";
import { KeyStore } from 'near-api-js/lib/key_stores';
import { KeyPair } from 'near-api-js/lib/utils';
export declare type NearKeyPair = KeyPair;
export interface NearAccount {
    accountId: string;
    signAndSendTransaction: () => {};
}
export interface Network {
    networkId: string;
    nodeUrl: string;
    helperUrl: string;
    explorerUrl: string;
}
export interface Funder {
    accountId: string;
    secretKey: string;
    seedPhrase: string;
}
export interface InitKeypomParams {
    near: any;
    network: string;
    keypomContractId: string;
    funder?: Funder;
}
export interface ExecuteParams {
    transactions: Transaction[];
    account: Account;
    wallet?: Wallet;
    fundingAccount?: Account;
}
export interface FTTransferCallParams {
    account: Account;
    contractId: string;
    args: object;
    returnTransaction?: boolean;
}
export interface NFTTransferCallParams {
    account: Account;
    contractId: string;
    receiverId: string;
    tokenIds: string[];
    msg: string | null;
    returnTransactions?: boolean;
}
export interface EstimatorParams {
    near: Near;
    depositPerUse: string;
    numKeys: number;
    usesPerKey: number;
    attachedGas: number;
    storage?: string | null;
    keyStorage?: string | null;
    fcData?: FCData;
    ftData?: FTData;
}
export interface DropConfig {
    usesPerKey?: number;
    time?: TimeConfig;
    usage?: UsageConfig;
    dropRoot?: string;
}
export interface TimeConfig {
    start?: number;
    end?: number;
    throttle?: number;
    interval?: number;
}
export interface UsageConfig {
    permissions?: string;
    refundDeposit?: boolean;
    autoDeleteDrop?: boolean;
    autoWithdraw?: boolean;
}
export interface FTData {
    contractId?: string;
    senderId?: string;
    balancePerUse?: string;
}
export interface NFTData {
    contractId?: string;
    senderId?: string;
    tokenIds?: string[];
}
export interface Method {
    receiverId: string;
    methodName: string;
    args: string;
    attachedDeposit: string;
    accountIdField: string;
    dropIdField: string;
}
export interface FCData {
    methods: Method[][];
}
export interface SimpleData {
    lazyRegister?: boolean;
}
export interface CreateDropParams {
    account: Account;
    wallet?: BrowserWalletBehaviour;
    dropId?: string;
    publicKeys?: string[];
    depositPerUseNEAR?: Number;
    depositPerUseYocto?: string;
    metadata?: string;
    config?: DropConfig;
    ftData?: FTData;
    nftData?: NFTData;
    fcData?: FCData;
    simpleData?: SimpleData;
    hasBalance?: boolean;
}
export interface GetDropParams {
    accountId: string;
    start: string | number;
    limit: number;
    withKeys: boolean;
}
export interface EnvVars {
    near: Near;
    connection: Connection;
    keyStore: KeyStore;
    logger: any;
    networkId: string;
    fundingAccount: Account;
    contractAccount: Account;
    viewAccount: any;
    fundingKeyPair: KeyPair;
    gas: string;
    gas300: string;
    attachedGas: string;
    contractId: string;
    receiverId: string;
    getAccount: any;
    execute: any;
}
