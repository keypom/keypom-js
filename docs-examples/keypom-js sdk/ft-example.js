const { initiateNearConnection, getFtCosts, estimateRequiredDeposit, ATTACHED_GAS_FROM_WALLET } = require("../utils/general");
const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const keypom = require("../lib");
const {
	execute,
	initKeypom,
	getEnv,
	createDrop,
	getDrops,
	claim,
	deleteKeys,
	deleteDrops,
	addKeys,
	generateKeys,
} = keypom

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

await initKeypom({
	near: near,
	funder: {
        accountId: "minqi.testnet", 
        secretKey: MY_PRVK
	}
});

// Creates the FT drop based on data from config file. Keys are automatically generated within the function based on `NUM_KEYS`. Since there is no entropy, all keys are completely random.
// Note that the SDK does error checks to ensure all the information passed in will succeed when creating a drop.
// If any information is not valid, the SDK will panic and the drop will NOT be created.
// These checks include, but are not limited to, valid configurations, enough attached deposit, and drop existence.
await createDrop({
    numKeys: 1,
    depositPerUseNEAR: 1,
    ftData: {
		contractId: "ft.keypom.testnet",
		senderId: "minqi.testnet",
		balancePerUse: parseNearAmount("1")
	},
});