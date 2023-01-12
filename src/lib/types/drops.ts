import { FCData } from "./fc"
import { FTData } from "./ft"
import { NFTData } from "./nft"
import { SimpleData } from "./simple"

export interface KeyInfo {
    // Drop ID for the specific drop
    dropId: string,
    publicKey: string,

    // Which use is the current key on?
    curKeyUse: number,

    // How many uses this key has left. Once 0 is reached, the key is deleted
    remainingUses: number,

    // When was the last time the key was used
    lastUsed: number,

    // How much allowance does the key have left. When the key is deleted, this is refunded to the funder's balance.
    allowance: number,

    // Nonce for the current key.
    keyId: number,
}

export interface Drop {
    dropId: string,
    ownerId: string,
    depositPerUse: string,
    simple?: SimpleData,
    nft?: NFTData,
    ft?: FTData,
    fc?: FCData,
    config?: DropConfig,
    metadata?: string,
    registeredUses: number,
    requiredGas: string,
    nextKeyId: number
}

export interface DropConfig {
	/// How many uses can each key have before it's deleted. If None, default to 1.
	usesPerKey?: number,

	// Any time based configurations
	time?: TimeConfig,
	
	// Any usage specific configurations
	usage?: UsageConfig,

	/// Override the global root account that sub-accounts will have (near or testnet). This allows
	/// users to create specific drops that can create sub-accounts of a predefined root.
	/// For example, Fayyr could specify a root of `fayyr.near` By which all sub-accounts will then
	/// be `ACCOUNT.fayyr.near`
	dropRoot?: string,
}

export interface TimeConfig {
    /// Minimum block timestamp before keys can be used. If None, keys can be used immediately
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    start?: number

    /// Block timestamp that keys must be before. If None, keys can be used indefinitely
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    end?: number

    /// Time interval between each key use. If None, there is no delay between key uses.
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    throttle?: number

    /// Interval of time after the `start_timestamp` that must pass before a key can be used.
    /// If multiple intervals pass, the key can be used multiple times. This has nothing to do
    /// With the throttle timestamp. It only pertains to the start timestamp and the current
    /// timestamp. The last_used timestamp is not taken into account.
    /// Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    interval?: number
}

export interface UsageConfig {
    /// Can the access key only call the claim method_name? Default to both method_name callable
    permissions?: string
    /// If claim is called, refund the deposit to the owner's balance. If None, default to false.
    refundDeposit?: boolean
    /// Should the drop be automatically deleted when all the keys are used? This is defaulted to false and
    /// Must be overwritten
    autoDeleteDrop?: boolean
    /// When this drop is deleted and it is the owner's *last* drop, automatically withdraw their balance.
    autoWithdraw?: boolean
}