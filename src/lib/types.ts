import { BrowserWalletBehaviour } from '@near-wallet-selector/core/lib/wallet/wallet.types'

/// Initialization

export interface Account {
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
	network: string;
	funder?: Funder;
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

export interface CreateDropParams {
	account: Account,
	wallet?: BrowserWalletBehaviour,
	accountRootKey?: string,
	dropId?: string,
	publicKeys?: string[],
	numKeys?: number | string,
	depositPerUseNEAR?: Number,
	depositPerUseYocto?: string,
	metadata?: string,
	config?: DropConfig,
	ftData: null,
	nftData: null,
	fcData: null,
}