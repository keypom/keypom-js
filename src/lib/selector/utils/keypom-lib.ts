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


import { Action, FunctionCallAction } from "@near-wallet-selector/core";
import { BN } from "bn.js";
import { logger } from "@near-wallet-selector/core/lib/services";

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
	logger.log('dataToWrite: ', dataToWrite)

	localStorage.setItem(`${KEYPOM_LOCAL_STORAGE_KEY}:envData`, dataToWrite);
}

export const validateTransactions = async (toValidate, accountId) => {
	logger.log('toValidate: ', toValidate)
	toValidate = [];

	const validInfo = {
		"guest-book.examples.keypom.testnet": {
			maxDeposit: "0",
			allowableMethods: ["add_message"]
		}
	}
	try {
		// wait 50 milliseconds
		await new Promise((resolve) => setTimeout(resolve, 50));
	} catch(e: any) {
		logger.log('error: ', e)
	}

	// Loop through each transaction in the array
	for (let i = 0; i < toValidate.length; i++) {
		const transaction = toValidate[i];
		logger.log('transaction: ', transaction)

		// Check if the contractId is valid
		if (!validInfo[transaction.receiverId]) {
			logger.log('!validInfo[transaction.receiverId]: ', !validInfo[transaction.receiverId])
			return false;
		}

		// Check if the method name is valid
		if (!validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName)) {
			logger.log('!validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName): ', !validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName))
			return false;
		}

		// Check if the deposit is valid
		if (new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit))) {
			logger.log('new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)): ', new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)))
			return false;
		}
	}

	return true;
}

export const autoSignIn = (accountId, secretKey, contractId, methodNames) => {
	contractId = contractId || 'testnet';
	logger.log('contractId in auto sign in: ', contractId)
	methodNames = methodNames || [];
	logger.log('methodNames in auto sign in: ', methodNames)

	logger.log("1");
	localStorage.setItem(`near-api-js:keystore:${accountId}:testnet`, `ed25519:${secretKey}`)
	
	// Contract
	logger.log("2");
	localStorage.setItem('near-wallet-selector:contract', `{\"contractId\":\"${contractId}\",\"methodNames\":${JSON.stringify(methodNames)}}`)
	logger.log("3");
	localStorage.setItem('near-wallet-selector:contract:pending', `{\"contractId\":\"${contractId}\",\"methodNames\":${JSON.stringify(methodNames)}}`)

	logger.log("4");
	// Selected Wallet
	localStorage.setItem('near-wallet-selector:selectedWalletId', "\"keypom\"")
	logger.log("5");
	localStorage.setItem('near-wallet-selector:selectedWalletId:pending', "\"keypom\"")
	logger.log("6");
	
	// Print the entire local storage
	for (var i = 0; i < localStorage.length; i++){
		logger.log(localStorage.key(i) + "=[" + localStorage.getItem(localStorage.key(i)!) + "]");
	}
	
	// let recentWallets = localStorage.get('near-wallet-selector:recentlySignedInWallets');

	// logger.log('recentWallets: ', recentWallets)
	// if (recentWallets) {
	// 	recentWallets.push(autoAccountId);
	// }
	// localStorage.setItem('near-wallet-selector:recentlySignedInWallets', JSON.stringify(["keypom"]))
	// localStorage.setItem('near-wallet-selector:recentlySignedInWallets:pending', JSON.stringify(["keypom"]))
}

export const isValidActions = (actions: Array<Action>): actions is Array<FunctionCallAction> => {
	return actions.every((x) => x.type === "FunctionCall");
};

export const transformActions = (actions: Array<Action>) => {
	const validActions = isValidActions(actions);

	if (!validActions) {
		throw new Error(`Only 'FunctionCall' actions types are supported`);
	}

	return actions.map((x) => x.params);
};

export const createAction = (action) => {
	switch (action.type) {
	  case "CreateAccount":
		return nearTransactions.createAccount();
	  case "DeployContract": {
		const { code } = action.params;
  
		return nearTransactions.deployContract(code);
	  }
	  case "FunctionCall": {
		const { methodName, args, gas, deposit } = action.params;
		logger.log('deposit: ', deposit)
		logger.log('gas: ', gas)
		logger.log('args: ', args)
		logger.log('methodName: ', methodName)
  
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
		//   utils.PublicKey.from(publicKey),
		//   // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
		//   getAccessKey(accessKey.permission)
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

// Make a read-only call to retrieve information from the network
export const viewMethod = async ({ contractId, methodName, args = {}, nodeUrl }) => {
	logger.log('args: ', args)
	logger.log('methodName: ', methodName)
	logger.log('contractId: ', contractId)
	logger.log('nodeUrl: ', nodeUrl)
	const provider = new nearAPI.providers.JsonRpcProvider({ url: nodeUrl });

	let res: any = await provider.query({
		request_type: 'call_function',
		account_id: contractId,
		method_name: methodName,
		args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
		finality: 'optimistic',
	});
	
	return JSON.parse(Buffer.from(res.result).toString());
}