import { FCData } from "./fc"
import { FTData } from "./ft"
import { NFTData } from "./nft"
import { SimpleData } from "./simple"

/** 
 * Important information returned in many view calls regarding a specific access key.
*/
export interface KeyInfo {
    /** Drop ID for the specific drop that the key belongs to. */
    dropId: string,
    /** Public key for this access key. */
    publicKey: string,

    /** Which use is the key currently on? For single-use keys, this is always 1.  */
    curKeyUse: number,

    /** How many uses this key has left before it's deleted.  */
    remainingUses: number,

    /** At what timestamp was the key last used? Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC. */
    lastUsed: number,

    /** How much allowance does the key have left (measured in $yoctoNEAR). When the key is deleted, this is refunded to the funder's balance. */
    allowance: number,

    /** The unique ID associated to this key. IDs are *not* unique across drops but they are unique for any key in the drop. */
    keyId: number,
}

/** 
 * Information related to a specific drop.
*/
export interface Drop {
    /** Drop ID for this specific drop. */
    dropId: string,
    /** Which account created this drop. */
    ownerId: string,
    /** How much $yoctoNEAR will be transferred anytime a key is used that is part of this drop. */
    depositPerUse: string,
    /** For simple drops, there are specific, optional configurations. */
    simple?: SimpleData,
    /** For NFT drops, important information such as the token IDs, or contract need to be stored. */
    nft?: NFTData,
    /** For Fungible Token drops, important information such as the amount of tokens to transfer, or contract need to be stored. */
    ft?: FTData,
    /** For Function-Call drops, important information needs to be stored such as which methods, the attached deposit, args etc. */
    fc?: FCData,
    /** All drops regardless of their type can have a suite of configurations such as how many uses each key has or how often a key can be used. */
    config?: DropConfig,
    /** Any extra information about the drop can be stored as metadata. This is up to the drop creator and can be stringified JSON, or any other string. */
    metadata?: string,
    /** How many key uses are registered for this drop? This is only applicable to simple drops with lazy registrations, FT drops, and NFT drops. */
    registeredUses: number,
    /** In order to use an access key that's part of this drop, how much Gas *needs* to be attached to the call? */
    requiredGas: string,
    /** What is the next unique ID that will be given to the next access key added to this drop. */
    nextKeyId: number
}

/** 
 * Configurable options for any drop regardless of type.
*/
export interface DropConfig {
	/** How many uses can each key have before it's deleted. If this isn't specified, it defaults to 1 use per key. */
	usesPerKey?: number,

	/** Any information related to time-based configurations such as a starting date for keys etc. */
	time?: TimeConfig,
	
	/** Any information related to how access keys are used such as which methods they can call or whether an empty drop should be automatically deleted etc.*/
	usage?: UsageConfig,

    /** Any information related to primary market sales for access keys added to this drop.*/
    sale?: PublicSaleConfig,

	/** Override the global root account that all created sub-accounts will have (currently `near` or `testnet`). This allows users to drops that have a custom root.
     * For example, Fayyr could specify a root of `fayyr.near` By which all sub-accounts will then be `ACCOUNT.fayyr.near`. 
     * It's important to note that this root account *MUST* have a smart contract deployed that has a method `create_account`.
    */
	dropRoot?: string,
}

/** 
 * Within the config, there are configurable options related to timing such as how often a key can be used.
*/
export interface TimeConfig {
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
 * Within the config, there are configurable options related to how keys can be used. What permissions they have, whether an empty drop should be automatically deleted etc.
*/
export interface UsageConfig {
    /**
     * Specify which methods can be called by the access key (either `claim` or `create_account_and_claim`). If this isn't specified, both methods can be called.
     */
    permissions?: string
    /**
     * If the method `claim` is called rather than `create_account_and_claim`, should the `deposit_per_use` be refunded to the owner's balance?
     * If this isn't specified, it defaults to false.
     */
    refundDeposit?: boolean
    /**
     * When a key is used and deleted, if it results in the drop being empty, should the drop automatically be deleted? If this isn't specified, it defaults to false.
     */
    autoDeleteDrop?: boolean
    /**
     * In the case where `autoDeleteDrop` is set to true and the drop is the owner's last, should their balance be automatically withdrawn? If this isn't specified, it defaults to false.
     */
    autoWithdraw?: boolean
    /** When calling `create_account` on the root account, which keypom args should be attached to the payload. */
    accountCreationFields?: {
        /**
         * Specifies what field Keypom should auto-inject the account that claimed the drop's ID into when calling the `create_account` function.
        */
        accountIdField?: string,
        /**
         * Specifies what field Keypom should auto-inject the drop's ID into when calling the `create_account` function.
        */
        dropIdField?: string,
        /**
         * Specifies what field Keypom should auto-inject the key's ID into when calling the `create_account` function.
        */
        keyIdField?: string,
        /**
         * Specifies what field Keypom should auto-inject the drop funder's account ID into when calling the `create_account` function.
        */
        funderIdField?: string,
    },
}

/** 
 * Within the config, there are configurable options related to how keys can be sold and a funder can potentially make a profit.
*/
export interface PublicSaleConfig {
    /** Maximum number of keys that can be added to this drop. If None, there is no max. */
    maxNumKeys?: number,
    /** 
     * Amount of $NEAR that the user needs to attach (if they are not the funder) on top of costs. This amount will be
     * Automatically sent to the funder's balance. If None, the keys are free to the public.
    */
    pricePerKeyNEAR?: number,
    pricePerKeyYocto?: string,
    /** Which accounts are allowed to add keys? If the allowlist is empty, anyone that is not in the blocklist can add keys. */
    allowlist?: string[],
    /** Which accounts are NOT allowed to add keys? */
    blocklist?: string[],
    /** 
     * Should the revenue generated be sent to the funder's account balance or
     * automatically withdrawn and sent to their NEAR wallet? 
    */
    autoWithdrawFunds?: boolean,
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


/** 
 * Keeps track of the password for a given key use. This should be passed in as an array for each key that has passwords.
*/
export interface PasswordPerUse {
    /** The password for this given use */
	pw: string; 
    /** Which use does the password belong to? These uses are *NOT* zero-indexed so the first use corresponds to `1` not `0`. */
    key_use: number
}