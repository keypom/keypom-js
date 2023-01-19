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
    fcData: {
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
				attachedDeposit: parseNearAmount("1"),
				accountIdField: "minqi.testnet"
			}]
		]
	},
});