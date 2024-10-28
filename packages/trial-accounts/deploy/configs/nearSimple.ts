// src/configs/simple.ts

import { UnencryptedFileSystemKeyStore } from "near-api-js/lib/key_stores";
import path from "path";
import os from "os";
import { Config } from "./type";
import { TrialData, ActionToPerform } from "../../src/index";
import { parseNearAmount } from "@near-js/utils";

const homedir = os.homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

export const config: Config = {
    networkId: "testnet",
    trialContractId: "1729530318593-trial-contract.testnet",
    signerAccountId: "benjiman.testnet",
    keyStore: new UnencryptedFileSystemKeyStore(credentialsPath),
    mpcContractId: "v1.signer-prod.testnet",
    numberOfKeys: 1,
    dataDir: "./data",
};

export const trialData: TrialData = {
    constraintsByChainId: {
        NEAR: {
            allowedMethods: ["add_message"],
            allowedContracts: ["guestbook.near-examples.testnet"],
            maxGas: null,
            maxDeposit: null,
            initialDeposit: parseNearAmount("10")!,
        },
    },
    usageConstraints: null,
    interactionLimits: null,
    exitConditions: null,
    expirationTime: null,
};

export const actionsToPerform: ActionToPerform[] = [
    {
        chain: "NEAR",
        targetContractId: "guestbook.near-examples.testnet",
        methodName: "add_message",
        args: { text: "Hello from the MPC Trial Account Near Config!" },
        attachedDepositNear: "1",
        gas: "300000000000000",
    },
];
