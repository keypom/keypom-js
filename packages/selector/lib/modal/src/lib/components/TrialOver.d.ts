import React from "react";
import { OffboardingWallet, TrialOverCustomizations } from "../modal.types";
interface TrialOverProps {
    accountId: string;
    secretKey: string;
    wallets: OffboardingWallet[];
    hide: () => void;
    customizations?: TrialOverCustomizations;
}
export declare const TrialOver: React.FC<TrialOverProps>;
export {};
