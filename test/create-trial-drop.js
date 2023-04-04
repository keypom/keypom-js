require('dotenv').config()
const { readFileSync } = require('fs');
const { formatNearAmount, parseNearAmount } = require('near-api-js/lib/utils/format');
const { getDropInformation } = require('../lib');

const keypom = require("../lib");
const {
    execute,
    initKeypom,
    createTrialAccountDrop,
    claimTrialAccountDrop,
    trialCallMethod,
    getEnv,
    createDrop,
    getDrops,
    claim,
    deleteKeys,
    deleteDrops,
    addKeys,
    generateKeys,
    withdrawBalance,
    addToBalance,
    trialSignAndSendTxns
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
        `nft.examples.testnet`
    ]

    const {dropId, keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}} 
    = await createTrialAccountDrop({
        numKeys: 1,
        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
        startingBalanceNEAR: 0.5,
        callableContracts: callableContracts,
        callableMethods: ['*'],
        maxAttachableNEARPerContract: [1],
        trialEndFloorNEAR: 0.33 + 0.3
    })

    const desiredAccountId = `${dropId}-keypom.testnet`
    const trialSecretKey = trialSecretKeys[0]
    await claimTrialAccountDrop({
        desiredAccountId,
        secretKey: trialSecretKey
    })

    const canExitTrial = await keypom.canExitTrial({
        trialAccountId: desiredAccountId
    })
    console.log('canExitTrial: ', canExitTrial)
}

createTrialAccount();