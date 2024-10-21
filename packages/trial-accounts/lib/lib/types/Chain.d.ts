/**
 * Enum representing supported blockchains.
 */
export declare enum Chain {
    NEAR = "NEAR",
    Ethereum = "Ethereum"
}
export type ChainId = {
    type: "NEAR";
} | {
    type: "EVM";
    value: number;
};
export declare function serializeChainId(chainId: ChainId): any;
export declare function deserializeChainId(data: any): ChainId;
