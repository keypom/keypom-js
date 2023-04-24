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

	t.true(true)
});

test('token drop', async (t) => {
    const wallets = ["mynearwallet", "herewallet"];
    const dropName = "My Cool Drop Name";
    const depositPerUseNEAR = 0.1;
    const numKeys = 50;
    const masterKey = "MASTER_KEY";

    const {dropId} = await createDrop({
        numKeys: 0,
        metadata: JSON.stringify({
            dropName,
            wallets
        }),
        depositPerUseNEAR,
    })

    let allSecretKeys = [];
    // Loop through in intervals of 50 until numKeys is reached
    let keysAdded = 0;
    while (keysAdded < numKeys) {
        const keysToAdd = Math.min(50, numKeys - keysAdded);
        const {secretKeys, publicKeys} = await generateKeys({
            numKeys: keysToAdd,
            rootEntropy: `${masterKey}-${dropId}`,
            autoMetaNonceStart: keysAdded
        })
        await addKeys({
            dropId,
            publicKeys
        })
        keysAdded += keysToAdd;

        allSecretKeys = allSecretKeys.concat(secretKeys);
    }

    const {contractId} = getEnv();

    let URLs = keypom.formatLinkdropUrl({
        customURL: "https://testnet.keypom-airfoil.pages.dev/claim/CONTRACT_ID#SECRET_KEY",
        contractId,
        secretKeys: allSecretKeys
    })
    console.log('TOKEN DROP URLS: ', URLs)
    
	t.true(true);
});

test('NFT drop', async (t) => {
	const wallets = ["mynearwallet", "herewallet"];
    const dropName = "My Cool Drop Name";
    const depositPerUseNEAR = 0.1;
    const numKeys = 50;
    const masterKey = "MASTER_KEY";
    
    const nftTitle = "Moon NFT!";
    const nftDescription = "A cool NFT for the best dog in the world.";
    const nftMediaIPFSHash = "bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq";

    const {dropId} = await createDrop({
        numKeys: 0,
        metadata: JSON.stringify({
            dropName,
            wallets
        }),
        depositPerUseNEAR,
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

    let allSecretKeys = [];
    // Loop through in intervals of 50 until numKeys is reached
    let keysAdded = 0;
    while (keysAdded < numKeys) {
        const keysToAdd = Math.min(50, numKeys - keysAdded);
        const {secretKeys, publicKeys} = await generateKeys({
            numKeys: keysToAdd,
            rootEntropy: `${masterKey}-${dropId}`,
            autoMetaNonceStart: keysAdded
        })
        await addKeys({
            dropId,
            publicKeys
        })
        keysAdded += keysToAdd;

        allSecretKeys = allSecretKeys.concat(secretKeys);
    }

    await keypom.createNFTSeries({
        dropId,
        metadata: {
            title: nftTitle,
            description: nftDescription,
            media: nftMediaIPFSHash
        }
    });

    const {contractId} = getEnv();

    let URLs = keypom.formatLinkdropUrl({
        customURL: "https://testnet.keypom-airfoil.pages.dev/claim/CONTRACT_ID#SECRET_KEY",
        contractId,
        secretKeys: allSecretKeys
    })
    console.log('NFT DROP URLS: ', URLs)

	t.true(true);
});

test('Ticket drops', async (t) => {
	const wallets = ["mynearwallet", "herewallet"];
    const dropName = "My Cool Drop Name";
    const depositPerUseNEAR = 0.1;
    const numKeys = 50;
    const masterKey = "MASTER_KEY";
    
    const eventPassword = "event-password";
    const nftTitle = "Moon NFT!";
    const nftDescription = "A cool NFT for the best dog in the world.";
    const nftMediaIPFSHash = "bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq";

    const {dropId} = await createDrop({
        numKeys: 0,
        metadata: JSON.stringify({
            dropName,
            wallets
        }),
        config: {
            usesPerKey: 3
        },
        depositPerUseNEAR,
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

    let allSecretKeys = [];
    // Loop through in intervals of 50 until numKeys is reached
    let keysAdded = 0;
    while (keysAdded < numKeys) {
        const keysToAdd = Math.min(50, numKeys - keysAdded);
        const {secretKeys, publicKeys} = await generateKeys({
            numKeys: keysToAdd,
            rootEntropy: `${masterKey}-${dropId}`,
            autoMetaNonceStart: keysAdded
        })
        await addKeys({
            dropId,
            publicKeys,
            basePassword: "event-password",
            passwordProtectedUses: [2]
        })
        keysAdded += keysToAdd;

        allSecretKeys = allSecretKeys.concat(secretKeys);
    }

    await keypom.createNFTSeries({
        dropId,
        metadata: {
            title: nftTitle,
            description: nftDescription,
            media: nftMediaIPFSHash
        }
    });

    const {contractId} = getEnv();

    let URLs = keypom.formatLinkdropUrl({
        customURL: "https://testnet.keypom-airfoil.pages.dev/claim/CONTRACT_ID#SECRET_KEY",
        contractId,
        secretKeys: allSecretKeys
    })
    console.log('TICKET DROP URLS: ', URLs)

	t.true(true);
});