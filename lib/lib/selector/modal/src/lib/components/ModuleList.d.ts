import React from "react";
import { PostTrialModules } from "../modal.types";
interface ModuleListProps {
    modulesTitle?: string;
    modules: PostTrialModules[];
    accountId: string;
    secretKey: string;
}
export declare const ModuleList: React.FC<ModuleListProps>;
export {};
