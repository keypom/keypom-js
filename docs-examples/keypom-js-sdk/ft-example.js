const { initiateNearConnection, getFtCosts, estimateRequiredDeposit, ATTACHED_GAS_FROM_WALLET } = require("../utils/general");
const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { BN } = require("bn.js");
const keypom = require("../../lib");
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

async function ftDropKeypom(){
// Initiate connection to the NEAR testnet blockchain.
console.log("Initiating NEAR connection");
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

// Get amount of FTs to transfer. In this scenario, we've assumed it to be 1 for one single use key.
let amountToTransfer = parseNearAmount("1")
let funderFungibleTokenBal = await fundingAccount.viewFunction(
	"ft.keypom.testnet", 
	'ft_balance_of',
	{
		account_id: "keypom-docs-demo.testnet"
	}
);

// Check if the owner has enough FT balance to fund drop
if (new BN(funderFungibleTokenBal).lte(new BN(amountToTransfer))){
	throw new Error('funder does not have enough Fungible Tokens for this drop. Top up and try again.');
}

// Initiate Keypom, while passing in the existing NEAR testnet connection so it does not create a new one
await initKeypom({
	near: near,
	funder: {
        accountId: "keypom-docs-demo.testnet", 
        secretKey: "ed25519:4QdPsdKrnyjmadJn7THkEYeH6QwVNkY1dTvaVFK16HH55hNr6UewfeYVvypgXgTT1GHGior8Yj3x4neGndGWhviy"
	}
});

// Creates the FT drop based on data from config file. Keys are automatically generated within the function based on `NUM_KEYS`. Since there is no entropy, all keys are completely random.
// Note that the SDK does error checks to ensure all the information passed in will succeed when creating a drop.
// If any information is not valid, the SDK will panic and the drop will NOT be created.
// These checks include, but are not limited to, valid configurations, enough attached deposit, and drop existence.
console.log(parseNearAmount("1"))
await createDrop({
    numKeys: 1,
    depositPerUseNEAR: 1,
    ftData: {
		contractId: "ft.keypom.testnet",
		senderId: "keypom-docs-demo.testnet",
		// This balance per use is balance of FTs per use. 
		// parseNearAmount is used for conveience to convert to 10^24
		amount: "1"
	},
});
// Note that Keypom createDrop will auto-register you onto the contract if you are not yet registered.
}

ftDropKeypom()