import BN from 'bn.js';
import * as nearAPI from "near-api-js";
const {
	utils: {
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

import { FinalExecutionOutcome, Transaction } from "@near-wallet-selector/core";
import { getEnv } from "./keypom";
import {
	estimateRequiredDeposit,
	ftTransferCall, generateKeys, generatePerUsePasswords, getStorageBase, key2str, keypomView, nftTransferCall, parseFTAmount
} from "./keypom-utils";
import { CreateDropParams, CreateOrAddParams, DeleteDropParams, GetDropParams } from './types/params';
import { getDropInformation, getUserBalance } from './views';

export const KEY_LIMIT = 50;

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
 * @param {string=} basePassword (OPTIONAL) For doing password protected drops, this is the base password that will be used to generate all the passwords. It will be double hashed with the public keys. If specified, by default, all uses will have a password (which is the same) unless passwordProtecedUses is passed in.
 * @param {number[]=} passwordProtectedUses (OPTIONAL) For doing password protected drops, specify exactly which uses will be password protected. The uses are NOT zero indexed (i.e 1st use = 1). Each use will have a different, unique password generated via double hashing the base password + public key + key use.
 * @param {boolean=} useBalance (OPTIONAL) If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw.
 * 
 * @return {Promise<CreateOrAddParams>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 * 
 * @example <caption>Create a basic simple drop containing 10 keys each with 1 $NEAR. Each key is completely random.:</caption>
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
 * // Create a drop with 10 completely random keys. The return value `keys` contains information about the generated keys
 * const {keys} = await createDrop({
 * 	numKeys: 10,
 * 	depositPerUseNEAR: 1,
 * });
 * 
 * console.log('public keys: ', keys.publicKeys);
 * console.log('private keys: ', keys.secretKeys);
 * ``` 
 * @example <caption>Init funder with root entropy and generate deterministic keys for a drop. Compare with manually generated keys</caption>
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
 * // Create a simple drop with 5 keys. Each key will be derived based on the rootEntropy of the funder, the drop ID, and key nonce.
 * const { keys: keysFromDrop, dropId } = await createDrop({
 * 	numKeys: 5,
 * 	depositPerUseNEAR: 1,
 * });
 * 
 * // Deterministically Generate the Private Keys:
 * const nonceDropIdMeta = Array.from({length: 5}, (_, i) => `${dropId}_${i}`);
 * const manualKeys = await generateKeys({
 * 	numKeys: 5,
 * 	rootEntropy: "my-global-secret-password",
 * 	metaEntropy: nonceDropIdMeta
 * })
 * 
 * // Get the public and private keys from the keys generated by the drop
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
 * @example <caption>Use manually generated keys to create a drop</caption>
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
 * // Generate 10 random keys
 * const {publicKeys} = await generateKeys({
 * 	numKeys: 10
 * });
 * 
 * // Create a drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
*/
export const createDrop = async ({
	account,
	wallet,
	dropId,
	numKeys = 0,
	publicKeys,
	rootEntropy,
	depositPerUseNEAR,
	depositPerUseYocto,
	metadata,
	config = {},
	ftData = {},
	nftData = {},
	simpleData = {},
	fcData,
	basePassword,
	passwordProtectedUses,
	useBalance = false,
}: CreateDropParams): Promise<CreateOrAddParams> => {
	const {
		near, viewAccount,
		gas, attachedGas, contractId, receiverId, getAccount, execute, fundingAccount, fundingAccountDetails
	} = getEnv()

	if (!near) {
		throw new Error('Keypom SDK is not initialized. Please call `initKeypom`.')
	}

	account = getAccount({ account, wallet })

	/// parse args
	if (depositPerUseNEAR) {
		depositPerUseYocto = parseNearAmount(depositPerUseNEAR.toString()) || '0'
	}
	if (!depositPerUseYocto) depositPerUseYocto = '0'

	// Ensure that if the dropID is passed in, it's greater than 1 billion
	if (dropId && parseInt(dropId) < 1000000000) {
		throw new Error('All custom drop IDs must be greater than 1_000_000_000');
	}
	if (!dropId) dropId = Date.now().toString()

	const finalConfig = {
		uses_per_key: config?.usesPerKey || 1,
		root_account_id: config?.dropRoot,
		usage: {
			auto_delete_drop: config?.usage?.autoDeleteDrop || false,
			auto_withdraw: config?.usage?.autoWithdraw || true,
			permissions: config?.usage?.permissions,
			refund_deposit: config?.usage?.refundDeposit,
		},
		time: config?.time,
	}

	// If there are no publicKeys being passed in, we should generate our own based on the number of keys
	if (!publicKeys) {
		var keys;
		
		// Default root entropy is what is passed in. If there wasn't any, we should check if the funding account contains some.
		const rootEntropyUsed = rootEntropy || fundingAccountDetails?.rootEntropy;
		// If either root entropy was passed into the function or the funder has some set, we should use that.
		if(rootEntropyUsed) {
			// Create an array of size numKeys with increasing strings from 0 -> numKeys - 1. Each element should also contain the dropId infront of the string 
			const nonceDropIdMeta = Array.from({length: numKeys}, (_, i) => `${dropId}_${i}`);
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
			uses: passwordProtectedUses || Array.from({length: numKeys}, (_, i) => i+1)
		})
	}

	/// estimate required deposit
	let requiredDeposit = await estimateRequiredDeposit({
		near,
		depositPerUse: depositPerUseYocto,
		numKeys,
		usesPerKey: finalConfig.uses_per_key,
		attachedGas: parseInt(attachedGas),
		storage: getStorageBase({ nftData, fcData }),
		ftData,
		fcData,
	})

	var hasBalance = false;
	if(useBalance) {
		let userBal = await getUserBalance({accountId: account!.accountId});
		if(userBal < requiredDeposit) {
			throw new Error(`Insufficient balance on Keypom to create drop. Use attached deposit instead.`);
		}

		hasBalance = true;
	}

	if (ftData?.balancePerUse) {
		const metadata = await viewAccount.viewFunction2({
			contractId: ftData.contractId,
			methodName: 'ft_metadata',
		})
		ftData.balancePerUse = parseFTAmount(ftData.balancePerUse, metadata.decimals);
	}

	const deposit = !hasBalance ? requiredDeposit : '0'
	
	let transactions: Transaction[] = []

	transactions.push({
		receiverId,
		signerId: account!.accountId, // We know this is not undefined since getAccount throws
		actions: [{
			type: 'FunctionCall',
			params: {
				methodName: 'create_drop',
				args: {
					drop_id: dropId,
					public_keys: publicKeys || [],
					deposit_per_use: depositPerUseYocto,
					config: finalConfig,
					metadata,
					ft: ftData.contractId ? ({
						contract_id: ftData.contractId,
						sender_id: ftData.senderId,
						balance_per_use: ftData.balancePerUse,
					}) : undefined,
					nft: nftData.contractId ? ({
						contract_id: nftData.contractId,
						sender_id: nftData.senderId,
					}) : undefined,
					fc: fcData?.methods ? ({
						methods: fcData.methods.map((useMethods) => 
							useMethods ? 
							useMethods.map((method) => {
								const ret: any = {}
								ret.receiver_id = method.receiverId;
								ret.method_name = method.methodName;
								ret.args = method.args;
								ret.attached_deposit = method.attachedDeposit;
								ret.account_id_field = method.accountIdField;
								ret.drop_id_field = method.dropIdField;
								return ret
							}) : undefined
						)
					}) : undefined,
					simple: simpleData?.lazyRegister ? ({
						lazy_register: simpleData.lazyRegister,
					}) : undefined,
					passwords_per_use: passwords
				},
				gas,
				deposit,
			}
		}]
	})

	if (ftData.contractId && publicKeys?.length) {
		transactions.push(ftTransferCall({
			account: account!,
			contractId: ftData.contractId,
			args: {
				receiver_id: contractId,
				amount: new BN(ftData.balancePerUse).mul(new BN(publicKeys.length)).toString(),
				msg: dropId.toString(),
			},
			returnTransaction: true
		}) as Transaction)
	}
	
	let tokenIds = nftData?.tokenIds
	if (tokenIds && tokenIds?.length > 0) {
		const nftTXs = await nftTransferCall({
			account: account!,
			contractId: nftData.contractId as string,
			receiverId: contractId,
			tokenIds,
			msg: dropId.toString(),
			returnTransactions: true
		}) as Transaction[]
		transactions = transactions.concat(nftTXs)
	}
	
	let responses = await execute({ transactions, account, wallet })

	return { responses, keys, dropId }
}

/**
 * Delete a set of drops and optionally withdraw any remaining balance you have on the Keypom contract.
 * 
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string[]=} dropIds (OPTIONAL) Specify a set of drop IDs to delete.
 * @param {any} drops (OPTIONAL) If the set of drop information for the drops you want to delete (from getDropInformation) is already known to the client, it can be passed in instead of the drop IDs to reduce computation.
 * @param {boolean=} withdrawBalance (OPTIONAL) Whether or not to withdraw any remaining balance on the Keypom contract.
 * 
 * @example <caption>Create 5 drops and delete each of them</caption>
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
 * // loop to create 5 simple drops each with 5 more keys than the next
 * for(var i = 0; i < 5; i++) {
 * 	// create 10 keys with no entropy (all random)
 * 	const {publicKeys} = await generateKeys({
 * 		numKeys: 5 * (i+1) // First drop will have 5, then 10, then 15 etc..
 * 	});
 * 
 * 	// Create the simple 
 * 	await createDrop({
 * 		publicKeys,
 * 		depositPerUseNEAR: 1,
 * 	});
 * }
 * 
 * let drops = await getDrops({accountId: "benji_demo.testnet"});
 * console.log('drops: ', drops)
 * 
 * await deleteDrops({
 * 	drops
 * })
 * 	
 * 	// Get the number of drops the account has after deletion (should be zero)
 * 	const numDrops = await getDropSupply({
 * 		accountId: "benjiman.testnet"
 * });
 * console.log('numDrops: ', numDrops)
*/
export const deleteDrops = async ({
	account,
	wallet,
	drops,
	dropIds,
	withdrawBalance = true,
}: DeleteDropParams) => {
	const {
		gas300, receiverId, execute, getAccount
	} = getEnv()

	account = getAccount({ account, wallet });

	// If the drop information isn't passed in, we should get it from the drop IDs
	if (!drops) {
		if (!dropIds) {throw new Error('Must pass in either drops or dropIds')};

		// For each drop ID in drop IDs, get the drop information
		drops = await Promise.all(dropIds.map(async (dropId) => {
			getDropInformation({ dropId })
		}));
	}

	const responses = await Promise.all(drops.map(async ({
		drop_id,
		keys,
		registered_uses,
		ft,
		nft,
	}) => {
		let keySupply = keys?.length || 0

		const updateKeys = async () => {
			let keyPromises = [
				(async() => {
					keySupply = await keypomView({
						methodName: 'get_key_supply_for_drop',
						args: {
							drop_id: drop_id.toString(),
						}
					})
				})()
			]
	
			if (!keys) {
				keyPromises.push((async() => {
					keys = await keypomView({
						methodName: 'get_keys_for_drop',
						args: {
							drop_id: drop_id.toString(),
							from_index: '0',
							limit: KEY_LIMIT,
						}
					})
				})())
			}
			
			await Promise.all(keyPromises)
		}
		await updateKeys()

		const responses: Array<void | FinalExecutionOutcome[]> = []

		if (registered_uses !== 0 && (ft !== undefined || nft !== undefined)) {
			responses.push(...(await execute({
				account, 
				wallet,
				transactions: [{
					receiverId,
					actions: [{
						type: 'FunctionCall',
						params: {
							methodName: 'refund_assets',
							args: {
								drop_id,
							},
							gas: gas300,
						}
					}],
				}]
			})))
		}

		const deleteKeys = async () => {
			responses.push(...(await execute({
				account,
				wallet,
				transactions: [{
					receiverId,
					actions: [{
						type: 'FunctionCall',
						params: {
							methodName: 'delete_keys',
							args: {
								drop_id,
								public_keys: keys.map(key2str),
							},
							gas: gas300,
						}
					}],
				}]
			})))

			if (keySupply > keys.length) {
				await updateKeys()
				await deleteKeys()
			}
		}
		await deleteKeys()

		if (withdrawBalance) {
			responses.push(...(await execute({
				account,
				wallet,
				transactions: [{
					receiverId,
					actions: [{
						type: 'FunctionCall',
						params: {
							methodName: 'withdraw_from_balance',
							args: {},
							gas: '50000000000000',
						}
					}],
				}]
			})))
		}

		return responses
	}))

	return responses
}

// TODO: add register & unregister uses