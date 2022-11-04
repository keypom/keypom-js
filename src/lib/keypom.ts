import * as nearAPI from "near-api-js";
import BN from 'bn.js'
const {
	Near,
	Account,
	KeyPair,
	keyStores: { BrowserLocalStorageKeyStore },
	utils: {
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

import { InitKeypomParams, CreateDropParams } from "./types";
import { parseSeedPhrase } from 'near-seed-phrase'
import { key2str, genKey, estimateRequiredDeposit, execute as _execute } from "./keypom-utils";

const gas = '300000000000000'
const attachedGas = '100000000000000'
const networks = {
	mainnet: {
		networkId: 'mainnet',
		viewAccountId: 'near',
		nodeUrl: 'https://rpc.mainnet.near.org',
		walletUrl: 'https://wallet.near.org',
		helperUrl: 'https://helper.mainnet.near.org'
	},
	testnet: {
		networkId: 'testnet',
		viewAccountId: 'testnet',
		nodeUrl: 'https://rpc.testnet.near.org',
		walletUrl: 'https://wallet.testnet.near.org',
		helperUrl: 'https://helper.testnet.near.org'
	}
}

/// for testing
const FT_CONTRACT_ID = 'ft.keypom.testnet'

let contractId = 'v1.keypom.testnet'
let receiverId = contractId

let near, connection, keyStore, logger, networkId, fundingAccount, contractAccount, viewAccount, fundingKey;

export const getEnv = () => ({
	near, connection, keyStore, logger, networkId, fundingAccount, contractAccount, viewAccount, fundingKey
})

const execute = async (args) => _execute({ ...args, fundingAccount })
const getAccount = ({ account, wallet }) => account || wallet || fundingAccount

export const initKeypom = async ({
	network,
	funder,
}: InitKeypomParams) => {
	const networkConfig = typeof network === 'string' ? networks[network] : network
	keyStore = new BrowserLocalStorageKeyStore()

	near = new Near({
		...networkConfig,
		deps: { keyStore },
	});
	connection = near.connection;

	networkId = networkConfig.networkId
	if (networkId === 'mainnet') {
		contractId = 'v1.keypom.near'
		receiverId = 'v1.keypom.near'
	}

	viewAccount = new Account(connection, networks[networkId].viewAccountId)
	viewAccount.viewFunction2 = ({ contractId, methodName, args }) => viewAccount.viewFunction(contractId, methodName, args)

	contractAccount = new Account(connection, contractId)
	if (funder) {
		let { accountId, secretKey, seedPhrase } = funder
		if (seedPhrase) {
			secretKey = parseSeedPhrase(seedPhrase).secretKey
		}
		fundingKey = KeyPair.fromString(secretKey)
		keyStore.setKey(networkId, accountId, fundingKey)
		fundingAccount = new Account(connection, accountId)
		fundingAccount.fundingKey = fundingKey
		return fundingAccount
	}

	return null
}



/// DROP CREATION



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
	nftData,
	fcData,
}: CreateDropParams) => {

	/// parse args
	if (depositPerUseNEAR) {
		depositPerUseYocto = parseNearAmount(depositPerUseNEAR.toString()) || '0'
	}
	if (!depositPerUseYocto) depositPerUseYocto = '0'
	if (!dropId) dropId = Date.now().toString()
	/// key generation
	let keyPairs: any[] = [], pubKeys = publicKeys || [];
	if (numKeys) {
		pubKeys = []
		for (var i = 0; i < numKeys; i++) {
			const keyPair = await genKey(fundingAccount ? fundingKey.secretKey : accountRootKey, dropId, i)
			keyPairs.push(keyPair)
			pubKeys.push(keyPair.getPublicKey().toString());
		}
	}

	const finalConfig = {
		uses_per_key: config.usesPerKey || 1,
		delete_on_empty: config.usesPerKey || true,
		auto_withdraw: config.usesPerKey || true,
		start_timestamp: config.usesPerKey,
		throttle_timestamp: config.usesPerKey,
		on_claim_refund_deposit: config.usesPerKey,
		claim_permission: config.usesPerKey,
		drop_root: config.usesPerKey,
	}

	/// estimate required deposit
	let requiredDeposit = await estimateRequiredDeposit({
		near,
		depositPerUse: depositPerUseYocto,
		numKeys,
		usesPerKey: finalConfig.uses_per_key,
		attachedGas,
		storage: parseNearAmount('0.00866'),
		ftData,
		fcData,
	})

	const activeAccount = getAccount({ account, wallet })

	const transactions: any[] = []
	if (ftData.contractId) {

		const storageDeposit = await viewAccount.viewFunction2({
			contractId: ftData.contractId,
			methodName: 'storage_balance_of',
			args: {
				account_id: activeAccount.accountId,
			}
		})

		if (!storageDeposit) {
			transactions.push({
				receiverId: ftData.contractId,
				actions: [{
					type: 'FunctionCall',
					params: {
						methodName: 'storage_deposit',
						args: {
							account_id: activeAccount.accountId,
						},
						gas: '100000000000000',
						deposit: parseNearAmount('0.1')
					}
				}]
			})
		}

		if (ftData.contractId === FT_CONTRACT_ID) {
			transactions.push({
				receiverId: ftData.contractId,
				actions: [{
					type: 'FunctionCall',
					params: {
						methodName: 'ft_mint',
						args: {
							account_id: activeAccount.accountId,
							amount: parseNearAmount('10')
						},
						gas: '100000000000000',
					}
				}]
			})
		}
	}

	transactions.push({
		receiverId,
		actions: [{
			type: 'FunctionCall',
			params: {
				methodName: 'create_drop',
				args: {
					drop_id: dropId,
					public_keys: pubKeys,
					deposit_per_use: depositPerUseYocto,
					config: finalConfig,
					metadata,
					ft_data: ftData.contractId ? ({
						contract_id: ftData.contractId,
						sender_id: ftData.senderId,
						balance_per_use: ftData.balancePerUse,
					}) : undefined,
					nft_data: null,
					fc_data: null,
				},
				gas,
				deposit: requiredDeposit,
			}
		}]
	})

	if (ftData.contractId) {
		transactions.push({
			receiverId: ftData.contractId,
			actions: [{
				type: 'FunctionCall',
				params: {
					methodName: 'ft_transfer_call',
					args: {
						receiver_id: contractId,
						amount: new BN(ftData.balancePerUse).mul(new BN(numKeys || '1')).toString(),
						msg: dropId.toString(),
					},
					gas: '50000000000000',
					deposit: '1',
				}
			}]
		})
	}

	const responses = await execute({ transactions, account, wallet })

	return { responses, keyPairs }
}



/// DROP ADMIN



export const addKeys = async ({
	account,
	wallet,
	drop,
	publicKeys
}) => {

	const {
		required_gas,
		deposit_per_use,
		config: { uses_per_key },
		ft_data = {}
	} = drop

	let requiredDeposit = await estimateRequiredDeposit({
		near,
		depositPerUse: deposit_per_use,
		numKeys: publicKeys.length,
		usesPerKey: uses_per_key,
		attachedGas: required_gas,
		storage: parseNearAmount('0.01'),
		ftData: ft_data,
		fcData: null,
	})

	console.log('requiredDeposit', formatNearAmount(requiredDeposit, 4))

	const transactions: any[] = [{
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
				deposit: requiredDeposit,
			}
		}]
	}]

	return execute({ transactions, account, wallet })
}

export const getDrops = async ({ accountId }) => {

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

export const deleteKeys = async ({
	account,
	wallet,
	drop,
	keys
}) => {

	const { drop_id, drop_type } = drop

	const actions: any[] = []
	if (drop_type.FungibleToken || drop_type.NonFungibleToken) {
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
	}, {
		type: 'FunctionCall',
		params: {
			methodName: 'withdraw_from_balance',
			args: {},
			gas: '100000000000000',
		}
	})

	const transactions: any[] = [{
		receiverId,
		actions,
	}]

	return execute({ transactions, account, wallet })
}

export const deleteDrops = async ({
	account,
	wallet,
	drops
}) => {

	const responses = await Promise.all(drops.map(async ({ drop_id, drop_type, keys, registered_uses }) => {

		const actions: any[] = []
		if (registered_uses !== 0 && (drop_type.FungibleToken || drop_type.NonFungibleToken)) {
			actions.push({
				type: 'FunctionCall',
				params: {
					methodName: 'refund_assets',
					args: {
						drop_id,
					},
					gas: '50000000000000',
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
				gas: '200000000000000',
			}
		}, {
			type: 'FunctionCall',
			params: {
				methodName: 'withdraw_from_balance',
				args: {},
				gas: '50000000000000',
			}
		})

		const transactions: any[] = [{
			receiverId,
			actions,
		}]

		return execute({ transactions, account, wallet })
	}))

	return responses
}



/// DROP CLAIMING



export const claim = ({
	secretKey,
	accountId,
	newAccountId,
	newPublicKey, 
}) => {

	const keyPair = KeyPair.fromString(secretKey)
	keyStore.setKey(networkId, contractId, keyPair)

	const transactions: any[] = [{
		receiverId,
		actions: [{
			type: 'FunctionCall',
			params: newAccountId ? 
			{
				methodName: 'create_account_and_claim',
				args: {
					new_account_id: newAccountId,
					new_public_key: newPublicKey,
				},
				gas: attachedGas,
			}
			:
			{
				methodName: 'claim',
				args: {
					account_id: accountId
				},
				gas: attachedGas,
			}
		}]
	}]

	return execute({ transactions, account: contractAccount })
}
