export interface CreateDropParams {
	account?: Account,
	wallet?: BrowserWalletBehaviour,
	dropId?: string,
	numKeys: number,
	publicKeys?: string[],
	rootEntropy?: string,
	depositPerUseNEAR?: Number,
	depositPerUseYocto?: string,
	metadata?: string,
	config?: DropConfig,
	ftData?: FTData,
	nftData?: NFTData,
	fcData?: FCData,
	simpleData?: SimpleData
	useBalance?: boolean,
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