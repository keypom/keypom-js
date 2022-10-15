const test = require('ava')

const wsCore = require("@near-wallet-selector/core");
const { setupWalletSelector } = wsCore

const kpLib = require("../lib/lib/keypom");
const { setupKeypom, networks } = kpLib

_ls = {}
localStorage = {
	getItem: (k) => _ls[k],
	setItem: (k, v) => _ls[k] = v,
	removeItem: (k) => delete _ls[k],
}

// test.beforeEach((t) => {
// });

let
	networkId = networks.testnet.networkId,
	contractId = networks.testnet.networkId,
	selector;

test('init', async (t) => {

	selector = await setupWalletSelector({
		network: 'testnet',
		contractId,
		debug: 'true',
		modules: [
			setupKeypom()
		],
	});

	console.log(selector)

	t.true(true)
});