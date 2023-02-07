import { Account, Connection, Near } from "near-api-js";
import { KeyStore } from "near-api-js/lib/key_stores";
import { KeyPair } from 'near-api-js/lib/utils';

export type NearKeyPair = KeyPair

/**
 * For each generated KeyPair (either through `createDrop`, `addKeys` or `generateKeys`), the public and private keys are returned.
 * In addition, the actual KeyPair objects are returned as well.
 */
export interface GeneratedKeyPairs {
	/** Actual KeyPair objects that can be used to sign messages, verify signatures, and get the public and private keys */
	keyPairs: NearKeyPair[];
	/** Set of public keys that were generated */
	publicKeys: string[];
	/** Set of private keys that were generated */
	secretKeys: string[];
}

/** 
 * Outlines how the structure of the *funder* object should be passed into `initKeypom` or `updateFunder`. This contains important information such as the
 * secret key, account ID and any root entropy associated with the account.
 * 
 * @throws if neither `secretKey` or `seedPhrase` are provided. One of these need to be passed in.
*/
export interface Funder {
	/** The account ID of the funder that will be used to sign transactions. */
	accountId: string;
	/** A valid private key associated with the funder's account. This can be function-call or full access (depending on what limitations and security measures are in place). */
	secretKey?: string;
	/** 12 word seedphrase that can be used to derive the `secretKey`. If this is present, it will override the passed in `secretKey`. */
	seedPhrase?: string;
	/** 
	 * When interacting with the SDK, there are several places where KeyPairs can be generated automatically rather than you having to pass them in.
	 * For example, during `createDrop` and `addKeys`, if `publicKeys` isn't passed in, the SDK will generate `numKeys` number of keys automatically.
	 * These generated keys can either be completely random or deterministically generated based off some entropy. If `rootEntropy` is provided, all the
	 * keys that are auto-generated will be based off this entropy.
	 */
	rootEntropy?: string;
	/** @internal */
	fundingKeyPair?: NearKeyPair;
}

/** 
 * Important context that is used throughout the SDK. This is generated when `initKeypom` is called and can be retrieved by calling `useKeypom`.
 * All parameters will start off as undefined until the Keypom SDK is initialized.
*/
export interface EnvVars {
	/** The specific NEAR object that contains important information such as the KeyStore and connection. This is used to interact with the chain and can either be manually passed in or will be automatically created during `initKeypom` */
	near?: Near,
	/** The connection instance that is part of the NEAR object */
	connection?: Connection,
	/** Which type of KeyStore is used when locating keys and signing transactions throughout the SDK (In Memory, Unencrypted FileStore etc.)  */
	keyStore?: KeyStore,
	/** What network is the SDK using (`testnet` or `mainnet`)  */
	networkId?: string,
	/** The NEAR Account object for the Funder  */
	fundingAccount?: Account,
	/** The details for the funder such as any `rootEntropy` or their `secretKey` etc. */
	fundingAccountDetails?: Funder,
	/** The NEAR Account object for the Keypom contract being used. This lets you know the account ID for the contract and can be used to sign transactions for claiming linkdrops. */
	contractAccount?: Account,
	/** @internal */
	viewAccount?: any,
	/** The default amount of Gas that will be attached to transactions (200 TGas). */
	gas?: string,
	/** The max amount of Gas that will be attached to transactions (300 TGas). */
	gas300?: string,
	/** The amount of Gas that will be attached to the `claim` and `create_account_and_claim` functions for claiming linkdrops (100 TGas). */
	attachedGas?: string,
	/** The account ID where the Keypom contract is deployed to. */
	contractId?: string,
	/** @internal */
	receiverId?: string,
	/** @internal */
	error?: string,
	/** @internal */
	getAccount?: any
	/** @internal */
	execute?: any,
	/** Object containing the supported Keypom contracts for both mainnet and testnet */
	supportedKeypomContracts?: {"mainnet": {}, "testnet": {}},
	/** Function that allows you to invoke a view method. This takes in a `receiverId`, `methodName`, and `args`. */
	viewCall?: any
	
}

/** 
 * Information returned from `getContractSourceMetadata` about the deployed Keypom contract. This is part of [NEP-330](https://nomicon.io/Standards/SourceMetadata) and
 * can allow you to view exactly what code is deployed to the contract.
*/
export interface ContractSourceMetadata {
	/** Versioning used by the Keypom developers to indicate which version of the contract is deployed. */
    version: string,
	/** Link to the specific commit and code on GitHub that is deployed to the Keypom account */
    link: string,
}