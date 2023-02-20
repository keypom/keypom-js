const test = require('ava');
const BN = require('bn.js');
const nearAPI = require("near-api-js");
const { getUserBalance, getCurMethodData, canUserAddKeys, addToSaleAllowlist, removeFromSaleAllowlist, addToSaleBlocklist, removeFromSaleBlocklist, updateSale, getDropSupplyForOwner } = require('../lib');
const {
	Near,
	KeyPair,
	utils: { format: {
		parseNearAmount
	} },
	keyStores: { InMemoryKeyStore },
} = nearAPI;

const keypom = require("../lib");
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
	addToBalance,
    createTrialAccountDrop
} = keypom
const { readFileSync } = require('fs')

/// testing contracts
const FT_CONTRACT_ID = 'ft.keypom.testnet'
const NFT_CONTRACT_ID = "nft.examples.testnet";
const NFT_METADATA = {
    title: "Keypom FTW!",
    description: "Keypom is lit fam!",
    media: "https://bafkreidsht2pxoytl3d4zdnpsjmxedtk7dhuef2vmr3muz7si3vlthbcr4.ipfs.nftstorage.link",
}
/// funding account
const accountId = process.env.TEST_ACCOUNT_ID
const secretKey = process.env.TEST_ACCOUNT_PRVKEY
const testKeyPair = KeyPair.fromString(secretKey)

const NUM_KEYS = 10
const keyPairs = {
	simple: [],
	ft: [],
	nft: [],
	fc: [],
}

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

/// all tests
let fundingAccount, drops

test('init', async (t) => {

	await initKeypom({
		// near,
		network: 'testnet',
		funder: {
			accountId,
			secretKey,
		}
	})

	const { fundingAccount: keypomFundingAccount } = getEnv()
	fundingAccount = keypomFundingAccount

	console.log('fundingAccount', keypomFundingAccount)

	t.true(true)
});

test('check FC data index', async (t) => {
    const { publicKeys: newPublicKeys, secretKeys: newSecretKeys } = await generateKeys({ numKeys: 1 })
	trialPublicKey = newPublicKeys[0]
	trialSecretKey = newSecretKeys[0]
	const newAccountId = `${Date.now().toString()}.linkdrop-beta.keypom.testnet`

    const {dropId, keys: {secretKeys, publicKeys}} = await createTrialAccountDrop({
        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
        trialFundsNEAR: 0.5,
        callableContracts: ['dev-1676298343226-57701595703433'],
        callableMethods: ['*'],
        amounts: ['0.5'],
        numKeys: 5,
        config: {
            dropRoot: "linkdrop-beta.keypom.testnet"
        }
    })

	let userFcArgs = {
		"INSERT_NEW_ACCOUNT": newAccountId,
        "INSERT_TRIAL_PUBLIC_KEY": trialPublicKey
	}

	const res = await claim({
		accountId: newAccountId,
		secretKey: secretKeys[0],
		fcArgs: [JSON.stringify(userFcArgs), null]
	})

    console.log(`
	
	${JSON.stringify({
		account_id: newAccountId,
		public_key: trialPublicKey,
		private_key: trialSecretKey
	})}

	`)

	console.log(`http://localhost:1234/keypom-url/${newAccountId}#${trialSecretKey}`)


	t.true(true);
});