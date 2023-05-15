const { parseNearAmount } = require("@near-js/utils");
const { KeyPair } = require("@near-js/crypto")
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { Near } = require("@near-js/wallet-account");
const { Account } = require("@near-js/accounts");
const { getRecentDropId } = require("../utils/general.js")
const path = require("path");
const homedir = require("os").homedir();

async function nftDropNear(){
	// Initiate connection to the NEAR testnet blockchain.
	const network = "testnet"
	const CREDENTIALS_DIR = ".near-credentials";
	const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);
	const YOUR_ACCOUNT = "keypom-docs-demo.testnet";
	const NFT_TOKEN_ID = "near-api-token-" + Date.now().toString();
	const NFT_CONTRACT = "nft.examples.testnet";
	const KEYPOM_CONTRACT = "v2.keypom.testnet";
	
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
	
	// Mint 1 NFT for the funder from the NFT contract outlined in the NFT_DATA
	await fundingAccount.functionCall({
		contractId: NFT_CONTRACT, 
		methodName: 'nft_mint', 
		args: {
			receiver_id: YOUR_ACCOUNT,
			metadata: {
			    title: "My Keypom NFT",
			    description: "Keypom is lit fam :D",
			    media: "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif",
			},
			token_id: NFT_TOKEN_ID,
		},
		gas: "300000000000000",
		// Attached deposit of 0.1 $NEAR
		attachedDeposit: parseNearAmount("0.1")
	});
	
	// Keep track of an array of the key pairs we create and the public keys we pass into the contract
	let keyPairs = [];
	let pubKeys = [];
	// Generate keypairs and store them into the arrays defined above
	let keyPair = await KeyPair.fromRandom('ed25519'); 
	keyPairs.push(keyPair);   
	pubKeys.push(keyPair.publicKey.toString());   
	
	// Create drop with NFT data and transfer NFTs to Keypom
	// Note that the user is responsible for error checking when using NEAR-API-JS
	// The SDK automatically does error checking; ensuring valid configurations, enough attached deposit, drop existence etc.
	try {
		await fundingAccount.functionCall({
			contractId: KEYPOM_CONTRACT, 
			methodName: 'create_drop', 
			args: {
				public_keys: pubKeys,
				deposit_per_use: parseNearAmount("1"),
				nft: {
					// Who will be sending the NFTs to the Keypom contract
					sender_id: YOUR_ACCOUNT,
					// NFT Contract Id that the tokens will come from
					contract_id: NFT_CONTRACT
				}
			}, 
			gas: "300000000000000",
			// Attached deposit of 1 $NEAR
			attachedDeposit: parseNearAmount("1")
		});
		
		// Get the drop ID of the drop that we just created. This is for the message in the NFT transfer
		let dropId = await getRecentDropId(fundingAccount, YOUR_ACCOUNT, KEYPOM_CONTRACT);
		
		// Transfer the NFT to the Keypom contract. 
		// This gives Keypom the ownership and thus the ability to give it to the recipient when they use the linkdrop
		await fundingAccount.functionCall({
			contractId: NFT_CONTRACT, 
			methodName: 'nft_transfer_call', 
			args: {
				receiver_id: KEYPOM_CONTRACT,
				token_id: NFT_TOKEN_ID,
				msg: dropId.toString()
			},
			gas: "300000000000000",
			// Attached deposit of 1 $NEAR
			attachedDeposit: "1"
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

nftDropNear()