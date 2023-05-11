const path = require("path");
const homedir = require("os").homedir();
const { KeyPair, keyStores, connect, Account } = require("near-api-js");
var assert = require('assert');

const keypom = require("keypom-js");
const { DAO_CONTRACT, DAO_BOT_CONTRACT } = require("./configurations");
const {
	initKeypom,
	getEnv,
	createDrop,
    parseNearAmount,
    formatLinkdropUrl,
} = keypom

// Change this to your account ID
const FUNDER_ACCOUNT_ID = "minqi.testnet";
const NETWORK_ID = "testnet";
async function createDaoDrop() {
    // Initiate connection to the NEAR blockchain.
    const CREDENTIALS_DIR = ".near-credentials";
    const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);

    let keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);  

    let nearConfig = {
        networkId: NETWORK_ID,
        keyStore: keyStore,
        nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
        walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
        helperUrl: `https://helper.${NETWORK_ID}.near.org`,
        explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
    };  

    let near = await connect(nearConfig);
    const fundingAccount = new Account(near.connection, FUNDER_ACCOUNT_ID)
    
    // If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
    // Here we are connecting to the testnet network
    await initKeypom({
        near,
        network: NETWORK_ID,
    });

    // Create drop with 10 keys and 2 key uses each
    let {keys, dropId} = await createDrop({
        account: fundingAccount,
        numKeys: 1,
        config: {
            usesPerKey: 1
        },
        depositPerUseNEAR: "0.1",
        fcData: {
            methods: [
                [
                    {
                        receiverId: DAO_BOT_CONTRACT,
                        methodName: "new_auto_registration",
                        args: JSON.stringify({
                            dao_contract: DAO_CONTRACT,
                            proposal: {
                                description: "mooooooooon",
                                kind: {
                                    AddMemberToRole:{
                                        role: "new-onboardee-role"
                                    }
                                }
                            }
                        }),
                        accountIdField: "proposal.kind.AddMemberToRole.member_id",
                        // Attached deposit of 0.1 $NEAR for when the receiver makes this function call
                        attachedDeposit: parseNearAmount("0.1")
                    }
                ],
            ]   
        }   
    })


    const {contractId: KEYPOM_CONTRACT} = getEnv()
    let tickets = formatLinkdropUrl({
        customURL: "https://testnet.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
        secretKeys: keys.secretKeys,
        contractId: KEYPOM_CONTRACT,
    })
    console.log(`
    
    Ticket Links: 
    
    ${tickets}
    
    `)

    return keys
}

createDaoDrop()

module.exports = {
    createDaoDrop,
}
