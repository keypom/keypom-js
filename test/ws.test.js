const test = require('ava')

const nearAPI = require("near-api-js");
const {
	utils: {
		PublicKey,
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

const keypom = require("../lib");
const {
	initKeypom,
	createDrop,
	getDrops,
	deleteKeys,
	deleteDrops,
	addKeys,
	genKey,
} = keypom

const accountId = process.env.TEST_ACCOUNT_ID
const secretKey = process.env.TEST_ACCOUNT_PRVKEY

const NUM_KEYS = 10

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

test('init', async (t) => {

	initKeypom({
		network: 'testnet',
		funder: {
			accountId,
			secretKey,
		}
	})

	t.true(true)
});

test('create drop', async (t) => {

	const dropId = Date.now().toString()

	const res = await createDrop({
		dropId,
		depositPerUseNEAR: 0.0042
	})

	const { responses } = res
	// console.log(responses)
	const resDropId = Buffer.from(responses[0].status.SuccessValue, 'base64').toString()

	t.is(resDropId, dropId)
});

let drops
test('get drops', async (t) => {

	drops = await getDrops({
		accountId
	})

	t.true(drops.length > 0)
});

test('add keys', async (t) => {

	const { drop_id: dropId } = drops[0]

	/// create throw away keys
	const publicKeys = []
	for (var i = 0; i < NUM_KEYS; i++) {
		const keyPair = await genKey('some secret entropy', dropId, i)
		publicKeys.push(keyPair.getPublicKey().toString());
	}

	await addKeys({
		dropId,
		publicKeys,
	})

	drops = await getDrops({
		accountId
	})

	t.is(drops[0].keys.length, NUM_KEYS)
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

	t.is(drops[0].keys.length, NUM_KEYS - 1)
});

test('delete drops', async (t) => {

	if (!drops.length) return t.true(false)

	await deleteDrops({ drops })

	drops = await getDrops({
		accountId
	})

	t.is(drops.length, 0)
});