const { initiateNearConnection, getFtCosts, estimateRequiredDeposit, ATTACHED_GAS_FROM_WALLET } = require("../utils/general");
const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { KeyPair } = require("near-api-js");


// Initiate connection to the NEAR blockchain.
console.log("Initiating NEAR connection");
let near = await initiateNearConnection('testnet');
const fundingAccount = await near.account('minqi.testnet');

// Keep track of an array of the keyPairs we create
let keyPairs = [];
// Keep track of the public keys to pass into the contract
let pubKeys = [];
console.log("Creating keypair");
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
		// Change this deposit value to whatever is needed to fund your drop; this will be added to your balance...?
		parseNearAmount("1"),
	);
} catch(e) {
	console.log('error creating drop: ', e);
}