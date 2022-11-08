import * as nearAPI from "near-api-js";
import BN from 'bn.js'
const {
	utils: {
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

import { CreateDropParams } from "./types";
import { getEnv } from "./keypom";
import {
	genKey,
	key2str,
	estimateRequiredDeposit,
	ftTransferCall,
	nftTransferCall,
	getStorageBase,
} from "./keypom-utils";
import { FinalExecutionOutcome } from "@near-wallet-selector/core";

export const createDrop = async ({
	account,
	wallet,
	accountRootKey,
	dropId,
	publicKeys,
	numKeys,
	depositPerUseNEAR,
	depositPerUseYocto,
	metadata,
	config = {},
	ftData = {},
	nftData = {},
	fcData,
}: CreateDropParams) => {

	const {
		near, fundingAccount, fundingKey,
		gas, attachedGas, contractId, receiverId, getAccount, execute,
	} = getEnv()

	/// parse args
	if (depositPerUseNEAR) {
		depositPerUseYocto = parseNearAmount(depositPerUseNEAR.toString()) || '0'
	}
	if (!depositPerUseYocto) depositPerUseYocto = '0'
	if (!dropId) dropId = Date.now().toString()

	/// key generation
	// let keyPairs: any[] = [], pubKeys = publicKeys || [];
	// numKeys = numKeys || pubKeys.length
	// if (numKeys) {
	// 	pubKeys = []
	// 	for (var i = 0; i < numKeys; i++) {
	// 		// @ts-ignore
	// 		// Not sure why KeyPair doesn't expose secret key param
	// 		const keyPair = await genKey((fundingAccount ? fundingKey.secretKey : accountRootKey) as string, dropId, i)
	// 		keyPairs.push(keyPair)
	// 		pubKeys.push(keyPair.getPublicKey().toString());
	// 	}
	// }

	const finalConfig = {
		uses_per_key: config.usesPerKey || 1,
		delete_on_empty: config.deleteOnEmpty || true,
		auto_withdraw: config.autoWithdraw || true,
		start_timestamp: config.startTimestamp,
		throttle_timestamp: config.throttleTimestamp,
		on_claim_refund_deposit: config.onClaimRefundDeposit,
		claim_permission: config.claimPermission,
		drop_root: config.dropRoot,
	}

	/// estimate required deposit
	let requiredDeposit = await estimateRequiredDeposit({
		near,
		depositPerUse: depositPerUseYocto,
		numKeys: publicKeys?.length || 1,
		usesPerKey: finalConfig.uses_per_key,
		attachedGas: parseInt(attachedGas),
		storage: getStorageBase({ nftData, fcData }),
		ftData,
		fcData,
	})

	console.log('requiredDeposit', formatNearAmount(requiredDeposit.toString()))

	const transactions: any[] = []

	transactions.push({
		receiverId,
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
					ft_data: ftData.contractId ? ({
						contract_id: ftData.contractId,
						sender_id: ftData.senderId,
						balance_per_use: ftData.balancePerUse,
					}) : undefined,
					nft_data: nftData.contractId ? ({
						contract_id: nftData.contractId,
						sender_id: nftData.senderId,
					}) : undefined,
					fc_data: fcData?.methods ? ({
						methods: fcData.methods.map((useMethods) => useMethods.map((method) => {
							const ret: any = {}
							ret.receiver_id = method.receiverId;
							ret.method_name = method.methodName;
							ret.args = method.args;
							ret.attached_deposit = method.attachedDeposit;
							ret.account_id_field = method.accountIdField;
							ret.drop_id_field = method.dropIdField;
							return ret
						}))
					}) : undefined,
				},
				gas,
				deposit: requiredDeposit,
			}
		}]
	})

	if (ftData.contractId && numKeys) {
		transactions.push(ftTransferCall({
			account: getAccount({ account, wallet }),
			contractId: ftData.contractId,
			args: {
				receiver_id: contractId,
				amount: new BN(ftData.balancePerUse).mul(new BN(numKeys)).toString(),
				msg: dropId.toString(),
			},
			returnTransaction: true
		}))
	}

	let responses = await execute({ transactions, account, wallet })

	const { tokenIds } = nftData
	if (tokenIds && tokenIds?.length > 0) {
		const nftResponses = await nftTransferCall({
			account: getAccount({ account, wallet }),
			contractId: nftData.contractId as string,
			receiverId: contractId,
			tokenIds,
			msg: dropId.toString(),
		})
		responses = responses.concat(nftResponses)
	}

	return { responses }
}

export const getDrops = async ({ accountId }) => {

	const {
		fundingAccount, viewAccount, contractId,
	} = getEnv()

	if (!fundingAccount) return null

	const drops = await viewAccount.viewFunction2({
		contractId,
		methodName: 'get_drops_for_owner',
		args: {
			account_id: accountId,
		},
	})

	await Promise.all(drops.map(async (drop, i) => {
		const { drop_id } = drop
		drop.keys = await viewAccount.viewFunction2({
			contractId,
			methodName: 'get_keys_for_drop',
			args: {
				drop_id: drop_id
			}
		})
	}))

	return drops
}

export const deleteDrops = async ({
	account,
	wallet,
	drops,
	withdrawBalance = true,
}) => {

	const {
		gas, gas300, receiverId, execute,
	} = getEnv()

	const responses = await Promise.all(drops.map(async ({ drop_id, drop_type, keys, registered_uses }) => {

		const responses: Array<void | FinalExecutionOutcome[]> = []

		if (registered_uses !== 0 && (drop_type.FungibleToken || drop_type.NonFungibleToken)) {
			responses.push(...(await execute({
				account, wallet,
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

		const actions: any[] = []

		actions.push({
			type: 'FunctionCall',
			params: {
				methodName: 'delete_keys',
				args: {
					drop_id,
					public_keys: keys.map(key2str),
				},
				gas,
			}
		})

		if (withdrawBalance) {
			actions.push({
				type: 'FunctionCall',
				params: {
					methodName: 'withdraw_from_balance',
					args: {},
					gas: '50000000000000',
				}
			})
		}

		const transactions: any[] = [{
			receiverId,
			actions,
		}]

		responses.push(...(await execute({ transactions, account, wallet })))

		return responses
	}))

	return responses
}