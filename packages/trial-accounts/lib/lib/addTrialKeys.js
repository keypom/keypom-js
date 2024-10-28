"use strict";
// addTrialKeys.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTrialKeys = void 0;
const near_api_js_1 = require("near-api-js");
/**
 * Generates the trial key data needed to add trial accounts.
 *
 * @param params - The number of keys to generate.
 * @returns A Promise that resolves to an array of TrialKey objects.
 */
async function generateTrialKeys(params) {
    const { trialContractId, mpcContractId, numberOfKeys, viewFunction } = params;
    const trialKeys = [];
    for (let i = 0; i < numberOfKeys; i++) {
        // Generate a new key pair
        const keyPair = near_api_js_1.KeyPair.fromRandom("ed25519");
        // Derive the MPC public key
        const derivationPath = keyPair.getPublicKey().toString();
        const mpcPublicKey = await viewFunction({
            contractId: mpcContractId,
            methodName: "derived_public_key",
            args: {
                path: derivationPath,
                predecessor: trialContractId,
            },
        });
        trialKeys.push({
            derivationPath,
            trialAccountSecretKey: keyPair.toString(),
            trialAccountPublicKey: keyPair.getPublicKey().toString(),
            mpcKey: mpcPublicKey,
        });
    }
    return trialKeys;
}
exports.generateTrialKeys = generateTrialKeys;
