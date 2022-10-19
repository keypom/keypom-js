const test = require('ava')

const nearAPI = require("near-api-js");
const {
	utils: {
		PublicKey,
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

const keypom = require("../lib/lib/keypom");
const { initKeypom, createDrop, getDrops, deleteDrops } = keypom

const accountId = PublicKey.fromString(process.env.TEST_ACCOUNT_PUBKEY).data.toString('hex')
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

	const kp = initKeypom({
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

	t.is(drops.length, 1)
});

test('delete drops', async (t) => {

	if (!drops.length) return t.true(true)

	const responses = await deleteDrops({ drops })

	// console.log(responses)

	t.is(responses[0][0]?.status?.SuccessValue, '')
});