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
        //'counter.examples.keypom.testnet',
        `v1.social08.testnet`,
        `v2.keypom.testnet`,
        'donation.examples.keypom.testnet',
        'guest-book.examples.keypom.testnet',
        'hello-near.examples.keypom.testnet'
    ]

    // const newUserName = "benji-monday" + Date.now()

    const {keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}} 
    = await createTrialAccountDrop({
        numKeys: 1,
        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
        trialFundsNEAR: 10,
        callableContracts: callableContracts,
        callableMethods: callableContracts.map(() => '*'),
        maxAttachableDepositPerContract: callableContracts.map(() => '1'),
        trialEndFloorNEAR: 11
    })

    const trialMeta = "bafkreiavyvm5qw4pdinqddeisfgl6gx55on4l32bocqqrlardulnrmqmy4"
    const keypomInstance = "http://localhost:3030"//"https://testnet.keypom-airfoil.pages.dev"
    console.log(`
    
 ${keypomInstance}/claim/v2.keypom.testnet?meta=${trialMeta}#${trialSecretKeys[0]}
    
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