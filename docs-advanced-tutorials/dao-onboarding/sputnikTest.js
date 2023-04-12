const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { KeyPair, keyStores, connect } = require("near-api-js");
const path = require("path");
const homedir = require("os").homedir();

async function daoFn(){
	// Initiate connection to the NEAR testnet blockchain.
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
	const councilMember = await near.account("minqianlu.testnet");
    const onboardTeamMember = await near.account("minqi.testnet");
    
    // Create DAO, specify minqianlu as council
    // createdDao = await councilMember.functionCall(
	// 	"dev-1681312181173-69377159098922", 
	// 	'new', 
	// 	{
    //         config: {
    //             name: 'keypomtestdao',
    //             purpose: 'to test adding members automatically',
    //             metadata: '',
    //         },
            
	// 		policy: '["minqianlu.testnet"]'
	// 	},
    // )
		
	// Ensure DAO creation successful
    let viewReturn = await councilMember.viewFunction(
        "dev-1681312181173-69377159098922", 
		'get_proposals',
        {
            from_index: 0,
            limit: 1
        } 
    )
    console.log(viewReturn)

    // Add two more roles, one "minqi-role" and one "onboardee-role"
    // await councilMember.functionCall(
    // 	"dev-1681312181173-69377159098922", 
    // 	'add_proposal', 
    // 	{
    //         proposal: {
    //             description: "adding minqianlu to council role",
    //             kind: {
    //                 ChangePolicyAddOrUpdateRole: {
    //                     role: {
    //                         /// Name of the role to display to the user.
    //                        name: 'council',
    //                        /// Kind of the role: defines which users this permissions apply.
    //                        kind: { Group: ["minqianlu.testnet"] },
    //                        /// Set of actions on which proposals that this role is allowed to execute.
    //                        /// <proposal_kind>:<action>
    //                        permissions: ['*:*'],
    //                        /// For each proposal kind, defines voting policy.
    //                        vote_policy: {},
    //                    }, 
    //                 }
    //             }
    //         }
    // 	},
    //     parseNearAmount("0.0000000001"),
    //     parseNearAmount("1"),
    // )


    // use minqianlu to approve said proposals to add the roles

    // give "minqi-role" the ability to add proposal to add members

    // use minqianlu to approve said proposal to give 

    // Add minqi to dao as new role "minqi-role", this should not automatically add

    // Use minqianlu to vote approve on this proposal to add minqi
    
    // Check minqi is added dao in that role

    // Use minqi to propose adding a new member, new-moon-dao-member-1.testnet or something, to "onboardee-role"

    // This should auto approve, get status/existence of the proposal and check for 

	
}

daoFn()