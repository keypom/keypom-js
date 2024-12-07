import { WalletSelector } from "@near-wallet-selector/core";
import { ModalOptions } from "@near-wallet-selector/modal-ui";
interface FastAuthModalProps {
    show: () => void;
    hide: () => void;
}
export interface FastAuthModalOptions extends ModalOptions {
    localTesting?: boolean;
}
export declare function setupModal(selector: WalletSelector, options: FastAuthModalOptions): FastAuthModalProps;
export {};
