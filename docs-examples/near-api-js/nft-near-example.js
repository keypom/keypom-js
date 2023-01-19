const { initiateNearConnection, getFtCosts, estimateRequiredDeposit, ATTACHED_GAS_FROM_WALLET } = require("../utils/general");
const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { KeyPair } = require("near-api-js");


// Initiate connection to the NEAR testnet blockchain.
console.log("Initiating NEAR connection");
let near = await initiateNearConnection("testnet");
const fundingAccount = await near.account("minqi.testnet");

// Mint 1 NFT for the funder from the NFT contract outlined in the NFT_DATA
await fundingAccount.functionCall(
	"nft.examples.testnet", 
	'nft_mint', 
	{
		receiver_id: "minqi.testnet",
		metadata: {
		    title: "My Keypom NFT",
		    description: "Keypom is lit fam :D",
		    media: "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif",
		},
		token_id: "my-token",
	},
	"300000000000000",
	parseNearAmount("0.1")
);

// Keep track of an array of the keyPairs we create
let keyPairs = [];
// Keep track of the public keys to pass into the contract
let pubKeys = [];
console.log("Creating keypairs");
let keyPair = await KeyPair.fromRandom('ed25519'); 
keyPairs.push(keyPair);   
pubKeys.push(keyPair.publicKey.toString());   

// Create drop with NFT data
// Note that the user is responsible for error checking when using NEAR-API-JS
// The SDK automatically does error checking; ensuring valid configurations, enough attached deposit, drop existence etc.
try {
	await fundingAccount.functionCall(
		"v1-3.keypom.testnet", 
		'create_drop', 
		{
			public_keys: pubKeys,
			deposit_per_use: parseNearAmount("1"),
			nft: {
				sender_id: "minqi.testnet",
				contract_id: "nft.examples.testnet"
			}
		}, 
		"300000000000000",
		parseNearAmount("1")
	);

	let dropId = await getRecentDropId(fundingAccount, FUNDING_ACCOUNT_ID, KEYPOM_CONTRACT);

	await fundingAccount.functionCall(
		"nft.examples.testnet", 
		'nft_transfer_call', 
		{
			receiver_id: "v1-3.keypom.testnet",
			token_id: "my-token",
			msg: dropId.toString()
		},
		"300000000000000",
		"1"
	);
} catch(e) {
	console.log('error creating drop: ', e);
}