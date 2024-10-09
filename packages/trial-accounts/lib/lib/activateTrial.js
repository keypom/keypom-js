"use strict";
// activateTrial.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateTrialAccounts = void 0;
const crypto_1 = require("@near-js/crypto");
const nearUtils_1 = require("./nearUtils");
/**
 * Activates trial accounts on the trial contract.
 *
 * @param params - The parameters required to activate trial accounts.
 * @returns A Promise that resolves when all accounts are activated.
 * @throws Will throw an error if activation of any trial account fails.
 */
async function activateTrialAccounts(params) {
    const { contractAccountId, trialAccountIds, near, config, trialAccountSecretKeys, } = params;
    console.log("Activating trial accounts...");
    for (let i = 0; i < trialAccountIds.length; i++) {
        const trialAccountId = trialAccountIds[i];
        const trialKey = trialAccountSecretKeys[i];
        console.log(`Activating trial account: ${trialAccountId}`);
        // Set the trial key in the keyStore
        const keyStore = near.connection.signer.keyStore;
        await keyStore.setKey(config.networkId, contractAccountId, crypto_1.KeyPair.fromString(trialKey));
        const signerAccount = await near.account(contractAccountId);
        const result = await (0, nearUtils_1.sendTransaction)({
            signerAccount,
            receiverId: contractAccountId,
            methodName: "activate_trial",
            args: {
                new_account_id: trialAccountId,
            },
            deposit: "0",
            gas: "300000000000000",
        });
        if (result) {
            console.log(`Trial account ${trialAccountId} activated.`);
        }
        else {
            throw new Error(`Failed to activate trial account: ${trialAccountId}`);
        }
    }
}
exports.activateTrialAccounts = activateTrialAccounts;
