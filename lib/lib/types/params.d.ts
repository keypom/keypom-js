import { Transaction } from '@near-wallet-selector/core';
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account, Near } from "near-api-js";
import { Maybe } from '../keypom';
import { DropConfig, PasswordPerUse } from './drops';
import { FCData } from './fc';
import { FTData } from './ft';
import { Funder, GeneratedKeyPairs } from './general';
import { NFTData } from './nft';
import { SimpleData } from './simple';
export interface CreateDropParams {
    account?: Account;
    wallet?: BrowserWalletBehaviour;
    numKeys: number;
    publicKeys?: string[];
    depositPerUseNEAR?: Number;
    depositPerUseYocto?: string;
    dropId?: string;
    config?: DropConfig;
    metadata?: string;
    simpleData?: SimpleData;
    ftData?: FTData;
    nftData?: NFTData;
    fcData?: FCData;
    rootEntropy?: string;
    basePassword?: string;
    passwordProtectedUses?: number[];
    useBalance?: boolean;
}
export interface AddKeyParams {
    account?: Account;
    wallet?: BrowserWalletBehaviour;
    numKeys: number;
    publicKeys?: string[];
    dropId?: string;
    drop?: any;
    nftTokenIds?: string[];
    rootEntropy?: string;
    basePassword?: string;
    passwordProtectedUses?: number[];
    useBalance?: boolean;
}
export interface RegisterUsesParams {
    account?: Account;
    wallet?: BrowserWalletBehaviour;
    dropId: string;
    numUses: number;
    useBalance?: boolean;
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
    account?: Account;
    wallet?: BrowserWalletBehaviour;
    contractId: string;
    absoluteAmount?: string;
    amount?: string;
    dropId: string;
    returnTransaction?: boolean;
}
export interface NFTTransferCallParams {
    account?: Account;
    wallet?: BrowserWalletBehaviour;
    contractId: string;
    tokenIds: string[];
    dropId: string;
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
export interface CreateOrAddReturn {
    responses: any;
    keys?: Maybe<GeneratedKeyPairs>;
    dropId: string;
}
export interface CreateDropProtocolArgs {
    public_keys?: string[];
    deposit_per_use: string;
    drop_id?: string;
    config?: {
        uses_per_key?: number;
        time?: {
            start?: number;
            end?: number;
            throttle?: number;
            interval?: number;
        };
        usage?: {
            permission?: string;
            refund_deposit?: boolean;
            auto_delete_drop?: boolean;
            auto_withdraw?: boolean;
        };
        root_account_id?: string;
    };
    metadata?: string;
    simple?: {
        lazy_register?: boolean;
    };
    ft?: {
        contract_id?: string;
        sender_id?: string;
        balance_per_use?: string;
    };
    nft?: {
        sender_id?: string;
        contract_id?: string;
    };
    fc?: {
        methods: Array<Maybe<Array<{
            receiver_id: string;
            method_name: string;
            args: string;
            attached_deposit: string;
            account_id_field?: string;
            drop_id_field?: string;
            key_id_field?: string;
        }>>>;
        config?: {
            attached_gas?: string;
        };
    };
    passwords_per_use?: Array<Maybe<Array<PasswordPerUse>>>;
}
export interface GetDropParams {
    accountId: string;
    start: string | number;
    limit: number;
    withKeys: boolean;
}
