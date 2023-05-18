require('dotenv').config()
const path = require("path");
const homedir = require("os").homedir();
const { readFileSync } = require('fs');
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { Account } = require('@near-js/accounts');
const { connect, Near } = require("@near-js/wallet-account");
const { initKeypom, createTrialAccountDrop, generateKeys } = require('@keypom/core');
const { parseNearAmount } = require('@near-js/utils');

const funderAccountId = 'benjiman.testnet';
const NETWORK_ID = 'testnet';
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

    const wasmDirectory = `${require('path').resolve(__dirname, '..')}/trial-accounts/ext-wasm/trial-accounts.wasm`
    const {keys} = await createTrialAccountDrop({
		account: fundingAccount,
        numKeys: 1,
        contractBytes: [...readFileSync(wasmDirectory)],
		// How much $NEAR should be made available to the trial account when it's created?
        startingBalanceNEAR: 0.5,
        callableContracts,
        callableMethods,
        maxAttachableNEARPerContract,
        // repayAmountNEAR: 0.6,
        // repayTo: "dennis.near",
		// Once the trial account has spent this much $NEAR, the trial will be over.
        trialEndFloorNEAR: 0.01
    })  

    

    const guestBookInstance = "http://localhost:1234/trial-url#"
    const keypomContractId = "v2.keypom.testnet"
    const delimiter = "/"
    const secretKey = keys.secretKeys[0]
    const desiredAccountId = `trial-account-${Date.now()}.testnet`

    // await keypom.claimTrialAccountDrop({
    //     secretKey,
    //     desiredAccountId
    // })

    const alphaInstance = "http://localhost:3000/#trial-url/"
    const mnwInstance = "https://testnet-preview.mynearwallet.com/linkdrop/"

    const res = await generateKeys({
        numKeys: 1
    })

    await fundingAccount.addKey(res.publicKeys[0], callableContracts[0], '', parseNearAmount('0.0001'));

    console.log(`

    Instant Sign In
    http://localhost:1234/instant-url#${funderAccountId}${delimiter}${res.secretKeys[0]}${delimiter}my-near-wallet
    
    Guest-Book App:
 	${guestBookInstance}${keypomContractId}${delimiter}${secretKey}
    
    Alpha:
 	${alphaInstance}${keypomContractId}${delimiter}${secretKey}


 	Good Luck!
    `)
}

createTrialAccount();