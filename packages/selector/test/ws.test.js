const test = require('ava');
const BN = require('bn.js');
const nearAPI = require("near-api-js");
const { getUserBalance, getCurMethodData, canUserAddKeys, addToSaleAllowlist, removeFromSaleAllowlist, addToSaleBlocklist, removeFromSaleBlocklist, updateSale } = require('../lib');
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
	addToBalance
} = keypom

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
	const fcData = {
		methods: [
			null,
			[
				{
					methodName: "nft_token",
					receiverId: "nft.examples.testnet",
					args: JSON.stringify({
						token_id: "1"
					}),
					attachedDeposit: "0"
				},
				{
					methodName: "nft_token",
					receiverId: "nft.examples.testnet",
					args: JSON.stringify({
						token_id: "2"
					}),
					attachedDeposit: "0"
				}
			],
			null
		]
	}

	const {keys: {publicKeys, secretKeys}} = await createDrop({
		numKeys: 1,
		depositPerUseNEAR: 0,
		fcData,
		config: {
			usesPerKey: 3
		}
	});
	const secretKey = secretKeys[0];

	let curMethodData = await getCurMethodData({secretKey});
	console.log('curMethodData (first): ', curMethodData)
	t.is(curMethodData, null);

	curMethodData = await getCurMethodData({secretKey, keyUse: 1});
	t.is(curMethodData, null);
	curMethodData = await getCurMethodData({secretKey, keyUse: 2});
	t.true(curMethodData != null);
	curMethodData = await getCurMethodData({secretKey, keyUse: 3});
	t.is(curMethodData, null);

	await claim({secretKey, accountId: 'foobar'})
	curMethodData = await getCurMethodData({secretKey});
	t.true(curMethodData != null);

	await claim({secretKey, accountId: 'foobar'})
	curMethodData = await getCurMethodData({secretKey});
	console.log('curMethodData (third): ', curMethodData)
	t.is(curMethodData, null);
});

test('delete drops', async (t) => {

	drops = await getDrops({
		accountId,
		withKeys: true,
	})

	console.log('drops', drops)

	if (!drops?.length) return t.true(true)

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
	const resWithDropId = responses.find((res) => Buffer.from(res.status.SuccessValue, 'base64').toString())

	t.is(Buffer.from(resWithDropId.status.SuccessValue, 'base64').toString().replaceAll('"', ''), dropId)
});

test('create ft drop', async (t) => {
	/// Auto minting for FT Testing (SDK only handles auto transferring to register keys)
	const balancePerUse = '1'
	const { viewAccount } = getEnv()
	
	const storageDeposit = await viewAccount.viewFunction2({
		contractId: FT_CONTRACT_ID,
		methodName: 'storage_balance_of',
		args: {
			account_id: accountId,
		}
	})

	const transactions = []

	if (!storageDeposit) {
		transactions.push({
			receiverId: FT_CONTRACT_ID,
			actions: [{
				type: 'FunctionCall',
				params: {
					methodName: 'storage_deposit',
					args: {
						account_id: accountId,
					},
					gas: '100000000000000',
					deposit: parseNearAmount('0.1')
				}
			}]
		})
	}

	transactions.push({
		receiverId: FT_CONTRACT_ID,
		actions: [{
			type: 'FunctionCall',
			params: {
				methodName: 'ft_mint',
				args: {
					account_id: accountId,
					amount: new BN(balancePerUse).mul(new BN(NUM_KEYS)).toString()
				},
				gas: '100000000000000',
			}
		}]
	})

	const ftRes = await execute({ transactions, fundingAccount })

	/// create the drop

	const dropId = Date.now().toString()

	const res = await createDrop({
		dropId,
		depositPerUseNEAR: 0.02,
		ftData: {
			contractId: FT_CONTRACT_ID,
			senderId: accountId,
			absoluteAmount: balancePerUse
		}
	})

	const { responses } = res
	// console.log(responses)
	const resWithDropId = responses.find((res) => Buffer.from(res.status.SuccessValue, 'base64').toString())

	t.is(Buffer.from(resWithDropId.status.SuccessValue, 'base64').toString().replaceAll('"', ''), dropId)
});

let nftTokenIds = []
test('create nft drop and add 1 key', async (t) => {

	/// Auto minting 2 NFTs for testing

	let tokenId1 = `Keypom1-${Date.now()}`;
	let tokenId2 = `Keypom2-${Date.now()}`;
	const action1 = {
		type: 'FunctionCall',
		params: {
			methodName: 'nft_mint',
			args: {
				receiver_id: accountId,
				metadata: NFT_METADATA,
				token_id: tokenId1,
			},
			gas: '100000000000000',
			deposit: parseNearAmount('0.1')
		}
	}
	const action2 = JSON.parse(JSON.stringify(action1))
	action2.params.args.token_id = tokenId2
	nftTokenIds.push(tokenId1, tokenId2)

	const nftRes = await execute({
		fundingAccount,
		transactions: [{
			receiverId: NFT_CONTRACT_ID,
			actions: [action1, action2]
		}]
	})

	const dropId = Date.now().toString()

	const publicKeys = []
	for (var i = 0; i < 1; i++) {
		const keys = await generateKeys({
			numKeys: 1,
			rootEntropy: 'some secret entropy' + Date.now(),
			metaEntropy: `${dropId}_${i}`
		})
		
		keyPairs.nft.push(keys.keyPairs[0])
		publicKeys.push(keys.publicKeys[0]);
	}

	const res = await createDrop({
		dropId,
		depositPerUseNEAR: 0.02,
		publicKeys,
		nftData: {
			contractId: NFT_CONTRACT_ID,
			senderId: accountId,
			/// if you're passing keys, what NFT tokens to auto send to Keypom so keys can claim them?
			tokenIds: nftTokenIds.slice(0, 1),
		}
	})

	const { responses } = res
	// console.log(responses)
	const resWithDropId = responses.find((res) => Buffer.from(res.status.SuccessValue, 'base64').toString())

	t.is(Buffer.from(resWithDropId.status.SuccessValue, 'base64').toString().replaceAll('"', ''), dropId)
});

test('create an fc drop and 1 key', async (t) => {

	let fcData = {
		methods: [
			[{
				receiverId: "dev-1664052531433-97566156431683",
				methodName: "nft_mint",
				args: JSON.stringify({
					"foo": "bar",
					"keypom_args": {
						"account_id_field": "receiver_id",
						"drop_id_field" : "mint_id"
					}
				}),
				attachedDeposit: parseNearAmount("1"),
				accountIdField: "receiver_id",
				dropIdField: "mint_id"
			}]
		]
	}

	const dropId = Date.now().toString()

	const publicKeys = []
	for (var i = 0; i < 1; i++) {
		const keys = await generateKeys({
			numKeys: 1,
			rootEntropy: 'some secret entropy' + Date.now(),
			metaEntropy: `${dropId}_${i}`
		})
		
		keyPairs.fc.push(keys.keyPairs[0])
		publicKeys.push(keys.publicKeys[0]);
	}

	const res = await createDrop({
		dropId,
		// see claim tests, expected this drop auto deletes when last key is used
		config: {
			usage: {
				autoDeleteDrop: true,
			}
		},
		depositPerUseNEAR: 0.02,
		publicKeys,
		fcData
	})

	const { responses } = res
	// console.log(responses)
	const resWithDropId = responses.find((res) => Buffer.from(res.status.SuccessValue, 'base64').toString())

	t.is(Buffer.from(resWithDropId.status.SuccessValue, 'base64').toString().replaceAll('"', ''), dropId)
});

test('get drops', async (t) => {
	drops = await getDrops({
		accountId
	})
	t.is(drops.length, 4)
});

test('add keys to simple drop', async (t) => {

	const drop = drops[0]
	const { drop_id: dropId, next_key_id: nextKeyId } = drop

	/// create throw away keys
	const publicKeys = []
	for (var i = 0; i < NUM_KEYS; i++) {
		const keys = await generateKeys({
			numKeys: 1,
			rootEntropy: 'some secret entropy' + Date.now(),
			metaEntropy: `${dropId}_${nextKeyId + i}`
		})
		
		keyPairs.simple.push(keys.keyPairs[0])
		publicKeys.push(keys.publicKeys[0]);
	}

	await addKeys({
		drop,
		publicKeys,
	})

	drops = await getDrops({
		accountId,
		withKeys: true,
	})

	t.is(drops[0].keys.length, NUM_KEYS)
});

test('add keys to ft drop', async (t) => {

	console.log('drops for FTs!!: ', drops)
	const drop = drops[1]
	const { drop_id: dropId, next_key_id: nextKeyId } = drop

	/// create throw away keys
	const publicKeys = []
	for (var i = 0; i < NUM_KEYS; i++) {
		const keys = await generateKeys({
			numKeys: 1,
			rootEntropy: 'some secret entropy' + Date.now(),
			metaEntropy: `${dropId}_${nextKeyId + i}`
		})
		
		keyPairs.ft.push(keys.keyPairs[0])
		publicKeys.push(keys.publicKeys[0]);
	}

	console.log('drop (FTs): ', drop)
	await addKeys({
		drop,
		publicKeys,
	})

	drops = await getDrops({
		accountId,
		withKeys: true,
	})

	t.is(drops[1].keys.length, NUM_KEYS)
});

test('add 1 key to nft drop', async (t) => {
	const drop = drops[2]
	const { drop_id: dropId, next_key_id: nextKeyId } = drop

	/// create throw away keys
	const publicKeys = []
	for (var i = 0; i < 1; i++) {
		const keys = await generateKeys({
			numKeys: 1,
			rootEntropy: 'some secret entropy' + Date.now(),
			metaEntropy: `${dropId}_${nextKeyId + i}`
		})
		
		keyPairs.nft.push(keys.keyPairs[0])
		publicKeys.push(keys.publicKeys[0]);
	}

	await addKeys({
		drop,
		publicKeys,
		nftTokenIds: nftTokenIds.slice(1)
	})

	drops = await getDrops({
		accountId,
		withKeys: true,
	})

	t.is(drops[2].keys.length, 2)
});

test('get drops after keys', async (t) => {
	drops = await getDrops({
		accountId
	})
	console.log(drops)
	t.is(drops.length, 4)
	t.is(drops[0].registered_uses, 10)
	t.is(drops[1].registered_uses, 10)
	t.is(drops[2].registered_uses, 2)
	t.is(drops[3].registered_uses, 1)
});

test('claim simple drop', async (t) => {

	if (!drops.length) return t.true(false)

	await claim({
		accountId,
		secretKey: keyPairs.simple[0].secretKey
	})

	drops = await getDrops({
		accountId,
		withKeys: true,
	})

	t.is(drops[0].keys.length, NUM_KEYS - 1)
});

test('create account and claim ft drop', async (t) => {

	if (!drops.length) return t.true(false)

	await claim({
		newAccountId: `someone-${Date.now()}.testnet`,
		newPublicKey: testKeyPair.getPublicKey().toString(), 
		secretKey: keyPairs.ft[0].secretKey
	})

	drops = await getDrops({
		accountId,
		withKeys: true,
	})

	t.is(drops[1].keys.length, NUM_KEYS - 1)
});

test('create account and claim nft drop', async (t) => {

	if (!drops.length) return t.true(false)

	await claim({
		newAccountId: `someone-${Date.now()}.testnet`,
		newPublicKey: testKeyPair.getPublicKey().toString(), 
		secretKey: keyPairs.nft[0].secretKey
	})

	drops = await getDrops({
		accountId,
		withKeys: true,
	})

	t.is(drops[2].keys.length, 1)
});

test('claim fc drop', async (t) => {

	if (!drops.length) return t.true(false)

	await claim({
		accountId,
		secretKey: keyPairs.fc[0].secretKey
	})

	drops = await getDrops({
		accountId,
		withKeys: true,
	})

	// the fc drop, having only 1 key, was removed automatically
	t.is(drops.length, 3)
});

test('delete 1 key from simple drop', async (t) => {

	if (!drops.length) return t.true(false)

	await deleteKeys({
		dropId: drops[0].drop_id,
		publicKeys: [drops[0].keys[0]]
	})

	drops = await getDrops({
		accountId,
		withKeys: true,
	})

	t.is(drops[0].keys.length, NUM_KEYS - 2)
});

test('Create drop and return requiredDeposit so it can be added to balance', async (t) => {
	await withdrawBalance({});

	const {requiredDeposit} = await createDrop({
		numKeys: 50,
		depositPerUseYocto: '1',
		basePassword: "foobar",
		returnTransactions: true 
	})
	console.log('requiredDeposit: ', requiredDeposit);

	await withdrawBalance({});
	await addToBalance({
		absoluteAmount: requiredDeposit.toString(),
	});
	const curBal = await getUserBalance({accountId});

	t.is(curBal.toString(), requiredDeposit.toString());
});


test('invalid args being passed in', async (t) => {
	try {
		await createDrop({
			account: "foobar.testnet"
		});

		t.is(1, 2, 'should have thrown an error')
	} catch(e) {}

	t.is(1, 1, 'no error was thrown! :)')
});