import React from "react";
import { WalletSelector } from "@near-wallet-selector/core";
interface FastAuthModalProps {
    selector: WalletSelector;
    options: any;
    isVisible: boolean;
    onClose: () => void;
    walletSelectorModal: any;
}
declare const FastAuthModal: React.FC<FastAuthModalProps>;
export default FastAuthModal;
