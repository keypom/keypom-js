const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { DEV_CONTRACT } = require("./configurations");
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
    console.log("\u001b[1;35m CREATING DROP")
    createdDao = await councilMember.functionCall(
        DEV_CONTRACT,
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
        DEV_CONTRACT,
    	'get_members_roles',
    )
    
    let viewReturn = await councilMember.viewFunction(
        DEV_CONTRACT,
		'get_proposals',
        {
            from_index: 0,
            limit: 1
        } 
    )
    console.log(viewReturn)
    
    viewReturn = await councilMember.viewFunction(
        DEV_CONTRACT,
		'get_policy'
    )
    console.log(" ")


    // Add minqi to dao as new role "minqi-role" with ability to add proposals, this should not automatically add
    console.log( "\u001b[1;35m ADDING PROPOSAL" );
    await councilMember.functionCall(
        DEV_CONTRACT,
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
        DEV_CONTRACT,
		'get_proposals',
        {
            from_index: 0,
            limit: 2
        } 
    )
    console.log(viewReturn)

    console.log( "\u001b[1;35m minqi should not be in dao yet" );

    await councilMember.viewFunction(
        DEV_CONTRACT,
    	'get_members_roles',
    )

    // Use minqianlu to vote approve on this proposal to add minqi
    console.log( "\u001b[1;35m approving minqi" );
    await councilMember.functionCall(
        DEV_CONTRACT,
    	'act_proposal', 
    	{
            id: 0, 
            action: 'VoteApprove'
    	},
        parseNearAmount("0.0000000001"),
    )

    // Check minqi is added dao in that role
    await councilMember.viewFunction(
        DEV_CONTRACT,
    	'get_members_roles',
    )
    
    // // Use minqi to propose adding a new member, new-moon-dao-member-1.testnet or something, to "onboardee-role"
    console.log( "\u001b[1;35m creating onboarding role" );
    await councilMember.functionCall(
        DEV_CONTRACT,
    	'add_proposal', 
    	{
            proposal: {
                description: "adding moon-dao-member",
                kind: {
                    ChangePolicyAddOrUpdateRole: {
                        role: {
                            /// Name of the role to display to the user.
                           name: 'new-onboardee-role',
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
    await councilMember.functionCall(
        DEV_CONTRACT,
    	'act_proposal', 
    	{
            id: 1, 
            action: 'VoteApprove'
    	},
        parseNearAmount("0.0000000001"),
    )

    // This should auto approve, get status/existence of the proposal and check for 
    await councilMember.viewFunction(
        DEV_CONTRACT,
    	'get_members_roles',
    )

    // await onboardTeamMember.functionCall(
    //     DEV_CONTRACT,
    // 	'add_proposal', 
    // 	{
    //         proposal: {
    //             description: "adding moon-dao-member",
    //             kind: {
    //                 AddMemberToRole: {
    //                     member_id: "new-moon-dao-member-1.testnet",
    //                     role: "new-onboardee-role"
    //                 }
    //             }
    //         },
    //         keypom_args:{
    //             account_id_field: "proposal.kind.AddMemberToRole.member_id",
    //             drop_id_field: "",
    //             funder_id_field: "funder", 
    //             key_id_field: "",
    //         },
    //         funder: "minqi.testnet"
    // 	},
    //     parseNearAmount("0.0000000001"),
    //     parseNearAmount("1"),
    // )

    // viewReturn = await councilMember.viewFunction(
    //     DEV_CONTRACT,
	// 	'get_proposals',
    //     {
    //         from_index: 0,
    //         limit: 2
    //     } 
    // )
    // console.log(viewReturn)

    // await councilMember.viewFunction(
    //     DEV_CONTRACT,
    // 	'get_members_roles',
    // )
	
}

daoFn()