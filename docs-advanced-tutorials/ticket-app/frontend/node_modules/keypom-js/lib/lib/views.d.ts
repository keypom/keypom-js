import { Maybe } from "./keypom";
import { ContractSourceMetadata } from "./types/general";
import { ProtocolReturnedDrop, ProtocolReturnedKeyInfo, ProtocolReturnedMethod } from "./types/protocol";
/**
 * Returns the balance associated a with given public key. If only the secret key is known, this can be passed in instead. This is used by the NEAR wallet to display the amount of the linkdrop
 *
 * @param {string=} publicKey The public key that contains a balance
 * @param {string=} secretKey The secret key corresponding to the public key
 *
 * @returns {Promise<string>} The amount of yoctoNEAR that is contained within the key
 *
 * @example
 * Create a 1 $NEAR linkdrop and query for its balance:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the amount of yoctoNEAR contained within the key
 * const keyBalance = await getKeyBalance({
 *     publicKey: keys.publicKeys[0]
 * })
 *
 * console.log('keyBalance: ', keyBalance)
 * ```
 * @group View Functions
*/
export declare const getKeyBalance: ({ publicKey, secretKey }: {
    publicKey?: string | undefined;
    secretKey?: string | undefined;
}) => Promise<string>;
/**
 * Query for the total supply of keys currently on the Keypom contract
 *
 * @returns {Promise<number>} The amount of keys.
 *
 * @example
 * Query for the key supply on the `v1.keypom.testnet` contract:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls
 * await initKeypom({
 *     network: "testnet",
 *     keypomContractId: "v1.keypom.testnet"
 * });
 *
 * // Query for the number of keys on the contract
 * const numKeys = await getKeyTotalSupply();
 *
 * console.log('numKeys: ', numKeys)
 * ```
 * @group View Functions
*/
export declare const getKeyTotalSupply: () => Promise<number>;
/**
 * Paginate through all active keys on the contract and return a vector of key info.
 *
 * @param {string= | number=} __namedParameters.start (OPTIONAL) Where to start paginating through keys.
 * @param {number=} __namedParameters.limit (OPTIONAL) How many keys to paginate through.
 *
 * @returns {Promise<Array<KeyInfo>>} Vector of KeyInfo.
 *
 * @example
 * Query for first 50 keys on the `v1.keypom.testnet` contract:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls
 * await initKeypom({
 *     network: "testnet",
 *     keypomContractId: "v1.keypom.testnet"
 * });
 *
 * // Query for the first 50 keys on the contract
 * const keyInfo = await getKeys({
 *   start: 0,
 *   limit: 50
 * });
 *
 * console.log('keyInfo: ', keyInfo)
 * ```
 * @group View Functions
*/
export declare const getKeys: ({ start, limit }: {
    start?: string | number | undefined;
    limit?: number | undefined;
}) => Promise<Array<ProtocolReturnedKeyInfo>>;
/**
 * Returns the KeyInfo corresponding to a specific public key
 *
 * @param {string=} publicKey the public key to get information for.
 * @param {string=} secretKey The secret key corresponding to the public key
 *
 * @returns {Promise<KeyInfo>} Key information struct for that specific key.
 *
 * @example
 * Create a drop and query for the key information:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key information for the key that was created
 * const keyInfo = await getKeyInformation({
 *     publicKey: keys.publicKeys[0]
 * })
 *
 * console.log('keyInfo: ', keyInfo)
 * ```
 * @group View Functions
*/
export declare const getKeyInformation: ({ publicKey, secretKey }: {
    publicKey?: string | undefined;
    secretKey?: string | undefined;
}) => Promise<ProtocolReturnedKeyInfo>;
/**
 * Returns a vector of KeyInfo corresponding to a set of public keys passed in.
 *
 * @param {string[]=} publicKeys Array of public keys to get information about
 * @param {string[]=} secretKeys Array of the secret keys corresponding to the public keys
 *
 * @returns {Promise<Array<KeyInfo>>} Array of Key information structs for the keys passed in
 *
 * @example
 * Create a drop and query for the key information for all keys created:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 5 keys automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 5,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key information for the key that was created
 * const keyInfos = await getKeyInformationBatch({
 *     publicKeys: keys.publicKeys
 * })
 *
 * console.log('keyInfos: ', keyInfos)
 * ```
 * @group View Functions
*/
export declare const getKeyInformationBatch: ({ publicKeys, secretKeys }: {
    publicKeys?: string[] | undefined;
    secretKeys?: string[] | undefined;
}) => Promise<Array<ProtocolReturnedKeyInfo>>;
/**
 * Get information about a specific drop by passing in either a drop ID, public key, or secret key.
 *
 * @param {string=} dropId (OPTIONAL) The drop ID for the specific drop that you want to get information about.
 * @param {string=} publicKey (OPTIONAL) A valid public key that is part of a drop.
 * @param {string=} secretKey (OPTIONAL) The secret key corresponding to a valid public key that is part of a drop.
 * @param {boolean=} withKeys (OPTIONAL) Whether or not to include key information for the first 50 keys in each drop.
 *
 * @returns {Drop} Drop information which may or may not have a keys field of type `KeyInfo` depending on if withKeys is specified as true.
 *
 * @example
 * Create a simple drop and retrieve information about it:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {dropId} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the drop information and also return the key information as well
 * const dropInfo = await getDropInformation({
 *     dropId,
 *     withKeys: true
 * })
 *
 * console.log('dropInfo: ', dropInfo)
 * ```
 *
 * @example
 * Create a simple drop and get the drop information based on a public key and then the secret key:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the drop information and also return the key information as well
 * let dropInfo = await getDropInformation({
 * 	   publicKey: keys.publicKeys[0],
 *     withKeys: true
 * })
 *
 * console.log('dropInfo via public key: ', dropInfo)
 *
 * // Query for the drop information and also return the key information as well
 * dropInfo = await getDropInformation({
 * 	   secretKey: keys.secretKeys[0],
 *     withKeys: true
 * })
 *
 * console.log('dropInfo via secret key: ', dropInfo)
 * ```
 * @group View Functions
*/
export declare const getDropInformation: ({ dropId, secretKey, publicKey, withKeys }: {
    dropId?: string | undefined;
    secretKey?: string | undefined;
    publicKey?: string | undefined;
    withKeys?: boolean | undefined;
}) => Promise<ProtocolReturnedDrop>;
/**
 * Returns the total supply of active keys for a given drop
 *
 * @param {string} dropId The drop ID for the specific drop that you want to get information about.
 *
 * @returns {Promise<number>} Number of active keys
 *
 * @example
 * Create a drop with 5 keys and query for the key supply:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 5 keys automatically created. That key will be completely random since there is no entropy.
 * const {keys, dropId} = await createDrop({
 *     numKeys: 5,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key supply for the drop that was created
 * const keySupply = await getKeySupplyForDrop({
 *     dropId
 * })
 *
 * console.log('keySupply: ', keySupply)
 * ```
 * @group View Functions
*/
export declare const getKeySupplyForDrop: ({ dropId }: {
    dropId: string;
}) => Promise<number>;
/**
 * Paginate through all keys in a specific drop, returning an array of KeyInfo.
 *
 * @param {string} dropId The drop ID for the specific drop that you want to get information about.
 * @param {string= | number=} start (OPTIONAL) Where to start paginating through keys.
 * @param {number=} limit (OPTIONAL) How many keys to paginate through.
 *
 * @returns {Promise<Array<KeyInfo>>} Vector of KeyInfo objects returned from pagination
 *
 * @example
 * Create a drop with 5 keys and return all the key info objects:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 5 keys automatically created. That key will be completely random since there is no entropy.
 * const {dropId} = await createDrop({
 *     numKeys: 5,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key supply for the drop that was created
 * const keyInfos = await getKeysForDrop({
 *     dropId
 * })
 *
 * console.log('keyInfos: ', keyInfos)
 * ```
 * @group View Functions
*/
export declare const getKeysForDrop: ({ dropId, start, limit }: {
    dropId: string;
    start?: string | number | undefined;
    limit?: number | undefined;
}) => Promise<Array<ProtocolReturnedKeyInfo>>;
/**
 * Returns the total supply of active drops for a given account ID
 *
 * @param {string} accountId The account that the drops belong to.
 *
 * @returns {Promise<number>} Amount of drops
 *
 * @example
 * Create a drop and check how many the owner has:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with no keys
 * await createDrop({
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the amount of drops owned by the account
 * const dropSupply = await getDropSupplyForOwner({
 *     accountId: "benji_demo.testnet"
 * })
 *
 * console.log('dropSupply: ', dropSupply)
 * ```
 * @group View Functions
*/
export declare const getDropSupplyForOwner: ({ accountId, }: {
    accountId: string;
}) => Promise<number>;
/**
 * Paginate through drops owned by an account. If specified, information for the first 50 keys in each drop can be returned as well.
 *
 * @param {string} accountId The funding account that the drops belong to.
 * @param {string= | number=} start (OPTIONAL) Where to start paginating through drops.
 * @param {number=} limit (OPTIONAL) How many drops to paginate through.
 * @param {boolean=} withKeys (OPTIONAL) Whether or not to include key information for the first 50 keys in each drop.
 *
 * @example
 * Get drop information for the last 5 drops owned by a given account:
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
 * @group View Functions
*/
export declare const getDrops: ({ accountId, start, limit, withKeys, }: {
    /** The funding account that the drops belong to. */
    accountId: string;
    /** Where to start paginating through drops. */
    start: string | number;
    /** How many drops to paginate through. */
    limit: number;
    /** Whether or not to include key information for the first 50 keys in each drop. */
    withKeys: boolean;
}) => Promise<ProtocolReturnedDrop[]>;
/**
 * Return the total supply of token IDs for a given NFT drop.
 *
 * @param {string} dropId The drop ID that the tokens belong to.
 *
 * @returns {Promise<number>} The amount of token IDs on the drop
 *
 * @example
 * Query for the supply of tokens on a specific drop:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the amount of token IDs on the drop
 * const tokenSupply = await getNftSupplyForDrop({
 *   dropId: "1669840629120"
 * })
 *
 * console.log('tokenSupply: ', tokenSupply)
 * ```
 * @group View Functions
*/
export declare const getNftSupplyForDrop: ({ dropId }: {
    dropId: string;
}) => Promise<number>;
/**
 * Paginate through token IDs in an NFT drop to return a vector of token IDs.
 *
 * @param {string} dropId The drop ID that the tokens belong to.
 * @param {string= | number=} start (OPTIONAL) Where to start paginating from.
 * @param {number=} limit (OPTIONAL) How many token IDs to paginate through.
 *
 * @returns {Promise<Array<string>>} Vector of token IDs
 *
 * @example
 * Query for a list of token IDs on a specific drop:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for a set of token IDs on the drop
 * const tokenList = await getNftTokenIDsForDrop({
 *   dropId: "1669840629120"
 * })
 *
 * console.log('tokenList: ', tokenList)
 * ```
 * @group View Functions
*/
export declare const getNftTokenIDsForDrop: ({ dropId, start, limit }: {
    dropId: string;
    start?: string | number | undefined;
    limit?: number | undefined;
}) => Promise<Array<string>>;
/**
 * Query for a user's current balance on the Keypom contract
 *
 * @param {string} accountId The account ID of the user to retrieve the balance for.
 *
 * @returns {string} The user's current balance
 *
 * @example
 * Query for a user's current balance on the Keypom contract:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the drop information for a specific drop
 * const userBal = await getUserBalance({
 * accountId: "benjiman.testnet",
 * })
 *
 * console.log('userBal: ', userBal)
 * ```
 * @group View Functions
*/
export declare const getUserBalance: ({ accountId }: {
    accountId: string;
}) => Promise<string>;
/**
 * Query for the current method data for a given key. This pertains to FC drops and the current method data is either null or an array of methods that will be invoked when the key is claimed next.
 *
 * @param {string=} secretKey (OPTIONAL) The secret key of the key to retrieve the method data for. If no secret key is passed in, the public key must be passed in.
 * @param {string=} publicKey (OPTIONAL) The public key of the key to retrieve the method data for. If no public key is passed in, the secret key must be passed in.
 * @param {number=} keyUse (OPTIONAL) Pass in a specific key use (*NOT* zero indexed) to retrieve the method data for. If no key use is passed in, the method data for the current key use will be returned.
 *
 * @returns {Promise<Maybe<Array<ProtocolReturnedMethod>>>} The current method data for the key
 *
 * @example
 * ```js
 * const fcData = {
 * 	methods: [
 * 		null,
 * 		[
 * 			{
 * 				methodName: "nft_token",
 * 				receiverId: "nft.examples.testnet",
 * 				args: JSON.stringify({
 * 					token_id: "1"
 * 				}),
 * 				attachedDeposit: "0"
 * 			},
 * 			{
 * 				methodName: "nft_token",
 * 				receiverId: "nft.examples.testnet",
 * 				args: JSON.stringify({
 * 					token_id: "2"
 * 				}),
 * 				attachedDeposit: "0"
 * 			}
 * 		],
 * 		null
 * 	]
 * }
 *
 * const {keys: {publicKeys, secretKeys}} = await createDrop({
 * 	numKeys: 1,
 * 	depositPerUseNEAR: 0,
 * 	fcData,
 * 	config: {
 * 		usesPerKey: 3
 * 	}
 * });
 * const secretKey = secretKeys[0];
 *
 * let curMethodData = await getCurMethodData({secretKey});
 * console.log('curMethodData (first): ', curMethodData)
 * t.is(curMethodData, null);
 *
 * 	curMethodData = await getCurMethodData({secretKey, keyUse: 1});
 *	t.is(curMethodData, null);
 *	curMethodData = await getCurMethodData({secretKey, keyUse: 2});
 *	t.true(curMethodData != null);
 *	curMethodData = await getCurMethodData({secretKey, keyUse: 3});
 *	t.is(curMethodData, null);
 *
 * await claim({secretKey, accountId: 'foobar'})
 * curMethodData = await getCurMethodData({secretKey});
 * t.true(curMethodData != null);
 *
 * await claim({secretKey, accountId: 'foobar'})
 * curMethodData = await getCurMethodData({secretKey});
 * console.log('curMethodData (third): ', curMethodData)
 * t.is(curMethodData, null);
 * ```
 * @group View Functions
 */
export declare const getCurMethodData: ({ secretKey, publicKey, keyUse }: {
    secretKey?: string | undefined;
    publicKey?: string | undefined;
    keyUse?: number | undefined;
}) => Promise<Maybe<Array<ProtocolReturnedMethod>>>;
/**
 * Check if a given user can add keys to a drop. The only case where a user *other than the funder* could add keys is if the drop has a public sale running.
 *
 * @param {string} dropId The drop ID to check if the user can add keys to
 * @param {string} accountId The account ID of the user to check if they can add keys to the drop
 *
 * @returns {Promise<boolean>} Whether or not the user can add keys to the drop
 *
 * @example
 * ```js
 * await createDrop({
 * 	numKeys: 0,
 * 	depositPerUseNEAR: 0,
 * 	config: {
 * 		sale: {
 * 			maxNumKeys: 2,
 * 			pricePerKeyNEAR: 1
 * 		}
 * 	}
 * });
 *
 * const canAddKeys = await canUserAddKeys({accountId: "foobar.testnet"});
 * t.is(canAddKeys, true);
 * ```
 *
 * @group View Functions
*/
export declare const canUserAddKeys: ({ dropId, accountId }: {
    dropId: string;
    accountId: string;
}) => Promise<boolean>;
/**
 * Returns the source metadata for the Keypom contract that the SDK has been initialized on. This includes valuable information
 * such as which specific version the contract is on and link to exactly which GitHub commit is deployed.
 *
 * @returns {ContractSourceMetadata} The contract's source metadata
 *
 * @example
 * Query for the current Keypom contract's source metadata:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the Keypom contract's source metadata
 * const metadata = await getContractSourceMetadata();
 *
 * console.log('metadata: ', metadata)
 * ```
 * @group View Functions
*/
export declare const getContractSourceMetadata: () => Promise<ContractSourceMetadata>;
