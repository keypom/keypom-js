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
	parseFTAmount,
} from "./keypom-utils";
import { Transaction, FinalExecutionOutcome } from "@near-wallet-selector/core";

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
	hasBalance = false,
}: CreateDropParams) => {

	const {
		near, viewAccount,
		gas, attachedGas, contractId, receiverId, getAccount, execute,
	} = getEnv()

	account = getAccount({ account, wallet })

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

	// TODO Update
	const finalConfig = {
		uses_per_key: config.usesPerKey || 1,
		usage: {
			auto_delete_drop: config?.usage?.autoDeleteDrop || false,
			auto_withdraw: config?.usage?.autoWithdraw || true,
		}
		// start_timestamp: config.startTimestamp,
		// throttle_timestamp: config.throttleTimestamp,
		// on_claim_refund_deposit: config.onClaimRefundDeposit,
		// claim_permission: config.claimPermission,
		// drop_root: config.dropRoot,
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
		signerId: account.accountId,
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
				deposit,
			}
		}]
	})

	if (ftData.contractId && publicKeys?.length) {
		transactions.push(ftTransferCall({
			account,
			contractId: ftData.contractId,
			args: {
				receiver_id: contractId,
				amount: new BN(ftData.balancePerUse).mul(new BN(publicKeys.length)).toString(),
				msg: dropId.toString(),
			},
			returnTransaction: true
		}) as Transaction)
	}
	
	const { tokenIds } = nftData
	if (tokenIds && tokenIds?.length > 0) {
		const nftTXs = await nftTransferCall({
			account,
			contractId: nftData.contractId as string,
			receiverId: contractId,
			tokenIds,
			msg: dropId.toString(),
			returnTransactions: true
		}) as Transaction[]
		transactions = transactions.concat(nftTXs)
	}
	
	let responses = await execute({ transactions, account, wallet })

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

	const responses = await Promise.all(drops.map(async ({
		drop_id,
		keys,
		registered_uses,
		ft,
		nft,
	}) => {

		const responses: Array<void | FinalExecutionOutcome[]> = []

		if (registered_uses !== 0 && (ft !== undefined || nft !== undefined)) {
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