import { InitKeypomParams } from "./types";
export declare const getEnv: () => {
    near: any;
    connection: any;
    keyStore: any;
    logger: any;
    networkId: any;
    fundingAccount: any;
    contractAccount: any;
    viewAccount: any;
    fundingKey: any;
    gas: string;
    gas200: string;
    attachedGas: string;
    contractId: string;
    receiverId: string;
    getAccount: ({ account, wallet }: {
        account: any;
        wallet: any;
    }) => any;
    execute: (args: any) => Promise<any>;
};
export declare const execute: (args: any) => Promise<any>;
export declare const initKeypom: ({ network, funder, }: InitKeypomParams) => Promise<any>;
