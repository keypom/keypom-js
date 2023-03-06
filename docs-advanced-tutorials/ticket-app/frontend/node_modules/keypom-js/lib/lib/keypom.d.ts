import * as nearAPI from "near-api-js";
import { Near } from "near-api-js";
import { EnvVars, Funder } from "./types/general";
export declare const officialKeypomContracts: {
    mainnet: {
        "v1.keypom.near": boolean;
        "v1-3.keypom.near": boolean;
        "v1-4.keypom.near": boolean;
        "v2.keypom.near": boolean;
    };
    testnet: {
        "v1.keypom.testnet": boolean;
        "v1-3.keypom.testnet": boolean;
        "v1-4.keypom.testnet": boolean;
        "v2.keypom.testnet": boolean;
    };
};
export declare const supportedKeypomContracts: {
    mainnet: {
        "v1-4.keypom.near": boolean;
        "v2.keypom.near": boolean;
    };
    testnet: {
        "v1-4.keypom.testnet": boolean;
        "v2.keypom.testnet": boolean;
    };
};
export declare const supportedLinkdropClaimPages: {
    mainnet: {
        mynearwallet: string;
        keypom: string;
    };
    testnet: {
        mynearwallet: string;
        keypom: string;
    };
};
export type Maybe<T> = T | undefined;
declare let near: Maybe<Near>;
/**
 *
 * @returns {EnvVars} The environment variables used by the Keypom library.
 * @group Keypom SDK Environment
 */
export declare const getEnv: () => EnvVars;
/** @group Utility */
export declare const execute: (args: any) => Promise<void | nearAPI.providers.FinalExecutionOutcome[] | (void | nearAPI.providers.FinalExecutionOutcome)[]>;
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
export declare const initKeypom: ({ near: _near, network, funder, keypomContractId, }: {
    /** The NEAR connection instance to use. If not passed in, it will create a new one. */
    near?: nearAPI.Near | undefined;
    /** The network to connect to either `mainnet` or `testnet`. */
    network: string;
    /**
     * The account that will sign transactions to create drops and interact with the Keypom contract. This account will be added to the KeyStore if provided.
     * If rootEntropy is provided for the funder, all access keys will be derived deterministically based off this string.
     */
    funder?: Funder | undefined;
    /**
     * Instead of using the most up-to-date, default Keypom contract, you can specify a specific account ID to use. If an older version is specified, some features of the SDK might not be usable.
     */
    keypomContractId?: string | undefined;
}) => Promise<null>;
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
export declare const updateFunder: ({ funder }: {
    funder: Funder;
}) => Promise<null>;
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
export declare const updateKeypomContractId: ({ keypomContractId }: {
    keypomContractId: string;
}) => Promise<null>;
export {};
