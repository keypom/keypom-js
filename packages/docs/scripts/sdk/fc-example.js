const { parseNearAmount } = require("@near-js/utils");
const { initKeypom, createDrop, getEnv, formatLinkdropUrl } = require("@keypom/core"); 
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { connect, Near } = require("@near-js/wallet-account");
const { Account } = require("@near-js/accounts");
const path = require("path");
const homedir = require("os").homedir();

async function fcDropKeypom(){
	// Initiate connection to the NEAR blockchain.
	const network = "testnet"
	const CREDENTIALS_DIR = ".near-credentials";
	const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);
	const YOUR_ACCOUNT = "keypom-docs-demo.testnet";
	const NFT_TOKEN_ID = "keypom-token-" + Date.now().toString();
	const NFT_CONTRACT = "nft.examples.testnet";
	
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
		// With our function call for this drop, we wish to allow the user to lazy mint an NFT
	    fcData: {
		// 2D array of function calls. In this case, there is 1 function call to make for a key use
		// By default, if only one array of methods is present, this array of function calls will be used for all key uses
		methods: [
			// Array of functions for Key use 1. 
		    [{
		    	receiverId: NFT_CONTRACT,
		    	methodName: "nft_mint",
		    	args: JSON.stringify({
					// Change this token_id if it already exists -> check explorer transaction
		    	    token_id: NFT_TOKEN_ID,
		    	    metadata: {
		    	        title: "My Keypom NFT",
		    	        description: "Keypom is lit fam",
		    	        media: "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif",
		    	    }
		    	}),
				accountIdField: "receiver_id",
		    	// Attached deposit of 1 $NEAR for when the receiver makes this function call
		    	attachedDeposit: parseNearAmount("1")
		    }]
		]
	    },
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
fcDropKeypom()