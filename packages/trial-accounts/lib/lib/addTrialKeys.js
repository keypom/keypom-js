"use strict";
// addTrialKeys.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTrialAccounts = void 0;
const crypto_1 = require("@near-js/crypto");
const near_1 = require("./networks/near");
/**
 * Adds trial accounts to the trial contract by generating key pairs and deriving MPC keys.
 *
 * @param params - The parameters required to add trial accounts.
 * @returns A Promise that resolves to an array of TrialKey objects.
 * @throws Will throw an error if adding trial keys fails.
 */
async function addTrialAccounts(params) {
    const { signerAccount, trialContractId, mpcContractId, trialId, numberOfKeys, } = params;
    console.log(`Adding ${numberOfKeys} trial accounts...`);
    const trialKeys = [];
    for (let i = 0; i < numberOfKeys; i++) {
        // Generate a new key pair
        const keyPair = crypto_1.KeyPair.fromRandom("ed25519");
        // Derive the MPC public key
        const derivationPath = keyPair.getPublicKey().toString();
        const mpcPublicKey = await signerAccount.viewFunction({
            contractId: mpcContractId,
            methodName: "derived_public_key",
            args: {
                path: derivationPath,
                predecessor: trialContractId,
            },
        });
        console.log(`Derived MPC public key: ${mpcPublicKey}`);
        trialKeys.push({
            derivationPath,
            trialAccountSecretKey: keyPair.toString(),
            trialAccountPublicKey: keyPair.getPublicKey().toString(),
            mpcKey: mpcPublicKey,
        });
    }
    // Prepare data to send to the contract
    const keysWithMpc = trialKeys.map((trialKey) => ({
        public_key: trialKey.trialAccountPublicKey,
        mpc_key: trialKey.mpcKey,
    }));
    // Call the `add_trial_keys` function
    const result = await (0, near_1.sendTransaction)({
        signerAccount,
        receiverId: trialContractId,
        methodName: "add_trial_keys",
        args: {
            keys: keysWithMpc,
            trial_id: trialId,
        },
        deposit: "1",
        gas: "300000000000000",
    });
    if (result) {
        console.log("Trial keys added successfully.");
        return trialKeys;
    }
    else {
        throw new Error("Failed to add trial keys");
    }
}
exports.addTrialAccounts = addTrialAccounts;
