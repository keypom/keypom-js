import { accountMappingContract, getEnv, getPubFromSecret, supportedKeypomContracts, trialCallMethod, updateKeypomContractId } from '@keypom/core';
import { parseNearAmount } from '@near-js/utils';
import { InstantSignInSpecs, TrialSignInSpecs } from '../core/types';

export const KEYPOM_LOCAL_STORAGE_KEY = 'keypom-wallet-selector';

export const getLocalStorageKeypomEnv = () => {
    const localStorageDataJson = localStorage.getItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`);
    return localStorageDataJson;
};

export const setLocalStorageKeypomEnv = (jsonData) => {
    const dataToWrite = JSON.stringify(jsonData);
    console.log('dataToWrite: ', dataToWrite);

    localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`, dataToWrite);
};

export const getAccountFromMap = async (secretKey) => {
    const {viewCall} = getEnv();
    const pk = getPubFromSecret(secretKey);

    const accountId = await viewCall({
        contractId: accountMappingContract[getEnv().networkId!],
        methodName: 'get_account_id',
        args: {pk}
    });
    console.log('accountId found from map: ', accountId);
	
    return accountId;
};

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

    return accountIdFromMapping !== accountId;
};

const isValidKeypomContract = (keypomContractId: string) => {
    const { networkId } = getEnv();
    return supportedKeypomContracts[networkId!][keypomContractId] !== undefined;
};

export const updateKeypomContractIfValid = (keypomContractId) => {
    if (isValidKeypomContract(keypomContractId) === true) {
        updateKeypomContractId({
            keypomContractId
        });

        return true;
    }

    return false;
};

export const parseTrialUrl = (trialSpecs: TrialSignInSpecs) => {
    const {baseUrl, delimiter} = trialSpecs;
    console.log(`Parse trial URL with base: ${baseUrl} and delim: ${delimiter}`);

    const split = window.location.href.split(baseUrl);

    if (split.length !== 2) {
        return;
    }

    const trialInfo = split[1];
    const [accountId, secretKey] = trialInfo.split(delimiter);

    if (!accountId || !secretKey) {
        return;
    }

    return {
        accountId,
        secretKey
    };
};

export const parseInstantSignInUrl = (instantSignInSpecs: InstantSignInSpecs) => {
    const {baseUrl, delimiter, moduleDelimiter} = instantSignInSpecs;

    console.log(`Parse instant sign in URL with base: ${baseUrl} delim: ${delimiter} and module delim: ${moduleDelimiter}`);

    const split = window.location.href.split(baseUrl);

    if (split.length !== 2) {
        return;
    }

    const signInInfo = split[1];

    // Get the account ID, secret key, and module ID based on the two delimiters `delimiter` and `moduleDelimiter`
    const regex = new RegExp(`(.*)${delimiter}(.*)${moduleDelimiter}(.*)`);
    const matches = signInInfo.match(regex);
    console.log('matches: ', matches)
    const accountId = matches?.[1];
    console.log('accountId: ', accountId)
    console.log('accountId: ', accountId)
    const secretKey = matches?.[2];
    console.log('secretKey: ', secretKey)
    const moduleId = matches?.[3];
    console.log('moduleId: ', moduleId)

    if (!accountId || !secretKey || !moduleId) {
        return;
    }

    return {
        accountId,
        secretKey,
        moduleId
    };
};