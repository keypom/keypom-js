import type { ReactNode } from "react";
import React from "react";
import { EnvVars } from "../lib/types/general";
/** @group Keypom SDK Environment */
export declare const KeypomContextProvider: React.FC<{
    children: ReactNode;
}>;
/** @group Keypom SDK Environment */
export declare function useKeypom(): EnvVars;
