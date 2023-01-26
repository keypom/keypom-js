const { initKeypom, createDrop } = require("keypom-js");

async function simpleDropKeypom(){
	// If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
	// Here we are connecting to the testnet network
	await initKeypom({
	    network: "testnet", 
	    funder: {
	        accountId: "keypom-docs-demo.testnet", 
	        secretKey: "ed25519:2T48Hax5vGA7Hh8h5QcWDAJvmG7aXVFMp95aSubHTLjaLE7tWpgD7Ha2LYbbchxY4KHMpZWTvv2eWxmHiX2orNbD"
	    }
	});

	// Note that the SDK does error checks to ensure all the information passed in will succeed when creating a drop.
	// If any information is not valid, the SDK will panic and the drop will NOT be created.
	// These checks include, but are not limited to, valid configurations, enough attached deposit, and drop existence.
	const {keys} = await createDrop({
	    numKeys: 1,
	    depositPerUseNEAR: "1",
	});
	pubKeys = keys.publicKeys

    	var dropInfo = {};
	const KEYPOM_CONTRACT = "v1-3.keypom.testnet"
    	// Creating list of pk's and linkdrops; copied from orignal simple-create.js
    	for(var i = 0; i < keys.keyPairs.length; i++) {
	let linkdropUrl = `https://testnet.mynearwallet.com/linkdrop/${KEYPOM_CONTRACT}/${keys.secretKeys[i]}`;
	    dropInfo[pubKeys[i]] = linkdropUrl;
		}
	// Write file of all pk's and their respective linkdrops
	console.log('Public Keys and Linkdrops: ', dropInfo)
}

simpleDropKeypom()