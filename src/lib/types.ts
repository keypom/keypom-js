import { BrowserWalletBehaviour, BrowserWalletSignAndSendTransactionsParams, SignAndSendTransactionParams, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types'
import { Account, Connection, Near } from "near-api-js";
import { KeyStore } from 'near-api-js/lib/key_stores';
import { KeyPair, KeyPairEd25519 } from 'near-api-js/lib/utils';

/// Initialization

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
	funder?: Funder;
}

export interface ExecuteParams {
	transactions: SignAndSendTransactionParams[] | BrowserWalletSignAndSendTransactionsParams,
	account: Account,
	wallet?: Wallet,
    fundingAccount?: Account,
}

export interface FTTransferCallParams {
    account: Account,
    contractId: string,
    args: object,
    returnTransaction: boolean,
}

export interface NFTTransferCallParams {
    account: Account,
    contractId: string,
    receiverId: string,
    tokenIds: string[],
    msg: string | null,
}

export interface EstimatorParams {
    near: Near,
    depositPerUse: string,
    numKeys: number,
    usesPerKey: number,
    attachedGas: number,
    storage?: string,
    keyStorage?: string,
    fcData?: FCData,
    ftData?: FTData,
}

/// Drops

export interface DropConfig {
	// How many claims can each key have.
	usesPerKey?: number,

	// Should the drop be automatically deleted when all the keys are used? This is defaulted to false and
	// Must be overwritten
	deleteOnEmpty?: true,

	// When this drop is deleted and it is the owner's *last* drop, automatically withdraw their balance.
	autoWithdraw?: true,

	// Minimum block timestamp that keys can be used. If None, keys can be used immediately
	// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
	startTimestamp?: string,

	// How often can a key be used
	// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
	throttleTimestamp?: string,

	// If claim is called, refund the deposit to the owner's balance. If None, default to false.
	onClaimRefundDeposit?: boolean,

	// Can the access key only call the claim method_name? Default to both method_name callable
	claimPermission?: boolean,

	// Root account that all sub-accounts will default to. If None, default to the global drop root.
	dropRoot?: string,
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