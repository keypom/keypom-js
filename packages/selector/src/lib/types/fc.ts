import { Maybe } from "../keypom";

/** 
 * Outlines the information needed for any given method as part of a Function-Call drop. 
 * Each individual key use can have an array of Methods that can be called. 
*/
export interface Method {
    /** 
	 * The account ID that the contract is deployed to that the method will be called on.
	*/
	receiverId: string;
	/** 
	 * The method that should be invoked on the `receiverId`'s contract.
	*/
	methodName: string;
	/** 
	 * What arguments should be passed to the method. This should be in stringified JSON.
	*/
	args: string;
	/** 
	 * How much yoctoNEAR should be attached to the call.
	*/
	attachedDeposit: string;
	/**
	 * How much gas to attach to this method call. If none, all the gas is split between the parallel method calls in a given claim.
	 * If this is specified, the key can ONLY be used to call `claim` and no `deposit_per_use` can be specified. This leads the key to act like a method calling proxy instead of a linkdrop.
	 */
    attachedGas?: string,
	/**
	 * Specifies what field Keypom should auto-inject the account that claimed the drop's ID into when calling the function.
	 * As an example, if the methodName was `nft_mint` and it expected a field `receiver_id` to be passed in, indicating who should receive the token, then the `accountIdField` would be `receiver_id`.
	 * To insert into nested objects, use periods to separate. For example, to insert into args.metadata.field, you would specify "metadata.field"
	*/
	accountIdField?: string;
	/**
	 * Specifies what field Keypom should auto-inject the drops ID into when calling the function.
	 * As an example, if an NFT contract expected the Keypom drop ID to be passed in as the field `keypom_drop_id` in order to gate access to who can mint NFTs, then the `dropIdField` would be `keypom_drop_id`.
	 * To insert into nested objects, use periods to separate. For example, to insert into args.metadata.field, you would specify "metadata.field"
	*/
	dropIdField?: string;
	/**
	 * Specifies what field Keypom should auto-inject the key's ID into when calling the function.
	 * As an example, if an NFT contract wanted to gate only users with an odd key ID to be able to mint an NFT and their parameter was called `keypom_key_id`, then the `keyIdField` would be `keypom_key_id`.
	 * To insert into nested objects, use periods to separate. For example, to insert into args.metadata.field, you would specify "metadata.field"
	*/
	keyIdField?: string;
	/**
	 * Specifies what field Keypom should auto-inject the drop funder's account ID into when calling the function.
	 * As an example, if an NFT contract wanted to gate only users that had a key coming from a specific funder's drops, it could expect a field called `keypom_funder_id` and the `funderIdField` would be `keypom_funder_id`.
	 * To insert into nested objects, use periods to separate. For example, to insert into args.metadata.field, you would specify "metadata.field"
	*/
	funderIdField?: string,
	/**
     * If set to true, the claiming account ID will be the receiver ID of the method call.
     * This receiver must be a valid account and non-malicious (cannot be set to the keypom contract) 
    **/ 
	receiverToClaimer?: boolean;
	/**  
	 * What permissions does the user have when providing custom arguments to the function call?
	 * By default, the user cannot provide any custom arguments
	*/
	userArgsRule?: "AllUser" | "FunderPreferred" | "UserPreferred"
}

/** 
 * Information pertaining to all Function-Call drops. This should be passed in if the drop will be a Function-Call drop.
*/
export interface FCData {
	/** 
	 * The top level array indicates a different set of methods that can be called for every key use. It is possible that for a given key use, no methods are called thus acting as a "free" key use whereby the use is reflected on-chain but no assets are transferred. 
	 * If a given key use does not have an undefined set of methods, when it is used, all the methods in the set will be called.
	*/
	methods: Array<Maybe<Array<Method>>>
}