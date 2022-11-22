import { Transaction } from '@near-wallet-selector/core';
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account, Connection, Near } from "near-api-js";
import { KeyStore } from 'near-api-js/lib/key_stores';
import { KeyPair } from 'near-api-js/lib/utils';
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
    storage?: string;
    keyStorage?: string;
    fcData?: FCData;
    ftData?: FTData;
}
export interface DropConfig {
    usesPerKey?: number;
    deleteOnEmpty?: true;
    autoWithdraw?: true;
    startTimestamp?: string;
    throttleTimestamp?: string;
    onClaimRefundDeposit?: boolean;
    claimPermission?: boolean;
    dropRoot?: string;
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
export interface CreateDropParams {
    account: Account;
    wallet?: BrowserWalletBehaviour;
    accountRootKey?: string;
    dropId?: string;
    publicKeys?: string[];
    numKeys?: number;
    depositPerUseNEAR?: Number;
    depositPerUseYocto?: string;
    metadata?: string;
    config?: DropConfig;
    ftData?: FTData;
    nftData?: NFTData;
    fcData?: FCData;
    hasBalance?: boolean;
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
    fundingKey: KeyPair;
    gas: string;
    gas300: string;
    attachedGas: string;
    contractId: string;
    receiverId: string;
    getAccount: any;
    execute: any;
}
