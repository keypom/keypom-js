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


console.log("Initiating NEAR connection");
await initKeypom({
    network: 'testnet', 
    funder: {
        accountId: "minqi.testnet", 
        secretKey: MY_PRVK
    }
});

// Note that the SDK does error checks to ensure all the information passed in will succeed when creating a drop.
// If any information is not valid, the SDK will panic and the drop will NOT be created.
// These checks include, but are not limited to, valid configurations, enough attached deposit, and drop existence.
await createDrop({
    account: 'minqi.testnet.',
    numKeys: 1,
    depositPerUseNEAR: "1",
});