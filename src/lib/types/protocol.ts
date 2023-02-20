import { Maybe } from "../keypom"

/** 
 * Key information returned from the Protocol. This interface is exactly the same as the `KeyInfo`, except all the fields are
 * snake cased instead of camel cased due to what the Protocol returns.
*/
export interface ProtocolReturnedKeyInfo {
    /** Drop ID for the specific drop that the key belongs to. */
    drop_id: string,
    /** Public key for this access key. */
    public_key: string,

    /** Which use is the key currently on? For single-use keys, this is always 1.  */
    cur_key_use: number,

    /** How many uses this key has left before it's deleted.  */
    remaining_uses: number,

    /** At what timestamp was the key last used? Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC. */
    last_used: number,

    /** How much allowance does the key have left (measured in $yoctoNEAR). When the key is deleted, this is refunded to the funder's balance. */
    allowance: number,

    /** The unique ID associated to this key. IDs are *not* unique across drops but they are unique for any key in the drop. */
    key_id: number,
}

/** 
 * Drop information returned from the Protocol. This interface is exactly the same as the `Drop`, except all the fields are
 * snake cased instead of camel cased due to what the Protocol returns.
*/
export interface ProtocolReturnedDrop {
    /** Drop ID for this specific drop. */
    drop_id: string,
    /** Which account created this drop. */
    owner_id: string,
    /** How much $yoctoNEAR will be transferred anytime a key is used that is part of this drop. */
    deposit_per_use: string,
    /** For simple drops, there are specific, optional configurations. */
    simple?: ProtocolReturnedSimpleData,
    /** For NFT drops, important information such as the token IDs, or contract need to be stored. */
    nft?: ProtocolReturnedNFTData,
    /** For Fungible Token drops, important information such as the amount of tokens to transfer, or contract need to be stored. */
    ft?: ProtocolReturnedFTData,
    /** For Function-Call drops, important information needs to be stored such as which methods, the attached deposit, args etc. */
    fc?: ProtocolReturnedFCData,
    /** All drops regardless of their type can have a suite of configurations such as how many uses each key has or how often a key can be used. */
    config?: ProtocolReturnedDropConfig,
    /** Any extra information about the drop can be stored as metadata. This is up to the drop creator and can be stringified JSON, or any other string. */
    metadata?: string,
    /** How many key uses are registered for this drop? This is only applicable to simple drops with lazy registrations, FT drops, and NFT drops. */
    registered_uses: number,
    /** In order to use an access key that's part of this drop, how much Gas *needs* to be attached to the call? */
    required_gas: string,
    /** What is the next unique ID that will be given to the next access key added to this drop. */
    next_key_id: number,
    /** If calling `getDrops` or `getDropInformation` and `withKeys` is passed in as true, an extra view call will be done to get a set of keys that are currently on the drop. */
    keys?: ProtocolReturnedKeyInfo[],
}

/** 
 * Drop config returned from the Protocol. This interface is exactly the same as the `DropConfig`, except all the fields are
 * snake cased instead of camel cased due to what the Protocol returns.
*/
export interface ProtocolReturnedDropConfig {
	/** How many uses can each key have before it's deleted. If this isn't specified, it defaults to 1 use per key. */
	uses_per_key?: number,

	/** Any information related to time-based configurations such as a starting date for keys etc. */
	time?: ProtocolReturnedTimeConfig,
	
	/** Any information related to how access keys are used such as which methods they can call or whether an empty drop should be automatically deleted etc.*/
	usage?: ProtocolReturnedUsageConfig,

    sale?: ProtocolReturnedPublicSaleConfig,

	/** 
     * Override the global root account that all created sub-accounts will have (currently `near` or `testnet`). This allows users to drops that have a custom root.
     * For example, Fayyr could specify a root of `fayyr.near` By which all sub-accounts will then be `ACCOUNT.fayyr.near`. 
     * It's important to note that this root account *MUST* have a smart contract deployed that has a method `create_account`.
    */
	root_account_id?: string,
}

/** 
 * Time Config information returned from the Protocol. This interface is exactly the same as the `TimeConfig`, except all the fields are
 * snake cased instead of camel cased due to what the Protocol returns.
*/
export interface ProtocolReturnedTimeConfig {
    /** 
     * Minimum block timestamp before keys can be used. If this isn't specified, keys can be used immediately.
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    start?: number

    /** 
     * Block timestamp that keys must be used before. If this isn't specified, keys can be used indefinitely.
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    end?: number

    /** 
     * Amount of time that *must* pass in between each key use. If this isn't specified, there is no delay between key uses.
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    throttle?: number

    /** 
     * Interval of time after the `start_timestamp` that must pass before a key can be used. If multiple intervals pass, the key can be used multiple times. 
     * This has nothing to do With the throttle timestamp. It only pertains to the start timestamp and the current timestamp. The last_used timestamp is not taken into account.
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    interval?: number
}

/** 
 * Usage Config information returned from the Protocol. This interface is exactly the same as the `UsageConfig`, except all the fields are
 * snake cased instead of camel cased due to what the Protocol returns.
*/
export interface ProtocolReturnedUsageConfig {
    /**
     * Specify which methods can be called by the access key (either `claim` or `create_account_and_claim`). If this isn't specified, both methods can be called.
     */
    permissions?: string
    /**
     * If the method `claim` is called rather than `create_account_and_claim`, should the `deposit_per_use` be refunded to the owner's balance?
     * If this isn't specified, it defaults to false.
     */
    refund_deposit?: boolean
    /**
     * When a key is used and deleted, if it results in the drop being empty, should the drop automatically be deleted? If this isn't specified, it defaults to false.
     */
    auto_delete_drop?: boolean
    /**
     * In the case where `autoDeleteDrop` is set to true and the drop is the owner's last, should their balance be automatically withdrawn? If this isn't specified, it defaults to false.
     */
    auto_withdraw?: boolean

    /** When calling `create_account` on the root account, which keypom args should be attached to the payload. */
    account_creation_fields?: {
        /**
         * Specifies what field Keypom should auto-inject the account that claimed the drop's ID into when calling the `create_account` function.
        */
        account_id_field?: string,
        /**
         * Specifies what field Keypom should auto-inject the drop's ID into when calling the `create_account` function.
        */
        drop_id_field?: string,
        /**
         * Specifies what field Keypom should auto-inject the key's ID into when calling the `create_account` function.
        */
        key_id_field?: string,
        /**
         * Specifies what field Keypom should auto-inject the drop funder's account ID into when calling the `create_account` function.
        */
        funder_id_field?: string,
    },
}

/** 
 * Within the config, there are configurable options related to how keys can be sold and a funder can potentially make a profit.
*/
export interface ProtocolReturnedPublicSaleConfig {
    /** Maximum number of keys that can be added to this drop. If None, there is no max. */
    max_num_keys?: number,
    /** 
     * Amount of $NEAR that the user needs to attach (if they are not the funder) on top of costs. This amount will be
     * Automatically sent to the funder's balance. If None, the keys are free to the public.
    */
    price_per_key?: string,
    /** Which accounts are allowed to add keys? If the allowlist is empty, anyone that is not in the blocklist can add keys. */
    allowlist?: string[],
    /** Which accounts are NOT allowed to add keys? */
    blocklist?: string[],
    /** 
     * Should the revenue generated be sent to the funder's account balance or
     * automatically withdrawn and sent to their NEAR wallet? 
    */
    auto_withdraw_funds?: boolean,
    /**
     * Minimum block timestamp before the public sale starts. If None, keys can be added immediately
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    start?: number,
    /**
     * Block timestamp dictating the end of the public sale. If None, keys can be added indefinitely
     * Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    */
    end?: number,
}

export interface ProtocolReturnedSimpleData {
	// If this is set to true, keys can be created and registered AFTER they've been created (for simple and FC drops only).
    lazy_register?: boolean,
}

/** 
 * NFT Data information returned from the Protocol. This interface is exactly the same as the `NFTData`, except all the fields are
 * snake cased instead of camel cased due to what the Protocol returns.
*/
export interface ProtocolReturnedNFTData {
	/** The account ID that the NFT contract is deployed to. This contract is where all the NFTs for the specific drop must come from. */
	contract_id: string;
	/** By default, anyone can fund your drop with NFTs. This field allows you to set a specific account ID that will be locked into sending the NFTs. */
	sender_id?: string;
}

/** 
 * FT Data returned from the Protocol. This interface is exactly the same as the `FTData`, except all the fields are
 * snake cased instead of camel cased due to what the Protocol returns.
*/
export interface ProtocolReturnedFTData {
	/**
     * Which contract do the FTs belong to?
     */
	contract_id: string;
	/**
     * By default, anyone can fund your drop with FTs. This field allows you to set a specific account ID that will be locked into sending the FTs.
     */
	sender_id?: string;
	/**
     * Amount of tokens to transfer but considering the decimal amount.
	 * Example: transferring one wNEAR should be passed in as "1000000000000000000000000" and NOT "1"
     */
	balance_per_use?: string;
}

/** 
 * Method information returned from the Protocol. This interface is exactly the same as the `Method`, except all the fields are
 * snake cased instead of camel cased due to what the Protocol returns.
*/
export interface ProtocolReturnedMethod {
    /** 
	 * The account ID that the contract is deployed to that the method will be called on.
	*/
	receiver_id: string;
	/** 
	 * The method that should be invoked on the `receiverId`'s contract.
	*/
	method_name: string;
	/** 
	 * What arguments should be passed to the method. This should be in stringified JSON.
	*/
	args: string;
	/** 
	 * How much yoctoNEAR should be attached to the call.
	*/
	attached_deposit: string;
    /**
	 * How much gas to attach to this method call. If none, all the gas is split between the parallel method calls in a given claim.
	 * If this is specified, the key can ONLY be used to call `claim` and no `deposit_per_use` can be specified. This leads the key to act like a method calling proxy instead of a linkdrop.
	 */
    attached_gas?: string,
	/**
	 * Specifies what field Keypom should auto-inject the account that claimed the drop's ID into when calling the function.
	 * As an example, if the methodName was `nft_mint` and it expected a field `receiver_id` to be passed in, indicating who should receive the token, then the `accountIdField` would be `receiver_id`.
     * To insert into nested objects, use periods to separate. For example, to insert into args.metadata.field, you would specify "metadata.field"
	*/
	account_id_field?: string;
	/**
	 * Specifies what field Keypom should auto-inject the drops ID into when calling the function.
	 * As an example, if an NFT contract expected the Keypom drop ID to be passed in as the field `keypom_drop_id` in order to gate access to who can mint NFTs, then the `dropIdField` would be `keypom_drop_id`.
     * To insert into nested objects, use periods to separate. For example, to insert into args.metadata.field, you would specify "metadata.field"
	*/
	drop_id_field?: string;
	/**
	 * Specifies what field Keypom should auto-inject the key's ID into when calling the function.
	 * As an example, if an NFT contract wanted to gate only users with an odd key ID to be able to mint an NFT and their parameter was called `keypom_key_id`, then the `keyIdField` would be `keypom_key_id`.
     * To insert into nested objects, use periods to separate. For example, to insert into args.metadata.field, you would specify "metadata.field"
	*/
	key_id_field?: string;
    /**
	 * Specifies what field Keypom should auto-inject the funder's account ID into when calling the function.
	 * As an example, if an NFT contract wanted to gate only users with an odd key ID to be able to mint an NFT and their parameter was called `keypom_key_id`, then the `keyIdField` would be `keypom_key_id`.
     * To insert into nested objects, use periods to separate. For example, to insert into args.metadata.field, you would specify "metadata.field"
	*/
    funder_id_field?: string;
    /** 
     * If set to true, the claiming account ID will be the receiver ID of the method call.
     * This receiver must be a valid account and non-malicious (cannot be set to the keypom contract) 
    **/ 
    receiver_to_claimer?: boolean;
    /**  
	 * What permissions does the user have when providing custom arguments to the function call?
	 * By default, the user cannot provide any custom arguments
	*/
    user_args_rule?: "AllUser" | "FunderPreferred" | "UserPreferred";
}

/** 
 * FC Data returned from the Protocol. This interface is exactly the same as the `FCData`, except all the fields are
 * snake cased instead of camel cased due to what the Protocol returns.
*/
export interface ProtocolReturnedFCData {
	/** 
	 * The top level array indicates a different set of methods that can be called for every key use. It is possible that for a given key use, no methods are called thus acting as a "free" key use whereby the use is reflected on-chain but no assets are transferred. 
	 * If a given key use does not have an undefined set of methods, when it is used, all the methods in the set will be called.
	*/
	methods: Array<Maybe<Array<ProtocolReturnedMethod>>>
}