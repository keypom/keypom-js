import { WalletSelector } from "@near-wallet-selector/core";
interface FastAuthModalProps {
    show: () => void;
    hide: () => void;
}
export declare function setupModal(selector: WalletSelector, options: any): FastAuthModalProps;
export {};
