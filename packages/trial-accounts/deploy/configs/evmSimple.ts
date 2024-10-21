// src/configs/evmSimple.ts

import { UnencryptedFileSystemKeyStore } from "@near-js/keystores-node";
import path from "path";
import os from "os";
import { Config } from "./type";
import { TrialData, ActionToPerform, AccessList } from "../../src/index";
import { BASE_GUESTBOOK_ABI } from "../abis/baseGuestbook";
import { parseEther } from "ethers";

const homedir = os.homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

export const config: Config = {
    networkId: "testnet",
    trialContractId: "1729518655055-trial-contract.testnet",
    signerAccountId: "benjiman.testnet",
    keyStore: new UnencryptedFileSystemKeyStore(credentialsPath),
    mpcContractId: "v1.signer-prod.testnet",
    numberOfKeys: 1,
    dataDir: "./data",
};

export const trialData: TrialData = {
    constraintsByChainId: {
        EVM: {
            chainId: 84532,
            allowedMethods: ["setMessage"],
            allowedContracts: ["0xdf5c3bd628a11C97BB25d441D8b6d9Ce974dc552"],
            maxGas: 1000000, // Optional
            maxValue: "0", // Optional
            initialDeposit: parseEther("0.004"), // roughly 15$
        },
    },
    usageConstraints: null,
    interactionLimits: null,
    exitConditions: null,
    expirationTime: null,
};

// ARGUMENTS TO THE FUNCTION CALL
const _message = "Hello from the MPC Trial Account EVM Config!";
const args = [_message];

const accessList: AccessList = [];
export const actionsToPerform: ActionToPerform[] = [
    {
        chain: "EVM",
        chainId: 84532,
        targetContractId: "0xdf5c3bd628a11C97BB25d441D8b6d9Ce974dc552",
        methodName: "setMessage",
        args,
        abi: BASE_GUESTBOOK_ABI, // Provide the ABI of the contract
        value: "0", // If no ETH is sent along with the transaction
        accessList: accessList,
    },
];
