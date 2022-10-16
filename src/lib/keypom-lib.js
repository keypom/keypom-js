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

let near, connection, logger, accountId, networkId, keyPair;

export const autoSignIn = async () => {
	/// TODO validation
	const secretKey = window.location.href.split('#/keypom/')[1]

	keyPair = KeyPair.fromString(secretKey)
	accountId = PublicKey.fromString(keyPair.publicKey.toString()).data.toString('hex')

	localStorage.setItem(`near-api-js:keystore:${accountId}:testnet`, `ed25519:${secretKey}`)
	localStorage.setItem('near-wallet-selector:contract', "{\"contractId\":\"testnet\",\"methodNames\":[]}")
	localStorage.setItem('near-wallet-selector:selectedWalletId', "\"keypom\"")
}

export const initConnection = (network, logFn) => {
	networkId = network.networkId
	const network = networks[networkId]
	const keyStore = new BrowserLocalStorageKeyStore()

	near = new Near({
		...network,
		deps: { keyStore },
	});
	
	connection = near.connection;
	networkId = network.networkId;
};

export const getAccount = async ()  => ({ accountId });

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