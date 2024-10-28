// addTrialKeys.ts

import { KeyPair } from "near-api-js";
import { TrialKey } from "./types";

interface AddTrialAccountsParams {
    trialContractId: string;
    mpcContractId: string;
    numberOfKeys: number;
    viewFunction: any;
}

/**
 * Generates the trial key data needed to add trial accounts.
 *
 * @param params - The number of keys to generate.
 * @returns A Promise that resolves to an array of TrialKey objects.
 */
export async function generateTrialKeys(
    params: AddTrialAccountsParams
): Promise<TrialKey[]> {
    const { trialContractId, mpcContractId, numberOfKeys, viewFunction } =
        params;

    const trialKeys: TrialKey[] = [];

    for (let i = 0; i < numberOfKeys; i++) {
        // Generate a new key pair
        const keyPair = KeyPair.fromRandom("ed25519");

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
