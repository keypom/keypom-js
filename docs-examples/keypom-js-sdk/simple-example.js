const { initKeypom, createDrop } = require("keypom-js");
const { KeyPair, keyStores, connect } = require("near-api-js");
const path = require("path");
const homedir = require("os").homedir();


async function simpleDropKeypom(){
	// Initiate connection to the NEAR blockchain.
	const network = "testnet"
	const CREDENTIALS_DIR = ".near-credentials";
	const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);
	
	let keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

	let nearConfig = {
		networkId: network,
		keyStore: keyStore,
		nodeUrl: `https://rpc.${network}.near.org`,
		walletUrl: `https://wallet.${network}.near.org`,
		helperUrl: `https://helper.${network}.near.org`,
		explorerUrl: `https://explorer.${network}.near.org`,
	};

	let near = await connect(nearConfig);
	const fundingAccount = await near.account('keypom-docs-demo.testnet');

	// If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
	// Here we are connecting to the testnet network
	await initKeypom({
	    near: near,
	    network: "testnet"
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

    	var dropInfo = {};
	const KEYPOM_CONTRACT = "v1-3.keypom.testnet"
    	// Creating list of pk's and linkdrops; copied from orignal simple-create.js
    	for(var i = 0; i < keys.keyPairs.length; i++) {
	    let linkdropUrl = `https://wallet.testnet.near.org/linkdrop/${KEYPOM_CONTRACT}/${keys.secretKeys[i]}`;
	    dropInfo[pubKeys[i]] = linkdropUrl;
		}
	// Write file of all pk's and their respective linkdrops
	console.log('Public Keys and Linkdrops: ', dropInfo)
}

simpleDropKeypom()