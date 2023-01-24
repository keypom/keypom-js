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
// const path = require("path");
// const homedir = require("os").homedir();
// const network = "testnet"
// const myAccountId = "keypom-docs-demo.testnet"
// const credentialsPath =  path.join(homedir, `.near-credentials/${network}/${myAccountId}.json`);
// const myAccountInfo = require(credentialsPath)

async function simpleDropKeypom(){
// If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
// Here we are connecting to the testnet network
await initKeypom({
    network: "testnet", 
    funder: {
        accountId: "keypom-docs-demo.testnet", 
        secretKey: "ed25519:66rWCwr7RTRpcLvpzCapSejmTBNbuWTDupv9T8H6YuYkgtcHeVKm3CgbPHTyD8VmidpfG7i3xnComzfnt4o5JfkU"
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