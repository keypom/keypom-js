const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { initKeypom, createDrop } = require("keypom-js");

async function nftDropKeypom(){
	// Initiate connection to NEAR testnet blockchain
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

	// Mint 1 NFT for the funder from the NFT contract outlined in the NFT_DATA
	await fundingAccount.functionCall(
		"nft.examples.testnet", 
		'nft_mint', 
		{
			receiver_id: "keypom-docs-demo.testnet",
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
	        accountId: "keypom-docs-demo.testnet", 
	        secretKey: "ed25519:2T48Hax5vGA7Hh8h5QcWDAJvmG7aXVFMp95aSubHTLjaLE7tWpgD7Ha2LYbbchxY4KHMpZWTvv2eWxmHiX2orNbD"
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
		    senderId: "keypom-docs-demo.testnet",
		    // List of tokenIDs
		    tokenIds: ["keypom-sdk-token-01"]
		}
	});
}
nftDropKeypom()