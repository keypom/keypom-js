export declare const resolveWalletUrl: (network: string, walletUrl?: string) => string;
interface INetworkPreset {
    networkId: string;
    nodeUrl: string;
    helperUrl: string;
    explorerUrl: string;
}
export declare const getNetworkPreset: (networkId: string) => INetworkPreset;
export {};
