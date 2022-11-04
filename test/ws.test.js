const test = require('ava');
const nearAPI = require("near-api-js");
const {
	KeyPair,
	Account,
	utils: { format: {
		parseNearAmount
	} }
} = nearAPI;

const keypom = require("../lib");
const {
	initKeypom,
	getEnv,
	createDrop,
	getDrops,
	claim,
	deleteKeys,
	deleteDrops,
	addKeys,
	genKey,
} = keypom

const accountId = process.env.TEST_ACCOUNT_ID
const secretKey = process.env.TEST_ACCOUNT_PRVKEY
const testKeyPair = KeyPair.fromString(secretKey)

const FT_CONTRACT_ID = 'ft.keypom.testnet'

const NUM_KEYS = 10
const keyPairs = []

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

/// the test account
let account, drops

test('init', async (t) => {

	initKeypom({
		network: 'testnet',
		funder: {
			accountId,
			secretKey,
		}
	})

	const { connection, networkId, keyStore } = getEnv()
	keyStore.setKey(networkId, accountId, testKeyPair)
	account = new Account(connection, accountId)

	t.true(true)
});

test('delete drops', async (t) => {

	drops = await getDrops({
		accountId
	})

	console.log(drops)

	if (!drops.length) return t.true(true)

	await deleteDrops({ drops })

	drops = await getDrops({
		accountId
	})

	t.is(drops.length, 0)
});

test('create simple drop', async (t) => {

	const dropId = Date.now().toString()

	const res = await createDrop({
		dropId,
		depositPerUseNEAR: 0.02,
	})

	const { responses } = res
	// console.log(responses)
	const resWithDropId = responses.find((res) => Buffer.from(res.status.SuccessValue, 'base64').toString())

	t.is(Buffer.from(resWithDropId.status.SuccessValue, 'base64').toString(), dropId)
});

test('create ft drop', async (t) => {

	const dropId = Date.now().toString()

	const res = await createDrop({
		dropId,
		depositPerUseNEAR: 0.02,
		ftData: {
			contractId: FT_CONTRACT_ID,
			senderId: accountId,
			balancePerUse: parseNearAmount('1')
		}
	})

	const { responses } = res
	// console.log(responses)
	const resWithDropId = responses.find((res) => Buffer.from(res.status.SuccessValue, 'base64').toString())

	t.is(Buffer.from(resWithDropId.status.SuccessValue, 'base64').toString(), dropId)
});

test('get drops', async (t) => {

	drops = await getDrops({
		accountId
	})

	t.true(drops.length > 0)
});

test('add keys to simple drop', async (t) => {

	const drop = drops[0]
	const { drop_id: dropId } = drop

	/// create throw away keys
	const publicKeys = []
	for (var i = 0; i < NUM_KEYS; i++) {
		const keyPair = await genKey('some secret entropy' + Date.now(), dropId, i)
		keyPairs.push(keyPair)
		publicKeys.push(keyPair.getPublicKey().toString());
	}

	await addKeys({
		drop,
		publicKeys,
	})

	drops = await getDrops({
		accountId
	})

	t.is(drops[0].keys.length, NUM_KEYS)
});

test('add keys to ft drop', async (t) => {

	const drop = drops[1]
	const { drop_id: dropId } = drop

	/// create throw away keys
	const publicKeys = []
	for (var i = 0; i < NUM_KEYS; i++) {
		const keyPair = await genKey('some secret entropy' + Date.now(), dropId, i)
		keyPairs.push(keyPair)
		publicKeys.push(keyPair.getPublicKey().toString());
	}

	await addKeys({
		drop,
		publicKeys,
	})

	drops = await getDrops({
		accountId
	})

	t.is(drops[0].keys.length, NUM_KEYS)
});

test('claim simple drop', async (t) => {

	if (!drops.length) return t.true(false)

	await claim({
		accountId,
		secretKey: keyPairs[0].secretKey
	})

	drops = await getDrops({
		accountId
	})

	t.is(drops[0].keys.length, NUM_KEYS - 1)
});

test('create account and claim ft drop', async (t) => {

	if (!drops.length) return t.true(false)

	await claim({
		newAccountId: `someone-${Date.now()}.testnet`,
		newPublicKey: testKeyPair.getPublicKey().toString(), 
		secretKey: keyPairs[NUM_KEYS].secretKey
	})

	drops = await getDrops({
		accountId
	})

	t.is(drops[1].keys.length, NUM_KEYS - 1)
});

test('delete keys', async (t) => {

	if (!drops.length) return t.true(false)

	await deleteKeys({
		drop: drops[0],
		keys: [drops[0].keys[0]]
	})

	drops = await getDrops({
		accountId
	})

	t.is(drops[0].keys.length, NUM_KEYS - 2)
});
