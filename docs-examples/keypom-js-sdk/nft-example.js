const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { initKeypom, createDrop, getEnv, formatLinkdropUrl } = require("keypom-js");
const path = require("path");
const homedir = require("os").homedir();

async function nftDropKeypom(){
	// Initiate connection to NEAR testnet blockchain
	const network = "testnet"
	const CREDENTIALS_DIR = ".near-credentials";
	const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);
	const YOUR_ACCOUNT = "keypom-docs-demo.testnet";
	const NFT_TOKEN_ID = "keypom-token-" + Date.now().toString();
	const NFT_CONTRACT = "nft.examples.testnet";

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
	const fundingAccount = await near.account(YOUR_ACCOUNT);

	// Mint 1 NFT for the funder from the NFT contract outlined in the NFT_DATA
	await fundingAccount.functionCall(
		NFT_CONTRACT, 
		'nft_mint', 
		{
			receiver_id: YOUR_ACCOUNT,
			metadata: {
			    title: "My First Keypom NFT",
			    description: "NFT from my first NFT Drop!",
			    media: "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif",
			},
			token_id: NFT_TOKEN_ID,
		},
		"300000000000000",
		// Cost to cover storage of NFT
		parseNearAmount("0.1")
	);

	// Initiate Keypom using existing NEAR testnet connection
	await initKeypom({
	    near,
		network,
	});

	// Create drop with nft data
	// Note that the SDK does error checks to ensure all the information passed in will succeed when creating a drop.
	// If any information is not valid, the SDK will panic and the drop will NOT be created.
	// These checks include, but are not limited to, valid configurations, enough attached deposit, and drop existence.
	const { keys } = await createDrop({
	    account: fundingAccount,
	    numKeys: 1,
	    depositPerUseNEAR: "1",
	    nftData: {
		    // NFT Contract Id that the tokens will come from
		    contractId: NFT_CONTRACT,
		    // Who will be sending the NFTs to the Keypom contract
		    senderId: YOUR_ACCOUNT,
		    // List of tokenIDs
		    tokenIds: [NFT_TOKEN_ID]
		}
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

}
nftDropKeypom()