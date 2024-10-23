"use strict";
// activateTrial.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateTrialAccounts = void 0;
const crypto_1 = require("@near-js/crypto");
const near_1 = require("./networks/near");
/**
 * Activates trial accounts on the trial contract.
 *
 * @param params - The parameters required to activate trial accounts.
 * @returns A Promise that resolves when all accounts are activated.
 * @throws Will throw an error if activation of any trial account fails.
 */
async function activateTrialAccounts(params) {
    const { trialContractId, trialAccountIds, near, trialAccountSecretKeys } = params;
    for (let i = 0; i < trialAccountIds.length; i++) {
        const trialAccountId = trialAccountIds[i];
        const trialKey = trialAccountSecretKeys[i];
        const chainId = params.chainIds[i];
        // Set the trial key in the keyStore
        const keyStore = near.connection.signer.keyStore;
        await keyStore.setKey(near.connection.networkId, trialContractId, crypto_1.KeyPair.fromString(trialKey));
        const signerAccount = await near.account(trialContractId);
        const result = await (0, near_1.sendTransaction)({
            signerAccount,
            receiverId: trialContractId,
            methodName: "activate_trial",
            args: {
                new_account_id: trialAccountId,
                chain_id: chainId.toString(),
            },
            deposit: "0",
            gas: "300000000000000",
        });
        if (!result) {
            throw new Error(`Failed to activate trial account: ${trialAccountId}`);
        }
    }
}
exports.activateTrialAccounts = activateTrialAccounts;
