// activateTrial.ts

import { KeyPair, KeyPairString } from "@near-js/crypto";
import { Near } from "@near-js/wallet-account";
import { sendTransaction } from "./networks/near";

interface ActivateTrialAccountsParams {
    near: Near;
    trialContractId: string;
    trialAccountIds: string[];
    trialAccountSecretKeys: KeyPairString[];
    chainIds: string[];
}

/**
 * Activates trial accounts on the trial contract.
 *
 * @param params - The parameters required to activate trial accounts.
 * @returns A Promise that resolves when all accounts are activated.
 * @throws Will throw an error if activation of any trial account fails.
 */
export async function activateTrialAccounts(
    params: ActivateTrialAccountsParams
): Promise<void> {
    const { trialContractId, trialAccountIds, near, trialAccountSecretKeys } =
        params;

    for (let i = 0; i < trialAccountIds.length; i++) {
        const trialAccountId = trialAccountIds[i];
        const trialKey = trialAccountSecretKeys[i];
        const chainId = params.chainIds[i];

        // Set the trial key in the keyStore
        const keyStore: any = (near.connection.signer as any).keyStore;
        await keyStore.setKey(
            near.connection.networkId,
            trialContractId,
            KeyPair.fromString(trialKey)
        );
        const signerAccount = await near.account(trialContractId);

        const result = await sendTransaction({
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
            throw new Error(
                `Failed to activate trial account: ${trialAccountId}`
            );
        }
    }
}
