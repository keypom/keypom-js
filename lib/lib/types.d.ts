import { BrowserWalletBehaviour } from '@near-wallet-selector/core/lib/wallet/wallet.types';
export interface Account {
    accountId: string;
    signAndSendTransaction: () => {};
}
export interface Network {
    networkId: string;
    nodeUrl: string;
    helperUrl: string;
    explorerUrl: string;
}
export interface Funder {
    accountId: string;
    secretKey: string;
    seedPhrase: string;
}
export interface InitKeypomParams {
    near: any;
    network: string;
    funder?: Funder;
}
export interface DropConfig {
    usesPerKey?: number;
    deleteOnEmpty?: true;
    autoWithdraw?: true;
    startTimestamp?: string;
    throttleTimestamp?: string;
    onClaimRefundDeposit?: boolean;
    claimPermission?: boolean;
    dropRoot?: string;
}
export interface FTData {
    contractId?: string;
    senderId?: string;
    balancePerUse?: string;
}
export interface NFTData {
    contractId?: string;
    senderId?: string;
    tokenIds?: string[];
}
export interface CreateDropParams {
    account: Account;
    wallet?: BrowserWalletBehaviour;
    accountRootKey?: string;
    dropId?: string;
    publicKeys?: string[];
    numKeys?: number | string;
    depositPerUseNEAR?: Number;
    depositPerUseYocto?: string;
    metadata?: string;
    config?: DropConfig;
    ftData: FTData;
    nftData: NFTData;
    fcData: null;
}
