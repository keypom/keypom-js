require('dotenv').config()
const path = require("path");
const homedir = require("os").homedir();
const { readFileSync } = require('fs');
const { keyStores, connect, Account } = require('near-api-js');

const keypom = require("../../lib");
const {
	initKeypom,
	createTrialAccountDrop
} = keypom

const funderAccountId = 'benjiman.testnet';
const NETWORK_ID = 'testnet';
async function createTrialAccount() {
	// Initiate connection to the NEAR blockchain.
    const CREDENTIALS_DIR = ".near-credentials";
    const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);

    let keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);  

    let nearConfig = {
        networkId: NETWORK_ID,
        keyStore: keyStore,
        nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
        walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
        helperUrl: `https://helper.${NETWORK_ID}.near.org`,
        explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
    };  

    let near = await connect(nearConfig);
    const fundingAccount = new Account(near.connection, funderAccountId)

	// Initialize the SDK and point it to the custom NEAR object that was created.
    await initKeypom({
		near,
		network: NETWORK_ID
	});

	// What contracts can the trial account call?
    const callableContracts = [
        'guest-book.examples.keypom.testnet'
    ]
    // What is the maximum amount of $NEAR that can be attached to a call for each callable contract?
    const maxAttachableNEARPerContract = [
        '1',
    ]
	// What methods can the trial account call?
	const callableMethods = [
		['*'],
	]

    const wasmDirectory = `${require('path').resolve(__dirname, '..')}/trial-accounts/ext-wasm/trial-accounts.wasm`
    const {keys} = await createTrialAccountDrop({
		account: fundingAccount,
        numKeys: 1,
        contractBytes: [...readFileSync(wasmDirectory)],
		// How much $NEAR should be made available to the trial account when it's created?
        startingBalanceNEAR: 0.05,
        callableContracts,
        callableMethods,
        maxAttachableNEARPerContract,
		// Once the trial account has spent this much $NEAR, the trial will be over.
        trialEndFloorNEAR: .01
    })

    const guestBookInstance = "http://localhost:1234/keypom-url#"
    const keypomContractId = "v2.keypom.testnet"
    const delimiter = "/"
    const secretKey = keys.secretKeys[0]

    const alphaInstance = "http://localhost:3030/#"

    console.log(`
    
    Guest-Book App:
 	${guestBookInstance}${keypomContractId}${delimiter}${secretKey}

 	Good Luck!
    `)
}

createTrialAccount();