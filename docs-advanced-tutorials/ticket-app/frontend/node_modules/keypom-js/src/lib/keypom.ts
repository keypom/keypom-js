import * as nearAPI from "near-api-js";
const {
	KeyPair,
	keyStores: { BrowserLocalStorageKeyStore, InMemoryKeyStore },
} = nearAPI;

import { BrowserWalletBehaviour } from "@near-wallet-selector/core";
import { Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account, Connection, Near } from "near-api-js";
import { KeyStore } from "near-api-js/lib/key_stores";
import { parseSeedPhrase } from 'near-seed-phrase';
import { assert, isValidFunderObject, isValidNearObject } from "./checks";
import {
	execute as _execute
} from "./keypom-utils";
import { EnvVars, Funder } from "./types/general";

type AnyWallet = BrowserWalletBehaviour | Wallet;

type KeypomWallet = {
	accountId: string,
	signAndSendTransactions: any;
}

const gas = '200000000000000'
const gas300 = '300000000000000'
const attachedGas = '100000000000000'
const networks = {
	mainnet: {
		networkId: 'mainnet',
		viewAccountId: 'near',
		nodeUrl: 'https://rpc.mainnet.near.org',
		walletUrl: 'https://wallet.near.org',
		helperUrl: 'https://helper.mainnet.near.org'
	},
	testnet: {
		networkId: 'testnet',
		viewAccountId: 'testnet',
		nodeUrl: 'https://rpc.testnet.near.org',
		walletUrl: 'https://wallet.testnet.near.org',
		helperUrl: 'https://helper.testnet.near.org'
	}
}

export const officialKeypomContracts = {
	mainnet: {
		"v1.keypom.near": true,
		"v1-3.keypom.near": true,
		"v1-4.keypom.near": true,
		"v2.keypom.near": true,
	},
	testnet: {
		"v1.keypom.testnet": true,
		"v1-3.keypom.testnet": true,
		"v1-4.keypom.testnet": true,
		"v2.keypom.testnet": true,
	}
}

export const supportedKeypomContracts = {
	mainnet: {
		"v1-4.keypom.near": true,
		"v2.keypom.near": true
	},
	testnet: {
		"v1-4.keypom.testnet": true,
		"v2.keypom.testnet": true,
	}
}

export const supportedLinkdropClaimPages = {
	mainnet: {
		"mynearwallet": `https://app.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY`,
		"keypom": "https://keypom.xyz/claim/CONTRACT_ID#SECRET_KEY"

	},
	testnet: {
		"mynearwallet": "https://testnet.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
		"keypom": "https://testnet.keypom.xyz/claim/CONTRACT_ID#SECRET_KEY"
	}
}

let contractBase = 'v2.keypom'
let contractId = `${contractBase}.testnet`
let receiverId = contractId

export type Maybe<T> = T | undefined;

let near: Maybe<Near> = undefined;
let connection: Maybe<Connection> = undefined;
let keyStore: Maybe<KeyStore> = undefined;
let networkId: Maybe<string> = undefined;
let fundingAccount: Maybe<Account> = undefined;
let fundingAccountDetails: Maybe<Funder> = undefined;
let contractAccount: Maybe<Account> = undefined;
let viewAccount: any = undefined;
let viewCall: any = undefined;

/**
 * 
 * @returns {EnvVars} The environment variables used by the Keypom library.
 * @group Keypom SDK Environment
 */
export const getEnv = (): EnvVars  => {
	assert(near, 'Keypom uninitialized. Please call initKeypom or initKeypomContext')

	return {
		near, connection, keyStore, networkId, fundingAccount, contractAccount, viewAccount, fundingAccountDetails,
		gas, gas300, attachedGas, contractId, receiverId, getAccount, execute, supportedKeypomContracts, viewCall
	}
}

/** @group Utility */
export const execute = async (args) => _execute({ ...args, fundingAccount })

const getAccount = async ({ account, wallet }: {account: Account, wallet: any}) : Promise<Account | KeypomWallet> => {

	if (wallet) {
		wallet = await wallet
		assert(wallet.signAndSendTransactions, 'Incorrect wallet type');
		wallet.accountId = (await wallet.getAccounts())[0].accountId
	}

	let returnedAccount = account || wallet || fundingAccount;

	// If neither a wallet object, account object, or funding account is provided, throw an error
	assert(returnedAccount, 'No account provided. Either pass in an account object, wallet object, or initialize Keypom with a funding account')

	return returnedAccount
}

/**
 * Initializes the SDK to allow for interactions with the Keypom Protocol. By default, a new NEAR connection will be established but this can be overloaded by
 * passing in an existing connection object. In either case, if a funder is passed in, the credentials will be added to the keystore to sign transactions.
 * 
 * To update the funder account, refer to the `updateFunder` function. If you only wish to use view methods and not sign transactions, no funder account is needed.
 * If you wish to update the Keypom Contract ID being used, refer to the `updateKeypomContractId` function.
 *
 * @returns {Promise<Account | null>} If a funder is passed in, its account object is returned. Otherwise, it null is returned.
 * 
 * @example 
 * Using a pre-created NEAR connection instance with an UnencryptedFileSystemKeyStore:
 * ```js
 * const path = require("path");
 * const homedir = require("os").homedir();
 * const { KeyPair, keyStores, connect } = require("near-api-js");
 * const { initKeypom, getDrops } = require("keypom-js");
 * 
 * // Establish the network we wish to work on
 * const network = "testnet";
 * // Get the location where the credentials are stored for our KeyStore
 * const CREDENTIALS_DIR = ".near-credentials";
 * const credentialsPath = (await path).join(homedir, CREDENTIALS_DIR);
 * (await path).join;
 * let keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
 *
 * // Establish the configuration for the connection
 * let nearConfig = {
 * 		networkId: network,
 * 		keyStore,
 * 		nodeUrl: `https://rpc.${network}.near.org`,
 * 		walletUrl: `https://wallet.${network}.near.org`,
 * 		helperUrl: `https://helper.${network}.near.org`,
 * 		explorerUrl: `https://explorer.${network}.near.org`,
 * };
 * // Connect to the NEAR blockchain and get the connection instance
 * let near = await connect(nearConfig);
 *
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 *		near,
 *		network
 * });
 * 
 * // Get the drops for the given owner
 * const dropsForOwner = await getDrops({accountId: "benjiman.testnet"});
 * ``` 
 * 
 * @example
 * Creating an entirely new NEAR connection instance by using initKeypom and passing in a funder account:
 * ```js
 * const { initKeypom, getDrops } = require("keypom-js");
 * 
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 *		network: "testnet",
 *		funder: {
 *			accountId: "benji_demo.testnet",
 *			secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *		}
 * });
 * 
 * // Get the drops for the given owner
 * const dropsForOwner = await getDrops({accountId: "benjiman.testnet"});
 * ``` 
 * @group Keypom SDK Environment
*/
export const initKeypom = async ({
	near: _near,
	network,
	funder,
	keypomContractId,
}: {
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
}) => {
	assert(network == "testnet" || network == "mainnet", "Network must be either `testnet` or `mainnet`");
	
	if (_near) {
		assert(isValidNearObject(_near), "The NEAR object passed in is not valid. Please pass in a valid NEAR object.");
		near = _near
		keyStore = near.config.keyStore
	} else {
		const networkConfig = typeof network === 'string' ? networks[network] : network
		keyStore = process?.versions?.node ? new InMemoryKeyStore() : new BrowserLocalStorageKeyStore()
		near = new Near({
			...networkConfig,
			deps: { keyStore },
		});
	}
	
	connection = near.connection;
	networkId = near.config.networkId

	if (networkId === 'mainnet') {
		contractId = receiverId = `${contractBase}.near`
	}

	if (keypomContractId) {
		assert(officialKeypomContracts[networkId!][keypomContractId] === true, "The keypom contract passed in must be an official Keypom contract for the given network.");
		if (supportedKeypomContracts[networkId!][keypomContractId] !== true) {
			console.warn("The Keypom contract you are using is not the latest version. Most methods will be unavailable. Please use the latest contract: v1-3.keypom.near or v1-3.keypom.testnet");
		}

		contractId = receiverId = keypomContractId
	}

	viewAccount = new Account(connection, networks[networkId!].viewAccountId)
	viewCall = viewAccount.viewFunction2 = ({ contractId, methodName, args }) => viewAccount.viewFunction(contractId, methodName, args);

	contractAccount = new Account(connection, contractId)

	if (funder) {
		await updateFunder({ funder })
	}

	return null
}

/**
 * Once the SDK is initialized, this function allows the current funder account to be updated. Having a funder is only necessary if you wish to sign transactions on the Keypom Protocol.
 * 
 * @param {Funder} funder The account that will sign transactions to create drops and interact with the Keypom contract. This account will be added to the KeyStore if provided.
 * If rootEntropy is provided for the funder, all access keys will be derived deterministically based off this string.
 * @returns {Promise<Account>} The funder's account object is returned.
 * 
 * @example
 * After initializing the SDK, the funder is updated.
 * ```js
 * const path = require("path");
 * const homedir = require("os").homedir();
 * const { KeyPair, keyStores, connect } = require("near-api-js");
 * const { initKeypom, updateFunder, getDrops } = require("keypom-js");
 * 
 *	// Initialize the SDK for the given network and NEAR connection
 *	await initKeypom({
 *		network: "testnet",
 *	});
 *
 *	// Update the current funder account
 *	await updateFunder({
 *		funder: {
 *			accountId: "benji_demo.testnet",
 *			secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *		}
 *	})
 *
 *	// Get the drops for the given owner
 *	const dropsForOwner = await getDrops({accountId: "benjiman.testnet"});
 *	console.log('dropsForOwner: ', dropsForOwner)
 *
 *	return;
 * ``` 
 * @group Keypom SDK Environment
*/
export const updateFunder = async ({
	funder
}:{funder: Funder}) => {
	assert(near !== undefined, "You must initialize the SDK via `initKeypom` before updating the funder account.")
	assert(isValidFunderObject(funder), "The funder object passed in is not valid. Please pass in a valid funder object.");
	assert(funder.secretKey || funder.seedPhrase, "The funder object passed in must have either a secretKey or seedphrase");

	let { accountId, secretKey, seedPhrase } = funder
	if (seedPhrase) {
		secretKey = parseSeedPhrase(seedPhrase).secretKey
	}
	funder.fundingKeyPair = KeyPair.fromString(secretKey!)
	await keyStore!.setKey(networkId!, accountId, funder.fundingKeyPair)
	
	fundingAccountDetails = funder;
	fundingAccount = new Account(connection!, accountId)

	return null
}

/**
 * This allows the desired Keypom contract ID to be set. By default, the most up-to-date Keypom contract for the given network is set during initKeypom.
 * 
 * @param {string} keypomContractId The account ID that should be used for the Keypom contract.
 * 
 * @example 
 * After initializing the SDK, the Keypom contract ID is updated.
 * ```js
 * const path = require("path");
 * const homedir = require("os").homedir();
 * const { KeyPair, keyStores, connect } = require("near-api-js");
 * const { initKeypom, updateKeypomContractId, getDrops } = require("keypom-js");
 * 
 *	// Initialize the SDK for the given network and NEAR connection
 *	await initKeypom({
 *		network: "testnet",
 *	});
 *
 *	// Update the current Keypom contract ID
 *	await updateKeypomContractId({
 *		keypomContractId: "v1.keypom.testnet"
 *	})
 *
 *	//Get the drops for the given owner
 *	const dropsForOwner = await getDrops({accountId: "benjiman.testnet"});
 *	console.log('dropsForOwner: ', dropsForOwner)
 *
 *	return;
 * ``` 
 * @group Keypom SDK Environment
*/
export const updateKeypomContractId = async ({
	keypomContractId
}:{keypomContractId: string}) => {
	assert(near !== undefined, "You must initialize the SDK via `initKeypom` before updating the Keypom contract ID.")
	assert(officialKeypomContracts[networkId!][keypomContractId] === true, "The keypom contract passed in must be an official Keypom contract for the given network.");
	if (supportedKeypomContracts[networkId!][keypomContractId] !== true) {
		console.warn("The Keypom contract you are using is not the latest version. Most methods will be unavailable. Please use the latest contract: v1-3.keypom.near or v1-3.keypom.testnet");
	}

	contractId = receiverId = keypomContractId
	contractAccount = new Account(connection!, contractId)
	return null
}


