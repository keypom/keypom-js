import { CreateDropParams, GetDropParams } from "./types";
/**
 * Creates a new drop based on parameters passed in.
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string=} dropId (OPTIONAL) Specify a custom drop ID rather than using the incrementing nonce on the contract.
 * @param {number} numKeys Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed into the function, the keys will be
 * deterministically generated using the drop ID, key nonce, and entropy. Otherwise, each key will be generated randomly.
 * @param {string[]=} publicKeys (OPTIONAL) Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter.
 * @param {string=} rootEntropy (OPTIONAL) Specify an entropy to use for generating keys (will overload the funder's rootEntropy if applicable). This parameter only matters if the publicKeys variable is not passed in.
 * @param {Number=} depositPerUseNEAR (OPTIONAL) How much $NEAR should be contained in each link. Unit in $NEAR (i.e 1 = 1 $NEAR)
 * @param {string=} depositPerUseYocto (OPTIONAL) How much $yoctoNEAR should be contained in each link. Unit in yoctoNEAR (1 yoctoNEAR = 1e-24 $NEAR)
 * @param {string=} metadata (OPTIONAL) String of metadata to attach to the drop. This can be whatever you would like and is optional. Often this is stringified JSON.
 * @param {DropConfig=} config (OPTIONAL) Allows specific drop behaviors to be configured such as the number of uses each key / link will have.
 * @param {FTData=} ftData (OPTIONAL) For creating a fungible token drop, this contains necessary configurable information about the drop.
 * @param {NFTData=} nftData (OPTIONAL) For creating a non-fungible token drop, this contains necessary configurable information about the drop.
 * @param {FCData=} fcData (OPTIONAL) For creating a function call drop, this contains necessary configurable information about the drop.
 * @param {SimpleData=} simpleData (OPTIONAL) For creating a simple drop, this contains necessary configurable information about the drop.
 * @param {boolean=} hasBalance (OPTIONAL) If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit.
 *
 * @example <caption>Create a basic simple drop containing 10 keys each with 1 $NEAR:</caption>
 * ```js
 * const { KeyPair, keyStores, connect } = require("near-api-js");
 * const { initKeypom, createDrop, generateKeys } = require("keypom-js");
 *
 * // Initialize the SDK for the given network and NEAR connection
 *	await initKeypom({
 *		network: "testnet",
 *		funder: {
 *			accountId: "benji_demo.testnet",
 *			secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *		}
 *	});
 *
 * // create 10 keys with no entropy (all random)
 * const {publicKeys} = await generateKeys({
 * 	numKeys: 10
 * });
 *
 *	await createDrop({
 *		publicKeys,
 *		depositPerUseNEAR: 1,
 *	});
 * ```
*/
export declare const createDrop: ({ account, wallet, dropId, numKeys, publicKeys, rootEntropy, depositPerUseNEAR, depositPerUseYocto, metadata, config, ftData, nftData, simpleData, fcData, hasBalance, }: CreateDropParams) => Promise<{
    responses: any;
}>;
/**
 * Get the number of active drops for a given account ID. Active refers to ones exist on the contract and haven't been deleted.
 *
 * @param {string} accountId The account to get the number of active drops for.
 *
 * @returns {Promise<number>} The number of active drops for the given account ID.
 *
 * @example <caption>Query for the number of drops owned by an account</caption>
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * 	network: "testnet",
 * });
 *
 * // Query for the number of drops owned by the given account
 * const numDrops = await getDropSupply({
 * 	accountId: "benjiman.testnet"
 * })
 *
 * console.log('numDrops: ', numDrops)
 * ```
*/
export declare const getDropSupply: ({ accountId, }: {
    accountId: string;
}) => Promise<any>;
/**
 * Paginate through drops owned by an account. If specified, information for the first 50 keys in each drop can be returned as well.
 *
 * @param {string} accountId The funding account that the drops belong to.
 * @param {string= | number=} (OPTIONAL) Where to start paginating through drops.
 * @param {number=} (OPTIONAL) How many drops to paginate through.
 * @param {boolean=} (OPTIONAL) Whether or not to include key information for the first 50 keys in each drop.
 *
 * @example <caption>Get drop information for the last 5 drops owned by a given account</caption>
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * 	network: "testnet",
 * });
 *
 * // Get the number of drops the account has.
 * const numDrops = await getDropSupply({
 * 	accountId: "benjiman.testnet"
 * });
 *
 * // Query for drop information for the last 5 drops and their respective keys
 * const dropsAndKeys = await getDrops({
 * 	accountId: "benjiman.testnet",
 * 	start: numDrops - 5,
 * 	withKeys: true
 * })
 *
 * console.log('dropsAndKeys: ', dropsAndKeys)
 * ```
*/
export declare const getDrops: ({ accountId, start, limit, withKeys, }: GetDropParams) => Promise<any>;
/**
 * Get information about a specific drop given its drop ID.
 *
 * @param {string} dropId The drop ID for the specific drop that you want to get information about.
 *
 * @example <caption>Create a simple drop and retrieve information about it:</caption>
 * ```js
 *
 * ```
*/
export declare const getDropInformation: ({ dropId }: {
    dropId: string;
}) => Promise<any>;
/**
 * Delete a set of drops and optionally withdraw any remaining balance you have on the Keypom contract.
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 *
*/
export declare const deleteDrops: ({ account, wallet, drops, withdrawBalance, }: {
    account: any;
    wallet: any;
    drops: any;
    withdrawBalance?: boolean | undefined;
}) => Promise<any[]>;
