/**
 * General structure of a Non-Fungible Token drop. This should be passed into `createDrop` if you wish to have an NFT drop.
 */
export interface NFTData {
	/** The account ID that the NFT contract is deployed to. This contract is where all the NFTs for the specific drop must come from. */
	contractId: string;
	/** The account ID that will be sending any NFTs to the Keypom contract for the specific drop. Most times, this is simply the funder / drop owner. */
	senderId: string;
	/** 
	 * If there are any token IDs that you wish to be automatically sent to the Keypom contract in order to register keys as part of `createDrop`, specify them here.
	 * A maximum of 2 token IDs can be sent as part of the transaction. If you wish to register more keys by sending more NFTs, you must do this in a separate call by invoking
	 * the `nftTransferCall` method separately.
	 */
	tokenIds?: string[];
}