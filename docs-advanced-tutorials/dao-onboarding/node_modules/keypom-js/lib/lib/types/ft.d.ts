/**
 * Information pertaining to all Fungible-Token drops. This should be passed in if the drop will be used to transfer any fungible tokens.
*/
export interface FTData {
    /**
     * Which contract do the FTs belong to?
     */
    contractId: string;
    /**
     * By default, anyone can fund your drop with FTs. This field allows you to set a specific account ID that will be locked into sending the FTs.
     */
    senderId?: string;
    /**
     * Human readable format for the amount of tokens to transfer everytime the FT key is used.
     * Example: transferring one wNEAR should be passed in as "1" and NOT "1000000000000000000000000"
     */
    amount?: string;
    /**
     * Amount of tokens to transfer but considering the decimal amount.
     * Example: transferring one wNEAR should be passed in as "1000000000000000000000000" and NOT "1"
     */
    absoluteAmount?: string;
}
/**
 * General structure of Fungible Token Metadata as per official NEP-148 standard (https://github.com/near/NEPs/blob/master/neps/nep-0148.md).
 */
export interface FungibleTokenMetadata {
    /** A string. Should be ft-1.0.0 to indicate that a Fungible Token contract adheres to the current versions of this Metadata and the Fungible Token Core specs. This will allow consumers of the Fungible Token to know if they support the features of a given contract. */
    spec: string;
    /** The human-readable name of the token. */
    name: string;
    /** The abbreviation, like wETH or AMPL. */
    symbol: string;
    /** Used in frontends to show the proper significant digits of a token. This concept is explained well in this OpenZeppelin post (https://docs.openzeppelin.com/contracts/3.x/erc20#a-note-on-decimals). */
    decimals: number;
    /**
     * A small image associated with this token. Must be a data URL, to help consumers display it quickly while protecting user data.
     * Recommendation: use optimized SVG, which can result in high-resolution images with only 100s of bytes of storage cost.
     * (Note that these storage costs are incurred to the token owner/deployer, but that querying these icons is a very cheap & cacheable read operation for all consumers of the contract and the RPC nodes that serve the data.)
     * Recommendation: create icons that will work well with both light-mode and dark-mode websites by either using middle-tone color schemes, or by embedding media queries in the SVG.
     */
    icon?: string;
    /** A link to a valid JSON file containing various keys offering supplementary details on the token. Example: /ipfs/QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm, https://example.com/token.json, etc. If the information given in this document conflicts with the on-chain attributes, the values in reference shall be considered the source of truth. */
    reference?: string;
    /** The base64-encoded sha256 hash of the JSON file contained in the reference field. This is to guard against off-chain tampering. */
    reference_hash?: string;
}
