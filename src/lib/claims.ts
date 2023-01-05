import * as nearAPI from "near-api-js";
const {
	KeyPair,
} = nearAPI;

import { getEnv } from "./keypom";

export const claim = async ({
	secretKey,
	accountId,
	newAccountId,
	newPublicKey, 
}) => {

	const {
		networkId, keyStore, attachedGas, contractId, contractAccount, receiverId, execute, fundingKeyPair,
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
	
	const result = await execute({ transactions, account: contractAccount })

	if (fundingKeyPair) {
		await keyStore.setKey(networkId, contractId, fundingKeyPair)
	}

	return result
}
