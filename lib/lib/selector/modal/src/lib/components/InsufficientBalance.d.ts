import React from "react";
import { InsufficientBalanceCustomizations } from "../modal.types";
interface InsufficientBalanceProps {
    customizations?: InsufficientBalanceCustomizations;
    hide: () => void;
}
export declare const InsufficientBalance: React.FC<InsufficientBalanceProps>;
export {};
