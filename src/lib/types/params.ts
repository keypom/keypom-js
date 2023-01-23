import { Transaction } from '@near-wallet-selector/core';
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account, Near } from "near-api-js";
import { Maybe } from '../keypom';
import { DropConfig, PasswordPerUse } from './drops';
import { FCData } from './fc';
import { FTData } from './ft';
import { Funder, GeneratedKeyPairs } from './general';
import { NFTData } from './nft';
import { ProtocolReturnedDrop } from './protocol';
import { SimpleData } from './simple';

type AnyWallet = BrowserWalletBehaviour | Wallet;


/**
 * Parameters that should be passed in when creating a drop.
*/
export interface CreateDropParams {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/**
	 * Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed in, the keys will be
     * deterministically generated using the drop ID, key nonce, and entropy. Otherwise, each key will be generated randomly. 
	*/
	numKeys: number,
	/** Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter. */
	publicKeys?: string[],
	/** How much $NEAR should be contained in each link. Unit in $NEAR (i.e `1` = 1 $NEAR) */
	depositPerUseNEAR?: Number,
	/** How much $yoctoNEAR should be contained in each link. Unit in yoctoNEAR (1 yoctoNEAR = 1e-24 $NEAR) */
	depositPerUseYocto?: string,
	/** Specify a custom drop ID rather than using the incrementing nonce on the contract. */
	dropId?: string,
	/** Allows specific drop behaviors to be configured such as the number of uses each key / link will have. */
	config?: DropConfig,
	/** String of metadata to attach to the drop. This can be whatever you would like and is optional. Often this is stringified JSON. */
	metadata?: string,
	/** For creating a simple drop, this contains necessary configurable information about the drop. */
	simpleData?: SimpleData
	/** For creating a fungible token drop, this contains necessary configurable information about the drop. */
	ftData?: FTData,
	/** For creating a non-fungible token drop, this contains necessary configurable information about the drop. */
	nftData?: NFTData,
	/** For creating a function call drop, this contains necessary configurable information about the drop. */
	fcData?: FCData,
	/** Specify an entropy to use for generating keys (will overload the funder's rootEntropy if applicable). This parameter only matters if the publicKeys variable is not passed in. */
	rootEntropy?: string,
	/** For doing password protected drops, this is the base password that will be used to generate all the passwords. It will be double hashed with the public keys. If specified, by default, all key uses will have their own unique password unless passwordProtectedUses is passed in. */
    basePassword?: string,
	/** For doing password protected drops, specifies exactly which uses will be password protected. The uses are NOT zero indexed (i.e 1st use = 1). Each use will have a different, unique password generated via double hashing the base password + public key + key use. */
    passwordProtectedUses?: number[],
	/** If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw. */
	useBalance?: boolean,
	/** If true, the transaction will be returned instead of being signed and sent. This is useful for getting the requiredDeposit from the return value without actually signing the transaction. */
	returnTransactions?: boolean,
}

/**
 * Parameters that should be passed in when adding keys to a drop.
*/
export interface AddKeyParams {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/**
	 * Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed in, the keys will be
     * deterministically generated using the drop ID, key nonce, and entropy. Otherwise, each key will be generated randomly. 
	*/
	numKeys: number,
	/** Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter. */
	publicKeys?: string[],
	/**  Specify the drop ID for which you want to add keys to. */
	dropId?: string,
	/** If the drop information from getDropInformation is already known to the client, it can be passed in instead of the drop ID to reduce computation. */
	drop?: ProtocolReturnedDrop,
	/** 
	 * If the drop type is an NFT drop, the token IDs can be passed in so that the tokens are automatically sent to the Keypom contract rather
     * than having to do two separate transactions. A maximum of 2 token IDs can be sent during the `addKeys` function. To send more token IDs in
	 * order to register key uses, use the `nftTransferCall` function.
	 */
	nftTokenIds?: string[],
	/** Specify an entropy to use for generating keys (will overload the funder's rootEntropy if applicable). This parameter only matters if the publicKeys variable is not passed in. */
	rootEntropy?: string,
	/** For doing password protected drops, this is the base password that will be used to generate all the passwords. It will be double hashed with the public keys. If specified, by default, all key uses will have their own unique password unless passwordProtectedUses is passed in. */
    basePassword?: string,
	/** For doing password protected drops, specifies exactly which uses will be password protected. The uses are NOT zero indexed (i.e 1st use = 1). Each use will have a different, unique password generated via double hashing the base password + public key + key use. */
    passwordProtectedUses?: number[],
	/** If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw. */
	useBalance?: boolean,
	/** If true, the transaction will be returned instead of being signed and sent. This is useful for getting the requiredDeposit from the return value without actually signing the transaction. */
	returnTransactions?: boolean,
}

/**
 * Parameters that should be passed in when calling `deleteDrop`.
 */
export interface DeleteDropParams {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/** If the set of drop information for the drops you want to delete (from `getDropInformation` or `getDrops`) is already known to the client, it can be passed in instead of the drop IDs to reduce computation. */
	drops?: ProtocolReturnedDrop[],
	/** Specify a set of drop IDs to delete. */
	dropIds?: string[],
	/** Whether or not to withdraw any remaining balance on the Keypom contract. */
	withdrawBalance?: boolean
}

/**
 * Parameters that should be passed in when calling `deleteKeys`.
 */
export interface DeleteKeyParams {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/** Specify a set of public keys to delete. If deleting a single publicKey, the string can be passed in without wrapping it in an array. */
	publicKeys: string[] | string,
	/** Which drop ID do the keys belong to? */
	dropId: string,
	/**Whether or not to withdraw any remaining balance on the Keypom contract. */
	withdrawBalance?: boolean
}

/**
 * Parameters that should be passed in when initializing the Keypom SDK through `initKeypom`
 */
export interface InitKeypomParams {
	/** The NEAR connection instance to use. If not passed in, it will create a new one. */
	near?: Near;
	/** The network to connect to either `mainnet` or `testnet`. */
	network: string;
	/**
	 * The account that will sign transactions to create drops and interact with the Keypom contract. This account will be added to the KeyStore if provided.
     * If rootEntropy is provided for the funder, all access keys will be derived deterministically based off this string.
	 */
	funder?: Funder;
	/**
	 * Instead of using the most up-to-date, default Keypom contract, you can specify a specific account ID to use. If an older version is specified, some features of the SDK might not be usable.
	 */
	keypomContractId?: string;
}



/**
 * Parameters that should be passed in when generating keys using `generateKeys`.
 */
export interface GenerateKeysParams {
	/** The number of keys to generate. */
	numKeys: number;
	/** A root string that will be used as a baseline for all keys in conjunction with different metaEntropies (if provided) to deterministically generate a keypair. If not provided, the keypair will be completely random. */
	rootEntropy?: string;
	/** An array of entropies to use in conjunction with a base rootEntropy to deterministically generate the private keys. For single key generation, you can either pass in a string array with a single element, or simply 
 pass in the string itself directly (not within an array). */
	metaEntropy?: string[] | string;
}

/**
 * Parameters that should be passed in when calling `ftTransferCall` in order to transfer FTs to the Keypom contract for registering key uses.
 */
export interface FTTransferCallParams {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/** The fungible token contract ID. */
    contractId: string,
	/** Amount of tokens to transfer but considering the decimal amount (non human-readable).
	 *  Example: transferring one wNEAR should be passed in as "1000000000000000000000000" and NOT "1" 
    */
	absoluteAmount?: string
	/**
	 * Human readable format for the amount of tokens to transfer.
     * Example: transferring one wNEAR should be passed in as "1" and NOT "1000000000000000000000000"
	 */
    amount?: string,
	/** The drop ID to register the keys for. */
	dropId: string,
	/** If true, the transaction will be returned instead of being signed and sent. */
    returnTransaction?: boolean,
}

/**
 * Parameters that should be passed in when calling `nftTransferCall` in order to transfer NFTs to the Keypom contract for registering key uses.
 */
export interface NFTTransferCallParams {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/** The non-fungible token contract ID. */
    contractId: string,
	/** A set of token IDs that should be sent to the Keypom contract in order to register keys. */
    tokenIds: string[],
	/** The drop ID to register the keys for. */
    dropId: string,
	/** If true, the transaction will be returned instead of being signed and sent. */
	returnTransactions?: boolean,
}

/**
 * Parameters that should be passed in when estimating how much yoctoNEAR it will cost to interact with the protocol using the `estimateRequiredDeposit` function.
 */
export interface EstimatorParams {
	/** The NEAR connection instance used to interact with the chain. This can either the connection that the SDK uses from `getEnv` or a separate connection. */
    near: Near,
	/** How much yoctoNEAR each key will transfer upon use. */
    depositPerUse: string,
	/** How many keys are being added to the drop. */
    numKeys: number,
	/** How many uses each key has. */
    usesPerKey: number,
	/** How much Gas will be attached to each key's use. */
    attachedGas: number,
	/** The estimated storage costs (can be retrieved through `getStorageBase`). */
    storage?: string | null,
	/** How much storage an individual key uses. */
    keyStorage?: string | null,
	/** The FC data for the drop that is being created. */
    fcData?: FCData,
	/** The FT data for the drop that is being created. */
    ftData?: FTData,
}

/**
 * Parameters that should be passed in when adding $NEAR to your Keypom balance via `addToBalance`.
 */
export interface AddToBalanceParams {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/** 
	 * Amount of tokens to add but considering the decimal amount (non human-readable).
	 * Example: transferring one $NEAR should be passed in as "1000000000000000000000000" and NOT "1" 
	*/
	absoluteAmount?: string
	/**
	 * Human readable format for the amount of tokens to add.
	 * Example: transferring one $NEAR should be passed in as "1" and NOT "1000000000000000000000000"
	 */
	amount?: string,
}

/**
 * Parameters that should be passed in when withdrawing $NEAR from your Keypom balance via `withdrawBalance`.
 */
export interface WithdrawBalanceParams {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
}

/** 
 * Parameters that should be passed in when getting information about drops via `getDrops`.
*/
export interface GetDropParams {
	/** The funding account that the drops belong to. */
	accountId: string,
	/** Where to start paginating through drops. */
	start: string | number,
	/** How many drops to paginate through. */
	limit: number,
	/** Whether or not to include key information for the first 50 keys in each drop. */
	withKeys: boolean,
}

/**
 * Information returned when creating a drop or adding keys via `createDrop` and `addKeys` respectively.
 */
export interface CreateOrAddReturn {
	/** The responses to any transactions that were signed and sent to the network. */
	responses?: any,
	/** Information about the transactions if `returnTransactions` is specified in the arguments. This will result in the information being returned instead of signed and sent.  */
	transactions?: Transaction[],
	/** The required deposit that should be attached to the transaction. */
	requiredDeposit?: string,
	/** Any keys that were automatically generated. */
	keys?: Maybe<GeneratedKeyPairs>,
	/** The drop ID for the drop that is being interacted with. */
	dropId: string
}

/**
 * @ignore
 */
export interface RegisterUsesParams {
	account?: Account,
	wallet?: AnyWallet,
	dropId: string,
	numUses: number,
	useBalance?: boolean,
}

/** @internal */
export interface ExecuteParams {
	transactions: Transaction[],
	account: Account,
	wallet?: Wallet,
    fundingAccount?: Account,
}

/** @internal */
export interface CreateDropProtocolArgs {
	public_keys?: string[],
	deposit_per_use: string,

	drop_id?: string,
	config?: {
		uses_per_key?: number,
		time?: {
			start?: number,
			end?: number,
			throttle?: number,
			interval?: number,
		},
		usage?: {
			permission?: string,
			refund_deposit?: boolean,
			auto_delete_drop?: boolean,
			auto_withdraw?: boolean
		},
		root_account_id?: string,
	},
	metadata?: string,

	simple?: {
		lazy_register?: boolean
	},
	ft?: {
		contract_id?: string,
		sender_id?: string,
		balance_per_use?: string
	},
	nft?: {
		sender_id?: string,
		contract_id?: string,
	},
	fc?: {
		methods: Array<Maybe<Array<{
			receiver_id: string,
			method_name: string,
			args: string,
			attached_deposit: string,
			account_id_field?: string,
			drop_id_field?: string,
			key_id_field?: string
		}>>>,
		config?: {
			attached_gas?: string
		}
	},

	passwords_per_use?: Array<Maybe<Array<PasswordPerUse>>>,
}
