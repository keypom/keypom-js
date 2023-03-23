import React from "react";
import { MainBodyButton, MainBodyHeaders, PostTrialModules } from "../modal.types";
interface TrialOverProps {
    modules: PostTrialModules[];
    accountId: string;
    secretKey: string;
    hide: () => void;
    modulesTitle?: string;
    mainTitle?: string;
    mainBody?: string;
    headerOne?: MainBodyHeaders;
    headerTwo?: MainBodyHeaders;
    button?: MainBodyButton;
}
export declare const TrialOver: React.FC<TrialOverProps>;
export {};
