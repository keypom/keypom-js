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
    formatLinkdropUrl,
    claim
} = keypom

// Change this to your account ID
const FUNDER_ACCOUNT_ID = "minqi.testnet";
const NETWORK_ID = "testnet";
async function createDAODrop() {
    const { near } = getEnv()
    const fundingAccount = new Account(near.connection, FUNDER_ACCOUNT_ID)
    const councilMember = await near.account("minqianlu.testnet");

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
                        dropIdField: "id",
                        attachedDeposit: parseNearAmount("0")
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

    return {keys, dropId}
}

async function customIdCreation(dropId, keys){
    const { near } = getEnv()
    const councilMember = await near.account("minqianlu.testnet")

    console.log( "\u001b[1;35mADDING CUSTOM PROPOSAL ID" )
    await councilMember.functionCall(
        DEV_CONTRACT,
    	'add_proposal', 
    	{
            proposal: {
                description: "custom proposal id",
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
    // view big num
    viewReturn = await councilMember.viewFunction(
        DEV_CONTRACT,
		'get_proposals',
        {
            //2385 is the maximum the dao contract can paginate before hitting gas limit
            from_index: 0,
            limit: 2385
        } 
    )
    console.log(viewReturn)
}

async function customIdVoting(dropId, keys){
    const { near } = getEnv()
    const councilMember = await near.account("minqianlu.testnet")

    console.log( "\u001b[1;35mFIRST VOTE ON CUSTOM PROPOSAL ID\u001B[37m\n" )
    await claim({
        secretKey: keys.secretKeys[0],
        accountId: "new-moon-dao-member-2.testnet"
    })
    // view big num
    viewReturn = await councilMember.viewFunction(
        DEV_CONTRACT,
		'get_proposals',
        {
            //2385 is the maximum the dao contract can paginate before hitting gas limit
            from_index: 0,
            limit: 2385
        } 
    )
    console.log(viewReturn)
    console.log( "\u001b[1;35mTRYING DUPLICATE VOTE ON CUSTOM PROPOSAL ID\u001B[37m\n" )
    try{
        await claim({
            secretKey: keys.secretKeys[0],
            accountId: "new-moon-dao-member-2.testnet"
        })
        console.log("dup")
    }
    catch(err){
        console.log("rejected")
    }
    viewReturn = await councilMember.viewFunction(
        DEV_CONTRACT,
		'get_proposals',
        {
            //2385 is the maximum the dao contract can paginate before hitting gas limit
            from_index: 0,
            limit: 2385
        } 
    )
}

async function main(){
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
     
     // If a NEAR connection is not passed in and is not already running, initKeypom will create a new connection
     // Here we are connecting to the testnet network
     await initKeypom({
         near,
         network: NETWORK_ID,
     });

    // console.log("\u001b[1;35mCREATING DROP AND TESTING DAO\u001B[37m\n")
    res = await createDAODrop()
    // await customIdCreation(res.dropId, res.keys)
    await customIdVoting(1681829248185, res.keys)
}


main()

module.exports = {
    createDAODrop,
    customIdCreation
}
