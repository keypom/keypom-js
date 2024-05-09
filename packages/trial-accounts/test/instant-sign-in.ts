const path = require("path");
const homedir = require("os").homedir();
const { readFileSync } = require("fs");
const { UnencryptedFileSystemKeyStore } = require("@near-js/keystores-node");
const { Account } = require("@near-js/accounts");
const { connect, Near } = require("@near-js/wallet-account");
const {
    initKeypom,
    createTrialAccountDrop,
    generateKeys,
    claimTrialAccountDrop,
    getEnv,
} = require("@keypom/core");
const { parseNearAmount } = require("@near-js/utils");

const accountId = "benjiman.testnet";
const NETWORK_ID = "testnet";
const instances = {
    discovery: {
        url: "http://localhost:3000/#instant-url/ACCOUNT_ID/SECRET_KEY/MODULE_ID",
        moduleId: "my-near-wallet",
        contract: "v1.social08.testnet",
        allowance: parseNearAmount("0.1"),
        numLinks: 1,
    },
};

async function createInstantSignIn() {
    // Initiate connection to the NEAR blockchain.
    const CREDENTIALS_DIR = ".near-credentials";
    const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

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
    const accountObj = new Account(near.connection, accountId);

    // Initialize the SDK and point it to the custom NEAR object that was created.
    await initKeypom({
        near,
        network: NETWORK_ID,
    });

    // Loop through each key in the instances object and get the value's numLinks property
    for (const [key, value] of Object.entries(instances)) {
        console.log(`\n\n`);

        let numKeys = value.numLinks;
        const { secretKeys, publicKeys } = await generateKeys({ numKeys });
        console.log(`Created ${secretKeys.length} keys for ${key}`);
        console.log(`Public Keys: ${publicKeys}`);
        console.log(`Private Keys: ${secretKeys}`);

        for (const publicKey of publicKeys) {
            await accountObj.addKey(
                publicKey,
                value.contract,
                "",
                value.allowance
            );
        }

        let returnedURLs = [];
        // loop through all secret keys
        secretKeys.forEach((secretKey) => {
            // insert the secret key into the base URL
            let url = value.url.replace("SECRET_KEY", secretKey);
            url = url.replace("ACCOUNT_ID", accountId);
            url = url.replace("MODULE_ID", value.moduleId);

            // add the URL to the array of URLs
            returnedURLs.push(url);
        });

        console.log(`${key}:`);
        console.log(returnedURLs.join("\n"));
    }

    console.log(`\n\n`);
}

createInstantSignIn();
