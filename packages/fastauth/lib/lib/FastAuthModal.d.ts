import React from "react";
import { WalletSelector } from "@near-wallet-selector/core";
import { FastAuthModalOptions } from "./modal";
interface FastAuthModalProps {
    selector: WalletSelector;
    options: FastAuthModalOptions;
    isVisible: boolean;
    onClose: () => void;
    walletSelectorModal: any;
}
declare const FastAuthModal: React.FC<FastAuthModalProps>;
export default FastAuthModal;
