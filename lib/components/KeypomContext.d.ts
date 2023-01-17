import type { ReactNode } from "react";
import React from "react";
import { EnvVars } from "../lib/types/general";
export declare const KeypomContextProvider: React.FC<{
    children: ReactNode;
}>;
export declare function useKeypom(): EnvVars;
