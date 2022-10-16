const test = require('ava')

const nearAPI = require("near-api-js");
const {
	utils: {
		PublicKey,
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

const wsCore = require("@near-wallet-selector/core");
const { setupWalletSelector } = wsCore

const kpLib = require("../lib/lib/keypom");
const { setupKeypom } = kpLib

const accountId = PublicKey.fromString(process.env.TEST_ACCOUNT_PUBKEY).data.toString('hex')
/// mocking for tests
const lsAccount = `near-api-js:keystore:${accountId}:testnet`

/// mocking for tests
const _ls = {}
window = {
	location: {
		href: 'https://example.com/#/keypom/' + process.env.TEST_ACCOUNT_PRVKEY
	},
	localStorage: {
		getItem: (k) => _ls[k],
		setItem: (k, v) => _ls[k] = v,
		removeItem: (k) => delete _ls[k],
	},
	near: {
		isSignedIn: () => true,
	}
}
localStorage = window.localStorage

// test.beforeEach((t) => {
// });

let
	networkId = 'testnet',
	contractId = 'testnet',
	selector, wallet;

test('init', async (t) => {

	selector = await setupWalletSelector({
		network: networkId,
		contractId,
		debug: 'true',
		modules: [
			setupKeypom()
		],
		// storage: window.localStorage,
	});

	wallet = await selector.wallet('keypom')

	const accounts = await wallet.getAccounts()

	t.is(accounts[0].accountId, accountId)
});

test('transaction', async (t) => {

	const res = await wallet.signAndSendTransactions({
		transactions: [{
			receiverId: accountId,
			actions: [{
				type: 'Transfer',
				params: {
					deposit: parseNearAmount('0.42'),
				}
			}]
		}]
	})

	console.log(res)

	t.true(true)
});