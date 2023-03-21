const { initKeypom, createDrop, createNFTSeries, addToBalance, getEnv, claim, getKeyInformation, hashPassword, formatLinkdropUrl } = require("keypom-js");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount } = require("near-api-js/lib/utils/format");
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
        metadata: "My Cool Drop Title!",
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
    // Creating list of pk's and linkdrops; copied from orignal simple-create.js
    for(var i = 0; i < keys.keyPairs.length; i++) {
        // Replace this with your desired URL format. 
        let url = `http://localhost:1234/${KEYPOM_CONTRACT}/${keys.secretKeys[i]}`
        dropInfo[pubKeys[i]] = url;
    }   
    // Console log all pk's and their respective links
    console.log('Public Keys and Linkdrops: ', dropInfo)
    console.log(`Keypom Contract Explorer Link: explorer.${network}.near.org/accounts/${KEYPOM_CONTRACT}.com`)
    return keys
}

async function main(){
    // Create Drop
    let keys = await createTickDrop();
    let myPrivatekey = keys.secretKeys[0];
    let myPublicKey = keys.publicKeys[0];
    console.log(`Private Key: ${myPrivatekey}`)
    console.log(`Public Key: ${myPublicKey}`)

    // Incorrect Password
    let keyInfo = await getKeyInformation({publicKey: myPublicKey})
    console.log(`Key use before claiming with wrong password: ${keyInfo.cur_key_use}`)
    console.log("Claiming with wrong password...")
    await claim({
        secretKey: myPrivatekey,
        accountId: "minqi.testnet",
        password: "wrong-password"
    })
    keyInfo = await getKeyInformation({publicKey: myPublicKey})
    assert(keyInfo.cur_key_use == 1, `Key has claimed with an incorrect password. Current Key Use: ${keyInfo.cur_key_use}`)
    console.log(`Key use after claiming with wrong password and before claiming with correct password: ${keyInfo.cur_key_use}`)

    // Correct password
    let password = "event-password"
    let claimPassword = await hashPassword(password + myPublicKey + keyInfo.cur_key_use.toString())
    console.log("claiming with correct password...")
    await claim({
        secretKey: myPrivatekey,
        accountId: "minqi.testnet",
        password: claimPassword
    })
    keyInfo = await getKeyInformation({publicKey: myPublicKey})
    assert(keyInfo.cur_key_use == 2, `Claim Failed. Current Key Use: ${keyInfo.cur_key_use}`)
    console.log(`Key use after claiming with correct password: ${keyInfo.cur_key_use}`)

    // Second claim, no password needed
    console.log("Second claim with no password")
    await claim({
        secretKey: myPrivatekey,
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

    // Depleted key
    console.log("Claim with depleted key")
    try{
        await claim({
            secretKey: myPrivatekey,
            accountId: "minqi.testnet",
        })
        console.log("claimed successfully, this should not be happening")
    }
    catch(err){
        console.log("Claim failed, as expected")
    }

    // Bogus key
    console.log("Claim with fake key")
    try{
        await claim({
            secretKey: "fake-key",
            accountId: "minqi.testnet",
        })
        console.log("claimed successfully, this should not be happening")
    }
    catch(err){
        console.log("Claim failed, as expected")
    }
}

main()

