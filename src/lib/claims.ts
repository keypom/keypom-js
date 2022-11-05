import * as nearAPI from "near-api-js";
import BN from 'bn.js'
const {
	KeyPair,
	utils: {
		format: { parseNearAmount },
	},
} = nearAPI;

import { CreateDropParams } from "./types";
import { getEnv } from "./keypom";
import {
	genKey,
	estimateRequiredDeposit,
	ftTransferCall,
	nftTransferCall,
} from "./keypom-utils";


export const claim = ({
	secretKey,
	accountId,
	newAccountId,
	newPublicKey, 
}) => {

	const {
		networkId, keyStore, attachedGas, contractId, contractAccount, receiverId, execute,
	} = getEnv()

	const keyPair = KeyPair.fromString(secretKey)
	keyStore.setKey(networkId, contractId, keyPair)

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
