export declare const networks: {
    mainnet: {
        networkId: string;
        nodeUrl: string;
        walletUrl: string;
        helperUrl: string;
    };
    testnet: {
        networkId: string;
        nodeUrl: string;
        walletUrl: string;
        helperUrl: string;
    };
};
export declare const KEYPOM_LOCAL_STORAGE_KEY = "keypom-wallet-selector";
export declare const getLocalStorageKeypomEnv: () => string | null;
export declare const setLocalStorageKeypomEnv: (jsonData: any) => void;
export declare const isKeypomDrop: (networkId: any, keypomContractId: any) => boolean;
export declare const isUnclaimedTrialDrop: (networkId: any, keypomContractId: any, secretKey: any) => Promise<boolean>;
