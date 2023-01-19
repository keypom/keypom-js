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

// If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
// Here we are connecting to the testnet network
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
    numKeys: 1,
    depositPerUseNEAR: "1",
	// With our function call for this drop, we wish to allow the user to lazy mint an NFT
    fcData: {
		// 2D array of function calls. In this case, there is 1 function call to make for a key use
		// By default, if only one array of methods is present, this array of function calls will be used for all key uses
	    methods: [
			[{
			receiverId: "nft.examples.testnet",
			methodName: "nft_mint",
			args: JSON.stringify({
	                	token_id: "my-function-call-token",
	                	receiver_id: "minqi.testnet",
	                	metadata: {
					    title: "My Keypom NFT",
					    description: "Keypom is lit fam",
					    media: "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif",
					}
			}),
			// Attached deposit of 1 $NEAR for when the receiver makes this function call
			attachedDeposit: parseNearAmount("1"),
		}]
		]
	},
});