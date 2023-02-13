/**
 * Information pertaining to all Fungible-Token drops. This should be passed in if the drop will be used to transfer any fungible tokens.
*/
export interface FTData {
    /**
     * Which contract do the FTs belong to?
     */
    contractId: string;
    /**
     * Which account ID will be sending the fungible tokens to the Keypom contract in order to register key uses?
     */
    senderId: string;
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
