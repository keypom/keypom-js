import * as nearAPI from "near-api-js";
import { EnvVars, InitKeypomParams } from "./types";
export declare const getEnv: () => EnvVars;
export declare const execute: (args: any) => Promise<void | nearAPI.providers.FinalExecutionOutcome[]>;
export declare const initKeypom: ({ near: _near, network, funder, }: InitKeypomParams) => Promise<any>;
