const { parseNearAmount } = require("@near-js/utils");
const { initKeypom, createDrop, getEnv, formatLinkdropUrl } = require("@keypom/core");
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { connect, Near } = require("@near-js/wallet-account");
const { Account } = require("@near-js/accounts");
const path = require("path");
const homedir = require("os").homedir();
const { BN } = require("bn.js");

async function ftDropKeypom(){
	// Initiate connection to the NEAR testnet blockchain.
	const network = "testnet"
	const CREDENTIALS_DIR = ".near-credentials";
	const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);
	const YOUR_ACCOUNT = "keypom-docs-demo.testnet";
	const FT_CONTRACT = "ft.keypom.testnet";

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
	const fundingAccount = await new Account(near.connection, YOUR_ACCOUNT);

	// Get amount of FTs to transfer. In this scenario, we've assumed it to be 1 for one single use key.
	let amountToTransfer = parseNearAmount("1")
	let funderFungibleTokenBal = await fundingAccount.viewFunction({
		contractId: FT_CONTRACT, 
		methodName: 'ft_balance_of',
		args: {
			account_id: YOUR_ACCOUNT
		}
	});

	// Check if the owner has enough FT balance to fund drop
	if (new BN(funderFungibleTokenBal).lte(new BN(amountToTransfer))){
		throw new Error('funder does not have enough Fungible Tokens for this drop. Top up and try again.');
	}

	// Initiate Keypom, while passing in the existing NEAR testnet connection so it does not create a new one
	await initKeypom({
	    near,
	    network,
	});

	// Creates the FT drop based on data from config file. Keys are automatically generated within the function based on `NUM_KEYS`. Since there is no entropy, all keys are completely random.
	// Note that the SDK does error checks to ensure all the information passed in will succeed when creating a drop.
	// If any information is not valid, the SDK will panic and the drop will NOT be created.
	// These checks include, but are not limited to, valid configurations, enough attached deposit, and drop existence.
	const { keys } = await createDrop({
	    account: fundingAccount,
	    numKeys: 1,
	    depositPerUseNEAR: 1,
	    ftData: {
	    	contractId: FT_CONTRACT,
	    	senderId: YOUR_ACCOUNT,
	    	// This balance per use is balance of human readable FTs per use. 
	    	amount: "1"
			// Alternatively, you could use absoluteAmount, which is dependant on the decimals value of the FT
			// ex. if decimals of an ft = 8, then 1 FT token would be absoluteAmount = 100000000
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
	// Note that Keypom createDrop will auto-register you onto the contract if you are not yet registered.
}

ftDropKeypom()