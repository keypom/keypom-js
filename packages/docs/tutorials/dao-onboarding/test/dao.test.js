const test = require('ava');
const BN = require('bn.js');
const nearAPI = require("near-api-js");
const { getUserBalance, getCurMethodData, canUserAddKeys, addToSaleAllowlist, removeFromSaleAllowlist, addToSaleBlocklist, removeFromSaleBlocklist, updateSale, getDropSupplyForOwner } = require('../../../../core/lib');
const {
	Near,
	KeyPair,
	utils: { format: {
		parseNearAmount
	} },
	keyStores: { InMemoryKeyStore },
    Account
} = nearAPI;

const keypom = require("../../../../core/lib");
const {
	execute,
	initKeypom,
	getEnv,
	createDrop,
	getDrops,
	claim,
	deleteKeys,
	deleteDrops,
	addKeys,
	generateKeys,
	withdrawBalance,
	addToBalance
} = keypom

/// funding account
const accountId = process.env.TEST_ACCOUNT_ID
const secretKey = process.env.TEST_ACCOUNT_PRVKEY

console.log('accountId', accountId)

/// mocking browser for tests

const _ls = {}
window = {
	localStorage: {
		getItem: (k) => _ls[k],
		setItem: (k, v) => _ls[k] = v,
		removeItem: (k) => delete _ls[k],
	},
}
localStorage = window.localStorage

/// for testing of init NEAR here and pass in to initKeypom
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
const network = 'testnet'
const networkConfig = typeof network === 'string' ? networks[network] : network
const keyStore = new InMemoryKeyStore()
const near = new Near({
	...networkConfig,
	deps: { keyStore },
});

test('one', async (t) => {
    const fundingAccount = new Account(near.connection, "minqi.testnet")

    let viewReturn = await fundingAccount.viewFunction(
        "moondao.sputnikv2.testnet",
		'get_policy'
    )
	
	console.log(viewReturn)


	t.true(true)
});