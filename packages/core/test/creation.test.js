const path = require('path');
const homedir = require('os').homedir();
const { writeFile, mkdir, readFile } = require('fs/promises');
const test = require('ava');
const BN = require('bn.js');
const { getUserBalance, getCurMethodData, canUserAddKeys, addToSaleAllowlist, removeFromSaleAllowlist, addToSaleBlocklist, removeFromSaleBlocklist, updateSale, getDropSupplyForOwner } = require('../lib');
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { connect, Near } = require("@near-js/wallet-account");

const keypom = require('../lib');
const { Account } = require('@near-js/accounts');
const {
    execute,
    initKeypom,
    getEnv,
    createDrop,
    getDrops,
    claim,
    deleteKeys,
    deleteDrops,
    addKeys,
    generateKeys,
    withdrawBalance,
    addToBalance
} = keypom;

const NETWORK_ID = 'testnet';
const funderAccountId = 'foo.benjiman.testnet';
const viewAccountId = NETWORK_ID == 'mainnet' ? 'near' : 'testnet';

/// all tests
let fundingAccount;
test('init', async (t) => {
    // Initiate connection to the NEAR blockchain.
    const CREDENTIALS_DIR = '.near-credentials';
    const credentialsPath =  path.join(homedir, CREDENTIALS_DIR);

    let keyStore = new UnencryptedFileSystemKeyStore(credentialsPath);  

    let nearConfig = {
        networkId: NETWORK_ID,
        keyStore: keyStore,
        nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
        walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
        helperUrl: `https://helper.${NETWORK_ID}.near.org`,
        explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
    };  

    let near = new Near(nearConfig);
    fundingAccount = new Account(near.connection, funderAccountId);

    await initKeypom({
        near
    });

    t.true(true);
});

test('token drop', async (t) => {
    const wallets = ['mynearwallet', 'herewallet'];
    const dropName = 'My Cool Drop Name';
    const depositPerUseNEAR = 0.1;
    const numKeys = 1;
    const usesPerKey = 1;
    const masterKey = 'MASTER_KEY';

    const {dropId} = await createDrop({
        account: fundingAccount,
        numKeys: 0,
        config: {
            usesPerKey,
            usage: {
                autoDeleteDrop: true,
                autoWithdraw: true,
            }
        },
        metadata: JSON.stringify({
            dropName,
            wallets
        }),
        depositPerUseNEAR,
    });

    let allSecretKeys = [];
    // Loop through in intervals of 50 until numKeys is reached
    let keysAdded = 0;
    while (keysAdded < numKeys) {
        const keysToAdd = Math.min(50, numKeys - keysAdded);
        const {secretKeys, publicKeys} = await generateKeys({
            numKeys: keysToAdd,
            rootEntropy: `${masterKey}-${dropId}`,
            autoMetaNonceStart: keysAdded
        });
        await addKeys({
            account: fundingAccount,
            dropId,
            publicKeys
        });
        keysAdded += keysToAdd;

        allSecretKeys = allSecretKeys.concat(secretKeys);
    }

    const {contractId} = getEnv();

    const baseUrl = NETWORK_ID === 'testnet' ? 'https://testnet.keypom-airfoil.pages.dev/claim' : 'https://keypom.xyz/claim';

    const secretKeysStripped = allSecretKeys.map((sk) => `${baseUrl}/${contractId}#${sk.split(':')[1]}`);

    let stringToWrite = '';
    // Loop through each secret key
    var i = 0;
    for (const sk of secretKeysStripped) {
        stringToWrite += sk + '\n';
        i++;
    }
    
    let userBal = await getUserBalance({
        accountId: funderAccountId
    });
    console.log('userBal before: ', userBal);
    
    await claim({
        secretKey: allSecretKeys[0],
        accountId: 'benjiman.testnet'
    });

    userBal = await getUserBalance({
        accountId: funderAccountId
    });
    console.log('userBal after: ', userBal);


    await writeFile(path.resolve(__dirname, 'token_links.json'), stringToWrite);
    
    t.true(true);
});

// test('NFT drop', async (t) => {
// 	const wallets = ["mynearwallet", "herewallet"];
//     const dropName = "My Cool Drop Name";
//     const depositPerUseNEAR = 0.1;
//     const numKeys = 50;
//     const usesPerKey = 1;
//     const masterKey = "MASTER_KEY";
    
//     const nftTitle = "Moon NFT!";
//     const nftDescription = "A cool NFT for the best dog in the world.";
//     const nftMediaIPFSHash = "bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq";

//     const {dropId} = await createDrop({
//         account: fundingAccount,
//         numKeys: 0,
//         metadata: JSON.stringify({
//             dropName,
//             wallets
//         }),
//         config: {
//             usesPerKey
//         },
//         depositPerUseNEAR,
//         fcData: {
//             methods: [[
//                 {
//                     receiverId: `nft-v2.keypom.${viewAccountId}`,
//                     methodName: "nft_mint",
//                     args: "",
//                     dropIdField: "mint_id",
//                     accountIdField: "receiver_id",
//                     attachedDeposit: parseNearAmount("0.008")
//                 }
//             ]]
//         }
//     })

//     let allSecretKeys = [];
//     // Loop through in intervals of 50 until numKeys is reached
//     let keysAdded = 0;
//     while (keysAdded < numKeys) {
//         const keysToAdd = Math.min(50, numKeys - keysAdded);
//         const {secretKeys, publicKeys} = await generateKeys({
//             numKeys: keysToAdd,
//             rootEntropy: `${masterKey}-${dropId}`,
//             autoMetaNonceStart: keysAdded
//         })
//         await addKeys({
//             account: fundingAccount,
//             dropId,
//             publicKeys
//         })
//         keysAdded += keysToAdd;

//         allSecretKeys = allSecretKeys.concat(secretKeys);
//     }

//     await keypom.createNFTSeries({
//         account: fundingAccount,
//         dropId,
//         metadata: {
//             title: nftTitle,
//             description: nftDescription,
//             media: nftMediaIPFSHash
//         }
//     });

//     const {contractId} = getEnv();

//     const baseUrl = NETWORK_ID === "testnet" ? `https://testnet.keypom-airfoil.pages.dev/claim` : `https://keypom.xyz/claim`

//     const secretKeysStripped = allSecretKeys.map((sk) => `${baseUrl}/${contractId}#${sk.split(":")[1]}`)

//     let stringToWrite = ""
//     // Loop through each secret key
//     var i = 0;
//     for (const sk of secretKeysStripped) {
//         stringToWrite += sk + "\n";
//         i++;
//     }

//     await writeFile(path.resolve(__dirname, `nft_links.json`), stringToWrite);

// 	t.true(true);
// });

// test('Ticket drops', async (t) => {
// 	const wallets = ["mynearwallet", "herewallet"];
//     const dropName = "My Cool Drop Name";
//     const depositPerUseNEAR = 0.1;
//     const numKeys = 50;
//     const usesPerKey = 3;
//     const masterKey = "MASTER_KEY";
    
//     const eventPassword = "event-password";
//     const nftTitle = "Moon NFT!";
//     const nftDescription = "A cool NFT for the best dog in the world.";
//     const nftMediaIPFSHash = "bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq";

//     const {dropId} = await createDrop({
//         account: fundingAccount,
//         numKeys: 0,
//         metadata: JSON.stringify({
//             dropName,
//             wallets
//         }),
//         config: {
//             usesPerKey
//         },
//         depositPerUseNEAR,
//         fcData: {
//             methods: [
//                 null,
//                 null,
//                 [
//                     {
//                         receiverId: `nft-v2.keypom.${viewAccountId}`,
//                         methodName: "nft_mint",
//                         args: "",
//                         dropIdField: "mint_id",
//                         accountIdField: "receiver_id",
//                         attachedDeposit: parseNearAmount("0.008")
//                     }
//                 ]
//             ]
//         }
//     })

//     let allSecretKeys = [];
//     // Loop through in intervals of 50 until numKeys is reached
//     let keysAdded = 0;
//     while (keysAdded < numKeys) {
//         const keysToAdd = Math.min(50, numKeys - keysAdded);
//         const {secretKeys, publicKeys} = await generateKeys({
//             numKeys: keysToAdd,
//             rootEntropy: `${masterKey}-${dropId}`,
//             autoMetaNonceStart: keysAdded
//         })
//         await addKeys({
//             account: fundingAccount,
//             dropId,
//             publicKeys,
//             basePassword: eventPassword,
//             passwordProtectedUses: [2]
//         })
//         keysAdded += keysToAdd;

//         allSecretKeys = allSecretKeys.concat(secretKeys);
//     }

//     await keypom.createNFTSeries({
//         account: fundingAccount,
//         dropId,
//         metadata: {
//             title: nftTitle,
//             description: nftDescription,
//             media: nftMediaIPFSHash
//         }
//     });

//     const {contractId} = getEnv();

//     const baseUrl = NETWORK_ID === "testnet" ? `https://testnet.keypom-airfoil.pages.dev/claim` : `https://keypom.xyz/claim`

//     const secretKeysStripped = allSecretKeys.map((sk) => `${baseUrl}/${contractId}#${sk.split(":")[1]}`)

//     let stringToWrite = ""
//     // Loop through each secret key
//     var i = 0;
//     for (const sk of secretKeysStripped) {
//         stringToWrite += sk + "\n";
//         i++;
//     }

//     await writeFile(path.resolve(__dirname, `ticket_links.json`), stringToWrite);

// 	t.true(true);
// });