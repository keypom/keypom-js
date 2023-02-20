import { NetworkId, WalletModuleFactory } from "@near-wallet-selector/core";
import icon from "./icon";
import { KeypomWalletType } from "./types";
export { icon };
declare global {
    interface Window {
        near: any;
    }
}
interface KeypomSetupParams {
    networkId: NetworkId;
    iconUrl?: string;
    deprecated?: boolean;
    desiredUrl?: string;
}
export declare function setupKeypom({ iconUrl, deprecated, desiredUrl, networkId }: KeypomSetupParams): WalletModuleFactory<KeypomWalletType>;
