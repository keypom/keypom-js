import { Transaction } from '@near-wallet-selector/core';
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types'
import { Account, Connection, Near } from "near-api-js";
import { KeyStore } from 'near-api-js/lib/key_stores';
import { KeyPair } from 'near-api-js/lib/utils';

/// Initialization

export type NearKeyPair = KeyPair

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
	transactions: Transaction[],
	account: Account,
	wallet?: Wallet,
    fundingAccount?: Account,
}

export interface FTTransferCallParams {
    account: Account,
    contractId: string,
    args: object,
    returnTransaction?: boolean,
}

export interface NFTTransferCallParams {
	account: Account,
    contractId: string,
    receiverId: string,
    tokenIds: string[],
    msg: string | null,
	returnTransactions?: boolean,
}

export interface EstimatorParams {
    near: Near,
    depositPerUse: string,
    numKeys: number,
    usesPerKey: number,
    attachedGas: number,
    storage?: string | null,
    keyStorage?: string | null,
    fcData?: FCData,
    ftData?: FTData,
}

/// Drops

/// TODO Update
export interface TimeConfig {
	/// Minimum block timestamp before keys can be used. If None, keys can be used immediately
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    start: string,

    /// Block timestamp that keys must be before. If None, keys can be used indefinitely
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    end: string,

    /// Time interval between each key use. If None, there is no delay between key uses.
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    throttle: string,

    /// Interval of time after the `start_timestamp` that must pass before a key can be used.
    /// If multiple intervals pass, the key can be used multiple times. This has nothing to do
    /// With the throttle timestamp. It only pertains to the start timestamp and the current
    /// timestamp. The last_used timestamp is not taken into account.
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    interval: string,
}

export interface UsageConfig {
	// Should the drop be automatically deleted when all the keys are used? This is defaulted to false and
	// Must be overwritten
	autoDeleteDrop?: boolean,

	// When this drop is deleted and it is the owner's *last* drop, automatically withdraw their balance.
	autoWithdraw?: boolean,

	/// Can the access key only call the claim method_name? Default to both method_name callable
	permissions: string,
	
    /// If claim is called, refund the deposit to the owner's balance. If None, default to false.
    refundDeposit: boolean,
}

export interface DropConfig {
	// How many claims can each key have.
	usesPerKey?: number,

	// Root account that all sub-accounts will default to. If None, default to the global drop root.
	rootAccountId?: string,

	time?: TimeConfig,

	usage?: UsageConfig,
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
	methods: Method[][]
}

export interface CreateDropParams {
	account: Account,
	wallet?: BrowserWalletBehaviour,
	accountRootKey?: string,
	dropId?: string,
	publicKeys?: string[],
	numKeys?: number,
	depositPerUseNEAR?: Number,
	depositPerUseYocto?: string,
	metadata?: string,
	config?: DropConfig,
	ftData?: FTData,
	nftData?: NFTData,
	fcData?: FCData,
	hasBalance?: boolean,
}

export interface EnvVars {
	near: Near,
	connection: Connection,
	keyStore: KeyStore,
	logger:  any,
	networkId: string,
	fundingAccount: Account,
	contractAccount: Account,
	viewAccount: any,
	fundingKey: KeyPair,
	gas: string,
	gas300: string,
	attachedGas: string,
	contractId: string,
	receiverId: string,
	getAccount: any
	execute: any
}