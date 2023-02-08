/**
 * General structure of a Non-Fungible Token drop. This should be passed into `createDrop` if you wish to have an NFT drop.
 */
export interface NFTData {
    /** The account ID that the NFT contract is deployed to. This contract is where all the NFTs for the specific drop must come from. */
    contractId: string;
    /** By default, anyone can fund your drop with NFTs. This field allows you to set a specific account ID that will be locked into sending the NFTs. */
    senderId?: string;
    /**
     * If there are any token IDs that you wish to be automatically sent to the Keypom contract in order to register keys as part of `createDrop`, specify them here.
     * A maximum of 2 token IDs can be sent as part of the transaction. If you wish to register more keys by sending more NFTs, you must do this in a separate call by invoking
     * the `nftTransferCall` method separately.
     */
    tokenIds?: string[];
}
/**
 * General structure of a Non-Fungible Token object as per official NEP-171 standard (https://github.com/near/NEPs/blob/master/neps/nep-0171.md).
 */
export interface ProtocolReturnedNonFungibleTokenObject {
    /** String ID for the token */
    token_id: string;
    /** Account ID of the owner */
    owner_id: string;
    /** Metadata for the token */
    metadata?: ProtocolReturnedNonFungibleTokenMetadata;
    /** Map of account IDs to approval IDs as per official NEP-178 standard (https://github.com/near/NEPs/blob/master/neps/nep-0178.md). */
    approved_account_ids?: Map<string, number>;
    /** A mapping of NEAR accounts to the amount each should be paid out as per official NEP-199 standard (https://github.com/near/NEPs/blob/master/neps/nep-0199.md). */
    royalty?: Map<string, number>;
}
/**
 * General structure of Non-Fungible Token Metadata as per official NEP-177 standard (https://github.com/near/NEPs/blob/master/neps/nep-0177.md).
 */
export interface ProtocolReturnedNonFungibleTokenMetadata {
    /** ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055" */
    title?: string;
    /** free-form description */
    description?: string;
    /** URL to associated media, preferably to decentralized, content-addressed storage */
    media?: string;
    /** Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included. */
    media_hash?: string;
    /** number of copies of this set of metadata in existence when token was minted. */
    copies?: number;
    /** When token was issued or minted, Unix epoch in milliseconds */
    issued_at?: number;
    /** When token expires, Unix epoch in milliseconds */
    expires_at?: number;
    /** When token starts being valid, Unix epoch in milliseconds */
    starts_at?: number;
    /** When token was last updated, Unix epoch in milliseconds */
    updated_at?: number;
    /** anything extra the NFT wants to store on-chain. Can be stringified JSON. */
    extra?: string;
    /** URL to an off-chain JSON file with more info. */
    reference?: string;
    /** Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included. */
    reference_hash?: string;
}
/**
 * General structure of Non-Fungible Token Metadata (in camelCase) as per official NEP-177 standard (https://github.com/near/NEPs/blob/master/neps/nep-0177.md).
 */
export interface NonFungibleTokenMetadata {
    /** ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055" */
    title?: string;
    /** free-form description */
    description?: string;
    /** URL to associated media, preferably to decentralized, content-addressed storage */
    media?: string;
    /** Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included. */
    mediaHash?: string;
    /** number of copies of this set of metadata in existence when token was minted. */
    copies?: number;
    /** When token was issued or minted, Unix epoch in milliseconds */
    issuedAt?: number;
    /** When token expires, Unix epoch in milliseconds */
    expiresAt?: number;
    /** When token starts being valid, Unix epoch in milliseconds */
    startsAt?: number;
    /** When token was last updated, Unix epoch in milliseconds */
    updatedAt?: number;
    /** anything extra the NFT wants to store on-chain. Can be stringified JSON. */
    extra?: string;
    /** URL to an off-chain JSON file with more info. */
    reference?: string;
    /** Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included. */
    referenceHash?: string;
}
