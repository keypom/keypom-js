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

// Parsing user roles
const getUserRoles = (policyInfo, accountId) => {
    let roles = [];

    // Loop through each element in res.roles
    for (const role of policyInfo.roles) {
        const roleKind = role.kind;
        //console.log('roleKind: ', roleKind)
        const roleName = role.name;
        //console.log('roleName: ', roleName)


        if (roleKind === 'Everyone') {
            roles.push('All')
            continue
        }
        
        let groupMembers = roleKind['Group'];

        if (groupMembers.includes(accountId)) {
            roles.push(roleName)
        }
    }

    return roles
}

async function viewRoles(){
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
    
    
    let viewReturn = await fundingAccount.viewFunction(
        DAO_CONTRACT,
		'get_policy'
    )

    let roles = getUserRoles(viewReturn, "keypom-docs-demo.testnet")
    console.log(roles);
}

viewRoles()