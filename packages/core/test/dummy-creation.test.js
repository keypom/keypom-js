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
	addToBalance
} = keypom

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
	
	const {keys} = await createDrop({
		numKeys: 1,
		depositPerUseNEAR: 5000
	})

	console.log('Funder Secret Keys: ', keys)

	const newAccountId = `dummy-account-${Date.now()}.testnet`
	const autoImportLink = `https://wallet.testnet.near.org/auto-import-secret-key#${newAccountId}/ed25519:${keys.secretKeys[0]}`
	console.log('autoImportLink: ', autoImportLink)
	
	await claim({
		secretKey: keys.secretKeys[0],
		newAccountId,
		newPublicKey: keys.publicKeys[0]
	})

	await keypom.updateFunder({funder: {accountId: newAccountId, secretKey: keys.secretKeys[0]}})

	const { fundingAccount: keypomFundingAccount } = getEnv()
	fundingAccount = keypomFundingAccount

	console.log('fundingAccount', keypomFundingAccount)

	t.true(true)
});

const tokenDropInfo = {
	25: "Default Token Drop Title",
	26: " ",
	27: "😃",
	28: "This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated.",
	29: "s",
	30: "This is a duplicate drop title",
	31: "This is a duplicate drop title",
	32: "This is a duplicate drop title",
	33: "This is a duplicate drop title",
	0: "This drop has zero keys",
	1000: "This drop has a TON of keys",
	10: "This drop has an even amount of keys",
	11: "This drop has an odd number of keys",
	197: `Ascii art                    | 
	____________    __ -+-  ____________ 
	\_____     /   /_ \ |   \     _____/
	\_____    \____/  \____/    _____/
	\_____                    _____/
	\___________  ___________/
	/____\``,
}

const availableWallets = ["wallet.near.org", "mynearwallet", "herewallet"];

test('token drops', async (t) => {
	// Loop through entries in tokenDropInfo
	for (const [numKeys, dropName] of Object.entries(tokenDropInfo)) {
		// Randomly get 1, 2, or 3 wallets from the available wallets as an array
		const wallets = availableWallets.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
		
		const {dropId} = await createDrop({
			numKeys: 0,
			metadata: JSON.stringify({
				dropName,
				wallets
			}),
			depositPerUseNEAR: 0.1
		})

		// Loop through in intervals of 50 until numKeys is reached
		let keysAdded = 0;
		while (keysAdded < numKeys) {
			const keysToAdd = Math.min(50, numKeys - keysAdded);
			const {publicKeys} = await generateKeys({
				numKeys: keysToAdd,
				rootEntropy: `MASTER_KEY-${dropId}`,
				autoMetaNonceStart: keysAdded
			})
			await addKeys({
				dropId,
				publicKeys
			})
			keysAdded += keysToAdd;
		}
	}

	const lastDropId = Date.now().toString();
	const {secretKeys, publicKeys} = await generateKeys({
		numKeys: 27,
		rootEntropy: `MASTER_KEY-${lastDropId}`,
		autoMetaNonceStart: 0
	})
	await createDrop({
		dropId: lastDropId,
		publicKeys,
		metadata: JSON.stringify({
			dropName: "this drop has keys claimed",
			wallets: ["wallet.near.org"]
		}),
		depositPerUseNEAR: 0.1
	});

	// Claim 15 random keys out of the 27
	const keysToClaim = secretKeys.sort(() => Math.random() - 0.5).slice(0, 15);
	for (const key of keysToClaim) {
		await claim({
			secretKey: key,
			accountId: "benjiman.testnet"
		});
	}

	t.true(true);
});

const nftMedias = [
	"bafkreiat3ajmzexcc2pifxctcvsryztyqolytyr5dkgfw24pus7untxypu",
	"bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq",
	"bafkreia3m663c6kgzopsoyqkwmurufee6gxxlb4u7j573ej2ubnqd2q7ya",
	"bafkreifgjnfpzjpfijndodzqw262z2xrec3qjfut5nyoekbysozwwpqakq",
	"bafkreiaadsk6v5nygmgiwz2lfukdpa2mqdlsoq5lhnjibjjxsatwcfflzq",
	"bafybeiax2n6wtil67a6w5qcdm4jwnnxb34ujy2ldgbbanpaoudv7jvgizu",
	"bafkreifuuae4uzclz5futlfqrq43aqk6peb26er6dz7nhrserr6f7zqrqy",
	"bafybeiblargpzhwxgmbzzci6n6oubfhcw33cdqb4uqx62sxrvf5biwcszi",
	"bafkreif2n2mjkn62c3mbcb2jh5fncdxxnqybe4cfm3hubuwsmvtid74nrm",
	"bafybeie5rnsvy7oapjugh4vmw3hsod5w5cpamqblnokb45osnaypqf7bmm",
	"bafkreihphjw5exvg7tlrwhlgpaebmvpxya7tijglnn5virevjrsucxrxiu",
	"bafybeihnb36l3xvpehkwpszthta4ic6bygjkyckp5cffxvszbcltzyjcwi",
	"bafkreifczwmdq7zam4cpdf7sfx4n64ywcskwddgd6tn7cjwidmisjapqfy",
	"bafybeifnhwtbsdle3veww24imskadutiedwf6euama4toe6oix54mvhtrq",
	"bafybeiabyn6bqxahnwdxy4hpug5gseprep3zg4dedkrvjploebg7ih7uhq"
]

const nftDescriptions = [
	" ",
	"Default NFT Metadata Description",
	"This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated, This is a really long description that is repeated",
	"s",
	"😃",
	`Ascii art                    | 
	____________    __ -+-  ____________ 
	\_____     /   /_ \ |   \     _____/
	\_____    \____/  \____/    _____/
	\_____                    _____/
	\___________  ___________/
	/____\``
]

const nftTitles = [
	" ",
	"Default NFT Metadata Title",
	"This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated, This is a really long NFT title that is repeated",
	"s",
	"😃",
	`Ascii art                    | 
	____________    __ -+-  ____________ 
	\_____     /   /_ \ |   \     _____/
	\_____    \____/  \____/    _____/
	\_____                    _____/
	\___________  ___________/
	/____\``
]

const nftDropInfo = {
	25: "Default NFT Drop Title",
	26: " ",
	27: "😃",
	28: "This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated. This is a really long title that is repeated.",
	29: "s",
	30: "This is a duplicate drop title",
	31: "This is a duplicate drop title",
	32: "This is a duplicate drop title",
	33: "This is a duplicate drop title",
	0: "This drop has zero keys",
	1000: "This drop has a TON of keys",
	10: "This drop has an even amount of keys",
	11: "This drop has an odd number of keys",
	197: `Ascii art                    | 
	____________    __ -+-  ____________ 
	\_____     /   /_ \ |   \     _____/
	\_____    \____/  \____/    _____/
	\_____                    _____/
	\___________  ___________/
	/____\``,
}

test('NFT drops', async (t) => {
	// Loop through entries in nftDropInfo
	for (const [numKeys, dropName] of Object.entries(nftDropInfo)) {
		// Randomly get 1, 2, or 3 wallets from the available wallets as an array
		const wallets = availableWallets.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
		
		const {dropId} = await createDrop({
			numKeys: 0,
			metadata: JSON.stringify({
				dropName,
				wallets
			}),
			depositPerUseNEAR: 0.1,
			fcData: {
				methods: [[
					{
						receiverId: `nft-v2.keypom.testnet`,
						methodName: "nft_mint",
						args: "",
						dropIdField: "mint_id",
						accountIdField: "receiver_id",
						attachedDeposit: parseNearAmount("0.1")
					}
				]]
			}
		})

		// Loop through in intervals of 50 until numKeys is reached
		let keysAdded = 0;
		while (keysAdded < numKeys) {
			const keysToAdd = Math.min(50, numKeys - keysAdded);
			const {publicKeys} = await generateKeys({
				numKeys: keysToAdd,
				rootEntropy: `MASTER_KEY-${dropId}`,
				autoMetaNonceStart: keysAdded
			})
			await addKeys({
				dropId,
				publicKeys
			})
			keysAdded += keysToAdd;
		}

		// Pick a random title
		const title = nftTitles[Math.floor(Math.random() * nftTitles.length)];
		// Pick a random description
		const description = nftDescriptions[Math.floor(Math.random() * nftDescriptions.length)];
		// Pick a random media
		const media = nftMedias[Math.floor(Math.random() * nftMedias.length)];

		const res = await keypom.createNFTSeries({
			dropId,
			metadata: {
				title,
				description,
				media
			}
		});
	}

	const lastDropId = Date.now().toString();
	const {secretKeys, publicKeys} = await generateKeys({
		numKeys: 27,
		rootEntropy: `MASTER_KEY-${lastDropId}`,
		autoMetaNonceStart: 0
	})
	await createDrop({
		dropId: lastDropId,
		publicKeys,
		metadata: JSON.stringify({
			dropName: "this drop has keys claimed",
			wallets: ["wallet.near.org"]
		}),
		depositPerUseNEAR: 0.1,
		fcData: {
			methods: [[
				{
					receiverId: `nft-v2.keypom.testnet`,
					methodName: "nft_mint",
					args: "",
					dropIdField: "mint_id",
					accountIdField: "receiver_id",
					attachedDeposit: parseNearAmount("0.1")
				}
			]]
		}
	})

	// Pick a random title
	const title = nftTitles[Math.floor(Math.random() * nftTitles.length)];
	// Pick a random description
	const description = nftDescriptions[Math.floor(Math.random() * nftDescriptions.length)];
	// Pick a random media
	const media = nftMedias[Math.floor(Math.random() * nftMedias.length)];

	const res = await keypom.createNFTSeries({
		lastDropId,
		metadata: {
			title,
			description,
			media
		}
	});

	// Claim 15 random keys out of the 27
	const keysToClaim = secretKeys.sort(() => Math.random() - 0.5).slice(0, 15);
	for (const key of keysToClaim) {
		await claim({
			secretKey: key,
			accountId: "benjiman.testnet"
		});
	}

	t.true(true);
});

test('Ticket drops', async (t) => {
	// Loop through entries in nftDropInfo
	for (const [numKeys, dropName] of Object.entries(nftDropInfo)) {
		// Randomly get 1, 2, or 3 wallets from the available wallets as an array
		const wallets = availableWallets.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
		
		const {dropId} = await createDrop({
			numKeys: 0,
			config: {
				usesPerKey: 3
			},
			metadata: JSON.stringify({
				dropName,
				wallets
			}),
			depositPerUseNEAR: 0.1,
			basePassword: "event-password",
			passwordProtectedUses: [2],
			fcData: {
				methods: [
					null,
					null,
					[
						{
							receiverId: `nft-v2.keypom.testnet`,
							methodName: "nft_mint",
							args: "",
							dropIdField: "mint_id",
							accountIdField: "receiver_id",
							attachedDeposit: parseNearAmount("0.1")
						}
					]
				]
			}
		})

		// Loop through in intervals of 50 until numKeys is reached
		let keysAdded = 0;
		while (keysAdded < numKeys) {
			const keysToAdd = Math.min(50, numKeys - keysAdded);
			const {publicKeys} = await generateKeys({
				numKeys: keysToAdd,
				rootEntropy: `MASTER_KEY-${dropId}`,
				autoMetaNonceStart: keysAdded
			})
			await addKeys({
				dropId,
				publicKeys,
				basePassword: "event-password",
				passwordProtectedUses: [2],
			})
			keysAdded += keysToAdd;
		}

		// Pick a random title
		const title = nftTitles[Math.floor(Math.random() * nftTitles.length)];
		// Pick a random description
		const description = nftDescriptions[Math.floor(Math.random() * nftDescriptions.length)];
		// Pick a random media
		const media = nftMedias[Math.floor(Math.random() * nftMedias.length)];

		const res = await keypom.createNFTSeries({
			dropId,
			metadata: {
				title,
				description,
				media
			}
		});
	}

	const lastDropId = Date.now().toString();
	const {secretKeys, publicKeys} = await generateKeys({
		numKeys: 27,
		rootEntropy: `MASTER_KEY-${lastDropId}`,
		autoMetaNonceStart: 0
	})
	await createDrop({
		dropId: lastDropId,
		publicKeys,
		config: {
			usesPerKey: 3
		},
		metadata: JSON.stringify({
			dropName: "this drop has keys claimed",
			wallets: ["wallet.near.org"]
		}),
		depositPerUseNEAR: 0.1,
		basePassword: "event-password",
		passwordProtectedUses: [2],
		fcData: {
			methods: [
				null,
				null,
				[
					{
						receiverId: `nft-v2.keypom.testnet`,
						methodName: "nft_mint",
						args: "",
						dropIdField: "mint_id",
						accountIdField: "receiver_id",
						attachedDeposit: parseNearAmount("0.1")
					}
				]
			]
		}
	})

	// Pick a random title
	const title = nftTitles[Math.floor(Math.random() * nftTitles.length)];
	// Pick a random description
	const description = nftDescriptions[Math.floor(Math.random() * nftDescriptions.length)];
	// Pick a random media
	const media = nftMedias[Math.floor(Math.random() * nftMedias.length)];

	const res = await keypom.createNFTSeries({
		lastDropId,
		metadata: {
			title,
			description,
			media
		}
	});

	// Claim 15 random keys out of the 27
	const keysToClaim = secretKeys.sort(() => Math.random() - 0.5).slice(0, 25);
	for (const key of keysToClaim) {
		await claim({
			secretKey: key,
			accountId: "benjiman.testnet"
		});
	}

	t.true(true);
});

test('Final Output', async (t) => {
	const { fundingAccount: keypomFundingAccount } = getEnv()

	const supplyForOwner = await getDropSupplyForOwner({accountId: keypomFundingAccount.accountId});
	console.log('supplyForOwner: ', supplyForOwner)

	// Paginate through all drops owned by the account starting at index 0 with a limit of 10 drops per call all the way until supply is reached
	let index = 0;
	let supply = 0;
	while (supply < supplyForOwner) {
		const drops = await getDrops({accountId: keypomFundingAccount.accountId, index, limit: 10});
		console.log(`idx: ${index} supply: ${supply} - Drops for owner: `, drops)
		supply += drops.length;
		index += 10;
	}

	console.log('fundingAccount', keypomFundingAccount)

	t.true(true)
});