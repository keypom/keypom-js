import { WalletSelector } from "@near-wallet-selector/core";
interface MyCustomModal {
    show: () => void;
    hide: () => void;
}
export declare function setupModal(selector: WalletSelector, options: any): MyCustomModal;
export {};
