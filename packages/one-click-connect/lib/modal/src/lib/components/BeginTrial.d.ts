import React from "react";
import { BeginTrialCustomizations } from "../modal.types";
/**
 * regex for the body of an account not including TLA and not allowing subaccount
 */
export declare const accountAddressPatternNoSubaccount: RegExp;
interface BeginTrialProps {
    customizations?: BeginTrialCustomizations;
    includedCid?: string;
    secretKey: string;
    redirectUrlBase: string;
    delimiter: string;
    hide: () => void;
}
export declare const BeginTrial: React.FC<BeginTrialProps>;
export {};
