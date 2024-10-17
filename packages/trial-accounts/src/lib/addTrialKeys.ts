// addTrialKeys.ts

import { Account } from "@near-js/accounts";
import { KeyPair } from "@near-js/crypto";
import { sendTransaction } from "./networks/near";
import { TrialKey } from "./types";

interface AddTrialAccountsParams {
    signerAccount: Account;
    trialContractId: string;
    mpcContractId: string;
    trialId: number;
    numberOfKeys: number;
}

/**
 * Adds trial accounts to the trial contract by generating key pairs and deriving MPC keys.
 *
 * @param params - The parameters required to add trial accounts.
 * @returns A Promise that resolves to an array of TrialKey objects.
 * @throws Will throw an error if adding trial keys fails.
 */
export async function addTrialAccounts(
    params: AddTrialAccountsParams
): Promise<TrialKey[]> {
    const {
        signerAccount,
        trialContractId,
        mpcContractId,
        trialId,
        numberOfKeys,
    } = params;

    console.log(`Adding ${numberOfKeys} trial accounts...`);

    const trialKeys: TrialKey[] = [];

    for (let i = 0; i < numberOfKeys; i++) {
        // Generate a new key pair
        const keyPair = KeyPair.fromRandom("ed25519");

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
    const result = await sendTransaction({
        signerAccount,
        receiverId: trialContractId,
        methodName: "add_trial_keys",
        args: {
            keys: keysWithMpc,
            trial_id: trialId,
        },
        deposit: "1", // Adjust deposit as needed
        gas: "300000000000000",
    });

    if (result) {
        console.log("Trial keys added successfully.");

        return trialKeys;
    } else {
        throw new Error("Failed to add trial keys");
    }
}
