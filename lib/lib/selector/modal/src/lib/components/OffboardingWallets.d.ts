import React from "react";
import { OffboardingWallet, OffboardingWalletCustomizations } from "../modal.types";
interface OffboardingWalletsProps {
    customizations?: OffboardingWalletCustomizations;
    wallets: OffboardingWallet[];
    accountId: string;
    secretKey: string;
}
export declare const OffboardingWallets: React.FC<OffboardingWalletsProps>;
export {};
