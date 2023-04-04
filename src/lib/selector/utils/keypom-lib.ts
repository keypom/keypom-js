import * as nearAPI from "near-api-js";
const {
	Near,
	KeyPair,
	keyStores: { BrowserLocalStorageKeyStore },
	transactions: { addKey, deleteKey, functionCallAccessKey },
	utils,
	transactions: nearTransactions,
	utils: {
		PublicKey,
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;


import { BN } from "bn.js";
import { updateKeypomContractId } from "../../keypom";
import { getKeyInformation } from "../../views";
import { isValidKeypomContract } from "../../checks";

const gas = '200000000000000'

export const networks = {
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

export const KEYPOM_LOCAL_STORAGE_KEY = 'keypom-wallet-selector';

export const getLocalStorageKeypomEnv = () => {
	const localStorageDataJson = localStorage.getItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
	return localStorageDataJson;
}

export const setLocalStorageKeypomEnv = (jsonData) => {
	const dataToWrite = JSON.stringify(jsonData);
	console.log('dataToWrite: ', dataToWrite)

	localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`, dataToWrite);
}

export const isKeypomDrop = (networkId, keypomContractId) => {
	if (isValidKeypomContract(keypomContractId) === true) {
		updateKeypomContractId({
			keypomContractId
		})

		return true;
	}

	return false;
}

export const isUnclaimedTrialDrop = async (networkId, keypomContractId, secretKey) => {
	console.log('accountId is valid keypom contract ', keypomContractId)
	const keyInfo = await getKeyInformation({
		secretKey
	})
	console.log('keyInfo: ', keyInfo)

	if (keyInfo !== null) {
		return true;
	}

	return false;
}