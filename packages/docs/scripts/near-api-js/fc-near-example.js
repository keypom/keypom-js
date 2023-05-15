const { parseNearAmount } = require("@near-js/utils");
const { KeyPair } = require("@near-js/crypto")
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { Near } = require("@near-js/wallet-account");
const { Account } = require("@near-js/accounts");
const path = require("path");
const homedir = require("os").homedir();

async function fcDropNear(){
	// Initiate connection to the NEAR blockchain.
	const network = "testnet"
	const CREDENTIALS_DIR = ".near-credentials";
	const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);
	const YOUR_ACCOUNT = "keypom-docs-demo.testnet";
	const NFT_TOKEN_ID = "near-api-token-" + Date.now().toString();
	const NFT_CONTRACT = "nft.examples.testnet";
	const KEYPOM_CONTRACT = "v2.keypom.testnet"

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
	const fundingAccount = new Account(near.connection, YOUR_ACCOUNT);

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
		await fundingAccount.functionCall({
			contractId: KEYPOM_CONTRACT, 
			methodName: 'create_drop', 
			args: {
				public_keys: pubKeys,
				deposit_per_use: parseNearAmount("0.1"),
				fc: {
					// 2D array of function calls. In this case, there is 1 function call to make for a key use
					// By default, if only one array of methods is present, this array of function calls will be used for all key uses
				    methods: [
				    	// Array of functions for Key use 1. 
				    	[{
				    	    receiver_id: NFT_CONTRACT,
				    	    method_name: "nft_mint",
				    	    args: JSON.stringify({
	                		        token_id: NFT_TOKEN_ID,
	                		        metadata: {
				    	            title: "My Keypom NFT",
				    	            description: "Keypom is lit fam",
				    	            media: "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif",
				    	        }
				    	    }),
							account_id_field: "receiver_id",
				    	    // Attached deposit of 1 $NEAR for when the receiver makes this function call
				    	    attached_deposit: parseNearAmount("1"),
				    	}]
				    ]
				}
			}, 
			gas: "300000000000000",
			// Attcned depot of 1.5 $NEAR for creating the drop
			attachedDeposit: parseNearAmount("1.5")
		});
	} catch(e) {
		console.log('error creating drop: ', e);
	}

	var dropInfo = {};
    	// Creating list of pk's and linkdrops; copied from orignal simple-create.js
    	for(var i = 0; i < keyPairs.length; i++) {
		// For keyPairs.length > 1, change URL secret key to keyPair.secretKey[i]
	    let linkdropUrl = `https://testnet.mynearwallet.com/linkdrop/${KEYPOM_CONTRACT}/${keyPair.secretKey}`;
	    dropInfo[pubKeys[i]] = linkdropUrl;
	}
	// Write file of all pk's and their respective linkdrops
	console.log('Public Keys and Linkdrops: ', dropInfo)
	console.log(`Keypom Contract Explorer Link: explorer.${network}.near.org/accounts/${KEYPOM_CONTRACT}.com`)
}
fcDropNear()
