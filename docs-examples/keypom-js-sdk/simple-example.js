const keypom = require("../../lib");
const { updateFunder } = require("../../lib/lib/keypom");
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

async function simpleDropKeypom(){
	// If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
	// Here we are connecting to the testnet network
	console.log("Initiating NEAR connection");
	await initKeypom({
	    network: 'testnet', 
	    funder: {
	        accountId: "minqi.testnet", 
	        secretKey: "ed25519:3hsCWpjczaPoNejnC2A1McGvnJQipAJUDmo6tEZ6XH6qwxfxTLkpQ8hMNG3jxg1zXEe5Ke2qoqUq76jJpeNKxaMa"
	    }
	});

	const { fundingAccount: keypomFundingAccount } = getEnv()
	fundingAccount = keypomFundingAccount
	console.log("funding account: ", fundingAccount)


	// Note that the SDK does error checks to ensure all the information passed in will succeed when creating a drop.
	// If any information is not valid, the SDK will panic and the drop will NOT be created.
	// These checks include, but are not limited to, valid configurations, enough attached deposit, and drop existence.
	await createDrop({
	    numKeys: 1,
	    depositPerUseNEAR: "1",
	});
}

simpleDropKeypom()