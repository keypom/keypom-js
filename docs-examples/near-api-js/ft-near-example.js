const { initiateNearConnection, getFtCosts, estimateRequiredDeposit, ATTACHED_GAS_FROM_WALLET } = require("../utils/general");
const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { KeyPair } = require("near-api-js");


// Initiate connection to the NEAR blockchain.
console.log("Initiating NEAR connection");
let near = await initiateNearConnection("testnet");
const fundingAccount = await near.account("minqi.testnet");

//get amount to transfer and see if owner has enough balance to fund drop
let amountToTransfer = parseNearAmount("1")
let funderFungibleTokenBal = await fundingAccount.viewFunction(
	"ft.keypom.testnet", 
	'ft_balance_of',
	{
		account_id: "minqi.testnet"
	}
);
if (new BN(funderFungibleTokenBal).lte(new BN(amountToTransfer))){
	throw new Error('funder does not have enough Fungible Tokens for this drop. Top up and try again.');
}

// Keep track of an array of the keyPairs we create
let keyPairs = [];
// Keep track of the public keys to pass into the contract
let pubKeys = [];
console.log("Creating keypairs");
let keyPair = await KeyPair.fromRandom('ed25519'); 
keyPairs.push(keyPair);   
pubKeys.push(keyPair.publicKey.toString());   

// Create drop with FT data
// Note that the user is responsible for error checking when using NEAR-API-JS
// The SDK automatically does error checking; ensuring valid configurations, enough attached deposit, drop existence etc.
try {
	await fundingAccount.functionCall(
		KEYPOM_CONTRACT, 
		'create_drop', 
		{
			public_keys: pubKeys,
			deposit_per_use: parseNearAmount("1"),
			ft: {
				contract_id: "ft.keypom.testnet",
				sender_id: "minqi.testnet",
				balance_per_use: parseNearAmount("1")
			}
		}, 
		"300000000000000",
		parseNearAmount("10")
	);
} catch(e) {
	console.log('error creating drop: ', e);
}

// Pay storage deposit and trasnfer FTs to Keypom contract.
try {
	await fundingAccount.functionCall(
		FT_CONTRACT_ID, 
		'storage_deposit',
		{
			account_id: "minqi.testnet",
		},
		"300000000000000",
		parseNearAmount("0.1")
	);
	let dropId = await getRecentDropId(fundingAccount, "minqi.testnet", "v1-3.keypom.testnet");
	console.log('dropId: ', dropId);
	await fundingAccount.functionCall(
		"ft.keypom.testnet", 
		'ft_transfer_call', 
		{
			receiver_id: "v1-3.keypom.testnet",
			amount: parseNearAmount((amountToTransfer.toString())),				
			msg: dropId.toString()
		},
		"300000000000000",
		"1"
	);
} catch(e) {
	console.log('error sending FTs', e);
}