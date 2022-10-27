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

let contractId = 'v1.keypom.testnet'
let receiverId = contractId

let near, connection, keyStore, logger, networkId, fundingAccount, contractAccount, viewAccount, fundingKey;

const execute = async (args) => _execute({ ...args, fundingAccount })

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
		attachedGas,
		storage: parseNearAmount('0.00866'),
	})

	const transactions: any[] = [{
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
	drop,
	publicKeys
}) => {

	const { required_gas, deposit_per_use, config: { uses_per_key } } = drop

	let requiredDeposit = await estimateRequiredDeposit({
		near,
		depositPerUse: deposit_per_use,
		numKeys: publicKeys.length,
		usesPerKey: uses_per_key,
		attachedGas: required_gas,
		storage: '0',
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

export const claim = ({
	secretKey,
	accountId,
}) => {

	const keyPair = KeyPair.fromString(secretKey)
	keyStore.setKey(networkId, contractId, keyPair)

	const transactions: any[] = [{
		receiverId,
		actions: [{
			type: 'FunctionCall',
			params: {
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


export const createAccountAndClaim = ({
	newAccountId,
	newPublicKey, 
	secretKey,
}) => {

	const keyPair = KeyPair.fromString(secretKey)
	keyStore.setKey(networkId, contractId, keyPair)

	const transactions: any[] = [{
		receiverId,
		actions: [{
			type: 'FunctionCall',
			params: {
				methodName: 'create_account_and_claim',
				args: {
					new_account_id: newAccountId,
					new_public_key: newPublicKey,
				},
				gas: attachedGas,
			}
		}]
	}]

	return execute({ transactions, account: contractAccount })
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
