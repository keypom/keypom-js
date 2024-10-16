// src/configs/simple.ts

import { UnencryptedFileSystemKeyStore } from "@near-js/keystores-node";
import path from "path";
import os from "os";
import { Config } from "./type";
import {
    TrialData,
    ActionToPerform,
    SerializableParam,
    SerializableToken,
    AccessList,
} from "../../src/index";

const homedir = os.homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

export const config: Config = {
    networkId: "testnet",
    trialContractId: "1729090204281-trial-contract.testnet",
    signerAccountId: "benjiman.testnet",
    keyStore: new UnencryptedFileSystemKeyStore(credentialsPath),
    mpcContractId: "v1.signer-prod.testnet",
    numberOfKeys: 1,
    dataDir: "./data",
};

const chainId = 84532;
export const trialData: TrialData = {
    chainConstraints: {
        EVM: {
            allowedMethods: ["multiAddressLazyMint"],
            allowedContracts: ["0xCeb40Ce9979f2F044031759cCA5a3e2C3fc04c42"],
            maxGas: 1000000, // Optional
            maxValue: "0", // Optional
        },
    },
    initialDeposit: "10", // NEAR deposit for the trial account
};

const methodParams: SerializableParam[] = [
    {
        name: "addresses",
        kind: { type: "Array", inner: { type: "Address" } },
    },
    {
        name: "seriesIds",
        kind: { type: "Array", inner: { type: "Uint", size: 256 } },
    },
    {
        name: "data",
        kind: { type: "Bytes" },
    },
];

const args: SerializableToken[] = [
    {
        type: "Array",
        value: [
            {
                type: "Address",
                value: "0x1234567890abcdef1234567890abcdef12345678",
            },
            {
                type: "Address",
                value: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            },
        ],
    },
    {
        type: "Array",
        value: [
            { type: "Uint", value: "1" },
            { type: "Uint", value: "2" },
        ],
    },
    {
        type: "Bytes",
        value: "0xabcdef", // Hex string representing bytes data
    },
];

const accessList: AccessList = [];

export const actionToPerform: ActionToPerform = {
    chain: "EVM",
    targetContractId: "0xCeb40Ce9979f2F044031759cCA5a3e2C3fc04c42",
    methodName: "multiAddressLazyMint",
    methodParams: methodParams,
    args: args,
    gasLimit: "1000000", // Adjust as needed
    value: "0", // If no ETH is sent along with the transaction
    chainId: 84532,
    maxFeePerGas: "20000000000", // 20 Gwei in wei
    maxPriorityFeePerGas: "2000000000", // 2 Gwei in wei
    accessList: accessList,
};
