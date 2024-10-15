// src/configs/simple.ts

import { UnencryptedFileSystemKeyStore } from "@near-js/keystores-node";
import path from "path";
import os from "os";
import { Config } from "./type";
import { TrialData, ActionToPerform } from "../../src/index";

const homedir = os.homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

export const config: Config = {
    networkId: "testnet",
    trialContractId: "1729024431656-trial-contract.testnet",
    signerAccountId: "benjiman.testnet",
    keyStore: new UnencryptedFileSystemKeyStore(credentialsPath),
    mpcContractId: "v1.signer-prod.testnet",
    numberOfKeys: 1,
    dataDir: "./data",
};

export const trialData: TrialData = {
    chainConstraints: {
        NEAR: {
            allowedMethods: ["add_message"],
            allowedContracts: ["guestbook.near-examples.testnet"],
        },
    },
    initialDeposit: "10",
    chainId: 1313161555,
};

export const actionsToPerform: ActionToPerform[] = [
    {
        chain: "NEAR",
        targetContractId: "guestbook.near-examples.testnet",
        methodName: "add_message",
        args: { text: "Hello from the MPC Trial Account Simple Config!" },
        attachedDepositNear: "1",
        gas: "300000000000000",
    },
];
