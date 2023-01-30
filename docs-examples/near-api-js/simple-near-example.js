const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { KeyPair, keyStores, connect } = require("near-api-js");
const path = require("path");
const homedir = require("os").homedir();

async function simpleDropNear(){
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

	// Keep track of an array of the key pairs we create and the public keys we pass into the contract
	let keyPairs = [];
	let pubKeys = [];
	// Generate keypairs and store them into the arrays defined above
	let keyPair = await KeyPair.fromRandom('ed25519'); 
	keyPairs.push(keyPair);   
	pubKeys.push(keyPair.publicKey.toString());   

	// Create drop with pub keys, deposit_per_use
	// Note that the user is responsible for error checking when using NEAR-API-JS
	// The SDK automatically does error checking; ensuring valid configurations, enough attached deposit, drop existence etc.
	try {
		await fundingAccount.functionCall(
			'v1-3.keypom.testnet', 
			'create_drop', 
			{
				public_keys: pubKeys,
				deposit_per_use: parseNearAmount('1'),
			}, 
			"300000000000000",
			// Generous attached deposit of 1.5 $NEAR
			parseNearAmount("1.5")
		);
	} catch(e) {
		console.log('error creating drop: ', e);
	}
}
simpleDropNear()