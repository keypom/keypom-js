const { initKeypom, createDrop, createNFTSeries, addToBalance, getEnv, claim, getKeyInformation, hashPassword, formatLinkdropUrl, getPubFromSecret, generateKeys } = require("keypom-js");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount } = require("near-api-js/lib/utils/format");
const { hostClaim } = require("./utilFunctions");
const path = require("path");
const homedir = require("os").homedir();
var assert = require('assert');

async function createTickDrop(){
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
}

async function doubleClaimCheck() {
    // Create Drop
    let keys = await createTickDrop();
    let privKey = keys.secretKeys[0];

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
}

async function main(){
    await wrongPasswordCheck();
    await doubleClaimCheck(); 
}

main()