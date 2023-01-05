import * as nearAPI from "near-api-js";
const {
	KeyPair,
} = nearAPI;

import { getEnv } from "./keypom";

/**
 * Allows a specific Keypom drop to be claimed via the secret key.
 * 
 * @param {string} secretKey The private key associated with the Keypom link. This can either contain the `ed25519:` prefix or not.
 * @param {string=} accountId (OPTIONAL) The account ID of an existing account that will be used to claim the drop.
 * @param {string=} newAccountId (OPTIONAL) If passed in, a new account ID will be created and the drop will be claimed to that account. This must be an account that does not exist yet.
 * @param {string=} newPublicKey (OPTIONAL) If creating a new account, a public key must be passed in to be used as the full access key for the newly created account.
 * 
 * @example <caption>Using a pre-created NEAR connection instance with an UnencryptedFileSystemKeyStore:</caption>
 * ```
 * ``` 
*/
export const claim = async ({
	secretKey,
	accountId,
	newAccountId,
	newPublicKey, 
}) => {

	const {
		networkId, keyStore, attachedGas, contractId, contractAccount, receiverId, execute, connection,
	} = getEnv()

	const keyPair = KeyPair.fromString(secretKey)
	await keyStore.setKey(networkId, contractId, keyPair)

	const transactions: any[] = [{
		receiverId,
		actions: [{
			type: 'FunctionCall',
			params: newAccountId ? 
			{
				methodName: 'create_account_and_claim',
				args: {
					new_account_id: newAccountId,
					new_public_key: newPublicKey,
				},
				gas: attachedGas,
			}
			:
			{
				methodName: 'claim',
				args: {
					account_id: accountId
				},
				gas: attachedGas,
			}
		}]
	}]

	return execute({ transactions, account: contractAccount })
}
