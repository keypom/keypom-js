import { Transaction } from '@near-wallet-selector/core';
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account, Near } from "near-api-js";
import { Maybe } from '../keypom';
import { DropConfig } from './drops';
import { FCData } from './fc';
import { FTData } from './ft';
import { Funder } from './general';
import { NFTData } from './nft';
import { SimpleData } from './simple';
export interface CreateDropParams {
    account?: Account;
    wallet?: BrowserWalletBehaviour;
    dropId?: string;
    numKeys: number;
    publicKeys?: string[];
    rootEntropy?: string;
    depositPerUseNEAR?: Number;
    depositPerUseYocto?: string;
    metadata?: string;
    config?: DropConfig;
    ftData?: FTData;
    nftData?: NFTData;
    fcData?: FCData;
    simpleData?: SimpleData;
    useBalance?: boolean;
}
export interface InitKeypomParams {
    near: Near;
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
export interface GenerateKeysParams {
    numKeys: number;
    rootEntropy?: string;
    metaEntropy?: string[] | string;
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
export interface CreateOrAddParams {
    responses: any;
    keys?: Maybe<GenerateKeysParams>;
    dropId: string;
}
export interface DeleteDropParams {
    account?: Account;
    wallet?: BrowserWalletBehaviour;
    drops?: any;
    dropIds?: string[];
    withdrawBalance?: boolean;
}
export interface DeleteKeyParams {
    account?: Account;
    wallet?: BrowserWalletBehaviour;
    publicKeys: string[] | string;
    dropId: string;
    withdrawBalance?: boolean;
}
export interface AddKeyParams {
    account?: Account;
    wallet?: BrowserWalletBehaviour;
    dropId?: string;
    drop?: any;
    numKeys: number;
    publicKeys?: string[];
    nftTokenIds?: string[];
    rootEntropy?: string;
    useBalance?: boolean;
}
export interface GetDropParams {
    accountId: string;
    start: string | number;
    limit: number;
    withKeys: boolean;
}