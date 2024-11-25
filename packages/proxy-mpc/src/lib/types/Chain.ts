/**
 * Enum representing supported blockchains.
 */
export enum Chain {
    NEAR = "NEAR",
    Ethereum = "Ethereum",
}

export type ChainId = { type: "NEAR" } | { type: "EVM"; value: number };

export function serializeChainId(chainId: ChainId): any {
    if (chainId.type === "NEAR") {
        return { type: "NEAR" };
    } else if (chainId.type === "EVM") {
        return { type: "EVM", value: chainId.value };
    } else {
        throw new Error("Invalid ChainId");
    }
}

export function deserializeChainId(data: any): ChainId {
    if (data.type === "NEAR") {
        return { type: "NEAR" };
    } else if (data.type === "EVM") {
        return { type: "EVM", value: data.value };
    } else {
        throw new Error("Invalid ChainId data");
    }
}
