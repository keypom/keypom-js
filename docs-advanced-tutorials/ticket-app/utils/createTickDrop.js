const path = require("path");
const homedir = require("os").homedir();
const { KeyPair, keyStores, connect, Account } = require("near-api-js");
var assert = require('assert');
const BN = require("bn.js")
const { readFileSync } = require('fs');

const keypom = require("keypom-js");
const {
	initKeypom,
	getEnv,
	createDrop,
    parseNearAmount,
    createNFTSeries,
    formatLinkdropUrl,
    wrapTxnParamsForTrial,
    claim,
    hashPassword,
    getPubFromSecret,
    claimTrialAccountDrop
} = keypom

const wasmDirectory = `${require('path').resolve(__dirname, '../..')}/trial-accounts/ext-wasm/trial-accounts.wasm`

// Change this to your account ID
const FUNDER_ACCOUNT_ID = "benjiman.testnet";
const NETWORK_ID = "testnet";
async function createTickDrop() {
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

	// What contracts can the trial account call?
    const callableContracts = [
        'guest-book.examples.keypom.testnet',
        'v1.mapping.keypom.testnet'
    ]
    // What is the maximum amount of $NEAR that can be attached to a call for each callable contract?
    const maxAttachableNEARPerContract = [
        parseNearAmount('0.1'),
        parseNearAmount('0.1')
    ]
	// What methods can the trial account call?
	const callableMethods = [
		['*'],
        ['*']
	]

    // How much $NEAR should be made available to the trial account when it's created?
    const startingBalanceNEAR = 0.2

    // Once the trial account has spent this much $NEAR, the trial will be over.
    const trialEndFloorNEAR = .01

    const basePassword = "event-password"

    const storageCost = parseNearAmount("0.3");
	const attachedDeposit = new BN(parseNearAmount(startingBalanceNEAR.toString())).add(new BN(storageCost)).toString();
	const trialEndFloorYocto = new BN(attachedDeposit).sub(new BN(parseNearAmount(trialEndFloorNEAR.toString()))).toString();

	// Generate the proper args for setup:
	let actualContracts = callableContracts.join(",");
	let actualAmounts = maxAttachableNEARPerContract.join(",");
	let actualMethods = callableMethods.map((method) => method.join(":")).join(",");

    // Create drop with 10 keys and 2 key uses each
    let {keys, dropId} = await createDrop({
        account: fundingAccount,
        numKeys: 1,
        config: {
            usesPerKey: 2
        },
        depositPerUseNEAR: "0",
        basePassword,
        passwordProtectedUses: [1],
        requiredGas: "200000000000000",
        fcData: {
            methods: [
                null,
                [
                    {
                        receiverId: "testnet",
                        methodName: 'create_account_advanced',
                        //@ts-ignore
                        attachedDeposit,
                        args: JSON.stringify({
                            new_account_id: "INSERT_NEW_ACCOUNT",
                            options: {
                                contract_bytes: [...readFileSync(wasmDirectory)],
                                limited_access_keys: [{
                                    public_key: "INSERT_TRIAL_PUBLIC_KEY",
                                    allowance: "0",
                                    receiver_id: "INSERT_NEW_ACCOUNT",
                                    method_names: 'execute,create_account_and_claim',
                                }],
                            }
                        }),
                        userArgsRule: "UserPreferred"
                    },
                    {
                        receiverId: "",
                        methodName: 'setup',
                        //@ts-ignore
                        attachedDeposit: '0',
                        args: JSON.stringify(wrapTxnParamsForTrial({
                            contracts: actualContracts,
                            amounts: actualAmounts,
                            methods: actualMethods,
                            funder: 'benjiman.testnet',
                            repay: '0',
                            floor: trialEndFloorYocto,
                        })),
                        receiverToClaimer: true
                    },
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

    await createNFTSeries({
        account: fundingAccount,
        dropId,
        metadata: {
            title: "Moon NFT Ticket!",
            description: "A cool NFT POAP for the best dog in the world.",
            media: "bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq",
            copies: 30
        }
    }); 

    const {contractId: KEYPOM_CONTRACT} = getEnv()
    let tickets = formatLinkdropUrl({
        customURL: "http://localhost:59599/CONTRACT_ID/SECRET_KEY",
        secretKeys: keys.secretKeys,
        contractId: KEYPOM_CONTRACT,
    })
    console.log(`
    
    Ticket Links: 
    
    ${tickets}
    
    `)

    return keys
}

createTickDrop()

module.exports = {
    createTickDrop
}
