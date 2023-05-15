const { link } = require("fs");
const { initKeypom, createDrop, getEnv, formatLinkdropUrl } = require("@keypom/core");
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { connect, Near } = require("@near-js/wallet-account");

const path = require("path");
const homedir = require("os").homedir();


async function simpleDropKeypom(){
	// Initiate connection to the NEAR blockchain.
	const network = "testnet"
	const CREDENTIALS_DIR = ".near-credentials";
	const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);
	const YOUR_ACCOUNT = "keypom-docs-demo.testnet";
	
	let keyStore = new UnencryptedFileSystemKeyStore(credentialsPath);

	let nearConfig = {
	    networkId: network,
	    keyStore: keyStore,
	    nodeUrl: `https://rpc.${network}.near.org`,
	    walletUrl: `https://wallet.${network}.near.org`,
	    helperUrl: `https://helper.${network}.near.org`,
	    explorerUrl: `https://explorer.${network}.near.org`,
	};

	let near = new Near(nearConfig);
	const fundingAccount = await near.account(YOUR_ACCOUNT);

	// If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
	// Here we are connecting to the testnet network
	await initKeypom({
	    near,
	    network
	});

	// Note that the SDK does error checks to ensure all the information passed in will succeed when creating a drop.
	// If any information is not valid, the SDK will panic and the drop will NOT be created.
	// These checks include, but are not limited to, valid configurations, enough attached deposit, and drop existence.
	const {keys} = await createDrop({
	    account: fundingAccount,
	    numKeys: 1,
	    depositPerUseNEAR: "1",
	});
	pubKeys = keys.publicKeys
	
	const {contractId: KEYPOM_CONTRACT} = getEnv()
    // Creating list of pk's and linkdrops; copied from orignal simple-create.js
	let linkdropUrl = formatLinkdropUrl({
		customURL: "https://testnet.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
		secretKeys: keys.secretKeys,
		contractId: KEYPOM_CONTRACT
	})
	// Write file of all pk's and their respective linkdrops
	console.log('Public Keys: ', pubKeys)
	console.log('Linkdrops: ', linkdropUrl)
	console.log(`Keypom Contract Explorer Link: explorer.${network}.near.org/accounts/${KEYPOM_CONTRACT}.com`)

}

simpleDropKeypom()