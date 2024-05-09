const path = require("path");
const homedir = require("os").homedir();
const { readFileSync } = require('fs');
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { Account } = require('@near-js/accounts');
const { connect, Near } = require("@near-js/wallet-account");
const { initKeypom, createTrialAccountDrop, generateKeys,claimTrialAccountDrop, getEnv } = require('@keypom/core');
const { parseNearAmount } = require('@near-js/utils');

const funderAccountId = 'benjiman.testnet';
const NETWORK_ID = 'testnet';
// What URLs should be returned
const instances = {
    guestBook: "http://localhost:1234/trial-url#ACCOUNT_ID/SECRET_KEY",
    discovery: "http://localhost:3000/#trial-url/ACCOUNT_ID/SECRET_KEY"

}
// What contracts can the trial account call?
const callableContracts = [
    'guest-book.examples.keypom.testnet',
    'v1.social08.testnet'
]
// What is the maximum amount of $NEAR that can be attached to a call for each callable contract?
const maxAttachableNEARPerContract = [
    '1',
    '1'
]
// What methods can the trial account call?
const callableMethods = [
    ['*'],
    ['*']
]
// How much $NEAR should be made available to the trial account when it's created?
const startingBalanceNEAR = 0.5;
// Once the trial account has spent this much $NEAR, the trial will be over.
const trialEndFloorNEAR = 0.01;

const numKeys = 1;
const claimTrialAccounts = false;
const includedCID; // = "bafkreidneri4ffymscahjprlapg4j62yleli73ncwdmopnkxpgczpusqn4"

async function createTrialAccount() {
	// Initiate connection to the NEAR blockchain.
    const CREDENTIALS_DIR = '.near-credentials';
    const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);

    let keyStore = new UnencryptedFileSystemKeyStore(credentialsPath);  

    let nearConfig = {
        networkId: NETWORK_ID,
        keyStore: keyStore,
        nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
        walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
        helperUrl: `https://helper.${NETWORK_ID}.near.org`,
        explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
    };  

    let near = new Near(nearConfig);
    const fundingAccount = new Account(near.connection, funderAccountId);

	// Initialize the SDK and point it to the custom NEAR object that was created.
    await initKeypom({
		near,
		network: NETWORK_ID
	});

    const wasmDirectory = `${require('path').resolve(__dirname, '.')}/ext-wasm/trial-accounts.wasm`
    const {keys: {secretKeys}, dropId} = await createTrialAccountDrop({
		account: fundingAccount,
        numKeys,
        contractBytes: [...readFileSync(wasmDirectory)],
        startingBalanceNEAR,
        callableContracts,
        callableMethods,
        maxAttachableNEARPerContract,
        trialEndFloorNEAR
    })

    let accountIds = [];
    if (claimTrialAccounts !== false) {
        let incr = 0;
        for (const secretKey of secretKeys) {
            const newAccountId = `trial-drop-${dropId}_num-${incr}.testnet`
            accountIds.push(newAccountId);

            await claimTrialAccountDrop({
                secretKey,
                desiredAccountId: newAccountId
            })
            incr += 1;
        }
    }

    const {contractId: keypomContractId} = getEnv();
    // Loop through the instances
    for (const [key, value] of Object.entries(instances)) {
        console.log(`\n\n`)
        // insert the contractId and secret key into the base URL based on the CONTRACT_ID and SECRET_KEY field
        const returnedURLs = [];

        let incr = 0;
        // loop through all secret keys
        secretKeys.forEach((secretKey) => {
            // insert the secret key into the base URL
            let url = value.replace('SECRET_KEY', secretKey);


            if (claimTrialAccounts !== false) {
                // insert the contract ID into the base URL
                url = url.replace('ACCOUNT_ID', accountIds[incr]);
            } else {
                // insert the contract ID into the base URL
                url = url.replace('ACCOUNT_ID', keypomContractId);
            }

            if (includedCID !== undefined) {
                url = url + `?cid=${includedCID}`
            }
            // add the URL to the array of URLs
            returnedURLs.push(url);
            incr += 1;
        });

        console.log(`${key}:`)
        console.log(returnedURLs.join('\n'));
    }

    console.log(`\n\n`)
}

createTrialAccount();