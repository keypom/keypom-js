const { initiateNearConnection, getFtCosts, estimateRequiredDeposit, ATTACHED_GAS_FROM_WALLET } = require("../utils/general");
const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
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
async function nftDropKeypom(){
// Initiate connection to NEAR testnet blockchain
console.log("Initiating NEAR connection");
let near = await initiateNearConnection("testnet");
const fundingAccount = await near.account("minqi.testnet");

// Mint 1 NFT for the funder from the NFT contract outlined in the NFT_DATA
await fundingAccount.functionCall(
	"nft.examples.testnet", 
	'nft_mint', 
	{
		receiver_id: "minqi.testnet",
		metadata: {
		    title: "My Keypom NFT",
		    description: "Keypom is lit fam :D",
		    media: "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif",
		},
		token_id: "keypom-sdk-token-01",
	},
	"300000000000000",
	parseNearAmount("0.1")
);

// Initiate Keypom using existing NEAR testnet connection
await initKeypom({
	near: near,
	funder: {
        accountId: "minqi.testnet", 
        secretKey: "ed25519:3hsCWpjczaPoNejnC2A1McGvnJQipAJUDmo6tEZ6XH6qwxfxTLkpQ8hMNG3jxg1zXEe5Ke2qoqUq76jJpeNKxaMa"
	}
});
// Create drop with nft data
// Note that the SDK does error checks to ensure all the information passed in will succeed when creating a drop.
// If any information is not valid, the SDK will panic and the drop will NOT be created.
// These checks include, but are not limited to, valid configurations, enough attached deposit, and drop existence.
await createDrop({
    numKeys: 1,
    depositPerUseNEAR: "1",
    nftData: {
	    // NFT Contract Id that the tokens will come from
	    contractId: "nft.examples.testnet",
	    // Who will be sending the NFTs to the Keypom contract
	    senderId: "minqi.testnet",
	    // List of tokenIDs
	    tokenIds: ["keypom-sdk-token-01"]
	}
});
}
nftDropKeypom()