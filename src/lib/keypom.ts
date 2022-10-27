import * as nearAPI from "near-api-js";
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
const claimGas = '100000000000000'
const networks = {
	mainnet: {
		networkId: 'mainnet',
		nodeUrl: 'https://rpc.mainnet.near.org',
		walletUrl: 'https://wallet.near.org',
		helperUrl: 'https://helper.mainnet.near.org'
	},
	testnet: {
		networkId: 'testnet',
		nodeUrl: 'https://rpc.testnet.near.org',
		walletUrl: 'https://wallet.testnet.near.org',
		helperUrl: 'https://helper.testnet.near.org'
	}
}

let contractId = 'v1.keypom.testnet'
let receiverId = 'v1.keypom.testnet'

let near, connection, logger, fundingAccount, fundingKey;

const execute = async (args) => _execute({ ...args, fundingAccount })

export const initKeypom = async ({
	network,
	funder,
}: InitKeypomParams) => {
	const networkConfig = typeof network === 'string' ? networks[network] : network
	const keyStore = new BrowserLocalStorageKeyStore()

	near = new Near({
		...networkConfig,
		deps: { keyStore },
	});
	connection = near.connection;

	const { networkId } = networkConfig
	if (networkId === 'mainnet') {
		contractId = 'v1.keypom.near'
		receiverId = 'v1.keypom.near'
	}

	if (funder) {
		let { accountId, secretKey, seedPhrase } = funder
		if (seedPhrase) {
			secretKey = parseSeedPhrase(seedPhrase).secretKey
		}
		fundingKey = KeyPair.fromString(secretKey)
		keyStore.setKey(networkConfig.networkId, accountId, fundingKey)
		fundingAccount = new Account(connection, accountId)
		fundingAccount.viewFunction2 = ({ contractId, methodName, args }) => fundingAccount.viewFunction(contractId, methodName, args)
		fundingAccount.fundingKey = fundingKey
		return fundingAccount
	}

	/// TODO default view account when no funder specified

	return null
}

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
	ftData,
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
		attachedGas: '1',
		storage: parseNearAmount('0.00866'),
	})

	const transactions: any[] = [{
		receiverId: 'v1.keypom.testnet',
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
					ftData,
					nftData,
					fcData,
				},
				gas,
				deposit: requiredDeposit,
			}
		}]
	}]

	const responses = await execute({ transactions, account, wallet })

	return { responses, keyPairs }
}

export const addKeys = async ({
	account,
	wallet,
	dropId,
	publicKeys
}) => {

	const requiredDeposit = parseNearAmount((0.03 * publicKeys.length).toString())

	const transactions: any[] = [{
		receiverId: 'v1.keypom.testnet',
		actions: [{
			type: 'FunctionCall',
			params: {
				methodName: 'add_keys',
				args: {
					drop_id: dropId,
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

	const drops = await fundingAccount.viewFunction2({
		contractId,
		methodName: 'get_drops_for_owner',
		args: {
			account_id: accountId,
		},
	})

	await Promise.all(drops.map(async (drop, i) => {
		const { drop_id } = drop
		drop.keys = await fundingAccount.viewFunction2({
			contractId,
			methodName: 'get_keys_for_drop',
			args: {
				drop_id: drop_id
			}
		})
	}))

	return drops
}

export const claim = ({
	account,
	wallet,
	receiverId,
}) => {

	const transactions: any[] = [{
		receiverId: 'v1.keypom.testnet',
		actions: [{
			type: 'FunctionCall',
			params: {
				methodName: 'claim',
				args: {
					receiver_id: receiverId
				},
				gas: claimGas,
			}
		}]
	}]

	return execute({ transactions, account, wallet })
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

	const responses = await Promise.all(drops.map(async ({ drop_id, drop_type, keys }) => {

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
	}))

	return responses
}
