// src/configs/onniChainSimple.ts

import path from "path";
import os from "os";
import { Config } from "./type";
import { TrialData, ActionToPerform, AccessList } from "../../src/index";
import { BASE_GUESTBOOK_ABI } from "../abis/baseGuestbook";
import { parseEther } from "ethers";
import { UnencryptedFileSystemKeyStore } from "near-api-js/lib/key_stores";
import { parseNearAmount } from "near-api-js/lib/utils/format";

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
        EVM: {
            chainId: 421614,
            allowedMethods: ["increment"],
            allowedContracts: ["0x6d21161d1D17cDCA58707829E4d57D5a4EfE5489"],
            maxGas: 1000000, // Optional
            maxValue: "0", // Optional
            initialDeposit: parseEther("0.004"), // roughly 15$
        },
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

// ARGUMENTS TO THE FUNCTION CALL
const _message = "Hello from the MPC Trial Account EVM Config!";
const evmArgs = [_message];

const accessList: AccessList = [];
export const actionsToPerform: ActionToPerform[] = [
    {
        chain: "NEAR",
        targetContractId: "guestbook.near-examples.testnet",
        methodName: "add_message",
        args: { text: "Hello from the MPC Trial Account Near Config!" },
        attachedDepositNear: "1",
        gas: "300000000000000",
    },
    {
        chain: "EVM",
        chainId: 421614,
        targetContractId: "0xdf5c3bd628a11C97BB25d441D8b6d9Ce974dc552",
        methodName: "setMessage",
        args: evmArgs,
        abi: BASE_GUESTBOOK_ABI, // Provide the ABI of the contract
        value: "0", // If no ETH is sent along with the transaction
        accessList: accessList,
    },
];
