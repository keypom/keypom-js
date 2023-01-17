export interface FTData {
    contractId?: string;
    senderId?: string;
    /**
     * Amount: human readable format for the amount of tokens to transfer everytime the FT key is used.
     * Example: transferring one wNEAR should be passed in as "1" and NOT "1000000000000000000000000"
     */
    amount?: string;
    /**
     * Absolute Amount: amount of tokens to transfer but considering the decimal amount.
     * Example: transferring one wNEAR should be passed in as "1000000000000000000000000" and NOT "1"
     */
    absoluteAmount?: string;
}
