import BN from 'bn.js';
import * as nearAPI from "near-api-js";
const {
	utils: {
		format: { parseNearAmount },
	},
} = nearAPI;

import { getDropInformation, getUserBalance } from "./views";
import { getEnv } from "./keypom";
import {
	estimateRequiredDeposit, ftTransferCall, generateKeys,
	generatePerUsePasswords,
	key2str, nftTransferCall, toCamel
} from "./keypom-utils";
import { AddKeyParams, CreateOrAddReturn, DeleteKeyParams } from './types/params';

/**
 * Add keys to a specific drop
 * 
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string=} dropId (OPTIONAL) Specify the drop ID for which you want to add keys to.
 * @param {any} drop (OPTIONAL) If the drop information from getDropInformation is already known to the client, it can be passed in instead of the drop ID to reduce computation.
 * @param {number} numKeys Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed into the function, the keys will be
 * deterministically generated using the drop ID, key nonces, and entropy. Otherwise, each key will be generated randomly.
 * @param {string[]=} publicKeys (OPTIONAL) Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter.
 * @param {string[]=} nftTokenIds (OPTIONAL) If the drop type is an NFT drop, the token IDs can be passed in so that the tokens are automatically sent to the Keypom contract rather
 * than having to do two separate transactions.
 * @param {string=} basePassword (OPTIONAL) For doing password protected drops, this is the base password that will be used to generate all the passwords. It will be double hashed with the public keys. If specified, by default, all key uses will have their own unique password unless passwordProtectedUses is passed in.
 * @param {number[]=} passwordProtectedUses (OPTIONAL) For doing password protected drops, specifies exactly which uses will be password protected. The uses are NOT zero indexed (i.e 1st use = 1). Each use will have a different, unique password generated via double hashing the base password + public key + key use.
 * @param {boolean=} useBalance (OPTIONAL) If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw.
 * 
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 * 
 * @example <caption>Create a basic empty simple drop and add 10 keys. Each key is completely random.:</caption>
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto generated keys will
 * // be completely random unless otherwise overwritten.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 * 
 * // Create an empty simple drop with no keys.
 * const {dropId} = await createDrop({
 * 	depositPerUseNEAR: 1,
 * });
 * 
 * // Add 10 completely random keys. The return value `keys` contains information about the generated keys
 * const {keys} = await addKeys({
 * 	dropId,
 * 	numKeys: 10
 * })
 * 
 * console.log('public keys: ', keys.publicKeys);
 * console.log('private keys: ', keys.secretKeys);
 * ``` 
 * @example <caption>Init funder with root entropy, create empty drop and add generate deterministic keys. Compare with manually generated keys</caption>
 * // Initialize the SDK for the given network and NEAR connection. Root entropy is passed into the funder account so any generated keys
 * // Will be based off that entropy.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1",
 * 		rootEntropy: "my-global-secret-password"
 * 	}
 * });
 * 
 * // Create a simple drop with no keys
 * const { dropId } = await createDrop({
 * 	depositPerUseNEAR: 1,
 * });
 * 
 * // Add 5 keys to the empty simple drop. Each key will be derived based on the rootEntropy of the funder, the drop ID, and key nonce.
 * const {keys: keysFromDrop} = await addKeys({
 * 	dropId,
 * 	numKeys: 5
 * })
 * 
 * // Deterministically Generate the Private Keys:
 * const nonceDropIdMeta = Array.from({length: 5}, (_, i) => `${dropId}_${i}`);
 * const manualKeys = await generateKeys({
 * 	numKeys: 5,
 * 	rootEntropy: "my-global-secret-password",
 * 	metaEntropy: nonceDropIdMeta
 * })
 * 
 * // Get the public and private keys from the keys generated by addKeys
 * const {publicKeys, secretKeys} = keysFromDrop;
 * // Get the public and private keys from the keys that were manually generated
 * const {publicKeys: pubKeysGenerated, secretKeys: secretKeysGenerated} = manualKeys;
 * // These should match!
 * console.log('secretKeys: ', secretKeys)
 * console.log('secretKeysGenerated: ', secretKeysGenerated)
 * 
 * // These should match!
 * console.log('publicKeys: ', publicKeys)
 * console.log('pubKeysGenerated: ', pubKeysGenerated)
 * 
 * @example <caption>Create an empty drop and add manually created keys</caption>
 * // Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto generated keys will
 * // be completely random unless otherwise overwritten.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 * 
 * // Create an empty simple drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * const {dropId} = await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
 * 
 * // Generate 10 random keys
 * const {publicKeys} = await generateKeys({
 * 	numKeys: 10
 * });
 * 
 * // Add keys to the drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * await addKeys({
 * 	publicKeys,
 * 	dropId
 * })
*/
export const addKeys = async ({
	account,
	wallet,
	dropId,
	drop,
	numKeys,
	publicKeys,
	nftTokenIds,
	rootEntropy,
	basePassword,
	passwordProtectedUses,
	useBalance = false,
}: AddKeyParams): Promise<CreateOrAddReturn> => {
	const {
		near, gas, contractId, receiverId, getAccount, execute, fundingAccountDetails
	} = getEnv()

	if (!near) {
		throw new Error('Keypom SDK is not initialized. Please call `initKeypom`.')
	}

	if (!drop && !dropId) {
		throw new Error("Either a dropId or drop object must be passed in.")
	}

	if (!publicKeys?.length && !numKeys) {
		throw new Error("Either pass in publicKeys or set numKeys to a positive non-zero value.")
	}

	account = getAccount({ account, wallet });
	const {
		drop_id,
		registered_uses,
		required_gas,
		deposit_per_use,
		config: { uses_per_key },
		ft: ftData = {},
		nft: nftData = {},
		fc: fcData,
		next_key_id,
	} = drop || await getDropInformation({dropId: dropId!});

	// If there are no publicKeys being passed in, we should generate our own based on the number of keys
	if (!publicKeys) {
		var keys;
		
		// Default root entropy is what is passed in. If there wasn't any, we should check if the funding account contains some.
		const rootEntropyUsed = rootEntropy || fundingAccountDetails?.rootEntropy;
		// If either root entropy was passed into the function or the funder has some set, we should use that.
		if(rootEntropyUsed) {
			// Create an array of size numKeys with increasing strings from next_key_id -> next_key_id + numKeys - 1. Each element should also contain the dropId infront of the string 
			const nonceDropIdMeta = Array.from({length: numKeys}, (_, i) => `${drop_id}_${next_key_id + i}`);
			keys = await generateKeys({
				numKeys,
				rootEntropy: rootEntropyUsed,
				metaEntropy: nonceDropIdMeta
			});
		} else {
			// No entropy is provided so all keys should be fully random
			keys = await generateKeys({
				numKeys,
			});
		}
		
		publicKeys = keys.publicKeys
	}

	numKeys = publicKeys!.length;
	let passwords;
	if (basePassword) {
		// Generate the passwords with the base password and public keys. By default, each key will have a unique password for all of its uses unless passwordProtectedUses is passed in
		passwords = await generatePerUsePasswords({
			publicKeys: publicKeys!,
			basePassword,
			uses: passwordProtectedUses || Array.from({length: uses_per_key}, (_, i) => i+1)
		})
	}

	const camelFTData = toCamel(ftData);
	const camelFCData = toCamel(fcData);

	let requiredDeposit = await estimateRequiredDeposit({
		near,
		depositPerUse: deposit_per_use,
		numKeys,
		usesPerKey: uses_per_key,
		attachedGas: required_gas,
		storage: parseNearAmount('0.2') as string,
		fcData: camelFCData,
		ftData: camelFTData
	})
	console.log('requiredDeposit: ', requiredDeposit)

	var hasBalance = false;
	if(useBalance) {
		let userBal = await getUserBalance({accountId: account!.accountId});
		if(userBal < requiredDeposit) {
			throw new Error(`Insufficient balance on Keypom to create drop. Use attached deposit instead.`);
		}

		hasBalance = true;
	}

	const transactions: any[] = []

	transactions.push({
		receiverId,
		actions: [{
			type: 'FunctionCall',
			params: {
				methodName: 'add_keys',
				args: {
					drop_id,
					public_keys: publicKeys,
					passwords_per_use: passwords
				},
				gas,
				deposit: !hasBalance ? requiredDeposit : undefined,
			}
		}]
	})

	if (ftData.contract_id) {
		transactions.push(ftTransferCall({
			account: account!,
			contractId: ftData.contract_id,
			args: {
				receiver_id: contractId,
				amount: new BN(ftData.balance_per_use).mul(new BN(numKeys - registered_uses)).toString(),
				msg: drop_id.toString(),
			},
			returnTransaction: true
		}))
	}

	let responses = await execute({ transactions, account, wallet })

	if (nftTokenIds && nftTokenIds.length > 0) {
		const nftResponses = await nftTransferCall({
			account: account!,
			contractId: nftData.contract_id,
			receiverId: contractId,
			tokenIds: nftTokenIds,
			msg: drop_id.toString(),
		})
		responses = responses.concat(nftResponses)
	}

	return { responses, dropId: drop_id, keys }
}

/**
 * Delete a set of keys from a drop and optionally withdraw any remaining balance you have on the Keypom contract.
 * 
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string[] | string} publicKeys Specify a set of public keys to delete. If deleting a single publicKey, the string can be passed in without wrapping it in an array.
 * @param {string} dropId Which drop ID do the keys belong to?
 * @param {boolean=} withdrawBalance (OPTIONAL) Whether or not to withdraw any remaining balance on the Keypom contract.
 * 
 * @example <caption>Create a drop with 5 keys and delete the first one</caption>
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 * 
 * // Create the simple drop with 5 random keys
 * const {keys, dropId} = await createDrop({
 * 	numKeys: 5,
 * 	depositPerUseNEAR: 1,
 * });
 * 
 * await deleteKeys({
 * 	dropId,
 * 	publicKeys: keys.publicKeys[0] // Can be wrapped in an array as well
 * })
```
*/
export const deleteKeys = async ({
	account,
	wallet,
	publicKeys,
	dropId,
	withdrawBalance = false,
}: DeleteKeyParams) => {

	const {
		receiverId, execute,
	} = getEnv()

	const { drop_id, registered_uses, ft, nft } = await getDropInformation({ dropId })

	const actions: any[] = []
	if ((ft || nft) && registered_uses > 0) {
		actions.push({
			type: 'FunctionCall',
			params: {
				methodName: 'refund_assets',
				args: {
					drop_id,
				},
				gas: '100000000000000',
			}
		})
	}

	// If the publicKeys provided is not an array (simply the string for 1 key), we convert it to an array of size 1 so that we can use the same logic for both cases
    if (publicKeys && !Array.isArray(publicKeys)) {
        publicKeys = [publicKeys]
    }

	actions.push({
		type: 'FunctionCall',
		params: {
			methodName: 'delete_keys',
			args: {
				drop_id,
				// @ts-ignore - publicKeys is always an array here
				public_keys: publicKeys.map(key2str),
			},
			gas: '100000000000000',
		}
	})
	
	if (withdrawBalance) {
		actions.push({
			type: 'FunctionCall',
			params: {
				methodName: 'withdraw_from_balance',
				args: {},
				gas: '100000000000000',
			}
		})
	}

	const transactions: any[] = [{
		receiverId,
		actions,
	}]

	return execute({ transactions, account, wallet })
}