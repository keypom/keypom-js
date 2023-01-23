import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types'
import { assert } from "./checks"
import { KEY_LIMIT } from "./drops"
import { getEnv } from "./keypom"
import { keypomView } from "./keypom-utils"
import { KeyInfo } from "./types/drops"
import { ContractSourceMetadata } from "./types/general"
import { ProtocolReturnedDrop } from "./types/protocol"

type AnyWallet = BrowserWalletBehaviour | Wallet;

/**
 * Returns the balance associated with given key. This is used by the NEAR wallet to display the amount of the linkdrop
 * 
 * @param {string} publicKey The public key that contains a balance
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
*/
export const getKeyBalance = async ({
	publicKey,
}: { publicKey: string }): Promise<string> => {
	return keypomView({
		methodName: 'get_key_balance',
		args: {
			key: publicKey,
		},
	})
}

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
*/
export const getKeyTotalSupply = async (): Promise<number> => {
	return keypomView({
		methodName: 'get_key_total_supply',
		args: {}
	})
}

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
*/
export const getKeys = async ({
    start,
    limit
}: {start?: string | number, limit?: number }): Promise<Array<KeyInfo>> => {
	return keypomView({
		methodName: 'get_keys',
		args: {
            from_index: start?.toString(),
            limit
        }
	})
}

/**
 * Returns the KeyInfo corresponding to a specific public key
 * 
 * @param {string} publicKey the public key to get information for.
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
*/
export const getKeyInformation = async ({
    publicKey
}: {publicKey: string }): Promise<KeyInfo> => {
	return keypomView({
		methodName: 'get_key_information',
		args: {
            key: publicKey
        }
	})
}

/**
 * Returns a vector of KeyInfo corresponding to a set of public keys passed in.
 * 
 * @param {string[]} publicKeys Array of public keys to get information about
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
*/
export const getKeyInformationBatch = async ({
    publicKeys
}: {publicKeys: string[] }): Promise<Array<KeyInfo>> => {
	return keypomView({
		methodName: 'get_key_information_batch',
		args: {
            keys: publicKeys
        }
	})
}

/**
 * Get information about a specific drop given its drop ID.
 * 
 * @param {string} dropId The drop ID for the specific drop that you want to get information about.
 * @param {boolean=} withKeys (OPTIONAL) Whether or not to include key information for the first 50 keys in each drop.
 * 
 * @returns {Drop} Drop information which may or may not have a keys field of type `KeyInfo` depending on if withKeys is specified as true.
 * 
 * @example 
 * Create a simple drop and retrieve information about it::
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
*/
export const getDropInformation = async ({ dropId, withKeys = false } : {dropId: string, withKeys?: boolean}): Promise<ProtocolReturnedDrop> => {
	const {
		viewAccount, contractId,
	} = getEnv()

	assert(viewAccount, 'initKeypom must be called before view functions can be called.');

	const dropInfo = await viewAccount.viewFunction2({
		contractId,
		methodName: 'get_drop_information',
		args: {
			drop_id: dropId,
		},
	})

	if (withKeys) {
		dropInfo.keys = await keypomView({
			methodName: 'get_keys_for_drop',
			args: {
				drop_id: dropId,
				from_index: '0',
				limit: KEY_LIMIT
			}
		});
	}

	return dropInfo
}

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
*/
export const getKeySupplyForDrop = async ({
    dropId
}: {dropId: string }): Promise<number> => {
	return keypomView({
		methodName: 'get_key_supply_for_drop',
		args: {
            drop_id: dropId
        }
	})
}

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
*/
export const getKeysForDrop = async ({
    dropId,
    start,
    limit
}: {dropId: string, start?: string | number, limit?: number }): Promise<Array<KeyInfo>> => {
	return keypomView({
		methodName: 'get_keys_for_drop',
		args: {
            drop_id: dropId,
            from_index: start?.toString(),
            limit
        }
	})
}

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
*/
export const getDropSupplyForOwner = async ({
    accountId,
}: {accountId: string }): Promise<number> => {
	return keypomView({
		methodName: 'get_drop_supply_for_owner',
		args: {
            account_id: accountId
        }
	})
}

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
*/
export const getDrops = async ({
	accountId,
	start,
	limit,
	withKeys = false,
}: {
	/** The funding account that the drops belong to. */
	accountId: string,
	/** Where to start paginating through drops. */
	start: string | number,
	/** How many drops to paginate through. */
	limit: number,
	/** Whether or not to include key information for the first 50 keys in each drop. */
	withKeys: boolean,
}): Promise<ProtocolReturnedDrop[]> => {

	const drops = await keypomView({
		methodName: 'get_drops_for_owner',
		args: {
			account_id: accountId,
			from_index: start ? start.toString() : undefined,
			limit: limit ? limit : undefined,
		},
	})

	if (withKeys) {
		assert(drops.length <= 20, `Too many RPC requests in parallel. Use 'limit' arg 20 or less.`)

		await Promise.all(drops.map(async (drop, i) => {
			const { drop_id } = drop
			drop.keys = await keypomView({
				methodName: 'get_keys_for_drop',
				args: {
					drop_id,
					from_index: '0',
					limit: KEY_LIMIT
				}
			})
		}))
	}

	return drops
}

/**
 * Return the total supply of token IDs for a given NFT drop,
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
*/
export const getNftSupplyForDrop = async ({
    dropId
}: {dropId: string}): Promise<number> => {
    return keypomView({
		methodName: 'get_nft_supply_for_drop',
		args: {
            drop_id: dropId
        }
	})
}

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
*/
export const getNftTokenIDsForDrop = async ({
    dropId,
    start,
    limit
}: {dropId: string, start?: string | number, limit?: number}): Promise<Array<string>> => {
    return keypomView({
		methodName: 'get_nft_token_ids_for_drop',
		args: {
            drop_id: dropId,
            from_index: start,
            limit
        }
	})
}

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
 * const dropInfo = await getDropInformation({
 * dropId: "1669840629120",
 * withKeys: true
 * })
 * 
 * console.log('dropInfo: ', dropInfo)
 * ```
*/
export const getUserBalance = async ({
    accountId
}: {accountId: string}): Promise<string> => {
    return keypomView({
		methodName: 'get_user_balance',
		args: {
            account_id: accountId
        }
	})
}

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
*/
export const getContractSourceMetadata = async (): Promise<ContractSourceMetadata> => {
    return keypomView({
		methodName: 'contract_source_metadata',
		args: {}
	})
}