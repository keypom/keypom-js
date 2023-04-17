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

    viewReturn = await councilMember.viewFunction(
        DEV_CONTRACT,
		'get_proposals',
        {
            from_index: 0,
            limit: 3
        } 
    )
    console.log(viewReturn)

    await councilMember.viewFunction(
        DEV_CONTRACT,
    	'get_members_roles',
    )
	
}

daoFn()