const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { KeyPair, keyStores, connect } = require("near-api-js");
const path = require("path");
const homedir = require("os").homedir();

async function fcDropNear(){
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
	const fundingAccount = await near.account("keypom-docs-demo.testnet");

	// Keep track of an array of the keyPairs we create and the public keys to pass into the contract
	let keyPairs = [];
	let pubKeys = [];
	// Generate keypairs and store them into the arrays defined above
	let keyPair = await KeyPair.fromRandom('ed25519'); 
	keyPairs.push(keyPair);   
	pubKeys.push(keyPair.publicKey.toString());   


	// Create FC drop with pubkkeys from above and fc data
	// Note that the user is responsible for error checking when using NEAR-API-JS
	// The SDK automatically does error checking; ensuring valid configurations, enough attached deposit, drop existence etc.
	try {
		// With our function call for this drop, we wish to allow the user to lazy mint an NFT
		await fundingAccount.functionCall(
			"v1-3.keypom.testnet", 
			'create_drop', 
			{
				public_keys: pubKeys,
				deposit_per_use: parseNearAmount("1"),
				fc: {
					// 2D array of function calls. In this case, there is 1 function call to make for a key use
					// By default, if only one array of methods is present, this array of function calls will be used for all key uses
				    methods: [
				    	// Array of functions for Key use 1. 
				    	[{
				    	    receiver_id: 'nft.examples.testnet',
				    	    method_name: "nft_mint",
				    	    args: JSON.stringify({
	                		        token_id: "near-api-token-002",
	                		        receiver_id: "keypom-docs-demo.testnet",
	                		        metadata: {
				    			        title: "My Keypom NFT",
				    			        description: "Keypom is lit fam",
				    			        media: "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif",
				    			    }
				    	    }),
				    	    // Attached deposit of 1 $NEAR for when the receiver makes this function call
				    	    attached_deposit: parseNearAmount("1"),
				    	}]
				    ]
				}
			}, 
			"300000000000000",
			// Attcned depot of 1.5 $NEAR for creating the drop
			parseNearAmount("1.5")
		);
	} catch(e) {
		console.log('error creating drop: ', e);
	}
}
fcDropNear()
