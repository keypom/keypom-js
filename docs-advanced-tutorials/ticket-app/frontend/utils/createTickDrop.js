const { initKeypom, createDrop, createNFTSeries, addToBalance, getEnv, claim, getKeyInformation, hashPassword, formatLinkdropUrl, getPubFromSecret, generateKeys } = require("keypom-js");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount } = require("near-api-js/lib/utils/format");
const { allowEntry } = require("./utilFunctions");
const path = require("path");
const homedir = require("os").homedir();
var assert = require('assert');

const keypom = require("../../../../lib");
const {
	execute,
	initKeypom,
	createTrialAccountDrop,
	claimTrialAccountDrop,
	getEnv,
	createDrop,
	getDrops,
	claim,
	deleteKeys,
	deleteDrops,
	addKeys,
	generateKeys,
	withdrawBalance,
	addToBalance,
    parseNearAmount
} = keypom

// Change this to your account ID
const FUNDER_ACCOUNT_ID = "minqi.testnet";
const NETWORK_ID = "testnet";
async function createTickDrop() {
    // Initiate connection to the NEAR blockchain.
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
    const fundingAccount = await near.account('minqi.testnet'); 
    
    // If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
    // Here we are connecting to the testnet network
    await initKeypom({
        near: near,
        network: "testnet"
    }); 

    // Create drop with 10 keys and 2 key uses each
    let {keys, dropId} = await createDrop({
        account: fundingAccount,
        numKeys: 10,
        config: {
            usesPerKey: 2
        },
        depositPerUseNEAR: "0.1",
        basePassword: "event-password",
        passwordProtectedUses: [1],
        fcData: {
            methods: [
                null,
                [
                    {
                        receiverId: `nft-v2.keypom.testnet`,
                        methodName: "nft_mint",
                        args: "",
                        dropIdField: "mint_id",
                        accountIdField: "receiver_id",
                        attachedDeposit: parseNearAmount("0.1")
                    }
                ],
            ]   
        }   
    })

    let pubKeys = keys.publicKeys
    const res = await createNFTSeries({
        account: fundingAccount,
        dropId,
        metadata: {
            title: "Moon NFT Ticket!",
            description: "A cool NFT POAP for the best dog in the world.",
            media: "bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq",
            copies: 30
        }
    }); 
    var dropInfo = {};
    const {contractId: KEYPOM_CONTRACT} = getEnv()
    // Creating list of pk's and links
    for(var i = 0; i < keys.keyPairs.length; i++) {
        // Replace this with your desired URL format. 
        let url = formatLinkdropUrl({
            customURL: "http://localhost:1234/CONTRACT_ID/SECRET_KEY",
	    	secretKeys: keys.secretKeys[i],
            contractId: KEYPOM_CONTRACT,
        })
        dropInfo[pubKeys[i]] = url;
    }   
    // Console log all pk's and their respective links
    console.log('Public Keys and Linkdrops: ', dropInfo)
    console.log(`Keypom Contract Explorer Link: explorer.${network}.near.org/accounts/${KEYPOM_CONTRACT}.com`)
    return keys
}

async function wrongPasswordCheck() {
    // Create Drop
    let keys = await createTickDrop();
    let privKey = keys.secretKeys[0];
    let pubKey = keys.publicKeys[0];

    // Incorrect Password
    console.log("Claiming with wrong password...")
    let shouldAdmit = await allowEntry({
        privKey, 
        basePassword: "wrong-password"
    })
    assert(shouldAdmit === false, `Expected no admittance with incorrect password.`)

    // Correct password
    console.log("claiming with correct password...")
    shouldAdmit = await allowEntry({
        privKey,
        basePassword: "event-password"
    })
    assert(shouldAdmit === true, `Expected admittance with correct password.`)

    // Trying to use host scanner for second claim
    console.log("Second scanner claim, should fail")
    shouldAdmit = await allowEntry({
        privKey: privKey,
        basePassword: "event-password"
    })
    assert(shouldAdmit == false, `Second scanner claim succeeded unexpectedly.`)


    // Second claim, no password needed
    console.log("Normal second claim with no password")
    await claim({
        secretKey: privKey,
        accountId: "minqi.testnet",
    })
    // Getting key info here should fail as key has been depleted and deleted
    try{
        keyInfo = await getKeyInformation({publicKey: myPublicKey})
        console.log(`Key use is: ${keyInfo.cur_key_use}, this should not be happening`)
    }
    catch(err){
        console.log("Second claim successful. Key has been depleted and deleted")
    }

    // Scanning a depleted key
    console.log("Claim with depleted key")
    try{
        shouldAdmit = await allowEntry({
            privKey: privKey,
            basePassword: "event-password"
        })
        if(!shouldAdmit){
            throw new Error
        }
        console.log("claimed successfully, this should not be happening")
    }
    catch(err){
        console.log("Claim failed, as expected")
    }

    // Scanning a fake key
    console.log("Claim with fake key")
    try{
        let keys = await generateKeys({
            numKeys: 1,
        })
        let shouldAdmit = await allowEntry({
            privKey: keys.secretKeys[0],
        })
        if(!shouldAdmit){
            throw new Error
        }
        console.log("claimed successfully, this should not be happening")
    }
    catch(err){
        console.log("Claim failed, as expected")
    }
}

main()