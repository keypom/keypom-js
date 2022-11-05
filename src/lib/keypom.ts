import * as nearAPI from "near-api-js";
const {
	Near,
	Account,
	KeyPair,
	keyStores: { BrowserLocalStorageKeyStore },
} = nearAPI;

import { InitKeypomParams } from "./types";
import { parseSeedPhrase } from 'near-seed-phrase'
import {
	execute as _execute,
} from "./keypom-utils";

const gas = '300000000000000'
const gas200 = '200000000000000'
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

export const getEnv = () => ({
	near, connection, keyStore, logger, networkId, fundingAccount, contractAccount, viewAccount, fundingKey,
	gas, gas200, attachedGas, contractId, receiverId, getAccount, execute,
})

export const execute = async (args) => _execute({ ...args, fundingAccount })

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


