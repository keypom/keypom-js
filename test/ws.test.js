const test = require('ava')

const nearAPI = require("near-api-js");
const {
	utils: {
		PublicKey,
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

const keypom = require("../lib");
const { initKeypom, createDrop, getDrops, deleteDrops, addKeys, genKey } = keypom

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

test('createDrop', async (t) => {

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

	// console.log(drops)

	t.true(drops.length > 0)
});

test('add keys', async (t) => {

	const numKeys = 10
	const { drop_id: dropId } = drops[0]

	/// create throw away keys
	const publicKeys = []
	if (numKeys) {
		pubKeys = []
		for (var i = 0; i < numKeys; i++) {
			const keyPair = await genKey('some secret entropy', dropId, i)
			pubKeys.push(keyPair.getPublicKey().toString());
		}
	}

	await addKeys({
		dropId,
		publicKeys,
	})

	t.true(drops.length > 0)
});

test('delete drops', async (t) => {

	if (!drops.length) return t.true(true)

	const responses = await deleteDrops({ drops })

	console.log(responses)
	const res = responses[0][0]?.status?.SuccessValue
	if (res.length > 0) {
		return t.true(parseInt(res) > -1)
	}
	t.is(res, '')
});