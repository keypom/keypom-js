import { accountMappingContract, getEnv, getPubFromSecret, supportedKeypomContracts, trialCallMethod, updateKeypomContractId } from "@keypom/core";
import { parseNearAmount } from "@near-js/utils";
import { BN } from "bn.js";

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

export const getAccountFromMap = async (secretKey) => {
	const {viewCall} = getEnv();
	let pk = getPubFromSecret(secretKey);

	const accountId = await viewCall({
		contractId: accountMappingContract[getEnv().networkId!],
		methodName: 'get_account_id',
		args: {pk}
	})
	console.log('accountId found from map: ', accountId)
	
	return accountId
}

export const addUserToMappingContract = async (accountId, secretKey) => {
	const accountIdFromMapping = await getAccountFromMap(secretKey);

	if (accountIdFromMapping !== accountId) {
		console.log(`No Account ID found from mapping contract: ${JSON.stringify(accountIdFromMapping)} Adding now.`);
		trialCallMethod({
			trialAccountId: accountId,
			trialAccountSecretKey: secretKey,
			contractId: accountMappingContract[getEnv().networkId!],
			methodName: 'set',
			args: {},
			attachedDeposit: parseNearAmount('0.002')!,
			attachedGas: '10000000000000'
		});
	}

	return accountIdFromMapping !== accountId
}

const isValidKeypomContract = (keypomContractId: string) => {
    const { networkId } = getEnv();
    return supportedKeypomContracts[networkId!][keypomContractId] !== undefined;
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
