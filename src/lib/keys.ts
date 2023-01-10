import * as nearAPI from "near-api-js";
import BN from 'bn.js'
const {
	utils: {
		format: { parseNearAmount },
	},
} = nearAPI;

import { getEnv } from "./keypom";
import {
	key2str,
	estimateRequiredDeposit,
	execute as _execute,
	ftTransferCall,
	nftTransferCall,
	generateKeys,
	getUserBalance,
} from "./keypom-utils";
import { AddKeyParams } from "./types";
import { getDropInformation } from "./drops";

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
 * @param {boolean=} useBalance (OPTIONAL) If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw.
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
	useBalance = false,
}: AddKeyParams) => {
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
			const nonceDropIdMeta = Array.from({length: numKeys}, (_, i) => `${drop_id}:${next_key_id + i}`);
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
	let requiredDeposit = await estimateRequiredDeposit({
		near,
		depositPerUse: deposit_per_use,
		numKeys,
		usesPerKey: uses_per_key,
		attachedGas: required_gas,
		storage: parseNearAmount('0.2') as string,
		ftData,
	})

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
					drop_id: drop.drop_id,
					public_keys: publicKeys,
				},
				gas,
				deposit: !hasBalance ? requiredDeposit : undefined,
			}
		}]
	})

	if (ftData.contract_id) {
		console.log('ftData.balance_per_use: ', ftData.balance_per_use)
		console.log('numKeys: ', numKeys)
		console.log('registered_uses: ', registered_uses)
		console.log('numKeys - registered_uses: ', numKeys - registered_uses)

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

	return responses
}

export const deleteKeys = async ({
	account,
	wallet,
	drop,
	keys,
	withdrawBalance = false,
}) => {

	const {
		receiverId, execute,
	} = getEnv()

	const { drop_id, registered_uses } = drop
	if (!keys) keys = drop.keys

	const actions: any[] = []
	if ((drop.ft || drop.nft) && registered_uses > 0) {
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
	actions.push({
		type: 'FunctionCall',
		params: {
			methodName: 'delete_keys',
			args: {
				drop_id,
				public_keys: keys.map(key2str),
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