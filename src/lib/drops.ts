import * as nearAPI from "near-api-js";
import BN from 'bn.js'
const {
	utils: {
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

import { CreateDropParams, FTData, NFTData } from "./types";
import { getEnv } from "./keypom";
import {
	generateKeys,
	key2str,
	estimateRequiredDeposit,
	ftTransferCall,
	nftTransferCall,
	getStorageBase,
	parseFTAmount,
} from "./keypom-utils";
import { Transaction, FinalExecutionOutcome } from "@near-wallet-selector/core";

/**
 * Creates a new drop based on parameters passed in.
 * 
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string=} dropId (OPTIONAL) Specify a custom drop ID rather than using the incrementing nonce on the contract.
 * @param {string[]=} publicKeys (OPTIONAL) Add a set of publicKeys to the drop when it is created. If not specified, the drop will be empty.
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
export const createDrop = async ({
	account,
	wallet,
	dropId,
	publicKeys,
	depositPerUseNEAR,
	depositPerUseYocto,
	metadata,
	config = {},
	ftData = {},
	nftData = {},
	simpleData = {},
	fcData,
	hasBalance = false,
}: CreateDropParams) => {
	const {
		near, viewAccount,
		gas, attachedGas, contractId, receiverId, getAccount, execute, fundingAccount
	} = getEnv()

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
		signerId: account ? account?.accountId : fundingAccount.accountId,
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
					simple: simpleData?.lazyRegister ? ({
						lazy_register: simpleData.lazyRegister,
					}) : undefined,
				},
				gas,
				deposit,
			}
		}]
	})

	if (ftData.contractId && publicKeys?.length) {
		transactions.push(ftTransferCall({
			account: account || fundingAccount,
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
			account: account || fundingAccount,
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
		viewAccount, contractId,
	} = getEnv()

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
export const getDropInformation = async ({ dropId } : {dropId: string}) => {
	const {
		viewAccount, contractId,
	} = getEnv()

	const dropInfo = await viewAccount.viewFunction2({
		contractId,
		methodName: 'get_drop_information',
		args: {
			drop_id: dropId,
		},
	})

	return dropInfo
}

/**
 * Delete a set of drops and optionally withdraw any remaining balance you have on the Keypom contract.
 * 
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * 
*/
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