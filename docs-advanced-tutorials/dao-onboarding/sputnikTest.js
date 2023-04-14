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
    createdDao = await councilMember.functionCall(
		"dev-1681494717382-11686702269708", 
		'new', 
		{
            config: {
                name: 'keypomtestdao',
                purpose: 'to test adding members automatically',
                metadata: '',
            },
            policy: ['minqianlu.testnet']
            
		},
    )

    await councilMember.viewFunction(
        "dev-1681494717382-11686702269708", 
    	'get_members_roles',
    )
    
    let viewReturn = await councilMember.viewFunction(
        "dev-1681494717382-11686702269708", 
		'get_proposals',
        {
            from_index: 0,
            limit: 1
        } 
    )
    console.log(viewReturn)
    
    viewReturn = await councilMember.viewFunction(
        "dev-1681494717382-11686702269708", 
		'get_policy'
    )
    // console.log(viewReturn)
    // viewReturn = await councilMember.viewFunction(
    //     "dev-1681401491394-18732768526440", 
	// 	'get_available_amount'
    // )
    // console.log(viewReturn)

    // Add two more roles, one "minqi-role" and one "onboardee-role"
    await councilMember.functionCall(
        "dev-1681494717382-11686702269708", 
    	'add_proposal', 
    	{
            proposal: {
                description: "adding minqi",
                kind: {
                    ChangePolicyAddOrUpdateRole: {
                        role: {
                            /// Name of the role to display to the user.
                           name: 'minqi-role',
                           /// Kind of the role: defines which users this permissions apply.
                           kind: { Group: ["minqi.testnet"] },
                           /// Set of actions on which proposals that this role is allowed to execute.
                           /// <proposal_kind>:<action>
                           permissions: ['*:AddProposal'],
                           /// For each proposal kind, defines voting policy.
                           vote_policy: {},
                       }, 
                    }
                }
            }
    	},
        parseNearAmount("0.0000000001"),
        parseNearAmount("1"),
    )
    
    viewReturn = await councilMember.viewFunction(
        "dev-1681494717382-11686702269708", 
		'get_proposals',
        {
            from_index: 0,
            limit: 2
        } 
    )
    console.log(viewReturn)

    await councilMember.functionCall(
        "dev-1681494717382-11686702269708", 
    	'act_proposal', 
    	{
            id: 0, 
            action: 'VoteApprove'
    	},
        parseNearAmount("0.0000000001"),
    )

    await councilMember.viewFunction(
        "dev-1681494717382-11686702269708", 
    	'get_members_roles',
    )
    
    // write somewhere in the act proposal and add proposal functions the ability to log all current members, just for us to keep track
    // make a seperate helper function


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