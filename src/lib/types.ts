import { Transaction } from '@near-wallet-selector/core';
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types'
import { Account, Connection, Near } from "near-api-js";
import { KeyStore } from 'near-api-js/lib/key_stores';
import { KeyPair } from 'near-api-js/lib/utils';

/// Initialization

export type NearKeyPair = KeyPair

export interface GeneratedKeyPairs {
	keyPairs: NearKeyPair[];
	publicKeys: string[];
	secretKeys: string[];
}

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
	seedPhrase?: string;
	rootEntropy?: string;
	fundingKeyPair?: NearKeyPair;
}

export interface InitKeypomParams {
	near: Near;
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

export interface GenerateKeysParams {
	numKeys: number;
	rootEntropy?: string;
	metaEntropy?: string[] | string;
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

export interface DropConfig {
	/// How many uses can each key have before it's deleted. If None, default to 1.
	usesPerKey?: number,

	// Any time based configurations
	time?: TimeConfig,
	
	// Any usage specific configurations
	usage?: UsageConfig,

	/// Override the global root account that sub-accounts will have (near or testnet). This allows
	/// users to create specific drops that can create sub-accounts of a predefined root.
	/// For example, Fayyr could specify a root of `fayyr.near` By which all sub-accounts will then
	/// be `ACCOUNT.fayyr.near`
	dropRoot?: string,
}

export interface TimeConfig {
    /// Minimum block timestamp before keys can be used. If None, keys can be used immediately
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    start?: number

    /// Block timestamp that keys must be before. If None, keys can be used indefinitely
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    end?: number

    /// Time interval between each key use. If None, there is no delay between key uses.
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    throttle?: number

    /// Interval of time after the `start_timestamp` that must pass before a key can be used.
    /// If multiple intervals pass, the key can be used multiple times. This has nothing to do
    /// With the throttle timestamp. It only pertains to the start timestamp and the current
    /// timestamp. The last_used timestamp is not taken into account.
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    interval?: number
}

export interface UsageConfig {
    /// Can the access key only call the claim method_name? Default to both method_name callable
    permissions?: string
    /// If claim is called, refund the deposit to the owner's balance. If None, default to false.
    refundDeposit?: boolean
    /// Should the drop be automatically deleted when all the keys are used? This is defaulted to false and
    /// Must be overwritten
    autoDeleteDrop?: boolean
    /// When this drop is deleted and it is the owner's *last* drop, automatically withdraw their balance.
    autoWithdraw?: boolean
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

export interface SimpleData {
	// If this is set to true, keys can be created and registered AFTER they've been created (for simple and FC drops only).
    lazyRegister?: boolean,
}

export interface CreateDropParams {
	account?: Account,
	wallet?: BrowserWalletBehaviour,
	dropId?: string,
	numKeys: number,
	publicKeys?: string[],
	rootEntropy?: string,
	depositPerUseNEAR?: Number,
	depositPerUseYocto?: string,
	metadata?: string,
	config?: DropConfig,
	ftData?: FTData,
	nftData?: NFTData,
	fcData?: FCData,
	simpleData?: SimpleData
	useBalance?: boolean,
}

export interface DeleteDropParams {
	account?: Account,
	wallet?: BrowserWalletBehaviour,
	drops?: any,
	dropIds?: string[],
	withdrawBalance?: boolean
}

export interface AddKeyParams {
	account?: Account,
	wallet?: BrowserWalletBehaviour,
	dropId?: string,
	drop?: any,
	numKeys: number,
	publicKeys?: string[],
	nftTokenIds?: string[],
	rootEntropy?: string,
	useBalance?: boolean,
}

export interface GetDropParams {
	accountId: string,
	start: string | number,
	limit: number,
	withKeys: boolean,
}

export interface EnvVars {
	near?: Near,
	connection?: Connection,
	keyStore?: KeyStore,
	logger?:  any,
	networkId?: string,
	fundingAccount?: Account,
	fundingAccountDetails?: Funder,
	contractAccount?: Account,
	viewAccount?: any,
	gas: string,
	gas300: string,
	attachedGas: string,
	contractId: string,
	receiverId: string,
	getAccount: any
	execute: any
}