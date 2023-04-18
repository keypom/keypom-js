const path = require("path");
const homedir = require("os").homedir();
const { KeyPair, keyStores, connect, Account } = require("near-api-js");
var assert = require('assert');

const keypom = require("keypom-js");
const { DEV_CONTRACT } = require("./configurations");
const {
	initKeypom,
	getEnv,
	createDrop,
    parseNearAmount,
    createNFTSeries,
    formatLinkdropUrl
} = keypom

// Change this to your account ID
const FUNDER_ACCOUNT_ID = "minqi.testnet";
const NETWORK_ID = "testnet";
async function createDAODrop() {
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
    const councilMember = await near.account("minqianlu.testnet");
    
    // If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
    // Here we are connecting to the testnet network
    await initKeypom({
        near,
        network: NETWORK_ID,
    });

    // create drop with voting keys, then create a proposal from that

    // Create drop
    let {keys, dropId} = await createDrop({
        account: fundingAccount,
        numKeys: 1,
        config: {
            usesPerKey: 2
        },
        depositPerUseNEAR: "0.1",
        fcData: {
            methods: [
                [
                    {
                        receiverId: DEV_CONTRACT,
                        methodName: "act_proposal",
                        args: JSON.stringify(
                            {
                              memo: 'Keypom drop vote',
                              action: 'VoteApprove'
                            }
                        ),
                        drop_id_field: "id",
                        attachedDeposit: parseNearAmount("1")
                    }
                ],
            ] 
              
        }   
    })
    await councilMember.functionCall(
        DEV_CONTRACT,
    	'add_proposal', 
    	{
            proposal: {
                description: "adding moon-dao-member",
                kind: {
                    ChangeConfig: {
                        config:{
                            name: 'keypomtestdao',
                            purpose: 'to test custom proposal id',
                            metadata: '',
                        }
                    }
                }
            },
            custom_id: dropId
    	},
        parseNearAmount("0.0000000001"),
        parseNearAmount("1"),
    )
    console.log("created")
    // view big num
    viewReturn = await councilMember.viewFunction(
        DEV_CONTRACT,
		'get_proposals',
        {
            from_index: 0,
            limit: 2385
            //1681775131552
            //9999999999999
        } 
    )
    console.log(viewReturn)

    await councilMember.viewFunction(
        DEV_CONTRACT,
    	'get_members_roles',
    )

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

createDAODrop()

module.exports = {
    createDAODrop
}
