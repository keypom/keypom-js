import React from "react";
import { BeginTrialCustomizations } from "../modal.types";
interface BeginTrialProps {
    customizations?: BeginTrialCustomizations;
    secretKey: string;
    redirectUrlBase: string;
    delimiter: string;
    hide: () => void;
}
export declare const BeginTrial: React.FC<BeginTrialProps>;
export {};
