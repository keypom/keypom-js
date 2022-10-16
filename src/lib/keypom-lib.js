import * as nearAPI from "near-api-js";
const {
	Near,
	Account,
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
import { AddKeyPermission, Action } from "@near-wallet-selector/core";


const gas = '200000000000000'

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

let near, connection, logger, account, accountId, networkId, keyPair, publicKey;

export const autoSignIn = async () => {
	/// TODO validation
	const secretKey = window.location.href.split('#/keypom/')[1]

	keyPair = KeyPair.fromString(secretKey)
	publicKey = PublicKey.fromString(keyPair.publicKey.toString())

	accountId = publicKey.data.toString('hex')

	localStorage.setItem(`near-api-js:keystore:${accountId}:testnet`, `ed25519:${secretKey}`)
	localStorage.setItem('near-wallet-selector:contract', "{\"contractId\":\"testnet\",\"methodNames\":[]}")
	localStorage.setItem('near-wallet-selector:selectedWalletId', "\"keypom\"")
}

export const initConnection = (network, logFn) => {
	networkId = network.networkId
	const network = networks[networkId]
	const keyStore = new BrowserLocalStorageKeyStore()

	keyStore.setKey(networkId, accountId, keyPair)

	near = new Near({
		...network,
		deps: { keyStore },
	});

	connection = near.connection;
	account = new Account(connection, accountId)
};

export const getAccount = async () => ({ accountId });
export const signIn = async () => account;
export const signOut = () => { };

export const signAndSendTransactions = async ({ transactions }) => {

	if (!account) {
		throw new Error("Wallet not signed in");
	}

	const transformedTransactions = await transformTransactions(transactions)

	return [await account.sendMoney(accountId, parseNearAmount('0.42'))]

	return Promise.all(transformedTransactions.map((tx) => account.signAndSendTransaction(tx)))
};

const transformTransactions = async (
    transactions
  ) => {
    const { networkId, signer, provider } = account.connection;

    return Promise.all(
      transactions.map(async (transaction, index) => {
        const actions = transaction.actions.map((action) =>
          createAction(action)
        );

        const block = await provider.block({ finality: "final" });

        return nearTransactions.createTransaction(
          account.accountId,
          publicKey,
          transaction.receiverId,
          publicKey.nonce + index + 1,
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
  
		return nearTransactions.addKey(
		  utils.PublicKey.from(publicKey),
		  // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
		  getAccessKey(accessKey.permission)
		);
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