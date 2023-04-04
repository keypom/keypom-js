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

export const updateKeypomContractIfValid = (keypomContractId) => {
	if (isValidKeypomContract(keypomContractId) === true) {
		updateKeypomContractId({
			keypomContractId
		})

		return true;
	}

	return false;
}
