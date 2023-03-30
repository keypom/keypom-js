require('dotenv').config()
const { readFileSync } = require('fs');
const { formatNearAmount } = require('near-api-js/lib/utils/format');
const { getDropInformation } = require('../lib');

const keypom = require("../lib");
const {
	execute,
	initKeypom,
	createTrialAccountDrop,
	claimTrialAccountDrop,
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

const fundingAccountId = process.env.TEST_ACCOUNT_ID
const fundingAccountSecretKey = process.env.TEST_ACCOUNT_PRVKEY

async function createTrialAccount(){
    if (!fundingAccountId || !fundingAccountSecretKey) {
        throw new Error('Please set TEST_ACCOUNT_ID and TEST_ACCOUNT_PRVKEY in terminal')
    }

    await initKeypom({
		// near,
		network: 'testnet',
		funder: {
			accountId: fundingAccountId,
			secretKey: fundingAccountSecretKey,
		}
	});

    const callableContracts = [
        `v1.social08.testnet`,
        'guest-book.examples.keypom.testnet',
    ]

    const {dropId, keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}} 
    = await createTrialAccountDrop({
        numKeys: 1,
        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
        startingBalanceNEAR: 0.5,
        callableContracts: callableContracts,
        callableMethods: ['set:grant_write_permission', '*'],
        maxAttachableNEARPerContract: callableContracts.map(() => '1'),
        trialEndFloorNEAR: 0.33 + 0.3
    })

    const trialMeta = "bafkreihubzorx65v6yqxrhls3xjnh3r4d66e3a6jokn77esllsdp7xtfoy"
    const keypomInstance = "http://localhost:3030"//"https://testnet.keypom-airfoil.pages.dev"
    console.log(`
    
    Keypom App:
 ${keypomInstance}/claim/v2.keypom.testnet?meta=${trialMeta}#${trialSecretKeys[0]}

    Guest-Book App:
 http://localhost:1234/keypom-url#v2.keypom.testnet/${trialSecretKeys[0]}

 Alpha Frontend:
 http://localhost:3000/#/#v2.keypom.testnet/${trialSecretKeys[0]}

 Good Luck!
    `)

    // console.log(`
	
	// ${JSON.stringify({
	// 	account_id: newAccountId,
	// 	public_key: trialPublicKeys[0],
	// 	private_key: trialSecretKeys[0]
	// })}

	// `)

	// console.log(`/keypom-url/${newAccountId}#${trialSecretKeys[0]}`)


	// console.log(`
    
    // localhost:3000/claim/v2.keypom.testnet#${trialSecretKeys[0]}
    
    // `)
}

createTrialAccount();