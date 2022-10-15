
import * as nearAPI from "near-api-js";
const {
	Near,
	Account,
	KeyPair,
	keyStores: { BrowserLocalStorageKeyStore },
	transactions: { addKey, deleteKey, functionCallAccessKey },
	utils: {
		PublicKey,
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

const gas = '200000000000000'

let near, logger, connection, networkId;
export const initConnection = (network, logFn) => {

console.log(network)

	near = new Near({
		...network,
		deps: { keyStore },
	});
	
	connection = near.connection;
	networkId = network.networkId;
};

export const getAccount = async ()  => ({ accountId: 'testnet'});

export const signIn = async () => {

	const account = new Account(connection, 'testnet')
	return account
};

export const signOut = () => {};

export const signAndSendTransactions = async (transactions) => {


	const res = await account.functionCall({
		contractId: 'testnet',
		methodName: "create_account",
		args: {},
		gas,
	});

	return res
};