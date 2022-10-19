import * as nearAPI from "near-api-js";
const {
	Near,
	Account,
	KeyPair,
	keyStores: { BrowserLocalStorageKeyStore },
	utils,
	transactions: nearTransactions,
	utils: {
		PublicKey,
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;
import { parseSeedPhrase } from 'near-seed-phrase'
import { BN } from "bn.js";
import { AddKeyPermission, Action } from "@near-wallet-selector/core";
const gas = '200000000000000'

import { genKey, estimateRequiredDeposit } from "./keypom-utils";

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

import { InitKeypomParams, CreateDropParams } from "./types";

let near, connection, logger, fundingAccount, fundingKey;

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
		fundingAccount.signAndSendTransactions = async (transactions) => await Promise.all(transactions.map((tx) => fundingAccount.signAndSendTransaction(tx)))

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
		attachedGas: '1',
		storage: parseNearAmount('0.00866'),
	})

	const transactions = [{
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
				gas: '300000000000000',
				deposit: requiredDeposit,
			}
		}]
	}]

	/// self funding
	if (fundingAccount) {
		const responses = await fundingAccount.signAndSendTransactions(await transformTransactions(transactions))
		return { responses, keyPairs }
	}

	if (wallet) {

		const responses = await wallet.signAndSendTransactions({
			transactions: [{
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
						gas: '300000000000000',
						deposit: requiredDeposit,
					}
				}]
			}]
		})

		return { responses, keyPairs }
	}
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

export const deleteDrops = async ({ drops }) => {

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
					public_keys: keys.map(({ pk }) => pk),
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

		return fundingAccount.signAndSendTransactions(await transformTransactions([{
			receiverId,
			actions
		}]))

	}))

	return responses
}


const transformTransactions = async (transactions) => {
	const { provider } = fundingAccount.connection;

	return Promise.all(
		transactions.map(async (transaction, index) => {
			const actions = transaction.actions.map((action) =>
				createAction(action)
			);

			const block = await provider.block({ finality: "final" });

			return nearTransactions.createTransaction(
				fundingAccount.accountId,
				fundingKey.publicKey,
				transaction.receiverId,
				fundingKey.publicKey.nonce + index + 1,
				actions,
				utils.serialize.base_decode(block.header.hash)
			);
		})
	);
};


const createAction = (action) => {
	switch (action.type) {
		case "CreateAccount":
			return nearTransactions.createAccount();
		case "DeployContract": {
			const { code } = action.params;

			return nearTransactions.deployContract(code);
		}
		case "FunctionCall": {
			const { methodName, args, gas, deposit } = action.params;

			return nearTransactions.functionCall(
				methodName,
				args,
				new BN(gas),
				new BN(deposit)
			);
		}
		case "Transfer": {
			const { deposit } = action.params;

			return nearTransactions.transfer(new BN(deposit));
		}
		case "Stake": {
			const { stake, publicKey } = action.params;

			return nearTransactions.stake(new BN(stake), utils.PublicKey.from(publicKey));
		}
		case "AddKey": {
			const { publicKey, accessKey } = action.params;

			// return nearTransactions.addKey(
			// 	utils.PublicKey.from(publicKey),
			// 	// TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
			// 	getAccessKey(accessKey.permission)
			// );
		}
		case "DeleteKey": {
			const { publicKey } = action.params;

			return nearTransactions.deleteKey(utils.PublicKey.from(publicKey));
		}
		case "DeleteAccount": {
			const { beneficiaryId } = action.params;

			return nearTransactions.deleteAccount(beneficiaryId);
		}
		default:
			throw new Error("Invalid action type");
	}
};