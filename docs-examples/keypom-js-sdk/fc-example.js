const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { initKeypom, createDrop } = require("keypom-js");

async function fcDropKeypom(){
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
	await createDrop({
	    numKeys: 1,
	    depositPerUseNEAR: "1",
		// With our function call for this drop, we wish to allow the user to lazy mint an NFT
	    fcData: {
			// 2D array of function calls. In this case, there is 1 function call to make for a key use
			// By default, if only one array of methods is present, this array of function calls will be used for all key uses
		    methods: [
				// Array of functions for Key use 1. 
				[{
					receiverId: "nft.examples.testnet",
					methodName: "nft_mint",
					args: JSON.stringify({
		        	    	token_id: "keypom-sdk-token-02",
		        	    	receiver_id: "keypom-docs-demo.testnet",
		        	    	metadata: {
						    	title: "My Keypom NFT",
						    	description: "Keypom is lit fam",
						    	media: "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif",
							}
					}),
					// Attached deposit of 1 $NEAR for when the receiver makes this function call
					attachedDeposit: parseNearAmount("1")
				}]
			]
		},
	});
}
fcDropKeypom()