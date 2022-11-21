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
} from "./keypom-utils";

export const addKeys = async ({
	account,
	wallet,
	drop,
	publicKeys,
	nftTokenIds,
	hasBalance,
}) => {

	const {
		near, fundingAccount, fundingKey,
		gas, attachedGas, contractId, receiverId, getAccount, execute,
	} = getEnv()

	const numKeys = publicKeys.length

	const {
		drop_id,
		registered_uses,
		required_gas,
		deposit_per_use,
		config: { uses_per_key },
		drop_type: {
			ft: ftData = {},
			nft: nftData = {}
		}
	} = drop

	let requiredDeposit = await estimateRequiredDeposit({
		near,
		depositPerUse: deposit_per_use,
		numKeys,
		usesPerKey: uses_per_key,
		attachedGas: required_gas,
		storage: parseNearAmount('0.01') as string,
		ftData,
	})

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
		transactions.push(ftTransferCall({
			account: getAccount({ account, wallet }),
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
			account: getAccount({ account, wallet }),
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
		near, fundingAccount, fundingKey,
		gas, attachedGas, contractId, receiverId, getAccount, execute,
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